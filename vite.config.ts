import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path подбирается под GitHub Pages при сборке (см. workflow); для dev — корень.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
