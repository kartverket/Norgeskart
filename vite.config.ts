import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { defineConfig } from 'vitest/config';

// Falls back to 'unknown' when building outside a git checkout (e.g. a Docker
// build stage that doesn't COPY .git) so the build doesn't crash over a label.
function getCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

const commitHash = getCommitHash();
const buildDate = new Date().toISOString();

// Dev and preview both need the same CORS proxy to reach the style API.
// secure: false was dropped — dnl.kartverket.no presents a valid cert.
const stylesApiProxy = {
  '/api/styles': {
    target: 'https://dnl.kartverket.no',
    changeOrigin: true,
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000,
    proxy: stylesApiProxy,
  },
  preview: {
    port: 4173,
    proxy: stylesApiProxy,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/**/*.d.ts'],
    },
  },
});
