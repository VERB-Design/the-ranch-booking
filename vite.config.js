import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* Deploy target is not yet decided. Set `base` to the served subpath (e.g.
   '/the-ranch/') before publishing; the router reads it from
   import.meta.env.BASE_URL so nothing else needs to change. */
export default defineConfig(() => ({
  base: '/',
  plugins: [react(), tailwindcss()],
}))
