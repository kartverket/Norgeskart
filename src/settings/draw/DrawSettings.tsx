import { useEffect } from 'react';
import { DrawControls } from '../../map/draw/DrawControls';
import { useDrawSettings } from '../../map/mapHooks';

export const DrawSettings = () => {
  const { drawEnabled, toggleDrawEnabled } = useDrawSettings();
  //To disable the draw mode when the controlls are unmounted
  useEffect(() => {
    return () => {
      if (drawEnabled) {
        toggleDrawEnabled();
      }
    };
  }, [drawEnabled, toggleDrawEnabled]);

  return <DrawControls />;
};
