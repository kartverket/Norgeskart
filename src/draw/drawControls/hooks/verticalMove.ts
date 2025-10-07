import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { useMapInteractions } from './mapInterations';
import { useMapLayers } from './mapLayers';

type MoveDirection = 'up' | 'down';

export const useVerticalMove = () => {
  const { getSelectInteraction } = useMapInteractions();
  const { getDrawLayer } = useMapLayers();

  const getExtremaOtherFeatures = (
    feature: Feature<Geometry>,
    type: 'max' | 'min',
  ) => {
    const drawLayer = getDrawLayer();
    if (!drawLayer) {
      return 0;
    }
    const drawnFeatures = drawLayer.getSource()?.getFeatures() as
      | Feature<Geometry>[]
      | undefined;
    if (!drawnFeatures) {
      return 0;
    }
    const zIndecies = drawnFeatures
      .filter((f) => f.getId() !== feature.getId())
      .map((f) => f.get('zIndex') | 0);

    if (type === 'max') {
      return Math.max(...zIndecies);
    } else {
      return Math.min(...zIndecies);
    }
  };

  const getHighestZIndex = () => {
    const drawLayer = getDrawLayer();
    if (!drawLayer) {
      return 0;
    }
    const drawnFeatures = drawLayer.getSource()?.getFeatures() as
      | Feature<Geometry>[]
      | undefined;
    if (!drawnFeatures) {
      return 0;
    }
    const zIndecies = drawnFeatures.map((f) => f.get('zIndex') | 0);
    return Math.max(...zIndecies);
  };

  const moveFeatureUp = (feature: Feature<Geometry>) => {
    const existingZIndex = feature.get('zIndex') | 0;
    const maxOfOtherFeatures = getExtremaOtherFeatures(feature, 'max');
    const newZIndex = existingZIndex + 1;
    if (newZIndex > maxOfOtherFeatures + 1) {
      console.warn("can't move up");
      return;
    }
    feature.set('zIndex', newZIndex);
  };

  const moveFeatureDown = (feature: Feature<Geometry>) => {
    const existingZIndex = feature.get('zIndex') | 0;
    const minOfOtherFeatures = getExtremaOtherFeatures(feature, 'min');
    const newZIndex = existingZIndex - 1;
    if (newZIndex < minOfOtherFeatures - 1) {
      return;
    }

    feature.set('zIndex', newZIndex);
  };

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

  return { getHighestZIndex, moveSelectedUp, moveSelectedDown };
};
