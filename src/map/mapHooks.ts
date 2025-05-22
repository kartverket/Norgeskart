import { useAtomValue } from 'jotai';
import { View } from 'ol';
import LayerGroup from 'ol/layer/Group';
import { get as getProjection, transform } from 'ol/proj';
import { useRef } from 'react';
import { mapAtom, ProjectionIdentifier } from './atoms';
import { BackgroundLayer } from './layers';

const useMap = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const map = useAtomValue(mapAtom);

  const setTargetElement = (element: HTMLDivElement | null) => {
    mapElement.current = element;
    if (!map.getTarget() && element) {
      map.setTarget(element);
    } else if (element == null) {
      map.setTarget(undefined);
    }
  };
  return { setTargetElement };
};

const useMapSettings = () => {
  const map = useAtomValue(mapAtom);

  const setBackgroundLayer = (layerName: BackgroundLayer) => {
    const backgroundLayers = map
      .getLayers()
      .getArray()
      .filter(
        (layer) => layer.get('id') === 'backgroundLayers',
      )[0] as unknown as LayerGroup;

    backgroundLayers.getLayers().forEach((layer) => {
      if (layer.get('id') === layerName) {
        layer.setVisible(true);
      } else {
        layer.setVisible(false);
      }
    });
  };

  const setProjection = (projectionId: ProjectionIdentifier) => {
    const projection = getProjection(projectionId)!;

    // Optionally, transform the current center to the new projection
    const oldView = map.getView();
    const oldCenter = oldView.getCenter();
    const oldProjection = oldView.getProjection();

    let newCenter = undefined;
    if (
      oldCenter &&
      oldProjection &&
      oldProjection.getCode() !== projection.getCode()
    ) {
      // Transform center to new projection
      newCenter = transform(oldCenter, oldProjection, projection);
    }

    // Create a new view with the new projection
    const newView = new View({
      center: newCenter || [570130, 7032300], // fallback center if needed
      zoom: oldView.getZoom(),
      projection: projection,
      extent: projection.getExtent(),
    });

    map.setView(newView);
  };

  return { setBackgroundLayer, setProjection };
};

export { useMap, useMapSettings };
