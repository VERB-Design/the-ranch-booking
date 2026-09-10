import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* Published to GitHub Pages under /the-ranch-booking/ (VERB-Design/the-ranch-booking);
   other branches are published beneath it as /the-ranch-booking/preview/<branch>/ —
   the Pages workflow passes that path in BASE_PATH. Local dev stays at /. The router
   reads import.meta.env.BASE_URL and public-folder paths go through asset() in
   src/utils.js, so nothing else needs to know. */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? (process.env.BASE_PATH || '/the-ranch-booking/') : '/',
  plugins: [react(), tailwindcss()],
}))
