import { getTopLeft, getWidth } from 'ol/extent';
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
    // case 'EPSG:25832':
    //   return 'utm32n';
    case 'EPSG:25833':
      return 'utm33n';
    case 'EPSG:25835':
      return 'utm35n';
    default:
      return 'utm33n';
  }
};

const getProjectionParameters = (projectionId: ProjectionIdentifier) => {
  const projection = getProjection(projectionId)!;
  const projectionExtent = projection.getExtent();
  const size = getWidth(projectionExtent) / 256;

  const resolutions = new Array(19);
  const matrixIds = new Array(19);
  for (let z = 0; z < 19; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
  }

  const matrixSet = getMatrixSetForProjection(projectionId);
  return { projection, projectionExtent, resolutions, matrixIds, matrixSet };
};

type LayerFunction =
  | ((_: ProjectionIdentifier) => BaseLayer)
  | (() => BaseLayer);

export type MapLayer = {
  getLayer: LayerFunction;
  id: string;
};

export type MapLayers = {
  backgroundLayers: {
    newTopo: MapLayer;
    topo: MapLayer;
  };
  europaForenklet: MapLayer;
  drawLayer: MapLayer;
};

export type BackgroundLayer = keyof MapLayers['backgroundLayers'];

const mapLayers: MapLayers = {
  backgroundLayers: {
    newTopo: {
      id: 'newTopo',
      getLayer: (projectionId: ProjectionIdentifier) => {
        const {
          projection,
          projectionExtent,
          resolutions,
          matrixIds,
          matrixSet,
        } = getProjectionParameters(projectionId);
        return new TileLayer({
          properties: { id: 'newTopo' },
          zIndex: 1,
          source: new WMTS({
            url: 'https://cache.atgcp1-prod.kartverket.cloud/v1/service',
            layer: 'topo',
            matrixSet: matrixSet,
            projection: projection,
            format: 'image/png',
            tileGrid: new WMTSTileGrid({
              origin: getTopLeft(projectionExtent),
              resolutions: resolutions,
              matrixIds: matrixIds,
            }),
            style: 'default',
            wrapX: true,
          }),
        });
      },
    },

    topo: {
      id: 'topo',
      getLayer: (projectionId: ProjectionIdentifier) => {
        const {
          projection,
          projectionExtent,
          resolutions,
          matrixIds,
          matrixSet,
        } = getProjectionParameters(projectionId);
        return new TileLayer({
          properties: { id: 'topo' },
          zIndex: 1,
          source: new WMTS({
            url: 'https://cache.atkv3-dev.kartverket-intern.cloud/v1/service',
            layer: 'topo',
            matrixSet: matrixSet,
            projection: projection,
            format: 'image/png',
            tileGrid: new WMTSTileGrid({
              origin: getTopLeft(projectionExtent),
              resolutions: resolutions,
              matrixIds: matrixIds,
            }),
            style: 'default',
            wrapX: true,
          }),
        });
      },
    },
  },

  europaForenklet: {
    id: 'europaForenklet',
    getLayer: (projectionId: ProjectionIdentifier) => {
      const {
        projection,
        projectionExtent,
        resolutions,
        matrixIds,
        matrixSet,
      } = getProjectionParameters(projectionId);

      return new TileLayer({
        properties: { id: 'europaForenklet' },
        zIndex: 0,
        source: new WMTS({
          url: 'https://cache.kartverket.no/v1/service',
          layer: 'europaForenklet',
          matrixSet: matrixSet,
          format: 'image/png',
          projection: projection,
          tileGrid: new WMTSTileGrid({
            origin: getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds,
          }),
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
};

export { mapLayers };
