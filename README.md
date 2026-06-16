# Homebase

Homebase is a local-first personal command center for notes, tasks, links, references, snippets, and daily planning.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Browser `localStorage`

## Development

```bash
npm install
npm run dev
```

The app runs locally through Vite. It does not require authentication, a backend, cloud services, or external databases.

## Build

```bash
npm run build
```

The static output is generated in `dist/`.

## Deploy To Vercel

Import the project in Vercel and use the default Vite settings:

- Build command: `npm run build`
- Output directory: `dist`

## Usage

- Create spaces for different areas of life.
- Add cards as notes, tasks, links, references, or snippets.
- Pin important cards, add tags, search globally, and filter by type.
- Use the Daily space for focus, quick notes, mood, tasks, and pinned links.
- Export a JSON backup from the top bar.
- Import a JSON backup to replace local data after confirmation.

## Local-First Storage

Homebase stores all data in the browser using `localStorage`. The storage layer is isolated under `src/lib/storage` so it can later be replaced with IndexedDB without rewriting the UI.

Malformed local data is ignored safely and the app falls back to sample data.

## PWA Readiness

The project includes a basic `manifest.json`, dark theme color, and placeholder icon so it can be installed as a lightweight browser app where supported.

## Brand

The Homebase logo reference is stored at `public/brand/homebase-logo-reference.png`. The app uses a scalable SVG mark derived from that reference for the sidebar and PWA icon.
