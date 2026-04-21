import {
    Box,
    Button,
    Image,
    PopoverBody,
    PopoverContent,
    PopoverRoot,
    PopoverTrigger,
    SimpleGrid,
    Text,
    VStack,
} from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currentProjectionAtom, getBackgroundLayerImageName } from './atoms';
import { BackgroundLayerName } from './layers/backgroundLayers';
import {
    allConfiguredBackgroundLayers,
    backgroundLayerAtom,
} from './layers/config/backgroundLayers/atoms';

const backgroundLayerOrder = new Map<BackgroundLayerName, number>([
    ['topo', 1],
    ['topograatone', 2],
    ['toporaster', 3],
    ['sjokartraster', 4],
    ['nautical-background', 5],
    ['Nibcache_web_mercator_v2', 6],
    ['Nibcache_UTM32_EUREF89_v2', 7],
    ['Nibcache_UTM33_EUREF89_v2', 8],
    ['Nibcache_UTM35_EUREF89_v2', 9],
    ['Basisdata_NP_Basiskart_Svalbard_WMTS_25833', 10],
    ['Basisdata_NP_Basiskart_JanMayen_WMTS_25833', 11],
]);

const sortBackgroundLayers = (a: BackgroundLayerName, b: BackgroundLayerName) => {
    const priorityA = backgroundLayerOrder.get(a) ?? Number.MAX_SAFE_INTEGER;
    const priorityB = backgroundLayerOrder.get(b) ?? Number.MAX_SAFE_INTEGER;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.localeCompare(b);
};

interface LayerCardProps {
    label: string;
    thumbnailUrl: string;
    isActive?: boolean;
    onClick: () => void;
}

const LayerCard = ({
    label,
    thumbnailUrl,
    isActive,
    onClick,
}: LayerCardProps) => (
    <Button
        onClick={onClick}
        variant="ghost"
        colorPalette="green"
        borderWidth={isActive ? 2 : 0}
        borderColor={isActive ? 'green.500' : 'transparent'}
        borderRadius="lg"
        display="flex"
        alignItems="center"
        width="135px"
        justifyContent="center"
        maxHeight="100px"
        padding={10}
    >
        <VStack>
            <Box width="46px" height="46px" borderRadius="md" overflow="hidden">
                <Image src={thumbnailUrl} alt={label} width="100%" objectFit="cover" />
            </Box>
            <Text fontSize="xs" textAlign="center" lineHeight="short">
                {label}
            </Text>
        </VStack>
    </Button>
);

const BackgroundLayerGrid = ({
    layers,
    currentLayer,
    setLayer,
}: {
    layers: { value: BackgroundLayerName; label: string }[];
    currentLayer: BackgroundLayerName;
    setLayer: (layer: BackgroundLayerName) => void;
}) => (
    <SimpleGrid columns={2} justifyItems="center" gap={0} w="inherit">
        {layers.map((layer) => (
            <LayerCard
                key={layer.value}
                label={layer.label}
                thumbnailUrl={`/backgroundlayerImages/${getBackgroundLayerImageName(layer.value)}.png`}
                isActive={currentLayer === layer.value}
                onClick={() => setLayer(layer.value)}
            />
        ))}
    </SimpleGrid>
);

export const BackgroundLayerSwitcher = () => {
    const [open, setOpen] = useState(false);
    const [backgroundLayer, setBackgroundLayer] = useAtom(backgroundLayerAtom);
    const currentProjection = useAtomValue(currentProjectionAtom);
    const { t } = useTranslation();

    const backgroundLayers = Array.from(
        new Set(
            allConfiguredBackgroundLayers
                .filter(
                    (layer) =>
                        layer.showForProjections == null ||
                        layer.showForProjections.includes(currentProjection),
                )
                .map((layer) => layer.layerName),
        ),
    ).sort(sortBackgroundLayers);

    return (
        <PopoverRoot
            open={open}
            onOpenChange={(e) => setOpen(e.open)}
            positioning={{ placement: 'left-end' }}
        >
            <PopoverTrigger asChild>
                <Box
                    as="button"
                    bg="white"
                    borderRadius="lg"
                    shadow="lg"
                    overflow="hidden"
                    width="72px"
                    cursor="pointer"
                    border="1px solid"
                    borderColor="gray.300"
                    transition="all 0.2s ease"
                    _hover={{ transform: 'translateY(-1px)', shadow: 'xl', borderColor: 'gray.400' }}
                    aria-label={t('map.controls.quickBackgroundLayer.label')}
                >
                    <Box width="100%" height="52px" overflow="hidden">
                        <Image
                            src={`/backgroundlayerImages/${getBackgroundLayerImageName(backgroundLayer)}.png`}
                            alt={t(`map.settings.layers.mapNames.backgroundMaps.${backgroundLayer}`)}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                        />
                    </Box>
                    <Box bg="white" py="5px" textAlign="center" borderTop="1px solid" borderTopColor="gray.200">
                        <Text fontSize="2xs" fontWeight="semibold" color="gray.800" lineHeight="none" letterSpacing="0.01em">
                            Kart
                        </Text>
                    </Box>
                </Box>
            </PopoverTrigger>
            <PopoverContent width="300px" p={0}>
                <PopoverBody p={0} maxHeight="420px" overflowY="auto">
                    <Box backgroundColor="#FFFF" p={2} borderRadius={10} w="100%">
                        <BackgroundLayerGrid
                            layers={backgroundLayers.map((layerName) => ({
                                value: layerName,
                                label: t(`map.settings.layers.mapNames.backgroundMaps.${layerName}`),
                            }))}
                            currentLayer={backgroundLayer}
                            setLayer={(layerName) => {
                                setBackgroundLayer(layerName);
                                setOpen(false);
                            }}
                        />
                    </Box>
                </PopoverBody>
            </PopoverContent>
        </PopoverRoot>
    );
};