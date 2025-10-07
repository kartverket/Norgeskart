import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { useMapInteractions } from './mapInterations';
import { useMapLayers } from './mapLayers';

type MoveDirection = 'up' | 'down';

const moveFeatureUp = (feature: Feature<Geometry>) => {
  const existingZIndex = feature.get('zIndex') | 0;
  const newZIndex = existingZIndex + 1;
  feature.set('zIndex', newZIndex);
};

const moveFeatureDown = (feature: Feature<Geometry>) => {
  const existingZIndex = feature.get('zIndex') | 0;
  const newZIndex = existingZIndex - 1;
  feature.set('zIndex', newZIndex);
};

export const useVerticalMove = () => {
  const { getSelectInteraction } = useMapInteractions();
  const { getDrawLayer } = useMapLayers();

  const moveSelected = (direction: MoveDirection) => {
    const drawLayer = getDrawLayer();
    if (!drawLayer) {
      return;
    }

    const selectedInteraction = getSelectInteraction();
    if (!selectedInteraction) {
      return;
    }
    const selectedFeatures = selectedInteraction.getFeatures().getArray();

    const drawnFeatures = drawLayer.getSource()?.getFeatures() as
      | Feature<Geometry>[]
      | undefined;
    if (!drawnFeatures) {
      return;
    }

    for (let i = 0; i < drawnFeatures.length; i++) {
      const currentDrawnFeature = drawnFeatures[i];
      for (let j = 0; j < selectedFeatures.length; j++) {
        if (currentDrawnFeature.getId() === selectedFeatures[j].getId()) {
          switch (direction) {
            case 'up': {
              moveFeatureUp(currentDrawnFeature);
              break;
            }
            case 'down': {
              moveFeatureDown(currentDrawnFeature);
              break;
            }
          }
        }
      }
    }
  };

  const moveSelectedUp = () => {
    moveSelected('up');
  };

  const moveSelectedDown = () => {
    moveSelected('down');
  };

  return { moveSelectedUp, moveSelectedDown };
};
