import { Box, Button } from '@kvib/react';
import { getMarkerLayer } from '../draw/drawControls/hooks/mapLayers';

export const Print = () => {
  const clickHandler = () => {
    const markerLayer = getMarkerLayer();
    const features = markerLayer.getSource()?.getFeatures();
    console.log('Markers on map:', features);
  };
  return (
    <Box>
      <Button onClick={() => clickHandler()}>Get markers</Button>
    </Box>
  );
};
