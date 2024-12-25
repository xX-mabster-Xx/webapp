import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
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
