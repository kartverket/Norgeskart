import {
  Box,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@kvib/react';
import { useAtom, useSetAtom } from 'jotai';
import { mapToolAtom } from '../map/overlay/atoms';
import { measureTypeAtom } from './atoms';
import { MeasurePanel } from './MeasurePanel';

export const MeasureToolButton = () => {
  const setMeasureType = useSetAtom(measureTypeAtom);
  const [currentMapTool, setCurrentMapTool] = useAtom(mapToolAtom);

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
          {/* Needed for popover positioning with tooltip */}
          <Tooltip content="Måleverktøy" positioning={{ placement: 'left' }}>
            <IconButton
              title="Måleverktøy"
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
        <MeasurePanel />
      </PopoverContent>
    </Popover>
  );
};
