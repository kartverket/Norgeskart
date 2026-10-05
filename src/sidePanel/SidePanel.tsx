import { Box } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { DrawControls } from '../draw/drawControls/DrawControls';
import { mapToolAtom } from '../map/overlay/atoms';
import { MeasurePopoverContent } from '../measure/MeasurePopoverContent';
import { ExtentSection } from '../print/Extent/ExtentSection';
import { HikingMapSection } from '../print/HikingMap/HikingMapSection';
import { selectedResultAtom } from '../search/atoms';
import { InfoBoxContent } from '../search/infobox/InfoBoxContent';
import { MapThemes } from '../settings/map/themes/MapThemes';

export const SidePanel = () => {
  const [currentMapTool, setMapTool] = useAtom(mapToolAtom);
  const selectedResult = useAtomValue(selectedResultAtom);

  return (
    <Box
      height="100%"
      width="100%"
      bg="white"
      borderTopRightRadius="md"
      borderBottomRightRadius="md"
      boxShadow="lg"
      p={4}
      overflowY="auto"
    >
      {currentMapTool === 'layers' && <MapThemes />}
      {currentMapTool === 'draw' && <DrawControls />}
      {currentMapTool === 'measure' && <MeasurePopoverContent />}
      {currentMapTool === 'extent' && (
        <ExtentSection onCancel={() => setMapTool(null)} />
      )}
      {currentMapTool === 'hiking' && (
        <HikingMapSection onCancel={() => setMapTool(null)} />
      )}
      {currentMapTool === null && selectedResult !== null && (
        <InfoBoxContent showReportButton={false} />
      )}
    </Box>
  );
};