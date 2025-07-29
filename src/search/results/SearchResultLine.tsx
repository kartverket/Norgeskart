import { Box, Button, Flex, ListItem, Separator, Text } from '@kvib/react';

export const SearchResultLine = ({
  heading,
  locationType = null,
  onClick,
  showButton = false,
  onButtonClick,
}: {
  heading: string;
  locationType?: string | null;
  onClick: () => void;
  showButton?: boolean;
  onButtonClick?: () => void;
}) => {
  return (
    <ListItem
      cursor="pointer"
      _hover={{ fontWeight: '600' }}
      onClick={onClick}
      as={'ul'}
      pr={2}
      pl={2}
      mb={2}
    >
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        pb={2}
      >
        <Box>
          <Text>{heading}</Text>
          {locationType && (
            <Text
              fontSize="sm"
              color="gray.600"
              fontStyle="italic"
              title={locationType}
            >
              {locationType}
            </Text>
          )}
        </Box>
        {showButton && (
          <Button
            size="sm"
            colorPalette="gray"
            onClick={(e) => {
              e.stopPropagation();
              onButtonClick?.();
            }}
          >
            Husnr
          </Button>
        )}
      </Flex>
      <Separator />
    </ListItem>
  );
};
