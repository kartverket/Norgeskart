import {
  Box,
  Flex,
  Heading,
  IconButton,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kvib/react';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getUrlParameter,
  removeUrlParameter,
  setUrlParameter,
} from '../shared/utils/urlUtils';
import { isPrintDialogOpenAtom } from './atoms';
import { ElevationProfileSection } from './ElevationProfile/ElevationProfileSection';
import { EmergencyPosterSection } from './EmergencyPoster/EmergencyPosterSection';
import { ExtentSection } from './Extent/ExtentSection';
import { HikingMapSection } from './HikingMap/HikingMapSection';

const printTabNames = [
  'extent',
  'hiking',
  'elevationProfile',
  'emergencyPoster',
] as const;

type PrintTabName = (typeof printTabNames)[number];

const getDefaultPrintTab = (): PrintTabName => {
  const printToolParam = getUrlParameter('printTool');
  if (
    printToolParam &&
    printTabNames.includes(printToolParam as PrintTabName)
  ) {
    return printToolParam as PrintTabName;
  }
  return 'extent';
};

export const PrintDialog = () => {
  const setIsPrintDialogOpen = useSetAtom(isPrintDialogOpenAtom);
  const [selectedPrintTool, setSelectedPrintTool] =
    useState<PrintTabName>(getDefaultPrintTab());
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  useEffect(() => {
    setUrlParameter('printTool', selectedPrintTool);
    return () => {
      removeUrlParameter('printTool');
    };
  }, [selectedPrintTool]);

  const tabsListConfig: { label: string; value: PrintTabName }[] = printTabNames
    .filter((tabName) => {
      return currentLanguage !== 'en' || tabName !== 'emergencyPoster';
    })
    .map((tabName) => ({
      label: t(`printdialog.tabs.${tabName}.heading`),
      value: tabName,
    }));

  return (
    <Box
      id="print-dialog"
      backgroundColor="white"
      borderRadius={'16px'}
      p={4}
      m={1}
      pointerEvents={'auto'}
      maxH={'100%'}
      w={{ base: '100%', md: '500px' }}
    >
      <Stack>
        <Flex justifyContent={'space-between'} alignItems="center">
          <Heading fontWeight="bold" size={'lg'}>
            {t('printdialog.heading')}
          </Heading>
          <IconButton
            onClick={() => setIsPrintDialogOpen(false)}
            icon={'close'}
            colorPalette="red"
            size={'sm'}
            variant="ghost"
            alignSelf={'flex-end'}
            aria-label="close-print"
          />
        </Flex>
        <Tabs
          defaultValue={'extent'}
          lazyMount
          unmountOnExit
          value={selectedPrintTool}
          onValueChange={(value) =>
            setSelectedPrintTool(value.value as PrintTabName)
          }
        >
          <TabsList>
            {tabsListConfig.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="extent">
            <ExtentSection />
          </TabsContent>
          <TabsContent value="hiking">
            <HikingMapSection />
          </TabsContent>
          <TabsContent value="elevationProfile">
            <ElevationProfileSection />
          </TabsContent>
          <TabsContent value="emergencyPoster">
            <EmergencyPosterSection />
          </TabsContent>
        </Tabs>
      </Stack>
    </Box>
  );
};
