import { Box, Flex, IconButton, Tooltip } from '@kvib/react';

const ShareOrPrintMap = () => {
  return (
    <Box p={{ base: 0, md: 3 }} py={3}>
      <Flex>
        <Tooltip content="Del kart">
          <IconButton
            colorPalette="green"
            icon="share"
            size="md"
            variant="ghost"
          />
        </Tooltip>
        <Tooltip content="Skriv ut">
          <IconButton
            colorPalette="green"
            icon="print"
            size="md"
            variant="ghost"
          />
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default ShareOrPrintMap;
