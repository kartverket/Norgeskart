import { useAtomValue } from 'jotai';
import LayerGroup from 'ol/layer/Group';
import { useRef } from 'react';
import { mapAtom } from './atoms';
import { BackgroundLayer } from './layers';

const useMap = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const map = useAtomValue(mapAtom);

  const setTargetElement = (element: HTMLDivElement) => {
    console.log('setTargetElement', element);
    mapElement.current = element;
    if (!map.getTarget()) {
      map.setTarget(element);
    }
  };
  return { setTargetElement };
};

const useMapLayers = () => {
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

  return { setBackgroundLayer };
};

export { useMap, useMapLayers };
