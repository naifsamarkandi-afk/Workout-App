# Swolemates

A mobile-sized React app that tracks a 4-day dumbbell upper/lower split and
daily calories + protein. All data lives in `localStorage`, so it persists
between sessions with no account or backend.

Installable to the iPhone home screen as a PWA.

## Running it

```bash
npm install
npm run dev
```

Then open the printed URL. Vite also binds to your local network, so the
`http://192.168.x.x:5173` line works on your phone over the same wifi.

```bash
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build (this is where the SW runs)
```

The service worker is registered in production builds only — in dev it would sit
in front of Vite's hot reloading.

## The Anthropic API key

The environment variable is **`ANTHROPIC_API_KEY`**.

- **Local dev:** put it in `.env.local` in this folder (gitignored).
  ```
  ANTHROPIC_API_KEY=sk-ant-...
  ```
- **Vercel:** set `ANTHROPIC_API_KEY` under Project → Settings → Environment
  Variables. No `VITE_` prefix — that prefix is what *exposes* a variable to the
  browser bundle, which is exactly what must not happen here.

The key is only ever read inside `api/estimate-food.ts`, which runs on the
server. Nothing under `src/` imports that file, so the key cannot reach the
browser. The client just POSTs a food name to `/api/estimate-food`.

Without a key the app still works: it falls back to the local food table in
`src/config/foodTable.ts`, and anything it can't match opens the confirm sheet
for you to fill in.

## Deploying to Vercel

Vercel auto-detects Vite (`dist/`), and `api/estimate-food.ts` becomes a
serverless function at `/api/estimate-food` — the same path the dev server
serves, so the client code is identical in both. Set `ANTHROPIC_API_KEY` and
deploy; there's no `vercel.json` to maintain because the app uses hash routing
and needs no rewrite rules.

## Installing on an iPhone

Open the deployed URL in **Safari** (not Chrome — only Safari can install to the
home screen on iOS), then Share → *Add to Home Screen*. It launches without
browser chrome, and the layout already accounts for the notch and home indicator
via `viewport-fit=cover` plus safe-area insets.

## Where things live

| Thing | File |
|---|---|
| Daily calorie / protein goals | `src/config/goals.ts` |
| The four exercise lists | `src/config/workouts.ts` |
| Schedule projection (the core logic) | `src/lib/schedule.ts` |
| Offline food table | `src/config/foodTable.ts` |
| Claude food estimation (server-side) | `api/estimate-food.ts` |
| Colours, type, radii, shadows | `src/styles/tokens.css` |
| Character art | `src/assets/characters/` |
| PWA manifest / service worker / icons | `public/` |

## How the schedule works

The cycle is `Upper A → Lower A → rest → Upper B → Lower B → rest → rest`,
stated once as `CYCLE` in `src/lib/schedule.ts`. The workout is bound to the
cycle position rather than tracked separately, so a pair of consecutive workout
days is always one upper and one lower by construction.

The position advances a day at a time — except on a workout day you didn't log,
which holds it, so the missed workout slides onto the next day and everything
after it shifts along. Nothing resets. Days before your first ever session wrap
the cycle backwards, so a fresh install still shows a full week.

The Sunday–Saturday strip shows what actually happened on past days and the
projection for today onwards. A dark pill means a workout was completed; every
other pill, rest days included, is light.

## Swapping the app icon

`public/icons/` holds a placeholder: the theme colour with an "S", drawn as a
stroked path in `icon.svg` so it needs no font. Replace the PNGs with your own at
the same filenames and sizes and nothing else needs to change:

| File | Size | Used by |
|---|---|---|
| `apple-touch-icon-180.png` | 180×180 | iOS home screen |
| `icon-192.png` | 192×192 | manifest, `purpose: any` |
| `icon-512.png` | 512×512 | manifest, `purpose: any` |
| `icon-512-maskable.png` | 512×512 | manifest, `purpose: maskable` |
| `favicon-32.png` | 32×32 | browser tab |

The maskable one is cropped to a circle on Android, so keep its artwork inside
the middle ~60% — the placeholder's "S" is scaled down for exactly that reason.
If you change the background colour, update `theme_color` in
`public/manifest.webmanifest` and the `theme-color` meta in `index.html` to
match.

## Swapping the character art

`src/assets/characters/` holds all six animations plus the two heads and the zzz
mark. Replace a file (or repoint its import in `index.ts` at a different format)
and nothing else needs to change:

| Slot | File |
|---|---|
| Upper, rest day, homescreen | `upper-home-rest.webp` |
| Lower, rest day, homescreen | `lower-home-rest.webp` |
| Upper, workout day, homescreen | `upper-home-workout.webp` |
| Lower, workout day, homescreen | `lower-home-workout.webp` |
| Upper, workout screen loop | `upper-session.webp` |
| Lower, workout screen loop | `lower-session.webp` |
| Heads for the day pills | `upper-head.png`, `lower-head.png` |
| Rest-day pill icon | `zzz.png` |

These are animated WebP, converted from the source GIFs (67% smaller, visually
identical). GIF works too if you'd rather drop one straight in.
