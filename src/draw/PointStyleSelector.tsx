import { ButtonGroup, IconButton } from '@kvib/react';
import { useAtom } from 'jotai';
import { PointStyle, pointStyleAtom } from '../settings/draw/atoms';

type PointStyleIcon =
  | 'circle'
  | 'square'
  | 'change_history'
  | 'favorite'
  | 'star';

const styles: { style: PointStyle; icon: PointStyleIcon; label: string }[] = [
  { style: 'circle', icon: 'circle', label: 'Circle' },
  { style: 'square', icon: 'square', label: 'Square' },
  { style: 'triangle', icon: 'change_history', label: 'Triangle' },
  { style: 'heart', icon: 'favorite', label: 'Heart' },
  { style: 'star', icon: 'star', label: 'Star' },
];

export const PointStyleSelector = () => {
  const [pointStyle, setPointStyle] = useAtom(pointStyleAtom);

  return (
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
  );
};
