import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// TEMPORARY: base is "/gph-website/" so the site previews correctly at
// the default GitHub Pages project URL (gphtechnology.github.io/gph-website/).
// Switch this back to "/" once the Hostinger custom domain is connected
// (see README) — a custom domain serves from the root, so "/" is
// required there.
export default defineConfig({
  base: '/gph-website/',
  plugins: [react(), tailwindcss()],
})
