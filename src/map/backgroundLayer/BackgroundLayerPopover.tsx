import {
  Box,
  Button,
  Image,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  Text,
} from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currentProjectionAtom, getBackgroundLayerImageName } from '../atoms';
import { backgroundLayerAtom } from '../layers/config/backgroundLayers/atoms';
import {
  BackgroundLayerGrid,
  getAvailableBackgroundLayers,
} from './BackgroundLayerGrid';

export const BackgroundLayerPopover = () => {
  const [open, setOpen] = useState(false);
  const [backgroundLayer, setBackgroundLayer] = useAtom(backgroundLayerAtom);
  const currentProjection = useAtomValue(currentProjectionAtom);
  const { t } = useTranslation();

  const backgroundLayers = getAvailableBackgroundLayers(currentProjection);

  return (
    <PopoverRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement: 'top', offset: { mainAxis: 2 } }}
    >
      <PopoverTrigger asChild>
        <Button
          pointerEvents="auto"
          width="56px"
          height="54px"
          borderRadius="10px"
          overflow="hidden"
          cursor="pointer"
          padding={0}
          aria-label={t('search.backgroundChooser.label')}
          border="3px solid"
          borderColor="white"
          boxShadow="0 2px 10px rgba(0, 0, 0, 0.35)"
        >
          <Image
            src={`/backgroundlayerImages/${getBackgroundLayerImageName(backgroundLayer)}.png`}
            alt={t(
              `map.settings.layers.mapNames.backgroundMaps.${backgroundLayer}`,
            )}
            width="100%"
            height="100%"
            objectFit="cover"
          />
          <Box position="absolute" inset={0} bg="rgba(0, 0, 0, 0.16)" />
          <Box
            position="absolute"
            left={0}
            right={0}
            bottom={0}
            px={1.5}
            py={0.5}
            bg="rgba(0, 0, 0, 0.68)"
          >
            <Text
              color="white"
              fontSize="10px"
              fontWeight="semibold"
              textAlign="center"
              lineHeight="short"
            >
              {t('map.controls.backgroundLayer.label')}
            </Text>
          </Box>
        </Button>
      </PopoverTrigger>
      <PopoverContent width="350px" p={0} borderRadius="2xl" boxShadow="lg">
        <PopoverArrow />
        <PopoverBody p={0} maxHeight="420px" overflowY="auto">
          <Box p={1}>
            <BackgroundLayerGrid
              layers={backgroundLayers.map((layerName) => ({
                value: layerName,
                label: t(
                  `map.settings.layers.mapNames.backgroundMaps.${layerName}`,
                ),
              }))}
              currentLayer={backgroundLayer}
              setLayer={(layerName) => {
                setBackgroundLayer(layerName);
                setOpen(false);
              }}
            />
          </Box>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};
