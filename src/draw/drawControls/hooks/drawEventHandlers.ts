import { Feature } from 'ol';
import BaseEvent from 'ol/events/Event';
import { Geometry } from 'ol/geom';
import { ModifyEvent } from 'ol/interaction/Modify';
import { SelectEvent } from 'ol/interaction/Select';
import { TranslateEvent } from 'ol/interaction/Translate';
import { Style } from 'ol/style';
import { FeatureMoveDetail } from './drawSettings';

const handleSelectCompleted = (e: BaseEvent | Event) => {
  if (e instanceof SelectEvent) {
    e.deselected.forEach(handleFeatureSetZIndex);
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
const handleTranslateStart = (e: BaseEvent | Event) => {
  console.log('sup');
  if (e instanceof TranslateEvent) {
    e.features.getArray().forEach((f) => {
      const preGeo = f.getGeometry()?.clone();
      if (preGeo == null) {
        return;
      }
      f.set('geometryPreMove', preGeo);
    });
  }
};
const handleTranslateEnd = (e: BaseEvent | Event) => {
  if (e instanceof TranslateEvent) {
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

const handleModifyStart = (e: BaseEvent | Event) => {
  if (e instanceof ModifyEvent) {
    e.features.getArray().forEach((f) => {
      const preGeo = f.getGeometry()?.clone();
      if (preGeo == null) {
        return;
      }
      f.set('geometryPreModify', preGeo);
    });
  }
};
//TODO: Sjekk om de kan slås sammen, modify og translate
const handleModifyEnd = (e: BaseEvent | Event) => {
  if (e instanceof ModifyEvent) {
    const moveDetails = e.features.getArray().map((f) => {
      const geometryBeforeMove = f.get('geometryPreModify');
      const geometryAfterMove = f.getGeometry()?.clone();
      f.set('geometryPreModify', undefined);
      return {
        featureId: f.getId(),
        geometryBeforeMove: geometryBeforeMove as Geometry,
        geometryAfterMove: geometryAfterMove as Geometry,
      } as FeatureMoveDetail;
    });
    const event = new CustomEvent('featureGeometryModified', {
      detail: moveDetails,
    });
    document.dispatchEvent(event);
  }
};

export {
  handleFeatureSetZIndex,
  handleModifyEnd,
  handleModifyStart,
  handleSelectCompleted,
  handleTranslateEnd,
  handleTranslateStart,
};
