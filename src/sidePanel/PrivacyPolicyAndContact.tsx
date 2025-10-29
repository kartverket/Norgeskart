import {
  Box,
  Button,
  Dialog,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  Flex,
  Link,
} from '@kvib/react';

import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
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
        {t('privacyAndContact.privacyPolicy')}
      </Link>

      <Dialog motionPreset="slide-in-left">
        <DialogTrigger asChild>
          <Button colorPalette="green" size="sm" variant="plain" p={0}>
            {t('privacyAndContact.contactUs')}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>{t('privacyAndContact.contactUs')}</DialogHeader>
          <DialogCloseTrigger />
          <DialogBody>
            <Box>{t('privacyAndContact.dialogContent')}</Box>
            <Box my={5}>
              <Link
                colorPalette="green"
                href="tel:+4732118000"
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
                {t('privacyAndContact.sendEmail')}
              </Link>
            </Box>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </Flex>
  );
};

export default PrivacyPolicy;
