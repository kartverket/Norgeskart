import { Flex } from '@kvib/react';
import { useEffect } from 'react';
import { MapComponent } from './map/MapComponent.tsx';
import { projInit } from './projInit.ts';
import { SidePanel } from './sidePanel/SidePanel.tsx';

function App() {
  useEffect(() => {
    projInit();
  }, []);
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
