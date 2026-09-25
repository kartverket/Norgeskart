import {
  Button,
  Dialog,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  Image,
  VStack,
} from '@kvib/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getEffectiveLegendImageUrls,
  ThemeLayerConfig,
  ThemeLayerDefinition,
} from '../layers/themeLayerConfigApi';
import { ThemeLayerName } from '../layers/themeWMS';

// GeoServer renders the default legend at ~20px; ask for 3x DPI + labels so the
// enlarged view is sharp and readable instead of a tiny upscaled icon
const ENLARGED_LEGEND_OPTIONS = '&LEGEND_OPTIONS=dpi:270;forceLabels:on';

export const ImageLegend = ({
  config,
  layer,
}: {
  config: ThemeLayerConfig;
  layer: ThemeLayerDefinition;
}) => {
  const { t, i18n } = useTranslation();
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  if (!layer.useLegendGraphic) {
    return null;
  }

  const imageUrls = getEffectiveLegendImageUrls(
    config,
    layer.id as ThemeLayerName,
  );
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }
  const layerName = layer.name[i18n.language as 'nb' | 'nn' | 'en'];

  return (
    <>
      <VStack align="flex-start" gap={1}>
        {imageUrls.map((url) => (
          <Button
            key={url}
            type="button"
            variant="plain"
            onClick={() => setSelectedImageUrl(url)}
            p={0}
            h="auto"
            aria-label={t('legend.image.enlarge', { layer: layerName })}
          >
            <Image src={url} maxW="100%" />
          </Button>
        ))}
      </VStack>
      <Dialog
        open={selectedImageUrl !== null}
        onOpenChange={(event) => {
          if (!event.open) setSelectedImageUrl(null);
        }}
        placement="center"
        size="lg"
      >
        <DialogContent>
          <DialogBody p={4} pt={12}>
            {selectedImageUrl && (
              <Image
                src={selectedImageUrl + ENLARGED_LEGEND_OPTIONS}
                alt={t('legend.image.enlargedAlt', { layer: layerName })}
                maxW="100%"
                maxH="75vh"
                objectFit="contain"
                mx="auto"
              />
            )}
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </Dialog>
    </>
  );
};
