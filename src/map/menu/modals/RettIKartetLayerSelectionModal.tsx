import {
  createListCollection,
  Dialog,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Link,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Text,
} from '@kvib/react';
import { getDefaultStore } from 'jotai';
import { transform } from 'ol/proj';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../atoms';

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

export const RettIKartetLayerSelectionModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
}) => {
  const { t } = useTranslation();
  const [selectedRettIKartetCategory, setSelectedRettIKartetCategory] =
    useState<RettIKartetCategory>('n50kartdata');

  const rettIKartetUrl = getRettIKartetUrl(selectedRettIKartetCategory);
  const rettIKartetCategories = rettIKartetCategory.map((category) => ({
    value: category as RettIKartetCategory,
    label: t(
      `map.contextmenu.items.rettikartet.modal.rettikartetcategories.${category}`,
    ),
  }));

  return (
    <Dialog onOpenChange={(e) => setIsOpen(e.open)} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('map.contextmenu.items.rettikartet.modal.title')}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            {t('map.contextmenu.items.rettikartet.modal.description')}
          </Text>

          <SelectRoot
            collection={createListCollection({
              items: rettIKartetCategories,
            })}
            value={[selectedRettIKartetCategory]}
          >
            <SelectLabel>
              {t('map.contextmenu.items.rettikartet.modal.category.label')}:
            </SelectLabel>
            <SelectTrigger>
              <SelectValueText placeholder={t('shared.actions.select')} />
            </SelectTrigger>
            <SelectContent portalled={false}>
              {rettIKartetCategories.map((item) => (
                <SelectItem
                  key={item.value}
                  item={item.value}
                  onClick={() =>
                    setSelectedRettIKartetCategory(
                      item.value as RettIKartetCategory,
                    )
                  }
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </DialogBody>
        <DialogFooter justifyContent="space-between">
          <Link href={rettIKartetUrl} external target="_blank">
            {t('map.contextmenu.items.rettikartet.modal.link.label')}
          </Link>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </Dialog>
  );
};
