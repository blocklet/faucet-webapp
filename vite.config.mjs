import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createBlockletPlugin } from 'vite-plugin-blocklet';
import svgr from 'vite-plugin-svgr';

export default defineConfig(() => {
  return {
    plugins: [react(), svgr(), createBlockletPlugin()],
    server: {
      fs: {
        strict: false,
      },
    },
  };
});
