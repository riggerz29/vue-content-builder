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
        // Runtime dependencies are installed alongside the package, so don't bundle a second copy.
        // Quill's stylesheet is the exception: it's inlined with our CSS so no extra import is needed.
        external: (id) =>
          id === 'vue' ||
          id === 'lucide-vue-next' ||
          ((id === 'quill' || id.startsWith('quill/')) && !id.endsWith('.css')),
        output: {
          // named + default export: `import EmailBuilder, { generateHTML } from '...'`
          exports: 'named',
          globals: {
            vue: 'Vue',
            quill: 'Quill',
            'lucide-vue-next': 'LucideVueNext'
          }
        }
      }
    }
  }
})
