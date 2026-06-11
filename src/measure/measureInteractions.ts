import Draw from 'ol/interaction/Draw';
import { noModifierKeys, primaryAction } from 'ol/events/condition';
import { Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import { getArea, getLength } from 'ol/sphere';
import { Geometry, LineString, Polygon } from 'ol/geom';
import { DistanceUnit, distanceUnitAtom } from '../settings/draw/atoms';
import { formatArea, formatDistance } from '../shared/utils/stringUtils';
import { getDefaultStore } from 'jotai';
import Text from 'ol/style/Text';


export const getMeasurementText = (
  geometry: Geometry,
  projection: string,
  unit: DistanceUnit,
) => {
  if (geometry instanceof Polygon) {
    const area = getArea(geometry, { projection });
    return formatArea(area, unit);
  }

  if (geometry instanceof LineString) {
    const length = getLength(geometry, { projection });
    return formatDistance(length, unit);
  }

  return '';
};

const createMeasureStyle = (text: string): Style => {
   return new Style({
    stroke: new Stroke({
      color: '#0e5aa0ff',
      width: 4,
    }),
    fill: new Fill({
      color: '#1d823b80',
    }),
    text: new Text({
      text,
      font: '14px sans-serif',
      fill: new Fill({ color: '#000' }),
      backgroundFill: new Fill({
        color: '#FFFF',
      }),
    }),
   });
}

// 👇 viktig: kun én aktiv interaction
let activeMeasureInteraction: Draw | null = null;

export type MeasureDrawType = 'LineString' | 'Polygon';

export const addMeasureInteractionToMap = (
  type: MeasureDrawType,
  measureLayer: VectorLayer,
  map: Map,
) => {
  // 🧹 cleanup gammel interaction
  if (activeMeasureInteraction) {
    const oldMap = activeMeasureInteraction.getMap();
    if (oldMap) {
      oldMap.removeInteraction(activeMeasureInteraction);
    }
    activeMeasureInteraction = null;
  }

  const draw = new Draw({
    source: measureLayer.getSource() as VectorSource,
    type,
    condition: (e) => noModifierKeys(e) && primaryAction(e),
  });

  draw.on('drawstart', (event) => {
     const feature = event.feature;
  const geom = feature.getGeometry();

  if (!geom) return;

  const store = getDefaultStore();
  const unit = store.get(distanceUnitAtom);
  const projection = map.getView().getProjection().getCode();

  geom.on('change', () => {
    const text = getMeasurementText(geom, projection, unit);

    feature.setStyle(createMeasureStyle(text));
  });
  });

  draw.on('drawend', (event) => {
     const feature = event.feature;
  const geom = feature.getGeometry();

  if (!geom) return;

  const store = getDefaultStore();
  const unit = store.get(distanceUnitAtom);
  const projection = map.getView().getProjection().getCode();

  const text = getMeasurementText(geom, projection, unit);

  feature.setStyle(createMeasureStyle(text));
  });

  map.addInteraction(draw);

  activeMeasureInteraction = draw;

  return draw;
};