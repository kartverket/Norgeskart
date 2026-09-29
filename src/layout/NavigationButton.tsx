import {
  Box,
  Button,
  Icon,
  MaterialSymbol,
  Text,
  VStack,
} from '@kvib/react';

interface NavigationButtonProps {
  icon: MaterialSymbol;
  label: string;
  isMinimized: boolean;
  onClick?: () => void;
  active?: boolean;
}

const buttonWidth = (isMinimized: boolean) =>
  isMinimized ? '44px' : '84px';

export const NavigationButton = ({
  icon,
  label,
  isMinimized,
  onClick,
  active = false,
}: NavigationButtonProps) => {
  return (
    <Button
      variant="ghost"
      color="white"
      width="fit-content"
      display="inline-flex"
      alignSelf="center"
      backgroundColor="transparent"
      _hover={{ backgroundColor: 'transparent' }}
      p={0}
      onClick={onClick}
      aria-label={label}
    >
      <Box
        backgroundColor={active ? 'green.700' : 'transparent'}
        _hover={{ backgroundColor: 'green.700' }}
        borderRadius="md"
        width={buttonWidth(isMinimized)}
        px={3}
        py={2}
      >
        <VStack gap={1}>
          <Icon icon={icon} />
          {!isMinimized && <Text fontSize="xs">{label}</Text>}
        </VStack>
      </Box>
    </Button>
  );
};