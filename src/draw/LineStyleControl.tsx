import { Button, Heading, HStack, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { LineStyle, lineStyleAtom } from '../settings/draw/atoms';

const lineStyles = [
  { value: 'solid' as LineStyle, label: '____' },
  { value: 'dashed' as LineStyle, label: '_ _ _' },
];

export const LineStyleControl = () => {
  const [lineStyle, setLineStyle] = useAtom(lineStyleAtom);

  return (
    <VStack align="stretch">
      <Heading size={{ base: 'xs', md: 'sm' }}>Linjetype</Heading>
      <HStack>
        {lineStyles.map((style) => (
          <Button
            key={style.value}
            size="xs"
            variant={lineStyle === style.value ? 'solid' : 'outline'}
            onClick={() => setLineStyle(style.value)}
          >
            {style.label}
          </Button>
        ))}
      </HStack>
    </VStack>
  );
};
