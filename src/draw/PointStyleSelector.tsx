import { Box, ButtonGroup, IconButton, Text } from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { PointType, pointTypeAtom } from '../settings/draw/atoms';

type PointStyleIcon = 'circle' | 'square' | 'change_history' | 'hov' | 'star';

const styles: { style: PointType; icon: PointStyleIcon; label: string }[] = [
  { style: 'circle', icon: 'circle', label: 'Circle' },
  { style: 'square', icon: 'square', label: 'Square' },
  { style: 'triangle', icon: 'change_history', label: 'Triangle' },
  { style: 'diamond', icon: 'hov', label: 'Diamond' },
  { style: 'star', icon: 'star', label: 'Star' },
];

export const PointStyleSelector = () => {
  const [pointStyle, setPointStyle] = useAtom(pointTypeAtom);
  const { t } = useTranslation();

  return (
    <Box>
      <Text fontSize={'sm'} mb={1}>
        {t('draw.controls.pointType')}
      </Text>
      <ButtonGroup>
        {styles.map(({ style, icon, label }) => (
          <IconButton
            key={style}
            colorPalette="green"
            size="sm"
            variant={pointStyle === style ? 'solid' : 'outline'}
            icon={icon}
            aria-label={label}
            onClick={() => setPointStyle(style)}
          />
        ))}
      </ButtonGroup>
    </Box>
  );
};
