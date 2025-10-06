import { HStack, Radio, RadioGroup, Text, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { LineWidth, lineWidthAtom } from '../settings/draw/atoms';
import { useDrawSettings } from './drawControls/hooks/drawSettings';

const lineWidthCollection: { value: LineWidth; label: string }[] = [
  { value: 2, label: 'S' },
  { value: 4, label: 'M' },
  { value: 8, label: 'L' },
];

export const LineWidthControl = () => {
  const [lineWidth, setLineWidth] = useAtom(lineWidthAtom);
  const { drawType } = useDrawSettings();
  const { t } = useTranslation();

  if (
    drawType !== 'LineString' &&
    drawType !== 'Point' &&
    drawType !== 'Polygon'
  ) {
    return null;
  }

  return (
    <VStack alignItems={'flex-start'}>
      <Text fontSize={'sm'}>{t('draw.size.label')}</Text>
      <RadioGroup value={lineWidth.toString()}>
        <HStack>
          {lineWidthCollection.map((item) => (
            <Radio
              key={item.value}
              value={item.value.toString()}
              onClick={() => {
                setLineWidth(item.value);
              }}
            >
              {item.label}
            </Radio>
          ))}
        </HStack>
      </RadioGroup>
    </VStack>
  );
};
