import {
  createListCollection,
  Heading,
  HStack,
  Icon,
  MaterialSymbol,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { pointIconAtom, primaryColorAtom } from '../settings/draw/atoms';
import { isDrawIconFilled } from './drawControls/drawUtils';

const icons: MaterialSymbol[] = [
  'circle',
  'change_history',
  'square',
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
  'ac_unit',
];

const iconsCollection = createListCollection({
  items: icons.map((icon) => ({
    value: icon,
    label: icon,
  })),
});

export const PointStyleSelector = () => {
  const [pointIcon, setPointIcon] = useAtom(pointIconAtom);
  const color = useAtomValue(primaryColorAtom);
  const { t } = useTranslation();

  return (
    <HStack
      align="center"
      justifyContent="space-between"
      width="100%"
    >
      <Heading fontWeight="semibold" size={{ base: 'xs', md: 'sm' }}>
        {t('draw.controls.pointType')}
      </Heading>

      <SelectRoot
        w="70px"
        collection={iconsCollection}
        value={pointIcon ? [pointIcon] : []}
      >
        <SelectTrigger
          className="point-style-select-trigger"
          border="none"
          borderWidth={0}
          borderColor="transparent"
          outline="none"
          boxShadow="none"
          bg="transparent"
          justifyContent="space-between"
        >
          <SelectValueText
            placeholder={t('draw.controls.pointType')}
            children={ValueText}
          />
        </SelectTrigger>
        <SelectContent overflowX="hidden">
          {icons.map((icon) => (
            <SelectItem
              key={icon}
              item={icon}
              onClick={() => setPointIcon(icon)}
            >
              <Icon icon={icon} filled={isDrawIconFilled(icon)} color={color} />
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </HStack>
  );
};

const ValueText = (
  items: { label: string; value: MaterialSymbol }[],
): ReactNode => {
  const color = useAtomValue(primaryColorAtom);
  return (
    <HStack>
      {items.map((item) => (
        <Icon
          color={color}
          key={item.value}
          icon={item.value}
          filled={isDrawIconFilled(item.value)}
        />
      ))}
    </HStack>
  );
};
