import { Flex, ListItem, Text } from '@kvib/react';

export const SearchResultLine = ({
  key,
  heading,
  locationType = null,
  onClick,
}: {
  key: string;
  heading: string;
  locationType?: string | null;
  onClick: () => void;
}) => {
  return (
    <ListItem
      key={key}
      cursor="pointer"
      _hover={{ bg: 'gray.100' }}
      onClick={onClick}
      as={'ul'}
      pr={2}
      pl={2}
    >
      <Flex justifyContent={'space-between'} alignItems="flex-start">
        <Text truncate>{heading}</Text>
        {locationType && <Text fontStyle="italic">{locationType}</Text>}
      </Flex>
    </ListItem>
  );
};
