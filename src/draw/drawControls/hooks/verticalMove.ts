import { useMapInteractions } from './mapInterations';
import { useMapLayers } from './mapLayers';

export const useVerticalMove = () => {
  const { getSelectInteraction } = useMapInteractions();
  const { getDrawLayer } = useMapLayers();

  const moveSelectedUp = () => {
    const drawLayer = getDrawLayer();
    if (!drawLayer) {
      return;
    }

    const selectedInteraction = getSelectInteraction();
    if (!selectedInteraction) {
      return;
    }
    const selectedFeatures = selectedInteraction.getFeatures();
    if (selectedFeatures.getLength() === 0) {
      return;
    }

    const drawnFeatures = drawLayer.getSource()?.getFeatures();
    if (!drawnFeatures) {
      return;
    }

    let remainingSelectedFeatures = selectedFeatures.getArray();

    for (let i = drawnFeatures.length - 2; i >= 0; i--) {
      for (let j = 0; j < remainingSelectedFeatures.length; j++) {
        console.log(i, j);
        if (drawnFeatures[i] === remainingSelectedFeatures[j]) {
          const featureToMove = drawnFeatures[i];
          drawnFeatures.splice(i, 1);
          drawnFeatures.splice(i + 1, 0, featureToMove);
          remainingSelectedFeatures.splice(j, 1);
          break;
        }
      }
    }

    const drawSource = drawLayer.getSource();
    if (!drawSource) {
      console.log('FUCK');
      return;
    }

    drawSource.clear();
    console.log(drawnFeatures);
    for (let i = drawnFeatures.length - 1; i >= 0; i--) {
      setTimeout(() => {
        const feature = drawnFeatures[i];
        drawSource.addFeature(feature);
      }, i * 1000);
    }
  };

  const moveSelectedDown = () => {};

  return { moveSelectedUp, moveSelectedDown };
};
