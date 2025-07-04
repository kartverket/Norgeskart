import { Box, Button, Flex, Link } from '@kvib/react';

const PrivacyPolicy = () => {
  return (
    <Box p={3}>
      <Flex
        alignItems={{ base: 'flex-start', md: 'center' }}
        justifyContent={{ base: 'flex-start', md: 'space-between' }}
        p="1"
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <Link
          href="https://www.kartverket.no/en/about-kartverket"
          target="_blank"
          rel="noopener noreferrer"
          colorPalette="green"
          variant="plain"
          p={0}
        >
          Personvernerklæring
        </Link>

        <Button
          colorPalette="green"
          rightIcon="waving_hand"
          size="md"
          variant="plain"
          p={0}
        >
          Kontakt oss
        </Button>
      </Flex>
    </Box>
  );
};

export default PrivacyPolicy;
