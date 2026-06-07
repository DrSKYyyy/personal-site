import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import remarkWikiLink from './src/lib/remark-wiki-link.mjs';

export default defineConfig({
  site: 'https://xxs.beauty',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  markdown: {
    remarkPlugins: [remarkWikiLink],
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
  prefetch: {
    prefetchAll: true,
  },
  compressHTML: true,
});
