import { useEffect } from 'react';
import { Debug } from './debug/Debug.tsx';
import './i18n';
import { Layout } from './Layout.tsx';
import { useMapSettings } from './map/mapHooks.ts';
import { RettIKartetDialog } from './map/menu/dialogs/RettIKartetDialog.tsx';
import { MapLegendDrawer } from './map/menu/drawers/MapLegendDrawer.tsx';
import { MessageBox } from './messages/MessageBox.tsx';

function App() {
  const { setMapFullScreen } = useMapSettings();

  const fullscreenClickHandler = (event: KeyboardEvent) => {
    if (event.key === 'F11') {
      event.preventDefault();
      setMapFullScreen(true);
      event.stopPropagation();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', fullscreenClickHandler);
    return () => {
      document.removeEventListener('keydown', fullscreenClickHandler);
    };
  });
  return (
    <>
      <MessageBox />
      <RettIKartetDialog />
      <MapLegendDrawer />
      <Debug />
      <Layout />
    </>
  );
}

export default App;
