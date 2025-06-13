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
      direction="column"
      justifyContent="space-between"
      height="100vh"
      w={isMobileScreen ? '100%' : 'fit-content'}
    >
      {/* Top panel with tabs and close button */}
      <Flex
        gap={4}
        p={4}
        alignItems="flex-start"
        flexDirection="row"
        justifyContent="space-between"
        w="100%"
      >
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
          <TabsList>
            <TabsTrigger value="tab_search">{t('search.tabHeading')}</TabsTrigger>
            <TabsTrigger value="tab_layers">{t('mapLayers')}</TabsTrigger>
            <TabsTrigger value="tab_draw">{t('draw.tabHeading')}</TabsTrigger>
          </TabsList>
          <TabsContent value="tab_search" w={TAB_WIDTH}>
            <SearchComponent />
          </TabsContent>
          <TabsContent value="tab_layers" w={TAB_WIDTH}>
            <MapSettings />
          </TabsContent>
          <TabsContent value="tab_draw" w={TAB_WIDTH}>
            <DrawSettings />
          </TabsContent>
        </Tabs>

        {activeTab && (
          <IconButton
            icon="close"
            variant="ghost"
            onClick={() => {
              setActiveTab(null);
            }}
          />
        )}
      </Flex>

      {/* Bottom language switcher */}
      <Flex p={4} justifyContent="flex-start">
        <LanguageSwitcher />
      </Flex>
    </Flex>
  );
};
