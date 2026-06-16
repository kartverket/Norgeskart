import {
  Box,
  HStack,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { mapToolAtom } from '../map/overlay/atoms';
import { measureTypeAtom } from './atoms';

export const MeasurePopover = () => {
  const [measureType, setMeasureType] = useAtom(measureTypeAtom);
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
        <HStack boxShadow="md" gap={1}>
          <Tooltip content="Lengde">
            <IconButton
              size="sm"
              variant="ghost"
              icon="straighten"
              backgroundColor={measureType === 'length' ? '#D0ECD6' : ''}
              onClick={() => setMeasureType('length')}
            ></IconButton>
          </Tooltip>

          <Tooltip content="Areal">
            <IconButton
              size="sm"
              variant="ghost"
              icon="square_foot"
              backgroundColor={measureType === 'area' ? '#D0ECD6' : ''}
              onClick={() => setMeasureType('area')}
            ></IconButton>
          </Tooltip>
        </HStack>
      </PopoverContent>
    </Popover>
  );
};
