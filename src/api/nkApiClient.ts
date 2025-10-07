import { FeatureCollection } from 'geojson';
import { Color } from 'ol/color';
import { ColorLike, PatternDescriptor } from 'ol/colorlike';
import { Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import RegularShape from 'ol/style/RegularShape';
import { getEnv } from '../env';

const BASE_API_URL = getEnv().apiUrl;

export type StyleForStorage = {
  fill: { color: Color | ColorLike | PatternDescriptor | null };
  stroke: {
    color: Color | ColorLike | undefined;
    width: number | undefined;
  };
  icon: {
    radius: number | undefined;
    color: Color | ColorLike | PatternDescriptor | null | undefined;
    radius2?: number | undefined;
    angle?: number | undefined;
    points?: number | undefined;
    scale?: [number, number] | undefined;
  };
  text?: {
    value: string | undefined;
    font: string | undefined;
    fillColor: Color | ColorLike | PatternDescriptor | null;
    backgroundFillColor: Color | ColorLike | PatternDescriptor | null;
  };
};

export const getFeatures = async (
  drawingId: string,
): Promise<FeatureCollection> => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/get-json.py?hash=${drawingId}`,
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: FeatureCollection = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching features:', error);
    throw error;
  }
};

export const saveFeatures = async (
  features: FeatureCollection,
): Promise<string | null> => {
  try {
    const res = await fetch(`${BASE_API_URL}/upload-json.py`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(features),
    });
    if (!res.ok) {
      throw new Error('Failed to save features');
    }
    const responseText = await res.text();
    const filterRegex = /^\/([\w-]*)\.json$/; //the response is of type "/someGuidLikeThings.json" Capture just the guid
    const parts = filterRegex.exec(responseText);
    const id = parts ? parts[1] : null;
    return id;
  } catch (e) {
    console.error('Error saving features:', e);
    return null;
  }
};

export const getStyleForStorage = (
  style: Style | null,
): StyleForStorage | null => {
  if (!style) {
    return null;
  }
  const fill = style.getFill();
  const stroke = style.getStroke();

  const fillColor = fill ? fill.getColor() : null;
  const strokeColor = stroke ? stroke.getColor() : undefined;
  const strokeWidth = stroke ? stroke.getWidth() : 1;
  const image = style.getImage();
  let circleRadius: number | undefined;
  let imageFillColor: Color | ColorLike | PatternDescriptor | null | undefined;
  if (image && image instanceof CircleStyle) {
    circleRadius = image.getRadius();
    imageFillColor = image.getFill()?.getColor();
    return {
      fill: { color: fillColor },
      stroke: { color: strokeColor, width: strokeWidth },
      icon: {
        radius: circleRadius,
        color: imageFillColor,
      },
    };
  }

  if (image && image instanceof RegularShape) {
    const regularRadius = image.getRadius();
    const regularColor = image.getFill()?.getColor();
    const regularPoints = image.getPoints();
    const regularAngle = image.getAngle();
    const regularRadius2 = image.getRadius2?.();
    const scale = image.getScale();
    const regularScale =
      Array.isArray(scale) && scale.length === 2
        ? ([Number(scale[0]), Number(scale[1])] as [number, number])
        : undefined;

    return {
      fill: { color: fillColor },
      stroke: { color: strokeColor, width: strokeWidth },
      icon: {
        radius: regularRadius,
        color: regularColor,
        points: regularPoints,
        angle: regularAngle,
        radius2: regularRadius2,
        scale: regularScale,
      },
    };
  }

  const text = style.getText();
  if (text) {
    const t = text.getText();
    const textValue = Array.isArray(t) ? t.join('') : t;
    if (typeof textValue === 'string' && textValue.length > 0) {
      const font = text.getFont();
      const textFillColor = text.getFill()?.getColor() as string;
      const backgroundFillColor = text
        .getBackgroundFill()
        ?.getColor() as string;
      return {
        fill: { color: fillColor },
        stroke: { color: strokeColor, width: strokeWidth },
        icon: { radius: circleRadius, color: imageFillColor },
        text: {
          value: textValue,
          font,
          fillColor: textFillColor,
          backgroundFillColor,
        },
      };
    }
  }

  return {
    fill: { color: fillColor },
    stroke: { color: strokeColor, width: strokeWidth },
    icon: { radius: circleRadius, color: imageFillColor },
  };
};
