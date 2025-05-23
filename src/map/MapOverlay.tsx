import {
  Box,
  Button,
  createListCollection,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  VStack,
} from '@kvib/react';
import { DrawType, useMapSettings } from './mapHooks';

const drawTypeCollection: { value: DrawType; label: string }[] = [
  { value: 'Point', label: 'Punkt' },
  { value: 'LineString', label: 'Linje' },
  { value: 'Polygon', label: 'Polygon' },
  { value: 'Circle', label: 'Sirkel' },
];

export const MapOverlay = () => {
  const { drawEnabled, setDrawType, toggleDrawEnabled } = useMapSettings();
  return (
    <>
      <Box position="absolute" bottom="16px" left="16px" zIndex={10}>
        <a
          href="https://www.kartverket.no"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/logos/KV_logo_staa.svg"
            alt="Logo"
            style={{ height: 64 }}
          />
        </a>
      </Box>
      <Box position={'absolute'} top={'16px'} right={'16px'}>
        <VStack
          backgroundColor={'rgba(255, 255, 255, 0.6)'}
          padding={4}
          borderRadius={'8px'}
        >
          <Button
            onClick={toggleDrawEnabled}
            leftIcon={drawEnabled ? 'close' : 'draw'}
            variant="primary"
          >
            {drawEnabled ? 'Ferdig å tegne' : 'Tegn på kartet'}
          </Button>
          {drawEnabled && (
            <SelectRoot
              collection={createListCollection({
                items: drawTypeCollection,
              })}
            >
              <SelectLabel>Tegneverktøy:</SelectLabel>
              <SelectTrigger>
                <SelectValueText placeholder={'Velg bakgrunnskart'} />
              </SelectTrigger>
              <SelectContent>
                {drawTypeCollection.map((item) => (
                  <SelectItem
                    key={item.value}
                    item={item.value}
                    onClick={() => setDrawType(item.value as DrawType)}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          )}
        </VStack>
      </Box>
    </>
  );
};
