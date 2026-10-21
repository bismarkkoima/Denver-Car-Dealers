import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const root = import.meta.dirname;

// Multi-page site: every HTML file is its own entry so Vite bundles and
// fingerprints the CSS/JS each page uses. `base: './'` keeps asset URLs
// relative, so the build works on GitHub Pages, Netlify, or any subfolder.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        inventory: resolve(root, 'inventory.html'),
        about: resolve(root, 'about.html'),
        contact: resolve(root, 'contact.html'),
        styleguide: resolve(root, 'styleguide.html'),
      },
    },
  },
});
