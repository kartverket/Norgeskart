import { Badge, Box, Button, HStack, Text, VStack } from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { backgroundLayerAtom } from '../map/layers/config/backgroundLayers/atoms';
import { ECC_STYLES, eccStyleAtom } from '../map/layers/eccStyle';

export const EccStyles = () => {
  const [currentStyle, setStyle] = useAtom(eccStyleAtom);
  const bgLayer = useAtomValue(backgroundLayerAtom);
  const isActive = bgLayer === 'oceanicelectronic';

  return (
    <Box p={2}>
      <HStack mb={2}>
        <Text fontWeight="bold">ECC Styles (tnt-proxy)</Text>
        <Badge colorPalette={isActive ? 'green' : 'gray'}>
          {isActive ? 'aktiv' : 'ikke aktiv – bytt til Sjøkart ENC'}
        </Badge>
      </HStack>
      <VStack gap={1} align="stretch">
        <Button
          size="xs"
          variant={currentStyle === '' ? 'solid' : 'outline'}
          colorPalette="blue"
          onClick={() => setStyle('')}
        >
          Serverstandard (ingen STYLES-param)
        </Button>
        {ECC_STYLES.map((style) => (
          <Button
            key={style.id}
            size="xs"
            variant={currentStyle === style.id ? 'solid' : 'outline'}
            colorPalette="blue"
            justifyContent="flex-start"
            onClick={() => setStyle(style.id)}
          >
            {style.title}{' '}
            <Text as="span" opacity={0.6} fontSize="xs" ml={1}>
              ({style.id})
            </Text>
          </Button>
        ))}
      </VStack>
      {currentStyle && (
        <Text mt={2} fontSize="xs" opacity={0.7}>
          Aktiv: {currentStyle} — URL: ?eccStyle={currentStyle}
        </Text>
      )}
    </Box>
  );
};
