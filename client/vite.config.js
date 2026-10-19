import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import flowbiteReact from 'flowbite-react/plugin/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Bind-mounted folders in Docker do not always deliver file system events.
    watch: { usePolling: true, interval: 300 },
  },
});
