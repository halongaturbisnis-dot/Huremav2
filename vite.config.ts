import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          manifest: {
            name: 'HUREMA v2 - Sistem Manajemen Sumber Daya Terpadu',
            short_name: 'HUREMA',
            description: 'Sistem Manajemen Sumber Daya Terpadu dengan fitur Presensi, Cuti, Izin, dan Manajemen Performa (KPI) berbasis Supabase dan Google Drive.',
            theme_color: '#006E62',
            background_color: '#ffffff',
            display: 'standalone',
            icons: [
              {
                src: 'https://placehold.co/192x192/006E62/FFFFFF/png?text=H',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'https://placehold.co/512x512/006E62/FFFFFF/png?text=H',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'https://placehold.co/512x512/006E62/FFFFFF/png?text=H',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
