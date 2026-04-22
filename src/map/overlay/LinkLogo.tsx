import { HStack, Image, Link } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { backgroundLayerAtom } from '../layers/config/backgroundLayers/atoms';

const POLAR_LAYERS = new Set([
  'Basisdata_NP_Basiskart_Svalbard_WMTS_25833',
  'Basisdata_NP_Basiskart_JanMayen_WMTS_25833',
]);

export const LinkLogo: React.FC = () => {
  const activeLayer = useAtomValue(backgroundLayerAtom);
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
          height={{ base: '46px', md: '46px' }}
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
            height={{ base: '42px', md: '42px' }}
          />
        </Link>
      )}
    </HStack>
  );
};
