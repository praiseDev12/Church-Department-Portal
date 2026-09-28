import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'prompt',

      manifest: {
        name: 'Dominion City Asaba HQ Department Portal',
        short_name: 'DC Dept Portal',
        description: 'Dominion City Asaba HQ Department Management Portal',

        // Matches the portal's brand-500 color.
        theme_color: '#003599',
        background_color: '#ffffff',

        display: 'standalone',
        start_url: '/',
        scope: '/',

        icons: [
          {
            src: '/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
          },
          {
            src: '/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],

  server: {
    host: true,
  },
});
