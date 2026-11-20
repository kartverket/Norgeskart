import { getDefaultStore } from 'jotai';
import type { Map } from 'ol';
import type MapBrowserEvent from 'ol/MapBrowserEvent';
import { noModifierKeys, primaryAction } from 'ol/events/condition';
import { LineString, Polygon, type Geometry } from 'ol/geom';
import Draw from 'ol/interaction/Draw';
import type VectorLayer from 'ol/layer/Vector';
import { unByKey } from 'ol/Observable';
import Overlay from 'ol/Overlay';
import type VectorSource from 'ol/source/Vector';
import { getArea, getLength } from 'ol/sphere';
import { Fill, Stroke, Style } from 'ol/style';
import Text from 'ol/style/Text';
import i18n from '../i18n';
import { distanceUnitAtom, type DistanceUnit } from '../settings/draw/atoms';
import { formatArea, formatDistance } from '../shared/utils/stringUtils';

const instructionCleanupByMap = new WeakMap<Map, () => void>();

export const removeMeasureInteractionsFromMap = (map: Map) => {
  instructionCleanupByMap.get(map)?.();
  map
    .getInteractions()
    .getArray()
    .slice()
    .forEach((interaction) => {
      if (interaction instanceof Draw) {
        map.removeInteraction(interaction);
      }
    });
};

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

  removeMeasureInteractionsFromMap(map);

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

  const instructionElement = document.createElement('div');
  instructionElement.classList.add(
    'ol-tooltip',
    'ol-tooltip-measure',
    'ol-tooltip-cursor',
  );
  instructionElement.style.display = 'none';
  const instructionOverlay = new Overlay({
    element: instructionElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
  });
  map.addOverlay(instructionOverlay);

  const setInstruction = (drawing: boolean) => {
    instructionElement.textContent = i18n.t(
      drawing ? 'measure.finishInstruction' : 'measure.startInstruction',
    );
  };
  setInstruction(false);

  const handlePointerMove = (event: MapBrowserEvent) => {
    if (event.dragging) return;
    instructionElement.style.display = '';
    instructionOverlay.setPosition(event.coordinate);
  };
  const handlePointerLeave = () => {
    instructionElement.style.display = 'none';
  };
  const viewport = map.getViewport();
  map.on('pointermove', handlePointerMove);
  viewport?.addEventListener('pointerleave', handlePointerLeave);

  const cleanupInstruction = () => {
    map.un('pointermove', handlePointerMove);
    viewport?.removeEventListener('pointerleave', handlePointerLeave);
    map.removeOverlay(instructionOverlay);
    instructionElement.remove();
    if (instructionCleanupByMap.get(map) === cleanupInstruction) {
      instructionCleanupByMap.delete(map);
    }
  };
  instructionCleanupByMap.set(map, cleanupInstruction);
  draw.on('drawstart', () => setInstruction(true));
  draw.on('drawend', () => setInstruction(false));

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
