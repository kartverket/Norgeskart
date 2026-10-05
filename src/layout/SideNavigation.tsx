import {
  Box,
  Image,
  Link,
  Separator,
  toaster,
  VStack,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import { helpDialogOpenAtom } from '../help/atoms';
import { mapToolAtom } from '../map/overlay/atoms';
import { measureTypeAtom } from '../measure/atoms';
import { NavigationButton } from './NavigationButton';

interface SideNavigationProps {
  isMinimized: boolean;
  onToggleMinimized: () => void;
}

export const SideNavigation = ({
  isMinimized,
  onToggleMinimized,
}: SideNavigationProps) => {
  const { t } = useTranslation();
  const setHelpDialogOpen = useSetAtom(helpDialogOpenAtom);
  const [currentMapTool, setMapTool] = useAtom(mapToolAtom);
  const [, setMeasureType] = useAtom(measureTypeAtom);
  const handleShareMap = () => {
    setMapTool(null);
    navigator.clipboard.writeText(window.location.href).then(() => {
      toaster.create({
        title: t('search.actions.shareMap.success'),
        duration: 2000,
      });
    });
  };

  const handleMeasure = () => {
    if (currentMapTool === 'measure') {
      setMapTool(null);
      setMeasureType(null);
      return;
    }

    setMapTool('measure');
    setMeasureType('length');
  };

  const navigationItems = [
    {
      icon: 'layers' as const,
      label: 'Kartdetaljer',
      active: currentMapTool === 'layers',
      onClick: () => {
        setMapTool(currentMapTool === 'layers' ? null : 'layers');
      },
    },
    {
      icon: 'edit' as const,
      label: t('Tegne'),
      active: currentMapTool === 'draw',
      onClick: () => {
        setMapTool(currentMapTool === 'draw' ? null : 'draw');
      },
    },
    {
      icon: 'straighten' as const,
      label: 'Måle',
      active: currentMapTool === 'measure',
      onClick: handleMeasure,
    },
    {
      icon: 'crop' as const,
      label: 'Utsnitt',
      active: currentMapTool === 'extent',
      onClick: () => {
        setMapTool(currentMapTool === 'extent' ? null : 'extent');
      },
    },
    {
      icon: 'map' as const,
      label: 'Turkart',
      active: currentMapTool === 'hiking',
      onClick: () => {
        setMapTool(currentMapTool === 'hiking' ? null : 'hiking');
      },
    },
    {
      icon: 'show_chart' as const,
      label: 'Høydeprofil',
      active: currentMapTool === 'elevationProfile',
      onClick: () => {
        setMapTool(
          currentMapTool === 'elevationProfile' ? null : 'elevationProfile',
        );
      },
    },
    {
      icon: 'share' as const,
      label: t('controller.sharemap.text'),
      onClick: handleShareMap,
    },
    
    {
      icon: 'help' as const,
      label: t('controller.help.mobiletext'),
      onClick: () => {
        setMapTool(null);
        setHelpDialogOpen(true);
      },
      
    },
  ];

  return (
    <Box height="100%" bg="white" display="flex" flexDirection="column">
      <VStack gap={2} alignItems="center" pt={3}>
        <Link
          href="https://www.kartverket.no"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Kartverket"
        >
          <Image
            src="/logos/KV_logo_staa_color.svg"
            alt="Kartverket"
            width="48px"
          />
        </Link>

        <Box mt={isMinimized ? 0 : 2}>
          <NavigationButton
            icon={isMinimized ? 'chevron_right' : 'chevron_left'}
            label="Minimer"
            isMinimized={isMinimized}
            onClick={onToggleMinimized}
          />
        </Box>
        <Separator width="100%" my={isMinimized ? 1 : 4} />
        <VStack width="100%" gap={isMinimized ? 4 : 12}>
          {navigationItems.map((item) => (
            <NavigationButton
              key={item.label}
              {...item}
              isMinimized={isMinimized}
            />
          ))}
        </VStack>
      </VStack>
      <Box mt="auto" mb={3} alignSelf="center">
        <LanguageSwitcher
          variant="text"
          compact
          isMinimized={isMinimized}
        />
      </Box>
    </Box>
  );
};
