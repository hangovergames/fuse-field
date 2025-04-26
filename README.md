# hangovergames/fuse-field

Fuse Field is a self-contained, browser-only 2D puzzle game that blends
deterministic daily gameplay with the joy of cascading merges. It runs
entirely client-side with no server dependencies and is implemented in
a single HTML file for maximum portability; the game boots in under two
seconds even on mobile data and uses a baked-in asset atlas, so no
external downloads are required. Every player receives the same daily
puzzle using a deterministic seed generated from the current date
(YYYY-MM-DD), ensuring fairness and comparability without any server
interaction.

The play area consists of a 5 × 6 rectangular grid. The daily seed
guarantees every player sees the same starting board: twelve orbs,
numbered 1 through 6, are randomly distributed in empty cells while the
remaining eighteen cells start blank. On each turn a new orb numbered
between 1 and 6 appears at the bottom of the screen, previewed and
tinted according to its number. The player can click any empty cell or
drag the orb into position; the piece drops instantly. If three or more
identical orbs are orthogonally adjacent—sharing a side—they fuse into
one orb of the next higher value. Fusions occur in place and radiate
outward: after each merge the board is rescanned, and any new
orthogonal cluster around the freshly created orb fuses again, allowing
multi-step chains. When a fusion would create a value above 6 it
instead produces an inert crystal that blocks space but awards bonus
points.

Fusions can cascade if new groupings arise from a previous merge. Each
fusion animates with chunky squash-and-stretch frames, and larger
chains trigger mild screen shake for visual impact; all animations
finish in well under a second, keeping feedback snappy. Scoring
increases by the square of the orb number produced—forming a level-5
orb grants 25 points. Crystals grant an additional fixed premium and
double as tactical blockers for advanced chain setups.

The visuals are minimal and charming. A parchment-colored background
and rounded dark-brown grid lines frame orbs colored pale blue, mint
green, cherry red, lavender, lemon yellow and molten gold for values
1–6; crystals glow soft white. All text uses a pixelated retro font. A
looping upbeat chiptune plays under gentle pops and chimes for fusions,
while spawning a crystal triggers a resonant low bell.

A round ends in whichever condition occurs first. • Move cap: each
daily seed carries a limit of 25–35 placements; when the counter
reaches zero the grid locks, any pending cascades resolve and the run
ends—even if spaces remain. • Full board: if a placement leaves no
empty cell, play stops immediately after that cascade. In both cases
animations halt, and a results panel shows total score, move count,
largest chain and inert-crystal count. Only then is the share string
generated—“Fuse Field — 23 moves — 47 200 pts 🔵🟢🔴🟣🟡✨”—and the
copy button enabled, guaranteeing every posted score reflects a fully
completed run.

The game automatically loads the daily board using local hashing. A
permanent “Practice” side tab lets players try infinite procedurally
generated boards that ignore the daily seed; these runs do not generate
share strings but instead end with a concise tip such as “Merge near
walls to free centre space!” to encourage deeper strategy.

Fuse Field combines the social immediacy of Wordle-style daily sharing
without a backend, the tactile thrill of cascading merges with genuine
strategic depth, and a minimal, fast, retro presentation. Clear dual
end-game triggers, outward-radiating fusion logic and flexible
click-or-drag controls ensure each session feels brisk, fair and
endlessly replayable across all devices.
