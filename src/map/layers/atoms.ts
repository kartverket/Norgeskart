import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import { optionsFromCapabilities, default as WMTS } from 'ol/source/WMTS';
import { mapAtom } from '../atoms';
import { BackgroundLayer } from '../layers';

//TODO: Slette denne filen.
const capabilitiesUrls: Record<BackgroundLayer | string, string> = {
  topo: 'https://cache.kartverket.no/v1/service?Request=GetCapabilities&Service=WMTS',
  topo_2025:
    'https://cache.kartverket.no/v1/service?Request=GetCapabilities&Service=WMTS',
  topograatone:
    'https://cache.kartverket.no/v1/service?Request=GetCapabilities&Service=WMTS',
  orthophoto:
    'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?Service=WMTS&Request=GetCapabilities',
  Nibcache_web_mercator_v2:
    'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?Service=WMTS&Request=GetCapabilities',
};

//Se om det hjelper å fjerne det med ortofoto og se om vi kan lage noe smart kapabilitetsmessig eller wmts layer atom som fikser dette.

const capabilitiesAtom = atom(async () => {
  const parser = new WMTSCapabilities();
  let capabilitiesRecord: Record<BackgroundLayer, any> = {
    topo: null,
    topo_2025: null,
    topoGrayscale: null,
    orthophoto: null,
  };

  await Promise.all(
    Object.keys(capabilitiesUrls).map(async (key) => {
      const url = capabilitiesUrls[key as BackgroundLayer];
      const response = await fetch(url);
      const text = await response.text();
      capabilitiesRecord[key as BackgroundLayer] = parser.read(text);
    }),
  );
  return capabilitiesRecord;
});

const wmtsLayersAtom = atom(async (get) => {
  const projection = get(mapAtom).getView().getProjection();
  const parser = new WMTSCapabilities();

  const layers: Record<BackgroundLayer | string, WMTS | null> = {
    topo: null,
    topo_2025: null,
    topograatone: null,
    Nibcache_web_mercator_v2: null,
    orthophoto: null,
  };

  await Promise.all(
    Object.keys(capabilitiesUrls).map(async (key) => {
      const url = capabilitiesUrls[key as BackgroundLayer];
      const response = await fetch(url);
      const text = await response.text();
      const capabilities = parser.read(text);
      console.log('Capabilities for', key, ':', capabilities);
      const options = optionsFromCapabilities(capabilities, {
        layer: key,
        matrixSet: projection.getCode(),
      });
      layers[key as BackgroundLayer] =
        options != null ? new WMTS(options) : null;
    }),
  );
  return layers;
});
export const capabilitiesLoadable = loadable(capabilitiesAtom);
export const layersLoadable = loadable(wmtsLayersAtom);
