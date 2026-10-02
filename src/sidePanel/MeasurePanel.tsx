import { Button, HStack, Icon, Text, VStack } from '@kvib/react';
import { useAtom, useSetAtom } from 'jotai';
import { MeasurePopoverContent } from '../measure/MeasurePopoverContent';
import { measureTypeAtom } from '../measure/atoms';
import { mapToolAtom } from '../map/overlay/atoms';

export const MeasurePanel = () => {
  const setMapTool = useSetAtom(mapToolAtom);
  const [, setMeasureType] = useAtom(measureTypeAtom);

  const handleBack = () => {
    setMeasureType(null);
    setMapTool('tools');
  };

  return (
    <VStack alignItems="stretch" gap={4}>
      <HStack justifyContent="space-between">
        <Button variant="ghost" gap={2} px={0} onClick={handleBack}>
          <Icon icon="arrow_back" />
          <Text>Verktøy</Text>
        </Button>
      </HStack>
      <VStack alignItems="stretch" gap={2}>
        <Text fontWeight="bold" fontSize="lg">
          Måle
        </Text>
        <Text color="gray.600">
          Velg hva du vil måle i kartet. Klikk to ganger for å avslutte.
        </Text>
        <MeasurePopoverContent panel />
      </VStack>
    </VStack>
  );
};
