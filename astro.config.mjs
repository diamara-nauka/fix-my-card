import { defineConfig } from 'astro/config'
import solid from '@astrojs/solid-js'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  output: 'static',
  integrations: [solid(), tailwind()],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    formats: ['webp', 'avif'],
  },
})
