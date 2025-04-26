# hangovergames/fuse-field

Fuse Field is a self-contained, browser-only 2D puzzle game that blends 
deterministic daily gameplay with the joy of cascading merges. It runs entirely 
client-side with no server dependencies and is implemented in a single HTML 
file for maximum portability. Every player receives the same daily puzzle using 
a deterministic seed generated from the current date, ensuring fairness and 
comparability without any server interaction.

The play area consists of a 5x6 rectangular grid. The daily seed is generated 
by hashing the current date, for example in the format YYYY-MM-DD, into a seed 
value. This ensures every player sees the same starting board each day. The 
initial board contains 12 orbs, numbered 1 through 6, randomly distributed in 
empty cells based on the seed. The remaining 18 cells are empty.

On each turn, a new orb numbered between 1 and 6 appears at the bottom of the 
screen, previewed and tinted according to its number. The player drags this orb 
into any empty cell. If three or more identical orbs are orthogonally adjacent, 
meaning they share a side, they instantly fuse into one orb of a level one 
higher. If the fusion would create a value exceeding 6, it instead forms an 
inert crystal that blocks space but grants bonus points.

Fusions can cascade if new groupings are formed from a previous merge. Each 
fusion animates with chunky squash-and-stretch frames, and larger chains 
trigger mild screen shake for visual impact. All fusion animations complete in 
under one second to maintain fast-paced feedback.

The score increases by the square of the orb number after each fusion. For 
example, creating a level 5 orb grants 25 points. Crystals add bonus points and 
act as tactical space blockers for setting up advanced chain reactions.

The visuals are designed to be minimal and charming. The background is 
parchment-colored and the grid lines are rounded and dark brown. The orbs use a 
flat-design palette where 1 is pale blue, 2 is mint green, 3 is cherry red, 4 
is lavender, 5 is lemon yellow, and 6 is molten gold. Crystals are white with a 
subtle sparkling glow. All text uses a pixelated, retro-style font.

The audio features a looping upbeat chiptune track that plays throughout the 
game. Fusion events produce gentle popping and chiming sounds, while spawning a 
crystal triggers a deep, resonant low bell tone to mark a milestone moment.

The game automatically loads the same board each day using local date hashing, 
ensuring that no server calls are needed. After a run ends, the final score, 
move count, and the largest fusion chain achieved are displayed. A share string 
is generated in the format "Fuse Field — 23 moves — 47 200 pts 🔵🟢🔴🟣🟡✨" 
where the colored dots represent the highest orb values achieved and the 
sparkle emoji represents the number of inert crystals formed. There is a copy 
button to easily place the share string into social feeds or group chats.

A permanent "Practice" side tab allows players to play infinite procedurally 
generated boards without using the daily seed. Practice runs do not generate 
share strings. Instead, upon completion, players see a short, encouraging 
strategy tip such as "Plan your merges to trigger chain reactions!"

The entire game is fully contained within a single HTML file. It uses a 
lightweight canvas rendering library, and sprites and pixel fonts are baked 
into a compact asset atlas. The game boots in under two seconds even over 
mobile data connections. There are no external dependencies and no server 
backend is required.

Fuse Field combines the social immediacy of Wordle-style daily sharing without 
needing a backend, the tactile thrill of cascading merges with strategic depth, 
and a minimal, fast, satisfying gameplay loop with retro aesthetics. This makes 
it highly shareable, technically simple, and endlessly replayable across all 
devices.
