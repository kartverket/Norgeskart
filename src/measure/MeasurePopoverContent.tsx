import { Button, HStack, Icon, Text, VStack } from '@kvib/react';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { measureEnabledEffect, measureTypeAtom } from './atoms';

export const MeasurePopoverContent = ({
  panel = false,
}: {
  panel?: boolean;
}) => {
  const [measureType, setMeasureType] = useAtom(measureTypeAtom);
  useAtom(measureEnabledEffect);

  if (panel) {
    return (
      <HStack
        gap={0}
        borderWidth="1px"
        borderColor="gray.300"
        borderRadius="md"
        overflow="hidden"
        width="100%"
      >
        <Button
          variant="ghost"
          flex={1}
          borderRadius={0}
          backgroundColor={measureType === 'length' ? 'green.50' : 'white'}
          onClick={() => setMeasureType('length')}
        >
          <Icon icon="straighten" />
          <Text>Lengde</Text>
        </Button>
        <Button
          variant="ghost"
          flex={1}
          borderRadius={0}
          backgroundColor={measureType === 'area' ? 'green.50' : 'white'}
          onClick={() => setMeasureType('area')}
        >
          <Icon icon="square_foot" />
          <Text>Areal</Text>
        </Button>
      </HStack>
    );
  }

  return (
    <HStack
      boxShadow="md"
      gap={1}
      p={1}
      backgroundColor="white"
      borderRadius="md"
    >
      <Button
        variant="ghost"
        colorPalette="green"
        minW="64px"
        height="52px"
        px={1}
        py={1}
        backgroundColor={measureType === 'length' ? '#D0ECD6' : 'transparent'}
        onClick={() => setMeasureType('length')}
      >
        <VStack gap={1}>
          <Icon icon="straighten" />
          <Text fontSize="sm">{t('measure.length')}</Text>
        </VStack>
      </Button>
      <Button
        variant="ghost"
        colorPalette="green"
        minW="64px"
        height="52px"
        px={1}
        py={1}
        backgroundColor={measureType === 'area' ? '#D0ECD6' : 'transparent'}
        onClick={() => setMeasureType('area')}
      >
        <VStack gap={1}>
          <Icon icon="square_foot" />
          <Text fontSize="sm">{t('measure.area')}</Text>
        </VStack>
      </Button>
    </HStack>
  );
};
