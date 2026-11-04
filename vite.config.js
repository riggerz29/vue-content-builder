import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig(({ command, mode }) => {
  // Vitest loads this config with mode "test" and command "serve". Keep the
  // demo root and the library-only plugins off that path so tests resolve src/.
  const isTest = mode === 'test' || !!process.env.VITEST
  const isServe = command === 'serve' && !isTest

  return {
    plugins: isServe || isTest ? [vue()] : [vue(), cssInjectedByJsPlugin()],
    root: isServe ? './demo' : '.',
    test: {
      environment: 'happy-dom',
      include: ['src/**/*.test.js']
    },
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
