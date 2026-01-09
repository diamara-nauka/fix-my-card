import { defineConfig } from 'astro/config'
import solid from '@astrojs/solid-js'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://fixmycard.fr',
  integrations: [
    solid(),
    tailwind(),
    sitemap({
      filter: (page) =>
        page !== 'https://fixmycard.fr/admin/' &&
        page !== 'https://fixmycard.fr/merci/',
    }),
  ],
})
