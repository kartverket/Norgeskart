import { getDefaultStore } from 'jotai';
import { Map } from 'ol';
import { noModifierKeys, primaryAction } from 'ol/events/condition';
import { Geometry, LineString, Polygon } from 'ol/geom';
import Draw from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import { unByKey } from 'ol/Observable';
import VectorSource from 'ol/source/Vector';
import { getArea, getLength } from 'ol/sphere';
import { Fill, Stroke, Style } from 'ol/style';
import Text from 'ol/style/Text';
import { DistanceUnit, distanceUnitAtom } from '../settings/draw/atoms';
import { formatArea, formatDistance } from '../shared/utils/stringUtils';

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
        color: 'rgba(255,255,255,0.9)',
      }),
      padding: [3, 6, 3, 6],
    }),
  });
};

export type MeasureDrawType = 'LineString' | 'Polygon';

export const addMeasureInteractionToMap = (
  type: MeasureDrawType,
  measureLayer: VectorLayer,
  map: Map,
) => {
  const store = getDefaultStore();
  const unit = store.get(distanceUnitAtom);
  const projection = map.getView().getProjection().getCode();

  map.getInteractions().forEach((interaction) => {
    if (interaction instanceof Draw) {
      map.removeInteraction(interaction);
    }
  });

  const draw = new Draw({
    source: measureLayer.getSource() as VectorSource,
    type,
    condition: (e) => noModifierKeys(e) && primaryAction(e),
    style: new Style({
      stroke: new Stroke({
        color: '#0e5aa0ff',
        width: 4,
      }),
      fill: new Fill({
        color: '#1d823b80',
      }),
    }),
  });

  draw.on('drawstart', (event) => {
    const feature = event.feature;
    const geometry = feature.getGeometry();

    if (!geometry) return;

    const listener = geometry.on('change', () => {
      const text = getMeasurementText(geometry, projection, unit);

      feature.setStyle(createMeasureStyle(text));
    });

    draw.once('drawend', () => {
      unByKey(listener);
    });
  });

  map.addInteraction(draw);

  return draw;
};
