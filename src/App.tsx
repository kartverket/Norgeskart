import { Box, HStack, Text } from '@kvib/react';
import { useEffect } from 'react';
import { MapComponent } from './map/MapComponent.tsx';
import { projInit } from './projInit.ts';
import { SearchComponent } from './search/SearchComponent.tsx';
import { Settings } from './settings/Settings.tsx';
import { ErrorBoundary } from './shared/ErrorBoundary.tsx';

function App() {
  useEffect(() => {
    projInit();
  }, []);
  return (
    <HStack alignItems={'flex-start'} height={'100%'} gap={0}>
      <Settings />
      <ErrorBoundary fallback={<Text>Noe gikk veldig galt med kartet</Text>}>
        <MapComponent />
        {/*Må fikse plassering av søk etter hvert, men gjør sånn her inntil videre*/}
      </ErrorBoundary>
      <Box position="absolute" top="1rem" left="20rem" zIndex="10">
        <SearchComponent />
      </Box>
    </HStack>
  );
}

export default App;
