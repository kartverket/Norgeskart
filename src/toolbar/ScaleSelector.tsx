import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { availableScales, scaleAtom } from '../map/atoms';

export const ScaleSelector = () => {
  const { t } = useTranslation();
  const [scale, setScale] = useAtom(scaleAtom);

  const scaleCollection = availableScales.map((s) => ({
    value: String(s),
    label: `${t('toolbar.scale')} 1 : ${s.toLocaleString('no-NO')}`,
  }));
  return (
    <SelectRoot
      width="300px"
      size="sm"
      collection={createListCollection({ items: scaleCollection })}
    >
      <SelectTrigger>
        <SelectValueText
          color="white"
          placeholder={
            scale
              ? `${t('toolbar.scale')} 1 : ${scale.toLocaleString('no-NO')}`
              : ''
          }
        ></SelectValueText>
      </SelectTrigger>
      <SelectContent>
        {scaleCollection.map((item) => (
          <SelectItem
            key={item.value}
            item={item.value}
            onClick={() => setScale(Number(item.value))}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
