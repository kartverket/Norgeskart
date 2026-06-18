import { Box, HStack, Input, Text, VStack, Heading } from '@kvib/react';
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
    <VStack alignItems="flex-start" gap={2} mt={2}>
      <Heading size={{base: 'xs', md: 'sm'}}>{t('draw.textInputLabel')}</Heading>

      <Input value={textValue} onChange={(e) => setTextValue(e.target.value)} />

      <Heading size={{base:'xs', md: 'sm'}}>{t('draw.size.textLabel')}</Heading>

      <HStack>
        {fontSizeCollection.map((item) => {
          const isSelected = fontSize === item.value;

          const buttonSize =
            item.value === 12 ? 28 : item.value === 16 ? 34 : 40;

          return (
            <Box
              key={item.value}
              as="button"
              onClick={() => setFontSize(item.value as TextFontSize)}
              w={`${buttonSize}px`}
              h={`${buttonSize}px`}
              borderRadius="full"
              borderWidth="1px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              borderColor="green.500"
              bg={isSelected ? 'green.100' : 'transparent'}
            >
              <Text
                fontSize={`${item.value}px`}
                color="green.600"
                fontWeight="bold"
              >
                Aa
              </Text>
            </Box>
          );
        })}
      </HStack>
    </VStack>
  );
};
