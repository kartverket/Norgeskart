import { getDefaultStore } from 'jotai';
import { Feature } from 'ol';
import { GML, GPX } from 'ol/format';
import { v4 as uuidv4 } from 'uuid';
import { mapAtom } from '../../../map/atoms';

import GeoJSON from 'ol/format/GeoJSON.js';

export type FeatureReadResult =
  | {
    status: 'success';
    features: Feature[];
  }
  | {
    status: 'error';
  };

import { GeoJsonProperties } from 'geojson';
import { Point } from 'ol/geom';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { StyleForStorage } from '../../../api/nkApiClient';
import { PointIcon } from '../../drawControls/hooks/drawSettings';
import { FeatureCollection } from './types';

const setDefaultStyleForFeature = (feature: Feature) => {
  const geometry = feature.getGeometry();
  if (geometry && geometry instanceof Point) {
    feature.setProperties(
      {
        overlayIcon: {
          icon: 'circle',
          color: '#0044ff',
          size: 2,
        } as PointIcon,
      },
      true,
    );
  } else {
    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: '#0044ff',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(0, 68, 255, 0.3)',
        }),
      }),
    );
  }
  return feature;
};

const ensureFeatureHasId = (feature: Feature) => {
  if (!feature.getId()) {
    feature.setId(uuidv4());
  }
  return feature;
};
export const readFeaturesFromGPXString = (
  fileText: string,
): FeatureReadResult => {
  const map = getDefaultStore().get(mapAtom);
  const projection = map.getView().getProjection().getCode();
  const gpxReader = new GPX();
  try {
    const features = gpxReader
      .readFeatures(fileText, {
        dataProjection: 'EPSG:4326',
        featureProjection: projection,
      })
      .map(setDefaultStyleForFeature)
      .map(ensureFeatureHasId);
    return {
      status: 'success',
      features,
    };
  } catch (error) {
    console.error('Error reading GPX file:', error);
    return {
      status: 'error',
    };
  }
};

export const readFeaturesFromGeoJsonString = (
  fileText: string,
): FeatureReadResult => {
  const map = getDefaultStore().get(mapAtom);
  const projection = map.getView().getProjection().getCode();
  let geoJsonFormat: FeatureCollection;
  try {
    geoJsonFormat = JSON.parse(fileText) as FeatureCollection;
    if (
      !geoJsonFormat ||
      !geoJsonFormat.type ||
      geoJsonFormat.type !== 'FeatureCollection'
    ) {
      console.error(
        'Invalid GeoJSON format: Missing or incorrect "type" property',
      );
      return {
        status: 'error',
      };
    }
  } catch (error) {
    console.error('Error parsing GeoJSON file:', error);
    return {
      status: 'error',
    };
  }
  try {
    const features = new GeoJSON()
      .readFeatures(geoJsonFormat, {
        dataProjection: 'EPSG:4326',
        featureProjection: projection,
      })
      .map((feature) => {
        const props = feature.getProperties() as GeoJsonProperties;
        const style = getStyleFromProperties(props);
        const icon = getOverlayIconFromProperties(props);
        if (style) {
          feature.setStyle(style);
        }
        if (icon) {
          feature.setProperties(
            {
              overlayIcon: icon,
            },
            true,
          );
        }
        return feature;
      })
      .map(ensureFeatureHasId);
    return {
      status: 'success',
      features: features,
    };
  } catch (error) {
    console.error('Error reading GeoJSON features:', error);
    return {
      status: 'error',
    };
  }
};

export const readFeaturesFromGMLString = (
  fileText: string,
): FeatureReadResult => {
  const map = getDefaultStore().get(mapAtom);
  const projection = map.getView().getProjection().getCode();
  try {
    const gmlReader = new GML();
    const features = gmlReader
      .readFeatures(fileText, {
        dataProjection: 'EPSG:4326',
        featureProjection: projection,
      })
      .map(setDefaultStyleForFeature)
      .map(ensureFeatureHasId);
    return {
      status: 'success',
      features,
    };
  } catch (error) {
    console.error('Error reading GML file:', error);
    return {
      status: 'error',
    };
  }
};

export const getStyleFromProperties = (props: GeoJsonProperties) => {
  if (props == null) {
    return null;
  }
  const styleFromProps = props.style as StyleForStorage | undefined;
  if (styleFromProps == null) {
    return null;
  }

  const fill = styleFromProps.fill?.color
    ? new Fill({ color: styleFromProps.fill.color })
    : undefined;

  const stroke = styleFromProps.stroke?.color
    ? new Stroke({
      color: styleFromProps.stroke.color,
      width: styleFromProps.stroke.width ?? 2,
      lineDash: styleFromProps.stroke.lineDash,
    })
    : undefined;

  const textValue =
    (styleFromProps.text as { text?: string; value?: string })?.text ??
    (styleFromProps.text as { text?: string; value?: string })?.value;
  const text = textValue
    ? new Text({
      text: textValue,
      font: styleFromProps.text?.font ?? '16px sans-serif',
      fill: styleFromProps.text?.fillColor
        ? new Fill({ color: styleFromProps.text.fillColor })
        : new Fill({ color: '#000000' }),
      stroke: styleFromProps.text?.stroke?.color
        ? new Stroke({
          color: styleFromProps.text.stroke.color,
          width: styleFromProps.text.stroke.width ?? 1,
        })
        : undefined,
      backgroundFill: styleFromProps.text?.backgroundFillColor
        ? new Fill({ color: styleFromProps.text.backgroundFillColor })
        : undefined,
      offsetY: -15,
      textAlign: 'center',
      textBaseline: 'bottom',
    })
    : undefined;

  if (!fill && !stroke && !text) {
    return null;
  }

  const style = new Style({
    fill,
    stroke,
    text,
  });

  return style;
};

export const getOverlayIconFromProperties = (
  properties: GeoJsonProperties,
): PointIcon | null => {
  const iconFromProps = properties?.overlayIcon as PointIcon | null;
  return iconFromProps;
};

export const getCircleRadiusFromProperties = (
  properties: GeoJsonProperties,
): number | null => {
  const radiusFromProps = properties?.radius as number | null;
  return radiusFromProps;
};

export const countFeatureTypes = (features: Feature[]) => {
  const typeCounts: Record<string, number> = {};
  features.forEach((feature) => {
    const geometry = feature.getGeometry();
    if (geometry) {
      const type = geometry.getType();
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
  });
  return typeCounts;
};
