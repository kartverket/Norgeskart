import { Box, Flex, Heading, IconButton, Stack } from '@kvib/react';
import { useAtom } from 'jotai';
import { isPrintDialogOpenAtom } from './atoms';

export const PrintDialog = () => {
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useAtom(
    isPrintDialogOpenAtom,
  );

  if (!isPrintDialogOpen) {
    return null;
  }
  return (
    <Box
      backgroundColor="white"
      borderRadius={'16px'}
      p={4}
      m={1}
      pointerEvents={'auto'}
      maxH={'100%'}
      overflowY={'auto'}
    >
      <Stack>
        <Flex justifyContent={'space-between'} alignItems="center">
          <Heading fontWeight="bold" size={'lg'}>
            print dialog
          </Heading>
          <IconButton
            onClick={() => setIsPrintDialogOpen(false)}
            icon={'close'}
            colorPalette="red"
            size={'sm'}
            variant="ghost"
            alignSelf={'flex-end'}
          />
        </Flex>
      </Stack>
      hei på deg
    </Box>
  );
};
