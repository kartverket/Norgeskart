import {
  Box,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@kvib/react';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { NavigationButton } from '../layout/NavigationButton';
import { mapToolAtom } from '../map/overlay/atoms';
import { searchCoordinatesAtom, selectedResultAtom } from '../search/atoms';
import { measureTypeAtom } from './atoms';
import { MeasurePopoverContent } from './MeasurePopoverContent';

export const MeasurePopover = ({ isMinimized }: { isMinimized: boolean }) => {
  const { t } = useTranslation();
  const setMeasureType = useSetAtom(measureTypeAtom);
  const setSelectedResult = useSetAtom(selectedResultAtom);
  const setSearchCoordinates = useSetAtom(searchCoordinatesAtom);
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);

  const open = currentMapTool === 'measure';

  const toggleMeasureTool = () => {
    if (open) {
      setCurrentMapTool(null);
      setMeasureType(null);
    } else {
      setSelectedResult(null);
      setSearchCoordinates(null);
      setCurrentMapTool('measure');
      setMeasureType('length');
    }
  };

  return (
    <Popover
      open={open}
      positioning={{ placement: 'right' }}
      closeOnInteractOutside={false}
    >
      <PopoverTrigger asChild>
        <Box display="inline-flex" width="fit-content">
          <NavigationButton
            icon="straighten"
            label={t('measure.label')}
            isMinimized={isMinimized}
            active={open}
            onClick={toggleMeasureTool}
          />
        </Box>
      </PopoverTrigger>
      <PopoverContent
        width="fit-content"
        maxW="none"
        p={0}
        backgroundColor="transparent"
        border="none"
        boxShadow="none"
      >
        <MeasurePopoverContent />
      </PopoverContent>
    </Popover>
  );
};
