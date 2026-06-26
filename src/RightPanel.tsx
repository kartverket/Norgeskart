import {
  HStack,
  IconButton,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kvib/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { displayMapLegendAtom } from './map/atoms';
import { activeThemeLayersAtom } from './map/layers/atoms';
import { MapLegend } from './map/legend/MapLegend';
import { isPrintDialogOpenAtom } from './print/atoms';
import { searchCoordinatesAtom, selectedResultAtom } from './search/atoms';
import { InfoBox } from './search/infobox/InfoBox';

export const RightPanel = () => {
  const { t } = useTranslation();
  const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);
  const setClickedCoordinate = useSetAtom(searchCoordinatesAtom);
  const [isLegendOpen, setLegendOpen] = useAtom(displayMapLegendAtom);
  const activeLayers = useAtomValue(activeThemeLayersAtom);
  const isPrintDialogOpen = useAtomValue(isPrintDialogOpenAtom);
  const hasInfoBox = selectedResult !== null;
  const hasLegend = isLegendOpen && activeLayers.size > 0;

  const [activeTab, setActiveTab] = useState('info');
  const prevHasLegendOnly = useRef(false);

  useEffect(() => {
    if (!hasInfoBox && hasLegend) {
      prevHasLegendOnly.current = true;
    } else if (hasInfoBox && hasLegend && prevHasLegendOnly.current) {
      setActiveTab('legend');
      prevHasLegendOnly.current = false;
    } else if (!hasLegend) {
      prevHasLegendOnly.current = false;
    }
  }, [hasInfoBox, hasLegend]);

  const closeInfoBox = useCallback(() => {
    setSelectedResult(null);
    setClickedCoordinate(null);
  }, [setSelectedResult, setClickedCoordinate]);

  if (!hasInfoBox && !hasLegend) return null;

  if (!hasInfoBox || !hasLegend) {
    return (
      <>
        {hasInfoBox && <InfoBox />}
        {hasLegend && <MapLegend />}
      </>
    );
  }

  const closeActive =
    activeTab === 'info' ? closeInfoBox : () => setLegendOpen(false);

  return (
    <Stack
      p={4}
      m="1"
      borderRadius={'16px'}
      bg="white"
      pointerEvents={'auto'}
      overflowY={'hidden'}
      maxHeight="80vh"
      width="100%"
      maxWidth="355px"
      display={isPrintDialogOpen ? 'none' : 'flex'}
    >
      <Tabs
        value={activeTab}
        onValueChange={(e) => setActiveTab(e.value)}
        width="100%"
      >
        <HStack justify="space-between" align="center">
          <TabsList>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="legend">
              {t('legend.heading.title')}
            </TabsTrigger>
          </TabsList>
          <IconButton
            aria-label={t('infoBox.close') ?? 'Lukk'}
            icon="close"
            size="sm"
            variant="ghost"
            colorPalette="red"
            onClick={closeActive}
          />
        </HStack>
        <TabsContent
          value="info"
          overflowY="auto"
          maxHeight="70vh"
          style={{ paddingTop: 0 }}
        >
          <InfoBox inPanel />
        </TabsContent>
        <TabsContent
          value="legend"
          overflowY="auto"
          maxHeight="70vh"
          style={{ paddingTop: 0 }}
        >
          <MapLegend inPanel />
        </TabsContent>
      </Tabs>
    </Stack>
  );
};
