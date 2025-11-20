import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { availableScales, scaleAtom } from '../map/atoms';

export const ScaleSelector = () => {
  const [scale, setScale] = useAtom(scaleAtom);

  const scaleCollection = availableScales.map((s) => ({
    value: String(s),
    label: `Målestokk 1 : ${s.toLocaleString('no-NO')}`,
  }));
  return (
    <SelectRoot
      width="230px"
      size="sm"
      collection={createListCollection({ items: scaleCollection })}
    >
      <SelectTrigger>
        <SelectValueText
          color="white"
          placeholder={
            scale
              ? `Målestokk 1 : ${scale.toLocaleString('no-NO')}`
              : 'Velg målestokk'
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
