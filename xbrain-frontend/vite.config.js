import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/analyze':     'http://127.0.0.1:8000',
      '/health':      'http://127.0.0.1:8000',
      '/qa':          'http://127.0.0.1:8000',
      '/translate':   'http://127.0.0.1:8000',
      '/languages':   'http://127.0.0.1:8000',
      '/index':       'http://127.0.0.1:8000',
    }
  }
})