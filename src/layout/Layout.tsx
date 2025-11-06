import { Box, Flex } from '@kvib/react';
import { Debug } from '../debug/Debug';
import { MapComponent } from '../map/MapComponent';
import { RettIKartetDialog } from '../map/menu/dialogs/RettIKartetDialog';
import { MapOverlay } from '../map/overlay/MapOverlay';
import { MessageBox } from '../messages/MessageBox';

const Layout: React.FC = () => {
  return (
    <Flex height="100vh" width="100vw" position="relative">
      <MessageBox />
      <RettIKartetDialog />
      <Debug />

      <Box flex="1" height="100%" bg="gray.200">
        <MapComponent />
        <MapOverlay />
      </Box>
    </Flex>
  );
};

export default Layout;
