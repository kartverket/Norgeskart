import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { availableScales, selectedScaleAtom } from '../map/atoms';

export const ScaleSelector = () => {
  const [selectedScale, setSelectedScale] = useAtom(selectedScaleAtom);

  const scaleCollection = availableScales.map((s) => ({
    value: String(s),
    label: `Målestokk 1 : ${s.toLocaleString('no-NO')}`,
  }));
  return (
    <SelectRoot
      width="200px"
      size="sm"
      value={[String(selectedScale)]}
      collection={createListCollection({ items: scaleCollection })}
      defaultValue={[String(selectedScale)]}
    >
      <SelectTrigger>
        <SelectValueText
          placeholder={`Målestokk 1 : ${selectedScale}`}
        ></SelectValueText>
      </SelectTrigger>
      <SelectContent>
        {scaleCollection.map((item) => (
          <SelectItem
            key={item.value}
            item={item.value}
            onClick={() => setSelectedScale(Number(item.value))}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
