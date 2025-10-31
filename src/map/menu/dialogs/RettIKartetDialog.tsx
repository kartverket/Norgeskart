import {
  Dialog,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Heading,
  HStack,
  Image,
  Link,
  Stack,
  Text,
  VStack,
} from '@kvib/react';
import { getDefaultStore } from 'jotai';
import { transform } from 'ol/proj';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../atoms';

const TRANSLATION_BASE_KEY = 'map.contextmenu.items.rettikartet.dialog';

const getRettIKartetUrl = (category: RettIKartetCategory) => {
  const store = getDefaultStore();
  const map = store.get(mapAtom);
  const view = map.getView();
  const center = view.getCenter();
  const zoom = view.getZoom();
  if (!center || !zoom) {
    return;
  }
  const projection = view.getProjection();
  const zoomToUse = Math.max(
    zoom - (projection.getCode() === 'EPSG:3857' ? 2 : 0),
    0,
  ); //Hack to make the maps more aligned between web mercator and utm3x

  const rettIKartetCoords = transform(center, projection, 'EPSG:25833');
  const url = `https://rettikartet.no/app/${category}?lon=${rettIKartetCoords[0]}&lat=${rettIKartetCoords[1]}&zoom=${zoomToUse}`;
  return url;
};

const rettIKartetCategory = [
  'n50kartdata',
  'sjo',
  'veger',
  'turruter',
] as const;
type RettIKartetCategory = (typeof rettIKartetCategory)[number];

export const RettIKartetDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Dialog onOpenChange={(e) => setIsOpen(e.open)} open={isOpen} size={'lg'}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`${TRANSLATION_BASE_KEY}.title`)}</DialogTitle>
        </DialogHeader>
        <DialogBody mb={'8px'}>
          <Stack>
            <Text>{t(`${TRANSLATION_BASE_KEY}.description`)}</Text>
            <HStack>
              {rettIKartetCategory.map((category) => (
                <Link
                  href={getRettIKartetUrl(category)}
                  key={category}
                  target="_blank"
                >
                  <VStack>
                    <Heading size="sm">
                      {t(
                        `${TRANSLATION_BASE_KEY}.rettikartetcategories.${category}`,
                      )}
                      <Image src={`/rettikartetCategories/${category}.jpg`} />
                    </Heading>
                  </VStack>
                </Link>
              ))}
            </HStack>
          </Stack>
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </Dialog>
  );
};
