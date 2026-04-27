import { Box, Button, Text, VStack } from '@kvib/react';
import { useAtom } from 'jotai';
import { ECC_STYLES } from '../layers/eccStyle';
import { eccStyleAtom } from '../layers/eccStyle';

export const EccStylePanel = () => {
  const [currentStyle, setStyle] = useAtom(eccStyleAtom);

  return (
    <Box px={2} pb={2}>
      <Text fontWeight="semibold" fontSize="sm" mb={1} px={1}>
        ENC-stil
      </Text>
      <VStack gap={0} align="stretch">
        <Button
          key="server-default"
          size="xs"
          variant={currentStyle === '' ? 'solid' : 'ghost'}
          colorPalette="green"
          justifyContent="flex-start"
          onClick={() => setStyle('')}
          fontWeight={currentStyle === '' ? 'semibold' : 'normal'}
          borderRadius="md"
        >
          Serverstandard
        </Button>
        {ECC_STYLES.map((style) => (
          <Button
            key={style.id}
            size="xs"
            variant={currentStyle === style.id ? 'solid' : 'ghost'}
            colorPalette="green"
            justifyContent="flex-start"
            onClick={() => setStyle(style.id)}
            fontWeight={currentStyle === style.id ? 'semibold' : 'normal'}
            borderRadius="md"
          >
            {style.title}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};
