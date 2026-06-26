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

interface InfoBoxProps {
  inPanel?: boolean;
}

export const InfoBox = ({ inPanel = false }: InfoBoxProps) => {
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

  if (selectedResult === null) {
    return null;
  }

  const effectiveMinimized = inPanel ? false : isMinimized;
  const showHeading =
    selectedResult.type !== 'Coordinate' &&
    selectedResult.name &&
    !effectiveMinimized;

  const content = (
    <>
      {!inPanel && (
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
      )}
      {showHeading && (
        <Heading fontWeight="bold" size={'lg'}>
          {selectedResult.name}
        </Heading>
      )}
      <Box display={effectiveMinimized ? 'none' : 'block'}>
        <InfoBoxPreamble result={selectedResult} />
      </Box>
      <Box
        overflowY="auto"
        overflowX="auto"
        display={effectiveMinimized ? 'none' : 'block'}
      >
        <AccordionRoot collapsible multiple defaultValue={[]}>
          <InfoboxAccordionContent />
        </AccordionRoot>
      </Box>
      <Button
        display={effectiveMinimized ? 'none ' : 'flex'}
        variant="plain"
        size="sm"
        onClick={() => {
          setRettIKartetCoordinates([selectedResult.lon, selectedResult.lat]);
          setRettIKartetDialogOpen(true);
        }}
      >
        {t('toolbar.reportError.label')}
      </Button>
    </>
  );

  if (inPanel) {
    return content;
  }

  return (
    <Stack
      p={4}
      m="1"
      borderRadius={'16px'}
      bg="white"
      pointerEvents={'auto'}
      overflowY={'hidden'}
      maxHeight="52vh"
      width="100%"
      display={isPrintDialogOpen ? 'none' : 'flex'}
      maxWidth={isMinimized ? '190px' : '355px'}
    >
      {content}
    </Stack>
  );
};
