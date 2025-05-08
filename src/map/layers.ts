import { getTopLeft, getWidth } from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import { get as getProjection } from 'ol/proj.js';
import { WMTS, XYZ } from 'ol/source';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

const projection = getProjection('EPSG:3857')!!;
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
      source: new XYZ({
        url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=topo&STYLE=default&FORMAT=image/png&TILEMATRIXSET=utm33n&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
      }),
    }),
  },
  europaForenklet: {
    layer: new TileLayer({
      source: new WMTS({
        url: 'https://cache.kartverket.no/test/wmts/1.0.0/europa_forenklet/default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
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
