import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
  Flex,
} from '@kvib/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import { SearchComponent } from '../search/SearchComponent';
import { DrawSettings } from '../settings/draw/DrawSettings';
import { MapSettings } from '../settings/map/MapSettings';
import { useIsMobileScreen } from '../shared/hooks';

type AccordionTab = 'search' | 'layers' | 'draw' | 'language';

export const SidePanelAccordion = () => {
  const { t } = useTranslation();
  const isMobileScreen = useIsMobileScreen();
  const PANEL_WIDTH = isMobileScreen ? '100%' : '400px';

  const [openTabs, setOpenTabs] = useState<AccordionTab[]>([
    'search',
    'layers',
  ]);

  const toggleTab = (tab: AccordionTab) => {
    setOpenTabs((prev) =>
      prev.includes(tab) ? prev.filter((t) => t !== tab) : [...prev, tab],
    );
  };

  return (
    <Flex
      direction="column"
      w={PANEL_WIDTH}
      h={isMobileScreen ? 'auto' : '100vh'}
      overflowY="auto"
      p={4}
    >
      <AccordionRoot multiple collapsible value={openTabs}>
        <AccordionItem value="search">
          <AccordionItemTrigger onClick={() => toggleTab('search')}>
            {t('search.tabHeading')}
          </AccordionItemTrigger>
          <AccordionItemContent>
            <SearchComponent />
          </AccordionItemContent>
        </AccordionItem>

        <AccordionItem value="layers">
          <AccordionItemTrigger onClick={() => toggleTab('layers')}>
            {t('mapLayers')}
          </AccordionItemTrigger>
          <AccordionItemContent>
            <MapSettings />
          </AccordionItemContent>
        </AccordionItem>

        <AccordionItem value="draw">
          <AccordionItemTrigger onClick={() => toggleTab('draw')}>
            {t('draw.tabHeading')}
          </AccordionItemTrigger>
          <AccordionItemContent>
            <DrawSettings />
          </AccordionItemContent>
        </AccordionItem>

        <AccordionItem value="language">
          <AccordionItemTrigger onClick={() => toggleTab('language')}>
            {t('languageSelector.tabHeading')}
          </AccordionItemTrigger>
          <AccordionItemContent>
            <LanguageSwitcher />
          </AccordionItemContent>
        </AccordionItem>
      </AccordionRoot>
    </Flex>
  );
};
