import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base is "/" because this site will be served from a custom domain
// (see README for the GitHub Pages project-site fallback).
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
