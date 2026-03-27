import type { ThemeLayerDefinition } from './themeLayerConfigApi';

export const FULLSTENDIGHETSDEKNING_BASE_URL =
  'https://testnedlasting.geonorge.no/geonorge/Basisdata/DOKFullstendighetsdekningskart/Kartkatalogen/';

const CATEGORY_ID = 'fullstendighetsdekning';
const GROUP_ID = 19;

/**
 * Derive a human-readable display name from a geojson filename.
 * e.g. "dekning_aktsomhetskart_jord_flomskred.geojson" → "Aktsomhetskart jord flomskred"
 */
function filenameToDisplayName(filename: string): string {
  const name = decodeURIComponent(filename)
    .replace(/^dekning_/, '')
    .replace(/\.geojson$/, '')
    .replace(/[_]/g, ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Derive a stable layer ID from a geojson filename.
 * e.g. "dekning_adresse.geojson" → "fd_adresse"
 */
function filenameToLayerId(filename: string): string {
  const name = decodeURIComponent(filename)
    .replace(/^dekning_/, '')
    .replace(/\.geojson$/, '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/_$/, '')
    .toLowerCase();
  return `fd_${name}`;
}

/**
 * Parse geojson filenames from an Apache-style directory listing HTML page.
 */
function parseDirectoryListing(html: string): string[] {
  const regex = /href="([^"]*\.geojson)"/gi;
  const filenames: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const filename = href.split('/').pop();
    if (filename) {
      filenames.push(filename);
    }
  }
  return [...new Set(filenames)];
}

/**
 * Fetch the Geonorge DOK fullstendighetsdekningskart directory listing and
 * return dynamically generated layer definitions for every .geojson file found.
 *
 * This means newly published datasets appear automatically without code changes.
 */
export async function fetchFullstendighetsdekningLayers(): Promise<
  ThemeLayerDefinition[]
> {
  const response = await fetch(FULLSTENDIGHETSDEKNING_BASE_URL);
  if (!response.ok) {
    console.error(
      `Failed to fetch fullstendighetsdekning listing: ${response.status}`,
    );
    return [];
  }

  const html = await response.text();
  const filenames = parseDirectoryListing(html);

  return filenames.map((filename) => {
    const displayName = filenameToDisplayName(filename);
    return {
      id: filenameToLayerId(filename),
      name: { nb: displayName, nn: displayName, en: displayName },
      type: 'geojson' as const,
      geojsonUrl: FULLSTENDIGHETSDEKNING_BASE_URL + filename,
      sourceEpsg: 'EPSG:25833',
      styleType: 'dekningsstatus' as const,
      categoryId: CATEGORY_ID,
      groupid: GROUP_ID,
    };
  });
}
