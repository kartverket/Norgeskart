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
import { measureEnabledEffect, measureTypeAtom } from './atoms';
import { MeasurePopoverContent } from './MeasurePopoverContent';

export const MeasurePopover = () => {
  const setMeasureType = useSetAtom(measureTypeAtom);
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);

  useAtom(measureEnabledEffect);

  const open = currentMapTool === 'measure';

  return (
    <Popover
      open={open}
      onOpenChange={({ open }) => {
        if (open) {
          setMeasureType('length');
          setCurrentMapTool('measure');
        } else {
          setMeasureType(null);
          setCurrentMapTool(null);
        }
      }}
      positioning={{ placement: 'left' }}
      closeOnInteractOutside={false}
    >
      <PopoverTrigger asChild>
        <Box as="span">
          {' '}
          {/* Needed for popover positioning with tooltip */}
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
