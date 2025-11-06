import TileLayer from 'ol/layer/Tile';
import { TileWMS } from 'ol/source';
import { getEnv } from '../../env';

type PropertyLayerName = 'adresses' | 'buildings' | 'parcels';
type OutdoorsLifeLayerName =
  | 'hikingTrails'
  | 'skiingTrails'
  | 'routeInfoPoints'
  | 'bikeTrails'
  | 'waterTrails';
type FactsLayerName = 'osloMarkaBorder';

export type ThemeLayerName =
  | PropertyLayerName
  | OutdoorsLifeLayerName
  | FactsLayerName;

const ENV = getEnv();

export const getThemeWMSLayer = (
  layerName: ThemeLayerName,
  projection: string,
): TileLayer | null => {
  switch (layerName) {
    case 'adresses':
      return new TileLayer({
        source: new TileWMS({
          url: `${ENV.apiUrl}/v1/matrikkel/wms`,
          params: {
            LAYERS: 'matrikkel:MATRIKKELADRESSEWFS,matrikkel:VEGADRESSEWFS',
            TILED: true,
            TRANSPARENT: true,
            SRS: projection,
          },
          projection: projection,
        }),
        properties: {
          id: `theme.${layerName}`,
        },
      });
    case 'buildings':
      return new TileLayer({
        source: new TileWMS({
          url: `${ENV.apiUrl}/v1/matrikkel/wms`,
          params: {
            LAYERS: 'matrikkel:BYGNINGWFS',
            TILED: true,
            TRANSPARENT: true,
            SRS: projection,
          },
          projection: projection,
        }),
        properties: {
          id: `theme.${layerName}`,
        },
      });
    case 'parcels':
      return new TileLayer({
        source: new TileWMS({
          url: `${ENV.apiUrl}/v1/matrikkel/wms`,
          params: {
            LAYERS: 'matrikkel:TEIGGRENSEWFS,matrikkel:TEIGWFS',
            TILED: true,
            TRANSPARENT: true,
            SRS: projection,
            STYLES: ',Matrikkelnummer',
          },
          projection: projection,
        }),
        properties: {
          id: `theme.${layerName}`,
        },
      });

    //Shared handling for outdoors life layers
    case 'hikingTrails':
    case 'routeInfoPoints':
    case 'skiingTrails':
    case 'bikeTrails':
    case 'waterTrails':
      return getOutdoorsLifeWMSLayer(layerName, projection);
    case 'osloMarkaBorder':
      return getNorwayFactsWMSLayer(layerName, projection);
    default:
      return null;
  }
};

const getNorwayFactsWMSLayer = (
  layerName: FactsLayerName,
  projection: string,
): TileLayer | null => {
  let wmsLayerName: string;
  switch (layerName) {
    case 'osloMarkaBorder':
      wmsLayerName = 'Markagrensen';
      break;
  }

  return getGeoNorgeWMSLayer(
    'markagrensen',
    projection,
    wmsLayerName,
    layerName,
  );
};

const getOutdoorsLifeWMSLayer = (
  layerName: OutdoorsLifeLayerName,
  projection: string,
): TileLayer | null => {
  let wmsLayerName: string;
  switch (layerName) {
    case 'hikingTrails':
      wmsLayerName = 'Fotrute';
      break;
    case 'skiingTrails':
      wmsLayerName = 'Skiloype';
      break;
    case 'routeInfoPoints':
      wmsLayerName = 'Ruteinfopunkt';
      break;
    case 'bikeTrails':
      wmsLayerName = 'Sykkelrute';
      break;
    case 'waterTrails':
      wmsLayerName = 'AnnenRute';
      break;
  }

  return getGeoNorgeWMSLayer(
    'friluftsruter2',
    projection,
    wmsLayerName,
    layerName,
  );
};

const getGeoNorgeWMSLayer = (
  wmsName: string,
  projection: string,
  layerNames: string,
  layerId: string,
): TileLayer => {
  return new TileLayer({
    source: new TileWMS({
      url: `${ENV.geoNorgeWMSUrl}.${wmsName}`,
      params: {
        LAYERS: layerNames,
        TILED: true,
        TRANSPARENT: true,
        SRS: projection,
      },
      projection: projection,
    }),
    properties: {
      id: `theme.${layerId}`,
    },
  });
};
