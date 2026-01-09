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
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { isPrintDialogOpenAtom } from './atoms';

const printTabNames = [
  'extent',
  'hiking',
  'heightProfile',
  'emergencyPoster',
] as const;

type PrintTabName = (typeof printTabNames)[number];

export const PrintDialog = () => {
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
        <Tabs>
          <TabsList>
            {tabsListConfig.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="extent">hei utsnitt</TabsContent>
          <TabsContent value="hiking">hei turkart</TabsContent>
          <TabsContent value="heightProfile">hei høydeprofil</TabsContent>
          <TabsContent value="emergencyPoster">hei nødplakat</TabsContent>
        </Tabs>
      </Stack>
    </Box>
  );
};
