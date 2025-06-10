import {
  Flex,
  IconButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kvib/react';
import { useState } from 'react';
import { useDrawSettings } from '../draw/drawHooks';
import { SearchComponent } from '../search/SearchComponent';
import { DrawSettings } from '../settings/draw/DrawSettings';
import { MapSettings } from '../settings/map/MapSettings';
import { useIsMobileScreen } from '../shared/hooks';

type MainTabs = 'tab_search' | 'tab_layers' | 'tab_draw';

export const SidePanel = () => {
  const [activeTab, setActiveTab] = useState<MainTabs | null>(null);
  const { setDrawEnabled } = useDrawSettings();
  const isMobileScreen = useIsMobileScreen();
  const TAB_WITH = isMobileScreen ? '100%' : '400px';
  return (
    <Flex
      gap={4}
      p={4}
      alignItems={'flex-start'}
      md={{
        width: 'fit-content',
        justifyContent: 'flex-start',
      }}
      flexDirection={'row'}
      w={'100%'}
      justifyContent={'space-between'}
    >
      <Tabs
        defaultValue={null}
        orientation={isMobileScreen ? 'horizontal' : 'vertical'}
        variant={'outline'}
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
          <TabsTrigger value="tab_search">Søk</TabsTrigger>
          <TabsTrigger value="tab_layers">Kartlag</TabsTrigger>
          <TabsTrigger value="tab_draw">Tegne</TabsTrigger>
        </TabsList>
        <TabsContent value="tab_search" w={TAB_WITH}>
          <SearchComponent />
        </TabsContent>
        <TabsContent value="tab_layers" w={TAB_WITH}>
          <MapSettings />
        </TabsContent>
        <TabsContent value="tab_draw" w={TAB_WITH}>
          <DrawSettings />
        </TabsContent>
      </Tabs>
      {activeTab && (
        <IconButton
          icon={'close'}
          variant="ghost"
          onClick={() => {
            setActiveTab(null);
          }}
        />
      )}
    </Flex>
  );
};
