import {
  Button,
  Dialog,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  Image,
  Text,
  VStack,
} from '@kvib/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// GeoServer renders the default legend at ~20px; ask for 3x DPI + labels so the
// enlarged view is sharp and readable instead of a tiny upscaled icon. Other
// servers (ArcGIS, MapServer) ignore the vendor parameter.
const ENLARGED_LEGEND_OPTIONS = '&LEGEND_OPTIONS=dpi:270;forceLabels:on';
// Servers that ignore the DPI hint return the same small image; scale those up
// on screen so "enlarge" does the same thing for every legend.
const SMALL_LEGEND_WIDTH = 300;
const SMALL_LEGEND_SCALE = 2.5;

/**
 * GetLegendGraphic images that open enlarged on click. Shared by theme layers
 * and URL/Geonorge WMS layers so every image legend behaves the same.
 */
export const LegendImages = ({
  urls,
  layerName,
}: {
  urls: string[];
  layerName: string;
}) => {
  const { t } = useTranslation();
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  // Some services have no legend for a layer and answer with an error; drop
  // those instead of showing a broken image button.
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const [enlargedWidth, setEnlargedWidth] = useState<number | undefined>();

  const visibleUrls = urls.filter((url) => !failedUrls.has(url));
  if (visibleUrls.length === 0) {
    return (
      <Text fontSize="sm">
        {layerName + ' ' + t('legend.item.fallbackMessage')}
      </Text>
    );
  }

  return (
    <>
      <VStack align="flex-start" gap={1}>
        {visibleUrls.map((url) => (
          <Button
            key={url}
            type="button"
            variant="plain"
            onClick={() => setSelectedImageUrl(url)}
            p={0}
            h="auto"
            aria-label={t('legend.image.enlarge', { layer: layerName })}
          >
            <Image
              src={url}
              alt=""
              maxW="100%"
              onError={() => setFailedUrls((prev) => new Set(prev).add(url))}
            />
          </Button>
        ))}
      </VStack>
      <Dialog
        open={selectedImageUrl !== null}
        onOpenChange={(event) => {
          if (!event.open) {
            setSelectedImageUrl(null);
            setEnlargedWidth(undefined);
          }
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
                w={enlargedWidth ? `${enlargedWidth}px` : undefined}
                maxW="100%"
                maxH="75vh"
                objectFit="contain"
                mx="auto"
                onLoad={(e) => {
                  const { naturalWidth } = e.currentTarget;
                  if (naturalWidth < SMALL_LEGEND_WIDTH) {
                    setEnlargedWidth(naturalWidth * SMALL_LEGEND_SCALE);
                  }
                }}
              />
            )}
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </Dialog>
    </>
  );
};
