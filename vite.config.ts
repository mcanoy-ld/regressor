import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import electron from 'vite-plugin-electron'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: [
        'src/electron/main.ts',
        'src/electron/preload.ts'
      ],
      vite: {
        build: {
          outDir: 'dist-electron',
          rollupOptions: {
            external: ['electron']
          }
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
