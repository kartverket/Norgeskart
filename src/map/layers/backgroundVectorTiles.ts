import { apply } from 'ol-mapbox-style';
import LayerGroup from 'ol/layer/Group';
import VectorTileLayer from 'ol/layer/VectorTile';

export type VectorTileLayerName = 'nautical-background';

type VectorTileProvider = {
  name: VectorTileLayerName;
  styleUrl: string;
  description: string;
};

const vectorTileProviders: Record<VectorTileLayerName, VectorTileProvider> = {
  'nautical-background': {
    name: 'nautical-background',
    styleUrl: 'https://dnl.kartverket.no/api/styles/nautisk-bakgrunnskart.json',
    description: 'Nautical background map with vector tiles',
  },
};

export const createVectorTileLayer = async (
  layerName: VectorTileLayerName,
): Promise<LayerGroup | null> => {
  const provider = vectorTileProviders[layerName];
  if (!provider) {
    console.error(`Vector tile provider ${layerName} not found`);
    return null;
  }

  try {
    const response = await fetch(provider.styleUrl);
    const styleJson = await response.json();

    // Replace hyphenated font names with proper Google Fonts names while preserving styles
    if (styleJson.layers) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      styleJson.layers.forEach((layer: any) => {
        if (layer.layout && layer.layout['text-font']) {
          layer.layout['text-font'] = layer.layout['text-font'].map(
            (font: string) => {
              const isItalic = font.includes('Italic');
              const isBold = font.includes('Bold');

              let baseFontName = font;
              if (font.includes('WorkSans')) {
                baseFontName = 'Work Sans';
              } else if (font.includes('Raleway')) {
                baseFontName = 'Raleway';
              }

              // Reconstruct with proper style suffix for Google Fonts
              if (isBold && isItalic) {
                return baseFontName + ' Bold Italic';
              } else if (isBold) {
                return baseFontName + ' Bold';
              } else if (isItalic) {
                return baseFontName + ' Italic';
              }

              return baseFontName;
            },
          );
        }
      });
    }

    const styleDataUrl =
      'data:application/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(styleJson));

    const container = document.createElement('div');
    const layerOrMap = await apply(container, styleDataUrl);

    let layerGroup: LayerGroup;
    if (layerOrMap instanceof LayerGroup) {
      layerGroup = layerOrMap;
    } else {
      const layers = layerOrMap.getAllLayers().filter((layer) => {
        return layer instanceof VectorTileLayer || layer instanceof LayerGroup;
      });
      layerGroup = new LayerGroup({ layers });
    }

    layerGroup.set('id', `bg.${layerName}`);
    layerGroup.set('isVectorTile', true);

    return layerGroup;
  } catch (error) {
    console.error(`Failed to load vector tile layer ${layerName}:`, error);
    return null;
  }
};

export const getAvailableVectorTileLayers = (): VectorTileLayerName[] => {
  return Object.keys(vectorTileProviders) as VectorTileLayerName[];
};

export const isVectorTileLayer = (
  layerName: string,
): layerName is VectorTileLayerName => {
  return layerName in vectorTileProviders;
};
