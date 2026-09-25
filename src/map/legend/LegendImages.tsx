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

// GeoServer vendor option: 3x DPI + labels for a sharp enlarged legend; ArcGIS
// and MapServer ignore it.
const ENLARGED_LEGEND_OPTIONS = '&LEGEND_OPTIONS=dpi:270;forceLabels:on';
// Those return the same small image, so scale it up on screen instead.
const SMALL_LEGEND_WIDTH = 300;
const SMALL_LEGEND_SCALE = 2.5;

/** Click-to-enlarge legend images, shared by theme and URL/Geonorge WMS layers. */
export const LegendImages = ({
  urls,
  layerName,
}: {
  urls: string[];
  layerName: string;
}) => {
  const { t } = useTranslation();
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  // Layers without a legend answer with an error: hide them, not a broken image.
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
