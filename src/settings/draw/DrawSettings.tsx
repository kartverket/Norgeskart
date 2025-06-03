import { useEffect } from 'react';
import { DrawControls } from '../../map/draw/DrawControls';
import { useMapSettings } from '../../map/mapHooks';

export const DrawSettings = () => {
  const { drawEnabled, toggleDrawEnabled } = useMapSettings();
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
