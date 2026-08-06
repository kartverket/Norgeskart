import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { createRequire } from 'module';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';

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

// maplibre-gl locates its vector-tile-parsing worker at runtime via
// `new URL('./maplibre-gl-worker.mjs', import.meta.url)` — a plain string,
// not a static `new Worker(new URL(...))` that Rollup's import analysis can
// see. So the build never emits that file, and MapLibre GL silently fails to
// fetch it (404) in production: every vector-tile source (e.g. the nautical
// background style) stays blank while raster/WMTS layers keep working since
// they don't need the worker. Copy the worker next to our hashed chunks so
// the runtime-constructed URL actually resolves.
function copyMaplibreWorkerPlugin(): Plugin {
  let outDir = 'dist';
  return {
    name: 'copy-maplibre-gl-worker',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      // vite.config.ts runs as ESM (package.json "type": "module"), so
      // require.resolve isn't available directly — createRequire recovers it
      // for locating the installed maplibre-gl package's dist folder.
      const require = createRequire(import.meta.url);
      const maplibreDist = path.dirname(
        require.resolve('maplibre-gl/dist/maplibre-gl.mjs'),
      );
      const assetsDir = path.resolve(outDir, 'assets');
      fs.mkdirSync(assetsDir, { recursive: true });
      for (const file of fs.readdirSync(maplibreDist)) {
        if (file.startsWith('maplibre-gl-worker')) {
          fs.copyFileSync(
            path.join(maplibreDist, file),
            path.join(assetsDir, file),
          );
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    copyMaplibreWorkerPlugin(),
  ],
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
