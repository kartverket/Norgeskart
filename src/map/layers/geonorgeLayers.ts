import type TileLayer from 'ol/layer/Tile';
import type { InfoFormat } from '../featureInfo/types';
import {
  createUrlWmsLayer,
  createVerifiedWmsLayer,
  UrlWmsProperties,
  WmsScaleRange,
} from './urlWms';
import { GeonorgeToken, isGeonorgeId } from './urlWmsState';

/** Generated and render-tested by scripts/generateGeonorgeWmsLayers.js. */
export type GeonorgeWmsLayer = {
  id: string;
  title: string;
  organization: string;
  category: string;
  url: string;
  layer: string;
  /** WMS scale denominators the layer draws between, when limited. */
  minScale?: number;
  maxScale?: number;
  /** First sentence of the catalog abstract: what the data actually is. */
  summary: string | null;
  detailsUrl: string | null;
  type: string;
  /** false when the capabilities mark the layer(s) queryable="0". */
  queryable?: false;
  /** Requests the whole service rather than one layer of it. */
  whole?: boolean;
  /** Zoomed-in-only twin of an overview layer (NVE "Dam" next to "Dam_N250"). */
  variant?: 'detailed';
};

export type GeonorgeWmsService = {
  title: string;
  organization: string;
  summary: string | null;
  detailsUrl: string | null;
  /** Best GetFeatureInfo format the service offers; null = none. */
  infoFormat: InfoFormat | null;
};

export type GeonorgeWmsData = {
  services: Record<string, GeonorgeWmsService>;
  layers: GeonorgeWmsLayer[];
};

// ~80 kB gzipped, so only fetched when needed.
export const loadGeonorgeWmsData = async (): Promise<GeonorgeWmsData> =>
  (await import('../../settings/map/themes/geonorgeWmsLayers.json'))
    .default as GeonorgeWmsData;

export const createGeonorgeEntryLayer = (
  entry: GeonorgeWmsLayer,
  service: GeonorgeWmsService | undefined,
  title: string,
  projection: string,
  layers: string = entry.layer,
): TileLayer => {
  const noInfo = service?.infoFormat === null || entry.queryable === false;
  return createVerifiedWmsLayer(entry.url, layers, projection, {
    layerTitle: title,
    serviceTitle: service?.title,
    entryId: entry.id,
    defaultLayers: entry.layer,
    scaleRange: {
      minScale: entry.minScale,
      maxScale: entry.maxScale,
    } satisfies WmsScaleRange,
    ...(isGeonorgeId(entry.id) ? { geonorgeId: entry.id } : {}),
    ...(entry.detailsUrl ? { geonorgeDetailsUrl: entry.detailsUrl } : {}),
    ...(noInfo
      ? { queryable: false }
      : service?.infoFormat
        ? { infoFormat: service.infoFormat }
        : {}),
  });
};

const CATALOG_URL = 'https://kartkatalog.geonorge.no';
const CATALOG_TIMEOUT_MS = 15_000;

export const geonorgeDetailsUrl = (id: string) =>
  `${CATALOG_URL}/metadata/uuid/${encodeURIComponent(id)}`;

/** The parts of api/getdata that decide what to show. */
export type CatalogRecord = {
  Title?: string;
  DistributionDetails?: { Protocol?: string; URL?: string; Name?: string };
  ServiceDistributionProtocolForDataset?: string | null;
  ServiceDistributionUrlForDataset?: string | null;
  ServiceDistributionNameForDataset?: string | null;
  DatasetServicesWithShowMapLink?:
    { DistributionProtocol?: string; GetCapabilitiesUrl?: string }[] | null;
};

export type CatalogWms = {
  url: string;
  wanted: string[];
  matchTitle?: string;
  titleFirst?: boolean;
};

const WMS_PROTOCOLS = ['OGC:WMS', 'WMS-tjeneste'];

/** null when the record has no WMS. */
export const wmsFromCatalogRecord = (r: CatalogRecord): CatalogWms | null => {
  const own = r.DistributionDetails;
  if (own?.URL && WMS_PROTOCOLS.includes(own.Protocol ?? '')) {
    return own.Name
      ? { url: own.URL, wanted: own.Name.split(','), matchTitle: r.Title }
      : { url: own.URL, wanted: [] };
  }
  const viaService = (url: string): CatalogWms => ({
    url,
    wanted: r.ServiceDistributionNameForDataset
      ? r.ServiceDistributionNameForDataset.split(',')
      : [],
    matchTitle: r.Title,
    titleFirst: true,
  });
  if (
    r.ServiceDistributionUrlForDataset &&
    r.ServiceDistributionProtocolForDataset === 'OGC:WMS'
  ) {
    return viaService(r.ServiceDistributionUrlForDataset);
  }
  const linked = r.DatasetServicesWithShowMapLink?.find(
    (s) =>
      s.GetCapabilitiesUrl &&
      (WMS_PROTOCOLS.includes(s.DistributionProtocol ?? '') ||
        (s.DistributionProtocol === 'Tjenestelag' &&
          /service=wms/i.test(s.GetCapabilitiesUrl))),
  );
  return linked?.GetCapabilitiesUrl
    ? viaService(linked.GetCapabilitiesUrl)
    : null;
};

/** Carries the dataset title when the catalog gave us one. */
export class GeonorgeLayerError extends Error {
  readonly title?: string;
  constructor(message: string, title?: string) {
    super(message);
    this.title = title;
  }
}

const createFromCatalog = async (
  { id, layers }: GeonorgeToken,
  projection: string,
): Promise<TileLayer> => {
  const resp = await fetch(
    `${CATALOG_URL}/api/getdata/${encodeURIComponent(id)}`,
    { signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS) },
  );
  if (!resp.ok) throw new GeonorgeLayerError(`getdata ${resp.status}`);
  const record = (await resp.json()) as CatalogRecord;
  const wms = wmsFromCatalogRecord(record);
  if (!wms) throw new GeonorgeLayerError('No WMS in record', record.Title);

  const properties: UrlWmsProperties = {
    geonorgeId: id,
    geonorgeDetailsUrl: geonorgeDetailsUrl(id),
    ...(record.Title ? { layerTitle: record.Title } : {}),
  };
  try {
    return await createUrlWmsLayer({
      url: wms.url,
      projection,
      ...(layers
        ? // defaultLayers '' = always write the explicit choice back to the URL.
          { wanted: layers, properties: { ...properties, defaultLayers: '' } }
        : { ...wms, properties }),
    });
  } catch (e) {
    throw new GeonorgeLayerError(String(e), record.Title);
  }
};

/** Our verified list first, then the live catalog. Throws when neither works. */
export const createGeonorgeLayer = async (
  token: GeonorgeToken,
  projection: string,
): Promise<TileLayer> => {
  const data = await loadGeonorgeWmsData();
  const entry = data.layers.find((l) => l.id === token.id);
  if (!entry) return createFromCatalog(token, projection);
  const service = data.services[entry.url];
  return createGeonorgeEntryLayer(
    entry,
    service,
    entry.whole ? (service?.title ?? entry.title) : entry.title,
    projection,
    token.layers?.join(','),
  );
};
