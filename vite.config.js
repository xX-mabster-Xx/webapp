import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';


export default defineConfig({
  base: '/',
  plugins: [react(), nodePolyfills()],
  define: {
    global: 'globalThis',
  },
  server: {
    open: true, // Открывать браузер при запуске
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Поддержка TypeScript
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
