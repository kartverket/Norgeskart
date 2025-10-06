import { HStack, Input, Radio, RadioGroup, Text, VStack } from '@kvib/react';
import { t } from 'i18next';
import { useAtom } from 'jotai';
import {
  TextFontSize,
  textFontSizeAtom,
  textInputAtom,
} from '../settings/draw/atoms';

const fontSizeCollection = [
  { value: 12, label: 'S' },
  { value: 16, label: 'M' },
  { value: 24, label: 'L' },
];

export const TextStyleControl = () => {
  const [textValue, setTextValue] = useAtom(textInputAtom);
  const [fontSize, setFontSize] = useAtom(textFontSizeAtom);
  return (
    <VStack alignItems="flex-start" gap={2}>
      <Text fontSize="sm">{t('draw.textInputLabel')}</Text>
      <Input value={textValue} onChange={(e) => setTextValue(e.target.value)} />
      <Text fontSize="sm">{t('draw.size.label')}</Text>
      <RadioGroup value={fontSize.toString()}>
        <HStack>
          {fontSizeCollection.map((item) => (
            <Radio
              key={item.value}
              value={item.value.toString()}
              onClick={() => setFontSize(item.value as TextFontSize)}
            >
              {item.label}
            </Radio>
          ))}
        </HStack>
      </RadioGroup>
    </VStack>
  );
};
