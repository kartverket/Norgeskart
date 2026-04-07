/**
 * DEV TOOL: Layer status matrix logger
 *
 * Tracks WMS load success/failure per layer per zoom level.
 * Outputs a console.table matrix and JSON blob for copy-paste into a spreadsheet
 * or comparison website.
 *
 * Available in browser console:
 *   window.printLayerMatrix()   — print matrix table now
 *   window.copyLayerMatrix()    — copy JSON to clipboard
 *   window.__layerMatrix        — raw data object
 */

export type LayerStatus = 'ok' | 'error' | 'loading';
export type Provider = 'Mapserver' | 'QGIS' | 'other';

interface LayerInfo {
  name: string;
  provider: Provider;
  wmsUrl: string;
}

// matrix[layerId][zoom] = worst status seen (error beats ok beats loading)
const matrix: Record<string, Record<number, LayerStatus>> = {};
const layerInfo: Record<string, LayerInfo> = {};

function getCurrentZoom(): number {
  const params = new URLSearchParams(window.location.search);
  const z = parseFloat(params.get('zoom') ?? '');
  return isNaN(z) ? -1 : Math.round(z);
}

export function registerLayer(layerId: string, info: LayerInfo): void {
  layerInfo[layerId] = info;
  if (!matrix[layerId]) matrix[layerId] = {};
}

const STATUS_RANK: Record<LayerStatus, number> = { error: 2, ok: 1, loading: 0 };

export function updateStatus(layerId: string, status: LayerStatus): void {
  const zoom = getCurrentZoom();
  if (!matrix[layerId]) matrix[layerId] = {};
  const current = matrix[layerId][zoom];
  // errors are sticky; ok beats loading
  if (!current || STATUS_RANK[status] > STATUS_RANK[current]) {
    matrix[layerId][zoom] = status;
  }
  scheduleLog();
}

let logTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleLog(): void {
  if (logTimer) return;
  logTimer = setTimeout(() => {
    logTimer = null;
    printMatrix();
  }, 800);
}

function printMatrix(): void {
  const allZooms = [
    ...new Set(
      Object.values(matrix).flatMap((z) => Object.keys(z).map(Number)),
    ),
  ].sort((a, b) => a - b);

  const rows = Object.entries(matrix)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, zoomMap]) => {
      const info = layerInfo[id] ?? { name: id, provider: 'other', wmsUrl: '' };
      const row: Record<string, string> = {
        Layer: id,
        Name: info.name,
        Provider: info.provider,
      };
      for (const z of allZooms) {
        const s = zoomMap[z];
        row[`Z${z}`] =
          s === 'ok' ? '✓' : s === 'error' ? '✗' : s === 'loading' ? '…' : '';
      }
      return row;
    });

  const summary = {
    generatedAt: new Date().toISOString(),
    zoomLevelsTested: allZooms,
    layers: Object.entries(matrix).map(([id, zoomMap]) => ({
      id,
      name: layerInfo[id]?.name ?? id,
      provider: layerInfo[id]?.provider ?? 'other',
      wmsUrl: layerInfo[id]?.wmsUrl ?? '',
      statusByZoom: Object.fromEntries(
        Object.entries(zoomMap).map(([z, s]) => [
          `zoom${z}`,
          { status: s, symbol: s === 'ok' ? '✓' : s === 'error' ? '✗' : '…' },
        ]),
      ),
    })),
  };

  console.group(
    '%c[LayerMatrix] Mapserver vs QGIS — status by zoom level',
    'color: #0a6; font-weight: bold',
  );
  console.table(rows);
  console.log(
    '%c[LayerMatrix] JSON (for comparison site):',
    'color: #888',
    '\n' + JSON.stringify(summary, null, 2),
  );
  console.groupEnd();
}

// Expose globally for console use
declare global {
  interface Window {
    __layerMatrix: typeof matrix;
    __layerInfo: typeof layerInfo;
    printLayerMatrix: typeof printMatrix;
    copyLayerMatrix: () => void;
  }
}

window.__layerMatrix = matrix;
window.__layerInfo = layerInfo;
window.printLayerMatrix = printMatrix;
window.copyLayerMatrix = () => {
  const summary = {
    generatedAt: new Date().toISOString(),
    layers: Object.entries(matrix).map(([id, zoomMap]) => ({
      id,
      name: layerInfo[id]?.name ?? id,
      provider: layerInfo[id]?.provider ?? 'other',
      wmsUrl: layerInfo[id]?.wmsUrl ?? '',
      statusByZoom: zoomMap,
    })),
  };
  navigator.clipboard
    .writeText(JSON.stringify(summary, null, 2))
    .then(() => console.log('%c[LayerMatrix] ✓ Copied to clipboard!', 'color: #0a6'))
    .catch(() => console.warn('[LayerMatrix] Clipboard write failed — see JSON above'));
};

console.info(
  '%c[LayerMatrix] Layer status logger active. Use window.printLayerMatrix() or window.copyLayerMatrix()',
  'color: #0a6',
);
