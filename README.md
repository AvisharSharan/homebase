<div align="center">
  <img src="public/brand/homebase_logo.svg" alt="Homebase Logo" width="120" />
  <h1>Homebase</h1>
  <p><strong>A local-first personal command center for your notes, tasks, links, references, snippets, and daily planning.</strong></p>
</div>

---

## 🛠 Tech Stack

Homebase is built with modern, accessible web technologies:
- **Framework:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS (v3)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com) & [Radix UI](https://www.radix-ui.com/) (Accessible, unstyled primitives)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Storage:** Browser `localStorage`

## 🚀 Development

```bash
# Install the locked dependencies (Node 20.19+ or 22.12+)
npm ci

# Start local development server
npm start
```

Open http://127.0.0.1:5173 in your browser. Keep the terminal running. Opening index.html directly will not start a Vite app. If port 5173 is occupied, stop the previous Homebase process or use `npm run dev -- --port 5174`.

The app runs locally through Vite and does not require authentication, a backend, cloud services, or external databases. Fonts use local system fallbacks. Markdown images are shown as placeholders to avoid unsolicited external requests.

Run `npm test` for regression checks and `npm run build` for TypeScript and production validation. Use `npm run preview` to inspect the production build.

## 📦 Build & Deploy

To build the static output:
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` folder.

### Deploy to Vercel / Netlify
Since Homebase is a static React app, you can easily deploy it anywhere:
- **Build command:** `npm run build`
- **Output directory:** `dist`

## ✨ Features & Usage

- **Spaces:** Create isolated spaces to organize different areas of your life (e.g., Work, Personal, Side Project).
- **Cards:** Add modular cards to your spaces:
  - 📝 **Notes:** Rich text notes and context.
  - ✅ **Tasks:** Interactive checklists with progress tracking.
  - 🔗 **Links:** Save important URLs.
  - 📚 **References:** Track files, books, or external sources.
  - 💻 **Snippets:** Save code snippets with syntax highlighting.
- **Daily Planner:** A dedicated "Daily" view for your daily focus, mood tracking, quick brain dumps, today's tasks, and pinned links.
- **Organization:** Pin important cards to the top, add custom tags, filter by card type, and search globally across all your spaces.
- **Portability:** Export your entire Homebase as a `.json` backup file, and import it anywhere to restore your state.

## 💾 Local-First Storage

Homebase stores all data entirely in the browser using `localStorage`. Your data never leaves your device unless you export it. The storage layer is isolated under `src/lib/storage`, designed so it can later be swapped out for IndexedDB without rewriting the UI logic. 

Blocked storage and malformed saved data do not prevent startup. Invalid settings are restored to safe defaults. Unreadable saved data is retained; before replacing it, the app copies it to `homebase:recovery:v2` and offers a recovery export. If storage is full or blocked, a persistent warning offers an export of the current unsaved state. Export backups regularly; private browsing and clearing site data can remove browser storage.

Imports accept valid JSON backups up to 5 MB and require confirmation before replacing your current data. Duplicate IDs, orphan cards, invalid dates, and malformed tasks are rejected. Saved links allow absolute HTTP(S) URLs without embedded credentials.

## 📱 PWA Readiness

The project includes a `manifest.json`, theme color, and scalable vector icons. It has no service worker or offline application cache; the local server must be running to open it. Data remains in the browser between visits.
