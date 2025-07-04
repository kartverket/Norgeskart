import {
  Box,
  Button,
  Flex,
  Link,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  DialogBody,
  Icon
} from '@kvib/react';


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
          size="sm"
        >
          Personvernerklæring
        </Link>

        <Dialog motionPreset="slide-in-left">
          <DialogTrigger asChild>
            <Button
              colorPalette="green"
              rightIcon="waving_hand"
              size="sm"
              variant="plain"
              p={0}
            >
              Kontakt oss
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>Kontakt oss</DialogHeader>
            <DialogCloseTrigger />
            <DialogBody>
              <Box >
                Vi tar gjerne imot ris og ros på Norgeskart.no. Kontakt oss gjerne på e-post eller telefon
              </Box>
              <Box my={4}>
               <Link
                colorPalette="green"
                  href="tel:+47123456789"
                size="lg"
                variant="underline"
              >
                +47 32 11 80 00
              </Link>
              </Box>
              <Box>
               <Link
                colorPalette="green"
                  href="mailto:kontakt@firma.no"
                size="lg"
                variant="underline"
              >
                Send e-post
              </Link>
              </Box>
            </DialogBody>
           
          </DialogContent>
        </Dialog>
      </Flex>
    </Box>
  );
};

export default PrivacyPolicy;
