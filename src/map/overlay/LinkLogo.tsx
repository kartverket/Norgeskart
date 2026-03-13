import { HStack, Image, Link } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { activeBackgroundLayerAtom } from '../layers/atoms';

const POLAR_LAYERS = new Set([
  'Basisdata_NP_Basiskart_Svalbard_WMTS_25833',
  'Basisdata_NP_Basiskart_JanMayen_WMTS_25833',
]);

export const LinkLogo: React.FC = () => {
  const activeLayer = useAtomValue(activeBackgroundLayerAtom);
  const isPolarLayer = POLAR_LAYERS.has(activeLayer);

  return (
    <HStack gap={3}>
      <Link
        pointerEvents={'auto'}
        href="https://www.kartverket.no"
        target="_blank"
        rel="noopener noreferrer"
        outline="none"
      >
        <Image
          src="/logos/KV_logo_staa_color.svg"
          alt="Logo"
          height={{ base: '42px', md: '64px' }}
        />
      </Link>
      {isPolarLayer && (
        <Link
          pointerEvents={'auto'}
          href="https://www.npolar.no"
          target="_blank"
          rel="noopener noreferrer"
          outline="none"
        >
          <Image
            src="/logos/npolar_logo.svg"
            alt="Norsk Polarinstitutt"
            height={{ base: '42px', md: '64px' }}
          />
        </Link>
      )}
    </HStack>
  );
};
