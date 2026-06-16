import {
  Box,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@kvib/react';
import { t } from 'i18next';
import { useAtom, useSetAtom } from 'jotai';
import { mapToolAtom } from '../map/overlay/atoms';
import { measureTypeAtom } from './atoms';
import { MeasurePopoverContent } from './MeasurePopoverContent';

export const MeasurePopover = () => {
  const setMeasureType = useSetAtom(measureTypeAtom);
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);

  const open = currentMapTool === 'measure';

  const toggleMeasureTool = () => {
    if (open) {
      setCurrentMapTool(null);
      setMeasureType(null);
    } else {
      setCurrentMapTool('measure');
      setMeasureType('length');
    }
  };

  return (
    <Popover
      open={open}
      positioning={{ placement: 'left' }}
      closeOnInteractOutside={false}
    >
      <PopoverTrigger asChild>
        {/* Needed for popover positioning with tooltip */}
        <Box as="span">
          <Tooltip
            content={t('measure.label')}
            positioning={{ placement: 'left' }}
          >
            <IconButton
              variant="ghost"
              colorPalette="green"
              size="xs"
              icon="straighten"
              aria-label="Måle"
              backgroundColor={open ? '#D0ECD6' : ''}
              onClick={toggleMeasureTool}
            />
          </Tooltip>
        </Box>
      </PopoverTrigger>
      <PopoverContent maxW="77px">
        <MeasurePopoverContent />
      </PopoverContent>
    </Popover>
  );
};
