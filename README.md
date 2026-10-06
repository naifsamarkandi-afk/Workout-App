# Workout Companion

A mobile-sized React app that tracks a 4-day dumbbell upper/lower split and daily
calories + protein. All data lives in `localStorage`, so it persists between
sessions with no account or backend.

## Running it

```bash
npm install
npm run dev
```

Then open the printed URL. Vite also binds to your local network, so the
`http://192.168.x.x:5173` line works on your phone over the same wifi.

### Food estimation key (optional)

The food search asks Claude to estimate calories and protein. Create a file
called `.env.local` in this folder containing:

```
ANTHROPIC_API_KEY=sk-ant-...
```

`.env.local` is gitignored. The key is read only by the dev server — the request
to Claude happens in Node (`server/estimateFood.ts`, mounted at
`POST /api/estimate-food` by the plugin in `vite.config.ts`), so it never reaches
the browser bundle.

Without a key the app still works: it falls back to the local food table in
`src/config/foodTable.ts`, and anything it can't match opens the confirm sheet
with blank numbers for you to fill in.

To deploy, move `server/estimateFood.ts` behind a serverless function at the same
path. The client in `src/lib/estimateFood.ts` doesn't care where it's hosted.

## Where things live

| Thing | File |
|---|---|
| Daily calorie / protein goals | `src/config/goals.ts` |
| The four exercise lists | `src/config/workouts.ts` |
| Schedule projection (the core logic) | `src/lib/schedule.ts` |
| Offline food table | `src/config/foodTable.ts` |
| Colours, type, radii, shadows | `src/styles/tokens.css` |
| Character art | `src/assets/characters/` |

## How the schedule works

The week is a shape — `W W R W W R R`, four workout days and three rest days —
but it is **not** pinned to weekdays. The app walks forward from your first ever
logged workout carrying two cursors:

- where you are in that 7-day shape, and
- where you are in the rotation `Upper A → Lower A → Upper B → Lower B`.

Both advance only when a workout is actually completed. Skip a suggested day and
neither moves, so the whole plan just slides forward by one day — nothing resets.
Because the two cursors step together, a pair of consecutive workout days is
always one upper and one lower.

The Sunday–Saturday strip shows what actually happened on past days and the
projection for today and beyond. A dark pill means a workout was completed; every
other pill, rest days included, is light.

The workout page is usable on any day. Logging a session on a projected rest day
just makes it a workout day and shifts the projection on from there.

## Swapping in the real character art

`src/assets/characters/` holds placeholder SVGs for all six animations plus the
two heads and the zzz mark. Replace a file (or repoint its import in
`index.ts` at a `.gif` / `.webp` / Lottie JSON) and nothing else needs to change:

| Slot | File |
|---|---|
| Upper, rest day, homescreen | `upper-home-rest.svg` |
| Lower, rest day, homescreen | `lower-home-rest.svg` |
| Upper, workout day, homescreen | `upper-home-workout.svg` |
| Lower, workout day, homescreen | `lower-home-workout.svg` |
| Upper, workout screen loop | `upper-session.svg` |
| Lower, workout screen loop | `lower-session.svg` |
| Heads for the day pills | `upper-head.svg`, `lower-head.svg` |
| Rest-day pill icon | `zzz.svg` |

The placeholders share a `0 0 200 240` viewBox (heads use `0 0 64 64`), so
same-shaped replacements drop straight in.
