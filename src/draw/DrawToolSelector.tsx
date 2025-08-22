import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { t } from 'i18next';
import { DrawType, useDrawSettings } from './drawHooks';

const drawTypeCollection: { value: DrawType; label: string }[] = [
  { value: 'Polygon', label: 'Polygon' },
  { value: 'Move', label: 'Flytt' },
  { value: 'Point', label: 'Punkt' },
  { value: 'LineString', label: 'Linje' },
  { value: 'Circle', label: 'Sirkel' },
];

export const DrawToolSelector = () => {
  const { setDrawType } = useDrawSettings();
  return (
    <SelectRoot
      collection={createListCollection({
        items: drawTypeCollection,
      })}
      defaultValue={[drawTypeCollection[0].value]}
    >
      <SelectLabel>{t('draw.tools')}:</SelectLabel>
      <SelectTrigger>
        <SelectValueText
          placeholder={t('draw.controls.toolSelect.placeholder')}
        />
      </SelectTrigger>
      <SelectContent>
        {drawTypeCollection.map((item) => (
          <SelectItem
            key={item.value}
            item={item.value}
            onClick={() => setDrawType(item.value as DrawType)}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
