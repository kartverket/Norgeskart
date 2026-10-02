import { Button, HStack, Icon, IconButton, Text, Tooltip } from '@kvib/react';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { measureEnabledEffect, measureTypeAtom } from './atoms';

export const MeasurePopoverContent = ({ panel = false }: { panel?: boolean }) => {
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
    <>
      <HStack boxShadow="md" gap={1}>
        <Tooltip content={t('measure.length')}>
          <IconButton
            size="sm"
            variant="ghost"
            icon="straighten"
            aria-label={t('measure.length')}
            backgroundColor={measureType === 'length' ? '#D0ECD6' : ''}
            onClick={() => setMeasureType('length')}
          ></IconButton>
        </Tooltip>

        <Tooltip content={t('measure.area')}>
          <IconButton
            size="sm"
            variant="ghost"
            icon="square_foot"
            aria-label={t('measure.area')}
            backgroundColor={measureType === 'area' ? '#D0ECD6' : ''}
            onClick={() => setMeasureType('area')}
          ></IconButton>
        </Tooltip>
      </HStack>
    </>
  );
};
