import { Flex } from '@kvib/react';
import { useEffect } from 'react';
import { MapComponent } from './map/MapComponent.tsx';
import { useMapSettings } from './map/mapHooks.ts';
import { projInit } from './projInit.ts';
import { SidePanel } from './sidePanel/SidePanel.tsx';
import './i18n';


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
    projInit();
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', fullscreenClickHandler);
    return () => {
      document.removeEventListener('keydown', fullscreenClickHandler);
    };
  });
  return (
    <Flex
      alignItems={'flex-start'}
      height={'100%'}
      gap={0}
      flexDir={'column'}
      md={{ flexDirection: 'row' }}
      w={'100%'}
    >
      <SidePanel />
      <MapComponent />
    </Flex>
  );
}

export default App;
