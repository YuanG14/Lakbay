import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lakbay — Smart Trip Planner',
        short_name: 'Lakbay',
        description: 'Plan Philippine road trips with route, fuel, toll, parking, and shared-cost estimates.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f5f9f6',
        theme_color: '#0f6b51',
        orientation: 'any',
        categories: ['travel', 'navigation', 'utilities'],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Plan a trip', short_name: 'Plan trip', url: '/plan-trip', icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }] },
          { name: 'My trips', short_name: 'Trips', url: '/trips', icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  build: {
    sourcemap: false,
    target: 'es2022',
  },
});
