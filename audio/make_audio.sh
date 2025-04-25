#!/bin/bash
set -euo pipefail

# Configuration
WAV_FILES="pop.wav chime.wav chain.wav bell.wav loop.wav"
OGG_FILES="pop.ogg chime.ogg chain.ogg bell.ogg loop.ogg"
B64_FILES="pop.b64 chime.b64 chain.b64 bell.b64 loop.b64"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check prerequisites
check_prerequisites() {
    echo -e "Checking prerequisites..."
    local missing=0
    for cmd in sox ffmpeg lame oggenc base64; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            echo -e "${RED}Error: $cmd is not installed${NC}"
            missing=1
        fi
    done
    if [ $missing -eq 1 ]; then
        echo -e "${RED}Please install missing dependencies:${NC}"
        echo "sudo apt-get install sox ffmpeg lame vorbis-tools libsox-fmt-all"
        exit 1
    fi
    echo -e "${GREEN}All prerequisites found${NC}"
}

# Function to clean up temporary files
cleanup() {
    if [ "${DEBUG:-0}" != "1" ]; then
        echo "Cleaning up temporary files..."
        rm -f $WAV_FILES $B64_FILES temp_*.wav
    fi
}

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    cleanup
    exit 1
}

# Set up cleanup on script exit
trap cleanup EXIT

# Main script starts here
echo -e "${YELLOW}Starting Fuse Field audio generation...${NC}"

# Check prerequisites
check_prerequisites

# Create output directory if it doesn't exist
mkdir -p output

# Generate WAV files
echo "Generating WAV files..."

# Pop sound (120ms white noise with exponential decay)
sox -n pop.wav synth 0.12 whitenoise vol 0.5 fade t 0 0.12 0.12 || handle_error "Failed to generate pop.wav"

# Chime sound (250ms three sine partials)
sox -n chime.wav synth 0.25 sine 880 sine 1320 sine 1760 vol 0.5 fade t 0 0.2 0.25 || handle_error "Failed to generate chime.wav"

# Chain sound (600ms ascending arpeggio)
sox -n temp_c5.wav synth 0.2 square C5 vol 0.5 fade t 0 0.2 0.2 || handle_error "Failed to generate C5"
sox -n temp_e5.wav synth 0.2 square E5 vol 0.5 fade t 0 0.2 0.2 || handle_error "Failed to generate E5"
sox -n temp_g5.wav synth 0.2 square G5 vol 0.5 fade t 0 0.2 0.2 || handle_error "Failed to generate G5"
sox temp_c5.wav temp_e5.wav temp_g5.wav chain.wav || handle_error "Failed to combine arpeggio"

# Bell sound (900ms deep bell)
sox -n bell.wav synth 0.9 sine 220 sine 440 sine 1320 vol 0.5 fade t 0 0.15 0.9 || handle_error "Failed to generate bell.wav"

# Loop track (45s chiptune)
# First generate one bar of melody
sox -n temp_melody.wav synth 2 square C4 vol 0.3 fade t 0 2 2 || handle_error "Failed to generate melody"
# Generate one bar of bass
sox -n temp_bass.wav synth 2 triangle C3 vol 0.2 fade t 0 2 2 || handle_error "Failed to generate bass"
# Combine melody and bass
sox -m temp_melody.wav temp_bass.wav temp_bar.wav || handle_error "Failed to mix melody and bass"
# Create 45 seconds by repeating
sox temp_bar.wav loop.wav repeat 22 || handle_error "Failed to create loop"

# Convert WAV to OGG
echo "Converting to OGG format..."
for wav in $WAV_FILES; do
    ogg="${wav%.wav}.ogg"
    ffmpeg -y -i "$wav" -c:a libvorbis -q:a 5 "$ogg" || handle_error "Failed to convert $wav to $ogg"
done

# Generate Base64 strings
echo "Generating Base64 strings..."
for ogg in $OGG_FILES; do
    base64 -w 0 "$ogg" > "${ogg%.ogg}.b64" || handle_error "Failed to generate Base64 for $ogg"
done

# Print HTML-ready audio tags
echo -e "\n${YELLOW}HTML-ready audio tags:${NC}"
for ogg in $OGG_FILES; do
    id="${ogg%.ogg}"
    echo "<audio id=\"$id\" preload=\"auto\" src=\"data:audio/ogg;base64,$(cat ${ogg%.ogg}.b64)\"></audio>"
done

# Print summary table
echo -e "\n${YELLOW}Summary:${NC}"
printf "%-10s %-10s %-80s\n" "File" "Size" "Base64 Preview"
echo "------------------------------------------------------------------------------------------------"
for ogg in $OGG_FILES; do
    size=$(stat -f %z "$ogg" 2>/dev/null || stat -c %s "$ogg")
    preview=$(head -c 80 "${ogg%.ogg}.b64")
    printf "%-10s %-10s %-80s\n" "$ogg" "$size" "$preview"
done

echo -e "\n${GREEN}Audio generation complete!${NC}"
exit 0 