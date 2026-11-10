import { Box, Heading, HStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { LineStyle, lineStyleAtom } from '../settings/draw/atoms';

const lineStyles = [
  { value: 'solid' as LineStyle, borderStyle: 'solid' as const },
  { value: 'dashed' as LineStyle, borderStyle: 'dashed' as const },
];

export const LineStyleControl = () => {
  const [lineStyle, setLineStyle] = useAtom(lineStyleAtom);
  const { t } = useTranslation();

  return (
    <HStack align="center" justifyContent="space-between" width="100%">
      <Heading size={{ base: 'xs', md: 'sm' }}>
        {t('draw.controls.lineType')}
      </Heading>
      <HStack gap={0}>
        {lineStyles.map((style) => (
          <Box
            as="button"
            key={style.value}
            w="36px"
            h="20px"
            p={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="1px solid"
            borderColor={
              lineStyle === style.value ? 'green.500' : 'gray.200'
            }
            borderRadius="4px"
            bg={lineStyle === style.value ? 'green.100' : 'transparent'}
            cursor="pointer"
            aria-pressed={lineStyle === style.value}
            onClick={() => setLineStyle(style.value)}
          >
            <Box
              w="20px"
              borderTop="2px"
              borderTopStyle={style.borderStyle}
              borderColor="green.500"
            />
          </Box>
        ))}
      </HStack>
    </HStack>
  );
};
