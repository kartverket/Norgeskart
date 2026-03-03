import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { DrawControls } from '../../draw/drawControls/DrawControls';
import { clearInteractions, drawEnabledEffect, drawTypeEffect } from './atoms';

export const DrawSettings = () => {
  useAtom(drawEnabledEffect);
  useAtom(drawTypeEffect);

  useEffect(() => {
    return () => {
      clearInteractions();
    };
  }, []);
  return <DrawControls />;
};
