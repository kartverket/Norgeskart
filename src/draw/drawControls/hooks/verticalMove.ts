import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { Style } from 'ol/style';
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
      //return;
    }

    const drawnFeatures = drawLayer.getSource()?.getFeatures() as
      | Feature<Geometry>[]
      | undefined;
    if (!drawnFeatures) {
      return;
    }

    let remainingSelectedFeatures = selectedFeatures.getArray();

    for (let i = drawnFeatures.length - 2; i >= 0; i--) {
      for (let j = 0; j < remainingSelectedFeatures.length; j++) {
        break;
      }
      const currentDrawnFeature = drawnFeatures[i]; // drawnFeatures[i];
      //console.log(i, j);

      if (currentDrawnFeature === drawnFeatures[0]) {
        console.log(currentDrawnFeature);
        const currentStyle = currentDrawnFeature.getStyle() as Style;

        console.log(currentStyle);
        const newZIndex = (currentStyle.getZIndex() || 0) + 1;
        const newStyle = currentStyle.clone();
        newStyle.setZIndex(newZIndex);
        currentDrawnFeature.setStyle(newStyle);

        drawnFeatures.splice(i + 1, 0, currentDrawnFeature);
        //

        //   currentStyle.setZIndex(currentStyle.getZIndex()! + 1);
        //   currentDrawnFeature.drawnFeatures.splice(i, 1);
        //
        //   remainingSelectedFeatures.splice(j, 1);
      }
    }

    // const drawSource = drawLayer.getSource();
    // if (!drawSource) {
    //   console.log('FUCK');
    //   return;
    // }

    // drawSource.clear();
    // console.log(drawnFeatures);
    // for (let i = drawnFeatures.length - 1; i >= 0; i--) {
    //   setTimeout(() => {
    //     const feature = drawnFeatures[i];
    //     console.log(feature.getProperties());
    //     drawSource.addFeature(feature);
    //   }, i * 1000);
    // }
  };

  const moveSelectedDown = () => {};

  return { moveSelectedUp, moveSelectedDown };
};
