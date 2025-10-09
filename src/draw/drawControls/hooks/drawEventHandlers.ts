import { Feature } from 'ol';
import BaseEvent from 'ol/events/Event';
import { Geometry } from 'ol/geom';
import { ModifyEvent } from 'ol/interaction/Modify';
import { SelectEvent } from 'ol/interaction/Select';
import { TranslateEvent } from 'ol/interaction/Translate';
import { Style } from 'ol/style';
import { FeatureMoveDetail } from './drawSettings';

const handleSelect = (e: BaseEvent | Event) => {
  console.log('handleSelectCompleted');
  if (e instanceof SelectEvent) {
    e.deselected.forEach(handleFeatureSetZIndex);
    e.deselected.forEach(handleUpdateStyle);
    e.selected.forEach((f) => {
      const style = f.getStyle();
      console.log('style', style);
      if (style && style instanceof Style) {
        f.set('featureStyle', style.clone());
      }
    });
  }
};

const handleUpdateStyle = (feature: Feature<Geometry>) => {
  const style = feature.get('changedStyle') as Style | undefined;
  if (style) {
    feature.setStyle(style);
    feature.set('changedStyle', undefined);
    feature.set('featureStyle', undefined);
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

export {
  handleFeatureSetZIndex,
  handleModifyEnd,
  handleModifyStart,
  handleSelect,
};
