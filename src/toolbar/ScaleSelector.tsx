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

  const scaleCollection = [...availableScales].map((s) => ({
    value: String(s),
    label: `1 : ${s.toLocaleString('no-NO')}`,
  }));

  const label = scale ? `1: ${scale.toLocaleString('no-NO')}` : '';

  return (
    <SelectRoot
      className={'toolbar-select'}
      width="180px"
      size="sm"
      collection={createListCollection({ items: scaleCollection })}
      value={[]}
      onValueChange={(details) => {
        if (details.value.length > 0) {
          setScale(Number(details.value[0]));
        }
      }}
    >
      <SelectTrigger>
        <SelectValueText color="white" placeholder={label}></SelectValueText>
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
