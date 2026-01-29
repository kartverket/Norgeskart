import {
  createListCollection,
  HStack,
  Icon,
  MaterialSymbol,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { pointIconAtom } from '../settings/draw/atoms';

const icons: MaterialSymbol[] = [
  'directions_walk',
  'directions_bike',
  'kayaking',
  'sledding',
  'phishing',
  'camping',
  'anchor',
  'home_pin',
  'pin_drop',
  'flag',
  'local_parking',
  'beenhere',
  'local_see',
  'elevation',
];

const iconsCollection = createListCollection({
  items: icons.map((icon) => ({
    value: icon,
    label: icon,
  })),
});

export const PointStyleSelector = () => {
  const [pointIcon, setPointIcon] = useAtom(pointIconAtom);
  const { t } = useTranslation();

  return (
    <SelectRoot
      w={'80px'}
      marginTop={4}
      collection={iconsCollection}
      value={pointIcon ? [pointIcon] : []}
    >
      <SelectLabel>{t('draw.controls.pointType')}:</SelectLabel>
      <SelectTrigger>
        <SelectValueText
          placeholder={t('draw.controls.pointType')}
          children={ValueText}
        />
      </SelectTrigger>
      <SelectContent>
        {icons.map((icon) => (
          <SelectItem key={icon} item={icon} onClick={() => setPointIcon(icon)}>
            <Icon icon={icon} />
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

const ValueText = (
  items: { label: string; value: MaterialSymbol }[],
): ReactNode => {
  return (
    <HStack>
      {items.map((item) => (
        <Icon key={item.value} icon={item.value} />
      ))}
    </HStack>
  );
};
