import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr({ svgrOptions: { memo: true } })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
      '@assets': `${path.resolve(__dirname, './src/assets/')}`,
      '@hooks': `${path.resolve(__dirname, './src/hooks/')}`,
      '@pages': `${path.resolve(__dirname, './src/pages/')}`,
      '@components': `${path.resolve(__dirname, './src/components/')}`,
      '@services': `${path.resolve(__dirname, './src/services/')}`,
      '@factories': `${path.resolve(__dirname, './src/factories/')}`,
      '@types': `${path.resolve(__dirname, './src/types/')}`,
    },
  },
})
