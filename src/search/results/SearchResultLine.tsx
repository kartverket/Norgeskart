import { Button, Flex, ListItem, Text } from '@kvib/react';

export const SearchResultLine = ({
  key,
  heading,
  locationType = null,
  onClick,
  showButton = false,
  onButtonClick,
}: {
  key: string;
  heading: string;
  locationType?: string | null;
  onClick: () => void;
  showButton?: boolean;
  onButtonClick?: () => void;
}) => {
  return (
    <ListItem
      key={key}
      cursor="pointer"
      _hover={{ fontWeight: '600' }}
      onClick={onClick}
      as={'ul'}
      pr={2}
      pl={2}
    >
      <Flex justifyContent={'space-between'} alignItems="flex-start">
        <Text truncate>{heading}</Text>
        {locationType && <Text fontStyle="italic">{locationType}</Text>}
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
    </ListItem>
  );
};
