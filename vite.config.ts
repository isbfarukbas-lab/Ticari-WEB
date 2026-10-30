import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Generates static HTML entry points for top-level SPA routes (`/admin`, `/teklif`, `/tanitim`, etc.)
 * plus `404.html` fallback so static hosts like Render return HTTP 200 OK on direct visits & F5 refreshes.
 */
function spaStaticRoutesPlugin(): Plugin {
  return {
    name: 'rvoba-spa-static-routes',
    apply: 'build',
    async closeBundle() {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const distDir = path.resolve('dist');
      const indexHtmlPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexHtmlPath)) return;

      const htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
      const staticRoutes = ['admin', 'teklif', 'hesapla', 'tanitim', 'hakkimizda'];

      for (const route of staticRoutes) {
        const routeDir = path.join(distDir, route);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, 'index.html'), htmlContent, 'utf-8');
      }

      // Fallback 404.html for any other dynamic path
      fs.writeFileSync(path.join(distDir, '404.html'), htmlContent, 'utf-8');
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaStaticRoutesPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
