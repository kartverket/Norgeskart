import { Button, HStack, Icon, Text, VStack } from '@kvib/react';
import { useSetAtom } from 'jotai';
import { mapToolAtom } from '../map/overlay/atoms';

export const PrintPanel = () => {
  const setMapTool = useSetAtom(mapToolAtom);

  return (
    <VStack alignItems="stretch" gap={4}>
      <HStack>
        <Button
          variant="ghost"
          gap={2}
          px={0}
          onClick={() => setMapTool('tools')}
        >
          <Icon icon="arrow_back" />
          <Text>Verktøy</Text>
        </Button>
      </HStack>
      <Text fontWeight="bold" fontSize="lg">
        Skriv ut
      </Text>
      <VStack alignItems="stretch" gap={2}>
        <Button variant="ghost" justifyContent="flex-start">
          <Text>Utsnitt</Text>
        </Button>
        <Button variant="ghost" justifyContent="flex-start">
          <Text>Turkart</Text>
        </Button>
        <Button variant="ghost" justifyContent="flex-start">
          <Text>Nødplakat</Text>
        </Button>
      </VStack>
    </VStack>
  );
};
