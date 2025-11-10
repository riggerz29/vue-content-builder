import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig(({ command }) => {
  const isServe = command === 'serve'

  return {
    plugins: isServe ? [vue()] : [vue(), cssInjectedByJsPlugin()],
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
