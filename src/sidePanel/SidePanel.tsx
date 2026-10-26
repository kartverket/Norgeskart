import { Box, Flex, Heading, IconButton } from '@kvib/react';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { DrawControls } from '../draw/drawControls/DrawControls';
import { mapToolAtom } from '../map/overlay/atoms';
import { ElevationProfileSection } from '../print/ElevationProfile/ElevationProfileSection';
import { searchCoordinatesAtom, selectedResultAtom } from '../search/atoms';
import { InfoBoxContent } from '../search/infobox/InfoBoxContent';
import { MapThemes, MapThemesHeader } from '../settings/map/themes/MapThemes';
import { PrintPanel } from './PrintPanel';

export const SidePanel = () => {
  const { t } = useTranslation();
  const [currentMapTool, setMapTool] = useAtom(mapToolAtom);
  const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);
  const setSearchCoordinates = useSetAtom(searchCoordinatesAtom);

  const handleClose = () => {
    setMapTool(null);
    setSelectedResult(null);
    setSearchCoordinates(null);
  };

  let sidePanelTitle: string | null = null;
  switch (currentMapTool) {
    case 'draw':
      sidePanelTitle = t('draw.tabHeading');
      break;
    case 'extent':
    case 'hiking':
      sidePanelTitle = t('printdialog.heading');
      break;
    case 'elevationProfile':
      sidePanelTitle = t('printdialog.tabs.elevationProfile.heading');
      break;
  }

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
        <Flex alignItems="center" mb={2}>
          {currentMapTool === 'layers' ? (
            <MapThemesHeader />
          ) : (
            sidePanelTitle && <Heading size="md">{sidePanelTitle}</Heading>
          )}
          <IconButton
            marginLeft="auto"
            onClick={handleClose}
            icon="close"
            colorPalette="green"
            size="sm"
            variant="ghost"
            aria-label="Lukk sidepanel"
          />
        </Flex>
      )}
      {currentMapTool === 'layers' && <MapThemes />}
      {currentMapTool === 'draw' && <DrawControls />}
      <PrintPanel />
      {currentMapTool === 'elevationProfile' && <ElevationProfileSection />}
      {currentMapTool === null && selectedResult !== null && (
        <InfoBoxContent showReportButton={false} showCloseButton={false} />
      )}
    </Box>
  );
};
