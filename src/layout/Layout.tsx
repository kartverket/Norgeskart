import { Box, Flex, useBreakpointValue } from '@kvib/react';
import React, { useState } from 'react';
import { MapComponent } from '../map/MapComponent';
import { SearchComponent } from '../search/SearchComponent';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';
import SidebarToggleButton from './SidebarToggleButton';

const Layout: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Flex height="100vh" width="100vw" position="relative">
      {isMobile ? (
        <MobileSidebar />
      ) : (
        <>
          <Box
            position="absolute"
            width="100%"
            maxWidth="400px"
            zIndex="overlay"
          >
            <SearchComponent />
          </Box>

          <DesktopSidebar isOpen={isSidebarOpen} />

          <SidebarToggleButton
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </>
      )}

      <Box flex="1" height="100%" bg="gray.200">
        <MapComponent />
      </Box>
    </Flex>
  );
};

export default Layout;
