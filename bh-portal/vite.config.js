import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/**/*.test.{js,jsx}'],
      // Fail CI if coverage regresses below these floors (set under current
      // levels to leave headroom). The pure business logic in src/lib is held
      // to a higher bar than the UI.
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 82,
        functions: 58,
        'src/lib/**': {
          lines: 90,
          statements: 90,
          branches: 90,
          functions: 90,
        },
      },
    },
  },
})
