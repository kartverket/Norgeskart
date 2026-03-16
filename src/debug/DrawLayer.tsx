import { Box, Button } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import { useState } from 'react';
import { mapAtom } from '../map/atoms';

export const DrawLayer = () => {
  const map = useAtomValue(mapAtom);
  const [features, setFeatures] = useState<Feature[]>([]);

  return (
    <>
      <Button
        onClick={() => {
          const drawLayer = map
            ?.getLayers()
            .getArray()
            .find((layer) => layer.get('id') === 'drawLayer') as VectorLayer;
          if (!drawLayer) {
            return null;
          }
          const feats = drawLayer.getSource()?.getFeatures() || [];
          setFeatures(feats);
        }}
      />
      <Box>
        {features?.length} features in draw layer
        {features?.map((f, i) => {
          return <Box key={i}>{f.getId()}</Box>;
        })}
      </Box>
    </>
  );
};
