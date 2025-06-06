import { ListItem, Text } from '@kvib/react';

export const SearchResultLine = ({
  key,
  text,
  onClick,
}: {
  key: string;
  text: string;
  onClick: () => void;
}) => {
  return (
    <ListItem
      key={key}
      cursor="pointer"
      _hover={{ bg: 'gray.100' }}
      onClick={onClick}
      as={'ul'}
    >
      <Text>{text}</Text>
    </ListItem>
  );
};
