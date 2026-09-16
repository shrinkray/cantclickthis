// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cantclickthis.dev',
  output: 'static',
  build: {
    // One stylesheet in the head instead of several small ones, so nothing
    // renders unstyled on conference wifi.
    inlineStylesheets: 'auto'
  },
  devToolbar: {
    // The toolbar injects its own UI into the page, which shows up in screen
    // reader demos and screen captures. Off.
    enabled: false
  }
});
