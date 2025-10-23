import react from '@vitejs/plugin-react';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { defineConfig } from 'vite';
import { createBlockletPlugin } from 'vite-plugin-blocklet';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      svgr(),
      createBlockletPlugin(),
      mode === 'development' &&
        codeInspectorPlugin({
          bundler: 'vite',
        }),
    ],
    server: {
      fs: {
        strict: false,
      },
    },
  };
});
