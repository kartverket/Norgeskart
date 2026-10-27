import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kvib/react';
import { useAtom } from 'jotai';
import { mapToolAtom } from '../map/overlay/atoms';
import { ExtentSection } from '../print/Extent/ExtentSection';
import { HikingMapSection } from '../print/HikingMap/HikingMapSection';

export const PrintPanel = () => {
  const [currentMapTool, setMapTool] = useAtom(mapToolAtom);

  if (currentMapTool !== 'extent' && currentMapTool !== 'hiking') {
    return null;
  }

  return (
    <Tabs
      value={currentMapTool}
      onValueChange={(value) => setMapTool(value.value as 'extent' | 'hiking')}
      lazyMount
      unmountOnExit
    >
      <TabsList>
        <TabsTrigger value="extent">Utsnitt</TabsTrigger>
        <TabsTrigger value="hiking">Turkart</TabsTrigger>
      </TabsList>
      <TabsContent value="extent">
        <ExtentSection onCancel={() => setMapTool(null)} />
      </TabsContent>
      <TabsContent value="hiking">
        <HikingMapSection onCancel={() => setMapTool(null)} />
      </TabsContent>
    </Tabs>
  );
};
