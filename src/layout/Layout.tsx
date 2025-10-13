import { Box, Flex } from '@kvib/react';
import { Debug } from '../debug/Debug';
import { MapComponent } from '../map/MapComponent';
import { MessageBox } from '../messages/MessageBox';
import { SearchComponent } from '../search/SearchComponent';

const Layout: React.FC = () => {
  return (
    <Flex height="100vh" width="100vw" position="relative">
      <MessageBox />
      <Debug />
      <Box position="absolute" width="100%" maxWidth="400px" zIndex="overlay">
        <SearchComponent />
      </Box>
      <Box flex="1" height="100%" bg="gray.200">
        <MapComponent />
      </Box>
    </Flex>
  );
};

export default Layout;
