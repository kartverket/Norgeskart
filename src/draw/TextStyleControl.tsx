import { Box, Heading, HStack, Input, Text, VStack } from '@kvib/react';
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
    <VStack alignItems="stretch" gap={2} mt={2}>
      <HStack
        width="100%"
        align="center"
        justifyContent="space-between"
        pb={2}
        borderBottom="1px solid #E0E0E0"
      >
        <Heading size={{ base: 'xs', md: 'sm' }}>
          {t('draw.textInputLabel')}
        </Heading>
        <Input
          width="180px"
          height="28px"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
        />
      </HStack>

      <HStack width="100%" align="center" justifyContent="space-between">
        <Heading size={{ base: 'xs', md: 'sm' }}>
          {t('draw.size.textLabel')}
        </Heading>
        <HStack gap={0}>
          {fontSizeCollection.map((item) => {
            const isSelected = fontSize === item.value;

            return (
              <Box
                key={item.value}
                as="button"
                onClick={() => setFontSize(item.value as TextFontSize)}
                w="36px"
                h="20px"
                borderRadius="4px"
                border="1px solid"
                borderColor={isSelected ? 'green.500' : 'gray.200'}
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                bg={isSelected ? 'green.100' : 'transparent'}
              >
                <Text
                  fontSize={`${item.value === 24 ? 20 : item.value}px`}
                  color="green.600"
                  fontWeight="bold"
                >
                  Aa
                </Text>
              </Box>
            );
          })}
        </HStack>
      </HStack>
    </VStack>
  );
};
