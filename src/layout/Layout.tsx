import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerPositioner,
  DrawerTrigger,
  Flex,
  IconButton,
  useBreakpointValue,
} from '@kvib/react';
import React, { useState } from 'react';
import { MapComponent } from '../map/MapComponent.tsx';
import { SearchComponent } from '../search/SearchComponent.tsx';
import { Menu } from '../sidePanel/Menu.tsx';

const Layout: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Flex height="100vh" width="100vw">
      {isMobile ? (
        <Drawer placement="start" size="sm" trapFocus>
          <DrawerTrigger asChild>
            <IconButton
              aria-label="Åpne meny"
              icon="menu"
              position="absolute"
              top="1rem"
              left="1rem"
              zIndex="overlay"
            />
          </DrawerTrigger>
          <DrawerPositioner>
            <DrawerContent>
              <DrawerCloseTrigger />
              <DrawerBody>
                <SearchComponent />
                <Menu />
              </DrawerBody>
            </DrawerContent>
          </DrawerPositioner>
        </Drawer>
      ) : (
        <>
          {isSidebarOpen && (
            <Box
              flexBasis="300px"
              flexShrink={0}
              height="100%"
              position="relative"
              bg="white"
              boxShadow="sm"
            >
              <SearchComponent />
              <Menu />

              {/* Collapse-knapp midt på høyre kant */}
              <IconButton
                icon="chevron_left"
                aria-label="Skjul meny"
                position="absolute"
                right={0}
                top="50%"
                transform="translate(50%, -50%)"
                zIndex="overlay"
                onClick={() => setIsSidebarOpen(false)}
                variant="solid"
                border-radius="full"
              />
            </Box>
          )}

      {!isSidebarOpen && (
        <IconButton
          icon="chevron_right"
          aria-label="Vis meny"
          position="absolute"
          top="50%"
          left="1.5rem"
          transform="translate(-50%, -50%)"
          zIndex="overlay"
          onClick={() => setIsSidebarOpen(true)}
          variant="solid"
          bg="green"
          boxShadow="md"
        />
      )}
        </>
      )}

      {/* Kartseksjon */}
      <Box flex="1" height="100%" bg="gray.200">
        <MapComponent />
      </Box>
    </Flex>
  );
};

export default Layout;
