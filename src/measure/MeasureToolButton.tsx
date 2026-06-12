import {
  Box,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@kvib/react';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { measureTypeAtom } from './atoms';
import { MeasurePanel } from './MeasurePanel';

export const MeasureToolButton = () => {
  const [openMeasureTool, setOpenMeasureTool] = useState(false);
  const setMeasureType = useSetAtom(measureTypeAtom);

  return (
    <Popover
      open={openMeasureTool}
      onOpenChange={({ open }) => {
        setOpenMeasureTool(open);

        if (open) {
          setMeasureType('length');
        } else {
          setMeasureType(null);
        }
      }}
      positioning={{ placement: 'left' }}
      closeOnInteractOutside={false}
    >
      <PopoverTrigger asChild>
        <Box as="span">{/* Needed for popover positioning with tooltip */}
          <Tooltip content="Måleverktøy" positioning={{ placement: 'left' }}>
            <IconButton
              title="Måleverktøy"
              variant="ghost"
              colorPalette="green"
              size="xs"
              icon="straighten"
              aria-label="Måle"
              backgroundColor={openMeasureTool ? '#D0ECD6' : undefined}
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
