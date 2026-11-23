import { Box, Button, Group, Heading, HStack } from '@kvib/react';
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
      <Group attached>
        {lineStyles.map((style) => (
          <Button
            key={style.value}
            size="xs"
            position="relative"
            zIndex={lineStyle === style.value ? 1 : 0}
            borderColor={lineStyle === style.value ? 'green.500' : 'gray.200'}
            bg={lineStyle === style.value ? 'green.100' : 'transparent'}
            aria-pressed={lineStyle === style.value}
            onClick={() => setLineStyle(style.value)}
          >
            <Box
              w="20px"
              borderTop="2px"
              borderTopStyle={style.borderStyle}
              borderColor="green.500"
            />
          </Button>
        ))}
      </Group>
    </HStack>
  );
};
