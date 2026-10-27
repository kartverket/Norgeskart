import { Box, Image, Link, Separator, toaster, VStack } from '@kvib/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { helpDialogOpenAtom } from '../help/atoms';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import { mapAtom } from '../map/atoms';
import {
  isRettIKartetDialogOpenAtom,
  rettIKartetCoordinatesAtom,
} from '../map/menu/dialogs/atoms';
import { mapToolAtom } from '../map/overlay/atoms';
import { MeasurePopover } from '../measure/MeasurePopover';
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
  const map = useAtomValue(mapAtom);
  const setRettIKartetDialogOpen = useSetAtom(isRettIKartetDialogOpenAtom);
  const setRettIKartetCoordinates = useSetAtom(rettIKartetCoordinatesAtom);
  const handleShareMap = () => {
    setMapTool(null);
    navigator.clipboard.writeText(window.location.href).then(() => {
      toaster.create({
        title: t('search.actions.shareMap.success'),
        duration: 2000,
      });
    });
  };

  const handleReportError = () => {
    const center = map.getView().getCenter();
    if (center) {
      setRettIKartetCoordinates(center);
      setRettIKartetDialogOpen(true);
    }
  };

  const navigationItems = [
    {
      icon: 'layers' as const,
      label: t('controller.maplayers.mobiletext'),
      active: currentMapTool === 'layers',
      onClick: () => {
        setMapTool(currentMapTool === 'layers' ? null : 'layers');
      },
    },
    {
      icon: 'edit' as const,
      label: t('controller.draw.text'),
      active: currentMapTool === 'draw',
      onClick: () => {
        setMapTool(currentMapTool === 'draw' ? null : 'draw');
      },
    },
    {
      icon: 'map' as const,
      label: t('controller.print.text'),
      active: currentMapTool === 'extent' || currentMapTool === 'hiking',
      onClick: () => {
        setMapTool(
          currentMapTool === 'extent' || currentMapTool === 'hiking'
            ? null
            : 'extent',
        );
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
      icon: 'feedback' as const,
      label: t('toolbar.reportError.shortLabel'),
      onClick: handleReportError,
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
            label={isMinimized ? 'Utvid' : 'Minimer'}
            isMinimized={isMinimized}
            onClick={onToggleMinimized}
          />
        </Box>
        <Separator width="100%" my={isMinimized ? 1 : 4} />
        <VStack width="100%" gap={isMinimized ? 4 : 8}>
          {navigationItems.slice(0, 2).map((item) => (
            <NavigationButton
              key={item.label}
              {...item}
              isMinimized={isMinimized}
            />
          ))}
          <MeasurePopover isMinimized={isMinimized} />
          {navigationItems.slice(2).map((item) => (
            <NavigationButton
              key={item.label}
              {...item}
              isMinimized={isMinimized}
            />
          ))}
        </VStack>
      </VStack>
      <Box mt="auto" mb={3} alignSelf="center">
        <LanguageSwitcher variant="text" compact isMinimized={isMinimized} />
      </Box>
    </Box>
  );
};
