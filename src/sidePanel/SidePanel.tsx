import { Box, Flex, IconButton } from '@kvib/react';
import { useAtom, useSetAtom } from 'jotai';
import { DrawControls } from '../draw/drawControls/DrawControls';
import { mapToolAtom } from '../map/overlay/atoms';
import { MeasurePopoverContent } from '../measure/MeasurePopoverContent';
import { ElevationProfileSection } from '../print/ElevationProfile/ElevationProfileSection';
import { searchCoordinatesAtom, selectedResultAtom } from '../search/atoms';
import { InfoBoxContent } from '../search/infobox/InfoBoxContent';
import { MapThemes } from '../settings/map/themes/MapThemes';
import { PrintPanel } from './PrintPanel';

export const SidePanel = () => {
  const [currentMapTool, setMapTool] = useAtom(mapToolAtom);
  const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);
  const setSearchCoordinates = useSetAtom(searchCoordinatesAtom);

  const handleClose = () => {
    setMapTool(null);
    setSelectedResult(null);
    setSearchCoordinates(null);
  };

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
      {(currentMapTool !== null || selectedResult !== null) && (
        <Flex justifyContent="flex-end" mb={2}>
          <IconButton
            onClick={handleClose}
            icon="close"
            colorPalette="red"
            size="sm"
            variant="ghost"
            aria-label="Lukk sidepanel"
          />
        </Flex>
      )}
      {currentMapTool === 'layers' && <MapThemes />}
      {currentMapTool === 'draw' && <DrawControls />}
      {currentMapTool === 'measure' && <MeasurePopoverContent />}
      <PrintPanel />
      {currentMapTool === 'elevationProfile' && <ElevationProfileSection />}
      {currentMapTool === null && selectedResult !== null && (
        <InfoBoxContent
          showReportButton={false}
          showCloseButton={false}
        />
      )}
    </Box>
  );
};