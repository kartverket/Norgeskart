import MVT from 'ol/format/MVT';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import type { ThemeLayerDefinition } from '../../api/themeLayerConfigApi';
import { createStyleFromConfig } from './themeGeoJson';

export const createMvtThemeLayer = (
  layerDef: ThemeLayerDefinition,
): VectorTileLayer => {
  return new VectorTileLayer({
    source: new VectorTileSource({
      format: new MVT(),
      // OGC API Tiles uses {tileMatrix}/{tileRow}/{tileCol} — maps to OL's {z}/{y}/{x}
      url: layerDef.mvtUrl,
    }),
    style: createStyleFromConfig(layerDef.style),
    properties: {
      id: `theme.${layerDef.id}`,
    },
  });
};
