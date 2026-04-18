# AI Assistant Guide

This file provides comprehensive guidance for AI coding assistants when working with this codebase.

---

**Never use `npm run build` for verification** — it takes 1–2 minutes and adds no validation value beyond what lint already catches.

---

## Shell Environment

**macOS/Linux**: use `&&` — **Windows PowerShell**: use `;`.

<!-- examples: `npm run lint && npm run dev` -->

---

## Project Overview

**mainao-webspace** is a creative portfolio site built with Next.js 16, React 19, and TypeScript. The UI is a browser-playable 2D platformer: a pixel-art character jumps into tulip flowers, each opening a modal with a portfolio section.

| Aspect    | Technology                                   |
| --------- | -------------------------------------------- |
| Framework | Next.js 16 with App Router                   |
| Language  | TypeScript (strict mode)                     |
| Styling   | Tailwind CSS 4                               |
| State     | React `useState`/`useRef` in `Portfolio.tsx` |
| Testing   | None                                         |

---

## Architecture — component-based

The site is a thin App Router shell (`app/`) around a single large client island (`components/Portfolio.tsx`). Keep game logic inside `components/game/`, UI primitives inside `components/ui/`, shared types in `lib/types.ts`, and all portfolio content in `lib/sections.ts`.

---

## Data flow

1. `lib/sections.ts` — single source of truth; defines the 5 sections (`Section[]`) with all display content.
2. `components/Portfolio.tsx` (`'use client'`) — root of the interactive tree; owns all shared state: visited sections, open modal, sound toggles, game-ready flag.
3. `components/game/GameWorld.tsx` (`'use client'`) — runs the canvas RAF loop; receives `sections` as props for tulip positions; fires `onSectionHit(id)` upward on collision; controlled imperatively via a `GameControls` ref.
4. Modals are portal-rendered via `components/ui/Modal.tsx`. `ModalContent.tsx` renders section body; `MenuModalContent.tsx` renders the tabbed settings/credits panel.

`app/page.tsx` is a Server Component that only renders `<Portfolio />`. All SEO metadata lives in `app/layout.tsx`.

---

## Canvas game engine — quick rules

- Sprites load as plain `new Image()` objects (not `next/image`) — correct for canvas.
- Physics constants live in `lib/constants.ts`: `GRAVITY`, `JUMP_FORCE`, `MOVE_SPEED`, `BOUNCE_DAMPING`, `HIT_COOLDOWN` (frames), `HITBOX_HEIGHT_RATIO`. Always edit them there, not inline.
- Layout is computed each frame from `canvas.width`: horizontal line on desktop, 2-row grid (3 top / 2 bottom) on mobile. There is no separate layout state.
- `TULIP_SRCS` in `lib/constants.ts` maps section IDs → tulip color filenames in `public/icons/flowers/`.

---

## Code style & state — quick rules

- Imports: use the `@/*` path alias; avoid relative `../../` imports across directories.
- TypeScript: strict mode is on; fix all errors; prefer `interface` for component props.
- Components: functional only; explicit prop types; hooks start with `use`.
- Styling: Tailwind utility classes; use `className` strings directly (no `cn()` helper currently in use).
- State: local `useState`/`useRef` inside `Portfolio.tsx` — no external state library.

---

## Known issues & rules

### Do's / Don'ts

- ✅ Add new section content only in `lib/sections.ts`.
- ✅ Add new physics/layout magic numbers to `lib/constants.ts`, not inline.
- ✅ Use `next/image` for all HUD/UI images; use `new Image()` only inside canvas rendering code.
- ✅ Add per-page `metadata` exports to any new App Router pages.
- ❌ Don't add `'use client'` to components that have no hooks or browser APIs.
- ❌ Don't reference audio or image files that don't exist in `public/` — they fail silently.
