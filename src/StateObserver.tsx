import { createStore, Provider } from 'jotai';
import { observe } from 'jotai-effect';
import { ReactNode } from 'react';
import { useDrawSettings } from './draw/drawHooks';
import { primaryColorAtom, secondaryColorAtom } from './map/atoms';

export const StateObserver = ({ children }: { children: ReactNode }) => {
  const store = createStore();
  const {} = useDrawSettings();

  observe((get) => {
    const color = get(primaryColorAtom);
    console.log('Primary color changed:', color);
    // setDrawPointColor(color);
    // setDrawFillColor(color);
    //setDrawStrokeColor(color);
  }, store);

  observe((get) => {
    const color = get(secondaryColorAtom);
    console.log('Secondary color changed:', color);
    // setDrawPointColor(color);
    // setDrawFillColor(color);
    //setDrawStrokeColor(color);
  }, store);

  return <Provider store={store}>{children}</Provider>;
};
