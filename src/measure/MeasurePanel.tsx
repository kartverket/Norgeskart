import { HStack, IconButton } from '@kvib/react';
import { useAtom } from 'jotai';
import { measureTypeAtom } from './atoms';

export const MeasurePanel = () => {
  const [measureType, setMeasureType] = useAtom(measureTypeAtom);

  return (
    <>
      <HStack boxShadow="md" gap={1}>
        <IconButton
          size="sm"
          variant="ghost"
          icon="straighten"
          backgroundColor={measureType === 'length' ? '#D0ECD6' : ''}
          onClick={() => setMeasureType('length')}
        ></IconButton>

        <IconButton
          size="sm"
          variant="ghost"
          icon="square_foot"
          backgroundColor={measureType === 'area' ? '#D0ECD6' : ''}
          onClick={() => setMeasureType('area')}
        ></IconButton>
      </HStack>
    </>
  );
};
