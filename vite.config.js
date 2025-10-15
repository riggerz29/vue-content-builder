import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ command }) => {
  const isServe = command === 'serve'

  return {
    plugins: [vue()],
    root: isServe ? './demo' : '.',
    build: isServe ? {} : {
      lib: {
        entry: path.resolve(__dirname, 'src/index.js'),
        name: 'EmailBuilder',
        fileName: (format) => `email-builder.${format}.js`
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue'
          }
        }
      }
    }
  }
})
