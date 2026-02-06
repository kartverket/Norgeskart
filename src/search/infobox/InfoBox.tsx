import {
  AccordionRoot,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Stack,
} from '@kvib/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { transform } from 'ol/proj';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isRettIKartetDialogOpenAtom,
  rettIKartetCoordinatesAtom,
} from '../../map/menu/dialogs/atoms';
import { isPrintDialogOpenAtom } from '../../print/atoms';
import { getInputCRS } from '../../shared/utils/crsUtils';
import {
  placesNearbyAtom,
  searchCoordinatesAtom,
  selectedResultAtom,
} from '../atoms';
import { InfoboxAccordionContent } from './InfoboxAccodionContent';
import { InfoBoxPreamble } from './InfoBoxPreamble';

export const InfoBox = () => {
  const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);
  const setClickedCoordinate = useSetAtom(searchCoordinatesAtom);
  const placesNearby = useAtomValue(placesNearbyAtom);
  const { t } = useTranslation();
  const isPrintDialogOpen = useAtomValue(isPrintDialogOpenAtom);
  const setRettIKartetDialogOpen = useSetAtom(isRettIKartetDialogOpenAtom);
  const setRettIKartetCoordinates = useSetAtom(rettIKartetCoordinatesAtom);

  const onClose = useCallback(() => {
    setSelectedResult(null);
    setClickedCoordinate(null);
  }, [setSelectedResult, setClickedCoordinate]);

  if (selectedResult === null || isPrintDialogOpen) {
    return null;
  }
  const inputCRS = getInputCRS(selectedResult);
  const [x, y] = transform(
    [selectedResult.lon, selectedResult.lat],
    inputCRS,
    'EPSG:25833',
  );

  return (
    <Stack
      p={4}
      m="1"
      borderRadius={'16px'}
      bg="white"
      pointerEvents={'auto'}
      overflowY={'hidden'}
      maxHeight={'100%'}
      w={'100%'}
    >
      <Flex justifyContent={'space-between'} alignItems="center">
        <Heading fontWeight="bold" size={'lg'}>
          {selectedResult.type !== 'Coordinate' && selectedResult.name}
        </Heading>
        <IconButton
          onClick={onClose}
          icon={'close'}
          colorPalette="red"
          size={'sm'}
          variant="ghost"
          alignSelf={'flex-end'}
        />
      </Flex>
      <InfoBoxPreamble result={selectedResult} x={x} y={y} />
      <Box overflowY="auto" overflowX="auto">
        <AccordionRoot collapsible multiple defaultValue={[]}>
          <InfoboxAccordionContent />
        </AccordionRoot>
      </Box>
      <Button
        variant="plain"
        size="sm"
        onClick={() => {
          setRettIKartetCoordinates([selectedResult.lon, selectedResult.lat]);
          setRettIKartetDialogOpen(true);
        }}
      >
        {t('toolbar.reportError.label')}
      </Button>
    </Stack>
  );
};
