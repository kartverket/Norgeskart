import { HStack, IconButton, Tooltip } from '@kvib/react';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import { measureEnabledEffect, measureTypeAtom } from './atoms';

export const MeasurePopoverContent = () => {
  const [measureType, setMeasureType] = useAtom(measureTypeAtom);
  useAtom(measureEnabledEffect);

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
