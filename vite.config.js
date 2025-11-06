import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React e React DOM
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // React Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Charts
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // PDF
            if (id.includes('jspdf')) {
              return 'vendor-pdf';
            }
            // Formulários
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            // Outras bibliotecas grandes
            if (id.includes('axios') || id.includes('date-fns')) {
              return 'vendor-utils';
            }
            // Outros node_modules
            return 'vendor';
          }
          // Chunks por portal
          if (id.includes('/pages/Student/')) {
            return 'portal-student';
          }
          if (id.includes('/pages/Parent/')) {
            return 'portal-parent';
          }
          if (id.includes('/pages/Teacher/')) {
            return 'portal-teacher';
          }
          if (id.includes('/pages/Coordinator/')) {
            return 'portal-coordinator';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
    },
  },
})

