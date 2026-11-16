import { Stack } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { isPrintDialogOpenAtom } from '../../print/atoms';
import { selectedResultAtom } from '../atoms';
import { InfoBoxContent } from './InfoBoxContent';

export const MobileInfoBox = () => {
  const selectedResult = useAtomValue(selectedResultAtom);
  const isPrintDialogOpen = useAtomValue(isPrintDialogOpenAtom);

  if (selectedResult === null) {
    return null;
  }

  return (
    <Stack
      p={4}
      m="1"
      borderRadius={'16px'}
      bg="white"
      boxShadow="lg"
      pointerEvents={'auto'}
      overflowY={'hidden'}
      maxHeight="52vh"
      width="100%"
      display={isPrintDialogOpen ? 'none' : 'flex'}
      maxWidth="355px"
    >
      <InfoBoxContent showMinimizeButton />
    </Stack>
  );
};
