import { MaterialSymbol } from '@kvib/react';
import { getDefaultStore } from 'jotai';
import { Feature } from 'ol';
import BaseEvent from 'ol/events/Event';
import { Geometry } from 'ol/geom';
import { ModifyEvent } from 'ol/interaction/Modify';
import { SelectEvent } from 'ol/interaction/Select';
import { TranslateEvent } from 'ol/interaction/Translate';
import { Circle, RegularShape, Stroke, Style } from 'ol/style';
import { mapAtom } from '../../../map/atoms';
import { showMeasurementsAtom } from '../../../settings/draw/atoms';
import {
  addInteractiveMeasurementOverlayToFeature,
  clearStaticOverlaysForFeature,
  enableFeatureMeasurementOverlay,
  removeInteractiveMeasurementOverlayFromFeature,
} from '../drawUtils';
import {
  FeatureMoveDetail,
  ICON_OVERLAY_PREFIX,
  PointIcon,
} from './drawSettings';

export type StyleChangeDetail = {
  featureId: string | number;
  oldStyle: Style;
  newStyle: Style;
  oldIcon?: PointIcon;
  newIcon?: PointIcon;
};

export const getFeatureOverlayIconProperties = (
  feature: Feature<Geometry>,
): PointIcon | null => {
  const featureId = feature.getId();
  if (!featureId) {
    return null;
  }
  const map = getDefaultStore().get(mapAtom);
  const overlay = map.getOverlayById(`${ICON_OVERLAY_PREFIX}${featureId}`);
  if (!overlay) {
    return null;
  }

  const element = overlay.getElement();
  if (!element) {
    return null;
  }
  const iconChar = element.textContent as MaterialSymbol;
  const color = element.style.color;
  const fontSize =
    (element.style.fontSize.replace('px', '') as unknown as number) / 10; //This is bad
  return { icon: iconChar, color: color, size: fontSize };
};

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

//Create a function to compare two styles
const stylesAreEqual = (style1: Style, style2: Style): boolean => {
  if (style1 === style2) {
    return true;
  }
  if (style1 == null || style2 == null) {
    return false;
  }
  // Compare stroke
  const stroke1 = style1.getStroke();
  const stroke2 = style2.getStroke();
  if (stroke1 && stroke2) {
    if (
      stroke1.getColor() !== stroke2.getColor() ||
      stroke1.getWidth() !== stroke2.getWidth()
    ) {
      return false;
    }
  } else if (stroke1 || stroke2) {
    return false;
  }

  // Compare fill
  const fill1 = style1.getFill();
  const fill2 = style2.getFill();
  if (fill1 && fill2) {
    if (fill1.getColor() !== fill2.getColor()) {
      return false;
    }
  } else if (fill1 || fill2) {
    return false;
  }

  // Compare image
  const image1 = style1.getImage();
  const image2 = style2.getImage();
  if (image1 && image2) {
    if (image1 instanceof Circle && image2 instanceof Circle) {
      if (
        image1.getRadius() !== image2.getRadius() ||
        image1.getFill()?.getColor() !== image2.getFill()?.getColor() ||
        image1.getStroke()?.getColor() !== image2.getStroke()?.getColor() ||
        image1.getStroke()?.getWidth() !== image2.getStroke()?.getWidth()
      ) {
        return false;
      }
    } else if (
      image1 instanceof RegularShape &&
      image2 instanceof RegularShape
    ) {
      if (
        image1.getPoints() !== image2.getPoints() ||
        image1.getRadius() !== image2.getRadius() ||
        image1.getRadius2() !== image2.getRadius2() ||
        image1.getAngle() !== image2.getAngle()
      ) {
        return false;
      }
    } else {
      return false; // Different types of images
    }
  } else if (image1 || image2) {
    return false;
  }

  return true;
};

//To signal which features are selected. Points are outlined, other things are given a dashed line
const addSelectedOutlineToStyle = (style: Style) => {
  const newStroke = style.getStroke();
  const image = style.getImage();
  if (image) {
    if (image instanceof Circle || image instanceof RegularShape) {
      const newImage = image.clone();
      newImage.setStroke(new Stroke({ color: 'black', width: 2 }));
      style.setImage(newImage);
    }
  }
  newStroke?.setLineDash([10, 10]);
  style.setStroke(newStroke);
};

const removeSelectedOutlineToStyle = (style: Style) => {
  const newStroke = style.getStroke();
  const image = style.getImage();
  if (image) {
    if (image instanceof Circle || image instanceof RegularShape) {
      const newImage = image.clone();
      newImage.setStroke(null);
      style.setImage(newImage);
    }
  }
  newStroke?.setLineDash([]);
  style.setStroke(newStroke);
};

const handleSelection = (e: BaseEvent | Event) => {
  if (e instanceof SelectEvent) {
    handleDeselected(e.deselected);
    handleSelected(e.selected);
  }
};

