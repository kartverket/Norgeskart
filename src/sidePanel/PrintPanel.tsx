import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { mapToolAtom } from '../map/overlay/atoms';
import { ExtentSection } from '../print/Extent/ExtentSection';
import { HikingMapSection } from '../print/HikingMap/HikingMapSection';

export const PrintPanel = () => {
  const { t } = useTranslation();
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
      display="flex"
      flexDirection="column"
      height="100%"
    >
      <TabsList>
        <TabsTrigger value="extent">
          {t('printdialog.tabs.extent.heading')}
        </TabsTrigger>
        <TabsTrigger value="hiking">
          {t('printdialog.tabs.hiking.heading')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="extent" flex="1" minHeight={0}>
        <ExtentSection onCancel={() => setMapTool(null)} />
      </TabsContent>
      <TabsContent value="hiking" flex="1" minHeight={0}>
        <HikingMapSection onCancel={() => setMapTool(null)} />
      </TabsContent>
    </Tabs>
  );
};
