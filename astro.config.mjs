import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://your-site.github.io',
  output: 'static',
  integrations: [],
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
