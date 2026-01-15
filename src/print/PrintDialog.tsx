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
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { getEnvName } from '../env';
import { mapToolAtom } from '../map/overlay/atoms';
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

const envName = getEnvName();

export const PrintDialog = () => {
  const currentMapTool = useAtomValue(mapToolAtom);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useAtom(
    isPrintDialogOpenAtom,
  );
  const { t } = useTranslation();

  if (!isPrintDialogOpen) {
    return null;
  }
  const tabsListConfig: { label: string; value: PrintTabName }[] =
    printTabNames.map((tabName) => ({
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
      overflowY={'auto'}
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
          defaultValue={envName == 'prod' ? 'elevationProfile' : 'extent'}
          lazyMount
          unmountOnExit
        >
          <TabsList>
            {tabsListConfig.map((tab) =>
              envName !== 'prod' ||
              tab.value === 'emergencyPoster' ||
              tab.value === 'elevationProfile' ? (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={
                    tab.value === 'elevationProfile' &&
                    currentMapTool === 'draw'
                  }
                >
                  {tab.label}
                </TabsTrigger>
              ) : null,
            )}
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
