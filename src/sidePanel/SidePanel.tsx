import {
  Heading,
  HStack,
  IconButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  VStack,
} from '@kvib/react';
import { useState } from 'react';
import { DrawControls } from '../map/draw/DrawControls';
import { SearchComponent } from '../search/SearchComponent';
import { Settings } from '../settings/Settings';

const TAB_WITH = '480px';

type MainTabs = 'tab_search' | 'tab_layers' | 'tab_draw';

export const SidePanel = () => {
  const [activeTab, setActiveTab] = useState<MainTabs | null>(null);
  return (
    <VStack gap={4} p={4} alignItems={'flex-start'}>
      <HStack justifyContent={'space-between'} w={'100%'}>
        <Heading as={'h2'} w={'200px'}>
          Instillinger
        </Heading>
        {activeTab && (
          <IconButton
            icon={'close'}
            variant='ghost'
            onClick={() => {
              setActiveTab(null);
            }}
          />
        )}
      </HStack>
      <Tabs
        defaultValue="tab1"
        orientation={'vertical'}
        variant={'outline'}
        value={activeTab}
        onValueChange={(e) => setActiveTab(e.value as MainTabs)}
        unmountOnExit
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
          <Settings />
        </TabsContent>
        <TabsContent value="tab_draw" w={TAB_WITH}>
          <DrawControls />
        </TabsContent>
      </Tabs>
    </VStack>
  );
};