const handleSelected = (selected: Feature<Geometry>[]) => {
  selected.forEach((f) => {
    const style = f.getStyle();
    const geometry = f.getGeometry();
    if (geometry && geometry.getType() === 'Point') {
      const icon = getFeatureIcon(f);
      f.set('iconPreSelect', icon);
      const featureId = f.getId();
      if (!featureId) {
        return;
      }
      const map = getDefaultStore().get(mapAtom);
      const overlay = map.getOverlayById(`${ICON_OVERLAY_PREFIX}${featureId}`);
      if (overlay) {
        const element = overlay.getElement();
        if (element) {
          element.style.border = '2px solid black';
        }
      }
      return;
    }
    if (style && style instanceof Style) {
      f.set('stylePreSelect', style);
      const newStyle = style.clone();
      addSelectedOutlineToStyle(newStyle);
      f.setStyle(newStyle);
    }
  });
};

const handleDeselected = (deselected: Feature<Geometry>[]) => {
  handleUpdateStyle(deselected);
};

const handleUpdateStyle = (features: Feature<Geometry>[]) => {
  const featureStyleChangeList: StyleChangeDetail[] = [];
  let anyStyleChanged = false;
  features.forEach((feature) => {
    handleFeatureSetZIndex(feature);
    const style = feature.getStyle();
    if (style && style instanceof Style) {
      removeSelectedOutlineToStyle(style);
      const styleStroke = style.getStroke();
      if (styleStroke) {
        styleStroke.setLineDash([]);
        style.setStroke(styleStroke);
        feature.setStyle(style);
      }
      const featureStylePreSelect = feature.get('stylePreSelect') as Style;
      const iconPreSelect = feature.get('iconPreSelect') as PointIcon | null;
      const featureId = feature.getId();

      if (!featureId) {
        return;
      }
      featureStyleChangeList.push({
        featureId: featureId,
        oldStyle: featureStylePreSelect,
        newStyle: style,
        oldIcon: iconPreSelect || undefined,
        newIcon: getFeatureOverlayIconProperties(feature) || undefined,
      });

      const map = getDefaultStore().get(mapAtom);
      const overlay = map.getOverlayById(`${ICON_OVERLAY_PREFIX}${featureId}`);
      if (overlay) {
        const element = overlay.getElement();
        if (element) {
          element.style.border = 'none';
        }
      }

      if (!stylesAreEqual(style, featureStylePreSelect)) {
        anyStyleChanged = true;
      }
    }

    feature.set('stylePreSelect', undefined);
    feature.set('iconPreSelect', undefined);
  });

  if (anyStyleChanged && featureStyleChangeList.length > 0) {
    const event = new CustomEvent('featureStyleChanged', {
      detail: featureStyleChangeList,
    });
    document.dispatchEvent(event);
  }
};

const handleFeatureSetZIndex = (feature: Feature<Geometry>) => {
  const style = feature.getStyle();
  const zIndex = feature.get('zIndex') | 0;
  if (style && style instanceof Style) {
    style.setZIndex(zIndex);
    feature.setStyle(style);
  }
};
const handleModifyStart = (e: BaseEvent | Event) => {
  if (e instanceof TranslateEvent || e instanceof ModifyEvent) {
    e.features.getArray().forEach((f) => {
      const preGeo = f.getGeometry()?.clone();
      if (preGeo == null) {
        return;
      }
      clearStaticOverlaysForFeature(f);
      f.set('geometryPreMove', preGeo);
      const shouldShowInteractive = getDefaultStore().get(showMeasurementsAtom);
      if (shouldShowInteractive) {
        addInteractiveMeasurementOverlayToFeature(f);
      }
    });
  }
};
const handleModifyEnd = (e: BaseEvent | Event) => {
  if (e instanceof TranslateEvent || e instanceof ModifyEvent) {
    const moveDetails = e.features.getArray().map((f) => {
      const geometryBeforeMove = f.get('geometryPreMove');
      const geometryAfterMove = f.getGeometry()?.clone();
      f.set('geometryPreMove', undefined);
      return {
        featureId: f.getId(),
        geometryBeforeMove: geometryBeforeMove as Geometry,
        geometryAfterMove: geometryAfterMove as Geometry,
      } as FeatureMoveDetail;
    });
    e.features.getArray().forEach((f) => {
      removeInteractiveMeasurementOverlayFromFeature(f);
      enableFeatureMeasurementOverlay(f);
    });

    const event = new CustomEvent('featureMoved', { detail: moveDetails });
    document.dispatchEvent(event);
  }
};

const handleFeatureSelectDone = (f: Feature) => {
  handleFeatureSetZIndex(f);
  const featureStyle = f.getStyle();
  if (featureStyle instanceof Style) {
    removeSelectedOutlineToStyle(featureStyle);
  }
};

export {
  handleFeatureSelectDone,
  handleModifyEnd,
  handleModifyStart,
  handleSelection as handleSelect,
  removeSelectedOutlineToStyle,
};
