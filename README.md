# mainao-webspace

A gamified portfolio built with Next.js. Visitors control a pixel-art character that walks and jumps through a 2D world, landing on flower-shaped sections to explore content — Intro, Education, Experience, Projects, and Contact. Visit all five sections to unlock a magic flower.

## Features

- **2D game engine** — canvas-based physics loop with gravity, jumping, collision detection, and sprite animation
- **Five interactive sections** — Intro, Education, Experience, Fun Projects, Contact — each triggered by colliding with a tulip flower
- **Progress mechanic** — a magic flower unlocks in the HUD once all five sections are visited
- **Ambient audio** — click sounds, a chime on full completion, and a chill looping track via the frog button
- **Sound toggle** — mute/unmute at any time
- **Pixel aesthetic** — Pixelify Sans + Share Tech Mono fonts, hand-crafted sprite sheets, webp icons
- **Mobile notice** — gameplay is desktop-first; mobile visitors see a friendly banner

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Fonts | Pixelify Sans, Share Tech Mono (Google Fonts via `next/font`) |
| Rendering | HTML5 Canvas (`requestAnimationFrame` game loop) |

## Prerequisites

- **Node.js** ≥ 20 (implied by `@types/node: ^20`)
- **npm**, **yarn**, **pnpm**, or **bun**

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/Mainao/mainao-webspace.git
cd mainao-webspace

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> There are no environment variables required for local development.

## Project Structure

```
mainao-webspace/
├── app/
│   ├── layout.tsx          # Root layout — fonts, metadata, OG/Twitter tags
│   ├── page.tsx            # Home route — renders <Portfolio />
│   ├── globals.css         # Global Tailwind styles
│   ├── favicon.ico
│   └── instructions/
│       └── page.tsx        # /instructions route — keyboard controls guide
│
├── components/
│   ├── Portfolio.tsx       # Top-level client component; owns game state, HUD, modal logic
│   ├── game/
│   │   └── GameWorld.tsx   # Canvas game engine — physics, sprite rendering, collision
│   └── ui/
│       ├── Modal.tsx       # Accessible modal wrapper
│       └── ModalContent.tsx# Section content renderer
│
├── lib/
│   ├── sections.ts         # Static data for all five portfolio sections
│   ├── constants.ts        # Physics constants, z-index map, tulip image sources
│   └── types.ts            # Shared TypeScript types
│
├── public/
│   ├── sprites/            # Sprite sheets — idle/, walk/, jump/ (PNG frames)
│   ├── icons/
│   │   ├── flowers/        # Tulip and magic flower webp icons
│   │   └── ui/             # Logo, frog, sound toggle, dance GIF
│   └── audio/              # chill.mp3, chime.mp3, click-open.mp3, click-close.mp3
│
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Environment Variables

No environment variables are required. There is no `.env` file needed for this project.

## Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start the development server at `localhost:3000` |
| `build` | `next build` | Create an optimised production build |
| `start` | `next start` | Serve the production build locally |
| `lint` | `eslint` | Run ESLint across the project |

## Gameplay Controls

| Action | Keys |
|---|---|
| Move left | `←` or `A` |
| Move right | `→` or `D` |
| Jump | `↑`, `W`, or `Space` |
| Open section | Jump into a flower |
| Play music | Click the frog (bottom-right) |

## Deployment

The project deploys to [Vercel](https://vercel.com) with zero configuration.

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy
vercel
```

Alternatively, connect the GitHub repository in the Vercel dashboard and every push to `main` will trigger an automatic deployment.
