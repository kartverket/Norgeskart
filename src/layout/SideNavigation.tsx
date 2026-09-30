import { Box, Image, Link, Separator, VStack } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { NavigationButton } from './NavigationButton';

interface SideNavigationProps {
  isMinimized: boolean;
  onToggleMinimized: () => void;
  onOpenPanel: () => void;
}

export const SideNavigation = ({
  isMinimized,
  onToggleMinimized,
  onOpenPanel,
}: SideNavigationProps) => {
  const { t } = useTranslation();
  const navigationItems = [
    { icon: 'layers' as const, label: 'Kartdetaljer', onClick: onOpenPanel },
    { icon: 'edit' as const, label: t('Tegne') },
    { icon: 'share' as const, label: t('controller.sharemap.text') },
    { icon: 'build' as const, label: 'Verktøy' },
    { icon: 'help' as const, label: t('controller.help.mobiletext') },
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
