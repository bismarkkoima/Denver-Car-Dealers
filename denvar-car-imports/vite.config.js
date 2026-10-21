import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const root = import.meta.dirname;

// <site-nav> is drawn by JavaScript. Making the entry script render-blocking
// means the nav exists before the first paint, which page transitions need
// (the highlighted link glides between pages) and which avoids a nav-less
// flash. The bundle is small. Vite drops unknown script attributes, so it is
// added to the built pages here.
const renderBlockingEntry = {
  name: 'render-blocking-entry',
  enforce: 'post',
  transformIndexHtml(html) {
    return html.replace(
      /<script type="module"( crossorigin)? src=/g,
      '<script type="module" blocking="render"$1 src='
    );
  },
};

// Multi-page site: every HTML file is its own entry so Vite bundles and
// fingerprints the CSS/JS each page uses. `base: './'` keeps asset URLs
// relative, so the build works on GitHub Pages, Netlify, or any subfolder.
export default defineConfig({
  base: './',
  plugins: [renderBlockingEntry],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        worlds: resolve(root, 'worlds.html'),
        inventory: resolve(root, 'inventory.html'),
        about: resolve(root, 'about.html'),
        contact: resolve(root, 'contact.html'),
        styleguide: resolve(root, 'styleguide.html'),
      },
    },
  },
});
