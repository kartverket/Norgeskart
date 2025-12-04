import { Feature } from 'ol';
import { FeatureLike } from 'ol/Feature';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style, Text } from 'ol/style';
import type {
  ThemeLayerDefinition,
  ThemeLayerStyle,
} from '../../api/themeLayerConfigApi';

const createStyleFromConfig = (
  styleConfig: ThemeLayerStyle | undefined,
): ((feature: FeatureLike) => Style) => {
  return (feature: FeatureLike) => {
    const fill = styleConfig?.fill
      ? new Fill({ color: styleConfig.fill.color })
      : new Fill({ color: 'rgba(128, 128, 128, 0.1)' });

    const stroke = styleConfig?.stroke
      ? new Stroke({
          color: styleConfig.stroke.color,
          width: styleConfig.stroke.width,
        })
      : new Stroke({ color: 'rgb(64, 128, 64)', width: 1 });

    let text: Text | undefined;
    if (styleConfig?.text) {
      const propertyValue = feature.get(styleConfig.text.property);
      if (propertyValue) {
        text = new Text({
          text: String(propertyValue),
          scale: styleConfig.text.scale ?? 1.3,
          fill: new Fill({
            color: styleConfig.text.fill?.color ?? '#000000',
          }),
          stroke: new Stroke({
            color: styleConfig.text.stroke?.color ?? '#FFFFFF',
            width: styleConfig.text.stroke?.width ?? 3,
          }),
        });
      }
    }

    return new Style({ fill, stroke, text });
  };
};

export const createGeoJsonThemeLayer = (
  layerDef: ThemeLayerDefinition,
  mapProjection: string,
): VectorLayer => {
  const sourceEpsg = layerDef.sourceEpsg ?? 'EPSG:4326';

  const vectorSource = new VectorSource<Feature<Geometry>>({
    url: layerDef.geojsonUrl,
    format: new GeoJSON({
      dataProjection: sourceEpsg,
      featureProjection: mapProjection,
    }),
  });

  return new VectorLayer({
    source: vectorSource,
    style: createStyleFromConfig(layerDef.style),
    properties: {
      id: `theme.${layerDef.id}`,
    },
  });
};
