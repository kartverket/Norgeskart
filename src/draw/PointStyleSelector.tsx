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
  VStack,
} from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { pointIconAtom, primaryColorAtom } from '../settings/draw/atoms';
import { useIsMobileScreen } from '../shared/hooks';
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

  const isMobile = useIsMobileScreen();

  return (
    <VStack align="stretch" mt={isMobile ? 1 : 1} gap={isMobile ? 1 : 1}>
      <Heading fontWeight="semibold" size={{ base: 'xs', md: 'sm' }}>
        {t('draw.controls.pointType')}
      </Heading>

      <SelectRoot
        w={'80px'}
        collection={iconsCollection}
        value={pointIcon ? [pointIcon] : []}
      >
        <SelectTrigger>
          <SelectValueText
            placeholder={t('draw.controls.pointType')}
            children={ValueText}
          />
        </SelectTrigger>
        <SelectContent>
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
    </VStack>
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
