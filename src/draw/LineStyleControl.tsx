import { Button, Heading, HStack, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { LineStyle, lineStyleAtom } from '../settings/draw/atoms';

const lineStyles = [
  { value: 'solid' as LineStyle, label: '____' },
  { value: 'dashed' as LineStyle, label: '_ _ _' },
];

export const LineStyleControl = () => {
  const [lineStyle, setLineStyle] = useAtom(lineStyleAtom);
  const { t } = useTranslation();

  return (
    <VStack align="stretch">
      <Heading size={{ base: 'xs', md: 'sm' }}>
        {t('draw.controls.lineType')}
      </Heading>
      <HStack>
        {lineStyles.map((style) => (
          <Button
            variant="outline"
            key={style.value}
            size="xs"
            color="green.500"
            bg={lineStyle === style.value ? 'green.100' : 'transparent'}
            onClick={() => setLineStyle(style.value)}
          >
            {style.label}
          </Button>
        ))}
      </HStack>
    </VStack>
  );
};
