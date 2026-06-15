import { HStack, IconButton, Tooltip } from '@kvib/react';
import { useAtom } from 'jotai';
import { measureEnabledEffect, measureTypeAtom } from './atoms';

export const MeasurePanel = () => {
  const [measureType, setMeasureType] = useAtom(measureTypeAtom);
    useAtom(measureEnabledEffect);
  

  return (
    <>
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
    </>
  );
};
