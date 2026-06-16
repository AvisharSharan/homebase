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
# Install dependencies
npm install

# Start local development server
npm run dev
```

The app runs locally through Vite. It is 100% local-first and does not require authentication, a backend, cloud services, or external databases.

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

Malformed local data is safely ignored and the app will start fresh if needed.

## 📱 PWA Readiness

The project includes a `manifest.json`, dark theme color, and scalable vector icons so it can be installed as a lightweight Progressive Web App (PWA) where supported.
