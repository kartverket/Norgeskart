import { Box } from '@kvib/react';
import { useAtomValue } from 'jotai';
import VectorLayer from 'ol/layer/Vector';
import { mapAtom } from '../map/atoms';

export const DrawLayer = () => {
  const map = useAtomValue(mapAtom);

  const drawLayer = map
    ?.getLayers()
    .getArray()
    .find((layer) => layer.get('id') === 'drawLayer') as VectorLayer;
  if (!drawLayer) {
    return null;
  }

  const features = drawLayer.getSource()?.getFeatures();
  return (
    <Box>
      {features?.length} features in draw layer
      {features?.map((f, i) => {
        return <Box key={i}>{f.getId()}</Box>;
      })}
    </Box>
  );
};
