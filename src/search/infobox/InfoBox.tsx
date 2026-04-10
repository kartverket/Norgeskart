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
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isRettIKartetDialogOpenAtom,
  rettIKartetCoordinatesAtom,
} from '../../map/menu/dialogs/atoms';
import { isPrintDialogOpenAtom } from '../../print/atoms';
import { searchCoordinatesAtom, selectedResultAtom } from '../atoms';
import { InfoboxAccordionContent } from './InfoboxAccordionContent';
import { InfoBoxPreamble } from './InfoBoxPreamble';

export const InfoBox = () => {
  const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);
  const setClickedCoordinate = useSetAtom(searchCoordinatesAtom);
  const { t } = useTranslation();
  const isPrintDialogOpen = useAtomValue(isPrintDialogOpenAtom);
  const setRettIKartetDialogOpen = useSetAtom(isRettIKartetDialogOpenAtom);
  const setRettIKartetCoordinates = useSetAtom(rettIKartetCoordinatesAtom);
  const [isMinimized, setIsMinimized] = useState(false);

  const onClose = useCallback(() => {
    setSelectedResult(null);
    setClickedCoordinate(null);
  }, [setSelectedResult, setClickedCoordinate]);

  if (selectedResult === null || isPrintDialogOpen) {
    return null;
  }

  const showHeading =
    selectedResult.type !== 'Coordinate' && selectedResult.name && !isMinimized;

  return (
    <Stack
      p={4}
      m="1"
      borderRadius={'16px'}
      bg="white"
      pointerEvents={'auto'}
      overflowY={'hidden'}
      maxHeight="55vh"
      width="100%"
      maxWidth={isMinimized ? '190px' : '355px'}
    >
      <Flex justifyContent={'flex-end'} alignItems="center" gap={1}>
        <Button
          onClick={() => setIsMinimized((prev) => !prev)}
          variant="ghost"
          leftIcon={isMinimized ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
          size="sm"
          p={1}
        >
          {isMinimized ? t('infoBox.showContent') : t('infoBox.hideContent')}
        </Button>
        <IconButton
          onClick={onClose}
          icon={'close'}
          colorPalette="red"
          size={'sm'}
          variant="ghost"
          alignSelf={'flex-end'}
        />
      </Flex>
      {showHeading && (
        <Heading fontWeight="bold" size={'lg'}>
          {selectedResult.name}
        </Heading>
      )}
      <Box display={isMinimized ? 'none' : 'block'}>
        <InfoBoxPreamble result={selectedResult} />
      </Box>
      <Box
        overflowY="auto"
        overflowX="auto"
        display={isMinimized ? 'none' : 'block'}
      >
        <AccordionRoot collapsible multiple defaultValue={[]}>
          <InfoboxAccordionContent />
        </AccordionRoot>
      </Box>
      <Button
        display={isMinimized ? 'none ' : 'flex'}
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
