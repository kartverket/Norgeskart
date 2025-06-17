import {
  Flex,
  IconButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kvib/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDrawSettings } from '../draw/drawHooks';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import { SearchComponent } from '../search/SearchComponent';
import { DrawSettings } from '../settings/draw/DrawSettings';
import { MapSettings } from '../settings/map/MapSettings';
import { useIsMobileScreen } from '../shared/hooks';

type MainTabs = 'tab_search' | 'tab_layers' | 'tab_draw';

export const SidePanel = () => {
  const [activeTab, setActiveTab] = useState<MainTabs | null>(null);
  const { setDrawEnabled } = useDrawSettings();
  const isMobileScreen = useIsMobileScreen();
  const { t } = useTranslation();
  const TAB_WIDTH = isMobileScreen ? '100%' : '400px';

  return (
    <Flex
      direction={isMobileScreen ? 'column' : 'row'}
      w={isMobileScreen ? '100%' : 'fit-content'}
      h={isMobileScreen ? 'auto' : '100vh'}
    >
      {/* Tabs wrapper */}
      <Tabs
        defaultValue={null}
        orientation={isMobileScreen ? 'horizontal' : 'vertical'}
        variant="outline"
        value={activeTab}
        onValueChange={(e) => {
          if (e.value !== 'tab_draw') {
            setDrawEnabled(false);
          }
          setActiveTab(e.value as MainTabs);
        }}
        unmountOnExit
        w={isMobileScreen ? '100%' : 'fit-content'}
      >
        {/* TabsList fixed at top on mobile */}
        <TabsList
          style={{
            width: isMobileScreen ? '100%' : 'auto',
            overflowX: isMobileScreen ? 'auto' : 'visible',
            whiteSpace: isMobileScreen ? 'nowrap' : 'normal',
            flexShrink: 0,
          }}
        >
          <TabsTrigger value="tab_search">{t('search.tabHeading')}</TabsTrigger>
          <TabsTrigger value="tab_layers">{t('mapLayers')}</TabsTrigger>
          <TabsTrigger value="tab_draw">{t('draw.tabHeading')}</TabsTrigger>
          <TabsTrigger value="tab_language">{t('languageSelector.tabHeading')}</TabsTrigger>
        </TabsList>

        {/* TabsContent section */}
        <Flex
          direction="row"
          p={4}
          gap={4}
          flexWrap="wrap"
          w="100%"
          overflowY="auto"
          maxHeight={isMobileScreen ? 'unset' : '100vh'}
        >
          <TabsContent value="tab_search" w={TAB_WIDTH}>
            <SearchComponent />
          </TabsContent>
          <TabsContent value="tab_layers" w={TAB_WIDTH}>
            <MapSettings />
          </TabsContent>
          <TabsContent value="tab_draw" w={TAB_WIDTH}>
            <DrawSettings />
          </TabsContent>
          <TabsContent value="tab_language" w={TAB_WIDTH}>
            <LanguageSwitcher />
          </TabsContent>
        </Flex>
      </Tabs>

      {activeTab && (
        <IconButton
          icon="close"
          variant="ghost"
          onClick={() => {
            setActiveTab(null);
          }}
          style={{
            position: isMobileScreen ? 'absolute' : 'initial',
            top: isMobileScreen ? 35 : 'auto',
            right: isMobileScreen ? 4 : 'auto',
          }}
        />
      )}
    </Flex>
  );
};

