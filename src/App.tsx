import { useEffect } from 'react';
import './i18n';

import { useMapSettings } from './map/mapHooks.ts';

import Layout from './layout/Layout.tsx';

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
  return <Layout />;
}

export default App;
