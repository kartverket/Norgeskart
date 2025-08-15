import { createStore, Provider } from 'jotai';
import { observe } from 'jotai-effect';
import { ReactNode } from 'react';
import { useDrawSettings } from './draw/drawHooks';
import { primaryColorAtom } from './map/atoms';

export const StateObserver = ({ children }: { children: ReactNode }) => {
  const store = createStore();
  const { setDrawPointColor, setDrawFillColor, setDrawStrokeColor } =
    useDrawSettings();

  observe((get) => {
    const color = get(primaryColorAtom);
    console.log('Color changed:', color);
    // setDrawPointColor(color);
    // setDrawFillColor(color);
    //setDrawStrokeColor(color);
  }, store);

  return <Provider store={store}>{children}</Provider>;
};
