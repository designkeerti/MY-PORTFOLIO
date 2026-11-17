import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // the job finder's /api runs in the worker: `npx wrangler dev` alongside `npm run dev`
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
})
