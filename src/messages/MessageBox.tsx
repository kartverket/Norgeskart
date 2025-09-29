import { Box, Center, Flex, IconButton, Text } from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getMessage } from '../api/messageApi';
import { useIsMobileScreen } from '../shared/hooks';

export const MessageBox = () => {
  const [showMessageBox, setShowMessageBox] = useState(true);
  const { data, error, isLoading } = useQuery({
    queryKey: ['message'],
    queryFn: getMessage,
  });
  const isMobile = useIsMobileScreen();
  const textboxWidth = isMobile ? '90vw' : '400px';

  if (!showMessageBox) {
    return null;
  }

  if (isLoading) {
    null;
  }

  if (error) {
    null;
  }
  if (!data) {
    return null;
  }

  return (
    <Box position={'absolute'} width={'100vw'}>
      <Center>
        <Flex zIndex={'overlay'} backgroundColor={'white'}>
          <Text
            maxW={textboxWidth}
            whiteSpace="pre-line"
            wordBreak={'break-word'}
            p={2}
          >
            {data}
          </Text>
          <IconButton icon={'close'} onClick={() => setShowMessageBox(false)} />
        </Flex>
      </Center>
    </Box>
  );
};
