import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Tooltip,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { availableScales, scaleAtom } from '../map/atoms';

export const ScaleSelector = () => {
  const [scale, setScale] = useAtom(scaleAtom);
  const { t } = useTranslation();

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
      <Tooltip content={t('toolbar.scale.tooltip')}>
        <SelectTrigger className={'toolbar-select-trigger'}>
          <SelectValueText color="white" placeholder={label}></SelectValueText>
        </SelectTrigger>
      </Tooltip>
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
