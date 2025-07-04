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
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher.tsx';
import { MapComponent } from '../map/MapComponent.tsx';
import { SearchComponent } from '../search/SearchComponent.tsx';
import { Menu } from '../sidePanel/Menu.tsx';
import PrivacyPolicy from '../sidePanel/PrivacyPolicy.tsx';
import transition from '../theme/transitions.ts';

const Layout: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarWidth = 400;

  const sidebarStyle = {
    width: isSidebarOpen ? `${sidebarWidth}px` : '0',
    transform: isSidebarOpen
      ? 'translateX(0)'
      : `translateX(-${sidebarWidth}px)`,
    transition: `width ${transition.duration.normal} ${transition.easing['ease-in-out']}, transform ${transition.duration.normal} ${transition.easing['ease-in-out']}`,
    overflow: 'hidden',
    height: '100%',
    bg: 'white',
    boxShadow: 'sm',
    flexShrink: 0,
    pt: '4rem',
  };

  const menuWrapperStyle = {
    my: '3rem',
    opacity: isSidebarOpen ? 1 : 0,
    pointerEvents: isSidebarOpen ? 'auto' : 'none',
    transition: `opacity ${transition.duration.fast} ${transition.easing['ease-in']}`,
  };

  return (
    <Flex height="100vh" width="100vw" position="relative">
      {isMobile ? (
        <Drawer placement="start" trapFocus>
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
                <LanguageSwitcher />
                <PrivacyPolicy />
              </DrawerBody>
            </DrawerContent>
          </DrawerPositioner>
        </Drawer>
      ) : (
        <>
          {/* SearchComponent over sidebar */}
          <Box
            position="absolute"
            width="100%"
            maxWidth={`${sidebarWidth}px`}
            zIndex="overlay"
          >
            <SearchComponent />
          </Box>

          {/* Sidebar desktop */}
          <Box {...sidebarStyle}>
            <Box {...menuWrapperStyle}>
              <Menu />
              <LanguageSwitcher />
              <PrivacyPolicy />
            </Box>
          </Box>

          {/* Collapse/Expand knapper */}
          <IconButton
            icon={isSidebarOpen ? 'chevron_left' : 'chevron_right'}
            aria-label={isSidebarOpen ? 'Skjul meny' : 'Vis meny'}
            position="absolute"
            left={isSidebarOpen ? `${sidebarWidth}px` : '20px'}
            top="50%"
            transform="translate(-50%, -50%)"
            zIndex="overlay"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            variant="solid"
            {...(!isSidebarOpen && { bg: 'green' })}
          />
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
