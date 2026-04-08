import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vueHsml from 'vite-plugin-vue-hsml';
import wasm from 'vite-plugin-wasm';

const hsmlPkg = JSON.parse(
  readFileSync(resolve(import.meta.dirname, 'node_modules/hsml/package.json'), 'utf-8'),
);

export default defineConfig({
  base: '/playground/',
  plugins: [wasm(), vueHsml(), tailwindcss(), vue()],
  define: {
    __HSML_VERSION__: JSON.stringify(hsmlPkg.version as string),
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
  },
});
