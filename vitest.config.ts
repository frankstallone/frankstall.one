import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [wgslVitePlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
