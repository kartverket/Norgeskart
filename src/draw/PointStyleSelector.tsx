import { Button, ButtonGroup } from '@kvib/react';
import { useAtom } from 'jotai';
import { pointStyleAtom } from '../settings/draw/atoms';

export const PointStyleSelector = () => {
  const [pointStyle, setPointStyle] = useAtom(pointStyleAtom);

  return (
    <ButtonGroup>
      <Button
        variant={pointStyle === 'circle' ? 'primary' : 'secondary'}
        onClick={() => setPointStyle('circle')}
      >
        Circle
      </Button>
      <Button
        variant={pointStyle === 'square' ? 'primary' : 'secondary'}
        onClick={() => setPointStyle('square')}
      >
        Square
      </Button>
      <Button
        variant={pointStyle === 'triangle' ? 'primary' : 'secondary'}
        onClick={() => setPointStyle('triangle')}
      >
        Triangle
      </Button>
    </ButtonGroup>
  );
};
