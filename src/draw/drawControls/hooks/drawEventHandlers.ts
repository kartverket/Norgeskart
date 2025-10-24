import { Feature } from 'ol';
import BaseEvent from 'ol/events/Event';
import { Geometry } from 'ol/geom';
import { ModifyEvent } from 'ol/interaction/Modify';
import { SelectEvent } from 'ol/interaction/Select';
import { TranslateEvent } from 'ol/interaction/Translate';
import { Circle, RegularShape, Stroke, Style } from 'ol/style';
import { FeatureMoveDetail } from './drawSettings';

export type StyleChangeDetail = {
  featureId: string | number;
  oldStyle: Style;
  newStyle: Style;
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

const handleSelect = (e: BaseEvent | Event) => {
  if (e instanceof SelectEvent) {
    e.deselected.forEach(handleFeatureSetZIndex);
    handleUpdateStyle(e.deselected);
    e.selected.forEach((f) => {
      const style = f.getStyle();
      if (style && style instanceof Style) {
        f.set('stylePreSelect', style);
        const newStyle = style.clone();
        addSelectedOutlineToStyle(newStyle);
        f.setStyle(newStyle);
      }
    });
  }
};

const handleUpdateStyle = (features: Feature<Geometry>[]) => {
  const featureStyleChangeList: StyleChangeDetail[] = [];
  features.forEach((feature) => {
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
      const featureId = feature.getId();
      if (!featureId) {
        return;
      }
      featureStyleChangeList.push({
        featureId: featureId,
        oldStyle: featureStylePreSelect,
        newStyle: style,
      });
    }

    feature.set('stylePreSelect', undefined);
  });

  if (featureStyleChangeList.length > 0) {
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
      f.set('geometryPreMove', preGeo);
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
  handleSelect,
  removeSelectedOutlineToStyle,
};
