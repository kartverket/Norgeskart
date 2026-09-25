import type { ThemeLayerDefinition } from './themeLayerConfigApi';

export const FULLSTENDIGHETSDEKNING_BASE_URL =
  'https://testnedlasting.geonorge.no/geonorge/Basisdata/DOKFullstendighetsdekningskart/Kartkatalogen/';

const CATEGORY_ID = 'fullstendighetsdekning';
const GROUP_ID = 19;

/** "dekning_aktsomhetskart_jord_flomskred.geojson" → "Aktsomhetskart jord flomskred" */
function filenameToDisplayName(filename: string): string {
  const name = decodeURIComponent(filename)
    .replace(/^dekning_/, '')
    .replace(/\.geojson$/, '')
    .replace(/[_]/g, ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Stable id: "dekning_adresse.geojson" → "fd_adresse" */
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

/** .geojson hrefs from an Apache directory listing. */
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

/** One layer per file in Geonorge's listing, so new datasets need no code change. */
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
