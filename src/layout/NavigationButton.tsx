import {
  Box,
  Button,
  Icon,
  MaterialSymbol,
  Text,
  Tooltip,
  VStack,
} from '@kvib/react';

interface NavigationButtonProps {
  icon: MaterialSymbol;
  label: string;
  isMinimized: boolean;
  onClick?: () => void;
  active?: boolean;
}

const buttonWidth = (isMinimized: boolean) => (isMinimized ? '44px' : '84px');

export const NavigationButton = ({
  icon,
  label,
  isMinimized,
  onClick,
  active = false,
}: NavigationButtonProps) => {
  const button = (
    <Button
      variant="ghost"
      colorPalette="green"
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
        backgroundColor={active ? '#D0ECD6' : 'transparent'}
        _hover={{ backgroundColor: '#D0ECD6' }}
        borderRadius="md"
        width={buttonWidth(isMinimized)}
      >
        <VStack gap={0}>
          <Icon icon={icon} />
          {!isMinimized && (
            <Text
              width="100%"
              fontSize="14px"
              textAlign="center"
              whiteSpace="normal"
            >
              {label}
            </Text>
          )}
        </VStack>
      </Box>
    </Button>
  );

  return isMinimized ? (
    <Tooltip content={label} positioning={{ placement: 'right' }}>
      {button}
    </Tooltip>
  ) : (
    button
  );
};
