import { Button, HStack, Icon, Text, Tooltip, VStack } from '@kvib/react';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { measureEnabledEffect, measureTypeAtom } from './atoms';

export const MeasurePopoverContent = ({
  panel = false,
  isMinimized = false,
}: {
  panel?: boolean;
  isMinimized?: boolean;
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

  const lengthButton = (
    <Button
      variant="ghost"
      colorPalette="green"
      minW={isMinimized ? '40px' : '64px'}
      height={isMinimized ? '40px' : '52px'}
      px={1}
      py={1}
      backgroundColor={measureType === 'length' ? '#D0ECD6' : 'transparent'}
      onClick={() => setMeasureType('length')}
    >
      <VStack gap={1}>
        <Icon icon="straighten" />
        {!isMinimized && <Text fontSize="sm">{t('measure.length')}</Text>}
      </VStack>
    </Button>
  );
  const areaButton = (
    <Button
      variant="ghost"
      colorPalette="green"
      minW={isMinimized ? '40px' : '64px'}
      height={isMinimized ? '40px' : '52px'}
      px={1}
      py={1}
      backgroundColor={measureType === 'area' ? '#D0ECD6' : 'transparent'}
      onClick={() => setMeasureType('area')}
    >
      <VStack gap={1}>
        <Icon icon="square_foot" />
        {!isMinimized && <Text fontSize="sm">{t('measure.area')}</Text>}
      </VStack>
    </Button>
  );

  return (
    <HStack
      boxShadow="md"
      gap={isMinimized ? 0.5 : 1}
      p={isMinimized ? 0.5 : 1}
      backgroundColor="white"
      borderRadius="md"
    >
      {isMinimized ? (
        <Tooltip
          content={t('measure.length')}
          positioning={{ placement: 'top' }}
        >
          {lengthButton}
        </Tooltip>
      ) : (
        lengthButton
      )}
      {isMinimized ? (
        <Tooltip
          content={t('measure.area')}
          positioning={{ placement: 'top' }}
        >
          {areaButton}
        </Tooltip>
      ) : (
        areaButton
      )}
    </HStack>
  );
};
