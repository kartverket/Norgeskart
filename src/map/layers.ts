import { getWidth } from 'ol/extent';
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { get as getProjection } from 'ol/proj.js';
import { WMTS } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { ProjectionIdentifier } from './atoms';

const getMatrixSetForProjection = (projectionId: ProjectionIdentifier) => {
  switch (projectionId) {
    case 'EPSG:25832':
      return 'utm32n';
    case 'EPSG:25833':
      return 'utm33n';
    case 'EPSG:25835':
      return 'utm35n';
    case 'EPSG:3857':
      return 'webmercator';
    default:
      return 'utm33n';
  }
};

//Sjekk disse om de egentlig gir mening
const getExtentsForProjection = (projectionId: ProjectionIdentifier) => {
  switch (projectionId) {
    case 'EPSG:25832':
      return [-1866822.47, 3680224.65, 3246120.36, 9483069.2];
    case 'EPSG:25833':
      return [-2500000, 3500000, 3045984, 9045984];
    case 'EPSG:25835':
      return [-3646007.42, 3680723.36, 1528001.15, 9567789.69];
    case 'EPSG:3857':
      return [-20037508.34, -20048966.1, 20037508.34, 20048966.1];
    default:
      return [-20037508.34, -20048966.1, 20037508.34, 20048966.1];
  }
};

const getWMTSTileGrid = (extent: number[]) => {
  const size = getWidth(extent) / 256;
  const resolutions = new Array(19);
  const matrixIds = new Array(19);
  for (let z = 0; z < 19; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z.toString();
  }

  return new WMTSTileGrid({
    extent,
    resolutions,
    matrixIds,
  });
};

const getProjectionParameters = (projectionId: ProjectionIdentifier) => {
  const projection = getProjection(projectionId)!;
  const projectionExtent = getExtentsForProjection(projectionId);
  const size = getWidth(projectionExtent) / 256;

  const tileGrid = getWMTSTileGrid(projectionExtent);

  const resolutions = new Array(19);
  const matrixIds = new Array(19);
  for (let z = 0; z < 19; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
  }

  const matrixSet = getMatrixSetForProjection(projectionId);
  return { projection, tileGrid, matrixSet };
};

const getOrthphotoUrl = (projectionId: ProjectionIdentifier) => {
  const urlPrefix = 'https://opencache.statkart.no/gatekeeper/gk/';
  switch (projectionId) {
    case 'EPSG:25832':
      return urlPrefix + 'gk.open_nib_utm32_wmts_v2';
    case 'EPSG:25833':
      return urlPrefix + 'gk.open_nib_utm33_wmts_v2?';
    case 'EPSG:25835':
      return urlPrefix + 'gk.open_nib_utm35_wmts_v2?';
    case 'EPSG:3857':
      return urlPrefix + 'gk.open_nib_web_mercator_wmts_v2?';
    default:
      return urlPrefix + 'gk.open_nib_web_mercator_wmts_v2?';
  }
};

type LayerFunction =
  | ((_: ProjectionIdentifier) => BaseLayer)
  | (() => BaseLayer);

export const isMapLayerBackground = (layer: BaseLayer) => {
  return Object.keys(mapLayers.backgroundLayers).some(
    (bgLayerId) => bgLayerId === layer.get('id'),
  );
};

export const isMapLayerEuropaForenklet = (layer: BaseLayer) => {
  return layer.get('id') === 'europaForenklet';
};
export type MapLayer = {
  getLayer: LayerFunction;
  id: string;
  maxZoom?: number;
};

export type MapLayers = {
  backgroundLayers: {
    topo: MapLayer;
    topoGrayscale: MapLayer;
    topo_2025: MapLayer;
    orthophoto: MapLayer;
  };
  europaForenklet: MapLayer;
  drawLayer: MapLayer;
  markerLayer: MapLayer;
};

const getWMTSSource = (
  url: string,
  layer: string,
  projectionId: ProjectionIdentifier,
  overrideMatrixSet?: string,
) => {
  const { projection, tileGrid, matrixSet } =
    getProjectionParameters(projectionId);
  return new WMTS({
    url,
    layer,
    matrixSet: overrideMatrixSet || matrixSet,
    projection,
    format: 'image/png',
    tileGrid,
    style: 'default',
    wrapX: true,
  });
};

export type BackgroundLayer = keyof MapLayers['backgroundLayers'];

const mapLayers: MapLayers = {
  backgroundLayers: {
    topo: {
      id: 'topo',
      getLayer: (projectionId: ProjectionIdentifier) => {
        return new TileLayer({
          properties: { id: 'topo' },
          zIndex: 1,
          source: getWMTSSource(
            'https://cache.kartverket.no/v1/service',
            'topo',
            projectionId,
          ),
        });
      },
    },

    topoGrayscale: {
      id: 'topoGrayscale',
      getLayer: (projectionId: ProjectionIdentifier) => {
        return new TileLayer({
          properties: { id: 'topoGrayscale' },
          zIndex: 1,
          source: getWMTSSource(
            'https://cache.kartverket.no/v1/service',
            'topograatone',
            projectionId,
          ),
        });
      },
    },

    topo_2025: {
      id: 'topo_2025',
      getLayer: (projectionId: ProjectionIdentifier) => {
        return new TileLayer({
          properties: { id: 'topo_2025' },
          zIndex: 1,
          source: getWMTSSource(
            'https://cache.atkv3-dev.kartverket.cloud/v1/service',
            'topo',
            projectionId,
          ),
        });
      },
    },

    orthophoto: {
      id: 'orthophoto',
      getLayer: (projectionId: ProjectionIdentifier) => {
        return new TileLayer({
          properties: { id: 'orthophoto' },
          zIndex: 1,
          source: getWMTSSource(
            getOrthphotoUrl(projectionId),
            'Nibcache_web_mercator_v2',
            projectionId,
            'default028mm',
          ),
        });
      },
      maxZoom: 17,
    },
  },

  europaForenklet: {
    id: 'europaForenklet',
    getLayer: (projectionId: ProjectionIdentifier) => {
      const { projection, tileGrid, matrixSet } =
        getProjectionParameters(projectionId);

      return new TileLayer({
        properties: { id: 'europaForenklet' },
        zIndex: 0,
        source: new WMTS({
          url: 'https://cache.kartverket.no/v1/service',
          layer: 'europaForenklet',
          matrixSet: matrixSet,
          format: 'image/png',
          projection: projection,
          tileGrid: tileGrid,
          style: 'default',
          wrapX: true,
        }),
      });
    },
  },

  drawLayer: {
    id: 'drawLayer',
    getLayer: () => {
      return new VectorLayer({
        zIndex: 2,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'drawLayer' },
      });
    },
  },

  markerLayer: {
    id: 'markerLayer',
    getLayer: () => {
      return new VectorLayer({
        zIndex: 3,
        source: new VectorSource({ wrapX: false }),
        properties: { id: 'markerLayer' },
      });
    },
  },
};

export { mapLayers };
