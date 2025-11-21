import {
  Box,
  ButtonGroup,
  createListCollection,
  Icon,
  IconButton,
  MaterialSymbol,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Text,
  VStack,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  pointIconAtom,
  PointType,
  pointTypeAtom,
} from '../settings/draw/atoms';

type PointStyleIcon = 'circle' | 'square' | 'change_history' | 'hov' | 'star';

const styles: { style: PointType; icon: PointStyleIcon; label: string }[] = [
  { style: 'circle', icon: 'circle', label: 'Circle' },
  { style: 'square', icon: 'square', label: 'Square' },
  { style: 'triangle', icon: 'change_history', label: 'Triangle' },
  { style: 'diamond', icon: 'hov', label: 'Diamond' },
  { style: 'star', icon: 'star', label: 'Star' },
];

const icons: MaterialSymbol[] = [
  'circle',
  'skull',
  'house',
  'fastfood',
  'plane_contrails',
  'flutter_dash',
  'coffee',
];

const iconsCollection = createListCollection({
  items: icons.map((icon) => ({
    value: icon,
    label: icon,
  })),
});

export const PointStyleSelector = () => {
  const [pointStyle, setPointStyle] = useAtom(pointTypeAtom);
  const [pointIcon, setPointIcon] = useAtom(pointIconAtom);
  const { t } = useTranslation();

  return (
    <Box>
      <Text fontSize={'sm'} mb={1}>
        {t('draw.controls.pointType')}
      </Text>
      <VStack>
        <ButtonGroup>
          {styles.map(({ style, icon, label }) => (
            <IconButton
              key={style}
              colorPalette="green"
              size="sm"
              variant={pointStyle === style ? 'solid' : 'outline'}
              iconFill
              icon={icon}
              aria-label={label}
              onClick={() => setPointStyle(style)}
            />
          ))}
        </ButtonGroup>
        <SelectRoot
          collection={iconsCollection}
          value={pointIcon ? [pointIcon] : []}
          size="sm"
        >
          <SelectLabel>{t('export.format.label')}:</SelectLabel>
          <SelectTrigger>
            <SelectValueText placeholder={t('export.format.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {icons.map((icon) => (
              <SelectItem
                key={icon}
                item={icon}
                onClick={() => setPointIcon(icon)}
              >
                <Icon icon={icon} />
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </VStack>
    </Box>
  );
};
