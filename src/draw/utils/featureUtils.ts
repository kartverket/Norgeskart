import { Feature } from 'ol';
import { Circle, Geometry } from 'ol/geom';
import { Style } from 'ol/style';
import { PointIcon } from '../drawControls/hooks/drawSettings';

export const getFeatureIcon = (
  feature: Feature<Geometry>,
): PointIcon | null => {
  let icon = null;
  const props = feature.getProperties();
  if ('overlayIcon' in props) {
    icon = props['overlayIcon'] as PointIcon;
  } else {
    try {
      icon = feature.getGeometry()?.getProperties()['overlayIcon'] as PointIcon;
    } catch {
      icon = null;
    }
  }
  return icon;
};

export const getFeaturePropertiesForExport = (feature: Feature<Geometry>) => {
  {
    const style = feature.getStyle();
    if (!style) {
      return null;
    }
    if (!(style instanceof Style)) {
      return null;
    }
    const fill = style.getFill();
    const stroke = style.getStroke();

    const fillColor = fill ? fill.getColor() : null;
    const strokeColor = stroke ? stroke.getColor() : undefined;
    const strokeWidth = stroke ? stroke.getWidth() : 1;
    const strokeLineDash = stroke ? stroke.getLineDash() : undefined;

    const text = getTextFromStyle(style);
    const icon = getFeatureIcon(feature);
    const radius = getRadius(feature.getGeometry() as Geometry);

    return {
      style: {
        fill: { color: fillColor },
        stroke: {
          color: strokeColor,
          width: strokeWidth,
          lineDash: strokeLineDash,
        },
        text,
      },
      overlayIcon: icon || undefined,
      radius,
    };
  }
};

const getRadius = (geo: Geometry): number | undefined => {
  if (geo instanceof Circle) {
    return geo.getRadius();
  }
  return undefined;
};

const getTextFromStyle = (style: Style) => {
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
      const textStroke = text.getStroke();
      const textStrokeColor = textStroke?.getColor();
      const textStrokeWidth = textStroke?.getWidth();
      return {
        text: textValue,
        font,
        fillColor: textFillColor,
        backgroundFillColor,
        stroke: textStrokeColor
          ? { color: textStrokeColor, width: textStrokeWidth }
          : undefined,
      };
    }
  }
};
