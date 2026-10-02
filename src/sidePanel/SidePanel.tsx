import { Box } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { DrawControls } from '../draw/drawControls/DrawControls';
import { mapToolAtom } from '../map/overlay/atoms';
import { selectedResultAtom } from '../search/atoms';
import { InfoBoxContent } from '../search/infobox/InfoBoxContent';
import { MapThemes } from '../settings/map/themes/MapThemes';
import { MeasurePanel } from './MeasurePanel';
import { PrintPanel } from './PrintPanel';
import { ToolsPanel } from './ToolsPanel';

export const SidePanel = () => {
  const currentMapTool = useAtomValue(mapToolAtom);
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
      {currentMapTool === 'tools' && <ToolsPanel />}
      {currentMapTool === 'layers' && <MapThemes />}
      {currentMapTool === 'draw' && <DrawControls />}
      {currentMapTool === 'measure' && <MeasurePanel />}
      {currentMapTool === 'print' && <PrintPanel />}
      {currentMapTool === null && selectedResult !== null && (
        <InfoBoxContent showReportButton={false} />
      )}
    </Box>
  );
};