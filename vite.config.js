import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'docs',
    lib: {
      entry: path.resolve(__dirname, 'src/comoponents/index.js'),
      name: 'vue3-damp-fireworks',
      fileName: (format) => `vue3-damp-fireworks`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
})
