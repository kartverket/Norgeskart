import { Box } from '@kvib/react';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import { Menu } from '../sidePanel/Menu';
import PrivacyPolicyAndContact from '../sidePanel/PrivacyPolicyAndContact';
import ShareOrPrintMap from '../sidePanel/ShareOrPrintMap';
import { menuWrapperStyle, sidebarStyle } from './LayoutStyles';
import { useState } from 'react';

const DesktopSidebar = ({ isOpen }: { isOpen: boolean }) => {
  const[showPrintWindow, setShowPrintWindow] = useState(false);
  const togglePrint = () => {
    setShowPrintWindow((prev) => !prev);
  };
  return (
    <Box {...sidebarStyle(isOpen)}>
      <Box {...menuWrapperStyle(isOpen)}>
        <Menu />
        <ShareOrPrintMap isOpen={showPrintWindow} onToggle={togglePrint} />
        {/* {showPrintWindow && <PrintWindow />} */}
        <LanguageSwitcher />
        <PrivacyPolicyAndContact />
      </Box>
    </Box>
  );
};

export default DesktopSidebar;
