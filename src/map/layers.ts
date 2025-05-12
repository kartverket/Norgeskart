import { getTopLeft, getWidth } from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import { get as getProjection } from 'ol/proj.js';
import { WMTS } from 'ol/source';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

const projection = getProjection('EPSG:3857')!;
const projectionExtent = projection.getExtent();
const size = getWidth(projectionExtent) / 256;

const resolutions = new Array(19);
const matrixIds = new Array(19);
for (let z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}

const mapLayers = {
  topo: {
    layer: new TileLayer({
      source: new WMTS({
        url: 'https://cache.atkv3-dev.kartverket-intern.cloud/v1/service',
        layer: 'topo',
        matrixSet: 'utm33n',
        format: 'image/png',
        tileGrid: new WMTSTileGrid({
          origin: getTopLeft(projectionExtent),
          resolutions: resolutions,
          matrixIds: matrixIds,
        }),
        style: 'default',
        wrapX: true,
      }),
    }),
  },
  europaForenklet: {
    layer: new TileLayer({
      source: new WMTS({
        url: 'https://cache.kartverket.no/test/wmts',
        layer: 'europa_forenklet',
        matrixSet: 'utm33n',
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
    }),
  },
};

export { mapLayers };
