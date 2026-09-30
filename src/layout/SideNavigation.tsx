import { Box, Image, Link, Separator, toaster, VStack } from '@kvib/react';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [currentMapTool, setMapTool] = useAtom(mapToolAtom);
  const setMeasureType = useSetAtom(measureTypeAtom);
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
      icon: 'share' as const,
      label: t('controller.sharemap.text'),
      onClick: handleShareMap,
    },
    { icon: 'build' as const, label: 'Verktøy' },
    {
      icon: 'help' as const,
      label: t('controller.help.mobiletext'),
      onClick: () => {
        setMapTool(null);
        navigate('/hjelp');
      },
      
    },
  ];

  return (
    <Box height="100%" bg="green.600">
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
    </Box>
  );
};
