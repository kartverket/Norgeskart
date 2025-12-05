import { Box, Button, VStack } from '@kvib/react';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { useState } from 'react';
import { getSelectInteraction } from '../draw/drawControls/hooks/mapInterations';

export const Selected = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<Feature<Geometry>[]>(
    [],
  );
  const getSelectedFeatures = () => {
    const interactions = getSelectInteraction();
    if (interactions) {
      const features = interactions.getFeatures().getArray();
      setSelectedFeatures([...features]);
    } else {
      setSelectedFeatures([]);
    }
  };
  return (
    <VStack>
      <Button onClick={getSelectedFeatures}>Get Selected Features</Button>
      <Box>
        {selectedFeatures.map((feature, index) => (
          <div key={index}>
            {index} Feature ID: {feature.getId()}
          </div>
        ))}
      </Box>
    </VStack>
  );
};
