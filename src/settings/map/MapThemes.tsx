import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Box,
  Flex,
  Heading,
  Switch,
  Text,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';

export const MapThemes = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading size="lg">Velg temakart </Heading>
      <Accordion collapsible multiple size="sm" variant="outline">
        <AccordionItem value="item1">
          <AccordionItemTrigger>
            <Heading size="lg">Eiendom</Heading>
          </AccordionItemTrigger>
          <AccordionItemContent>
            <Heading size="md">Velg matrikkeldata</Heading>
            <Flex justifyContent="space-between" paddingTop={2}>
              <Text>Adresser</Text>
              <Switch colorPalette="green" size="sm" variant="raised" />
            </Flex>
            <Flex justifyContent="space-between" paddingTop={2}>
              <Text>Bygninger</Text>
              <Switch colorPalette="green" size="sm" variant="raised" />
            </Flex>
            <Flex justifyContent="space-between" paddingTop={2}>
              <Text>Teiger og grenser</Text>
              <Switch colorPalette="green" size="sm" variant="raised" />
            </Flex>
          </AccordionItemContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionItemTrigger>
            <Heading size="lg">Friluftsliv</Heading>
          </AccordionItemTrigger>
          <AccordionItemContent>
            <Box paddingBottom={4}>
              <Heading size="md">Fakta</Heading>
              <Flex justifyContent="space-between" paddingTop={2}>
                <Text>Markagrensa</Text>
                <Switch colorPalette="green" size="sm" variant="raised" />
              </Flex>
            </Box>
            <Box paddingBottom={4}>
              <Heading size="md">Tur- og friluftsruter</Heading>
              <Flex justifyContent="space-between" paddingTop={2}>
                <Text>Fotruter</Text>
                <Switch colorPalette="green" size="sm" variant="raised" />
              </Flex>
              <Flex justifyContent="space-between" paddingTop={2}>
                <Text>Ruteinfopunkt</Text>
                <Switch colorPalette="green" size="sm" variant="raised" />
              </Flex>
              <Flex justifyContent="space-between" paddingTop={2}>
                <Text>Skiløyper</Text>
                <Switch colorPalette="green" size="sm" variant="raised" />
              </Flex>
              <Flex justifyContent="space-between" paddingTop={2}>
                <Text>Sykkelruter</Text>
                <Switch colorPalette="green" size="sm" variant="raised" />
              </Flex>
              <Flex justifyContent="space-between" paddingTop={2}>
                <Text>Annenruter</Text>
                <Switch colorPalette="green" size="sm" variant="raised" />
              </Flex>
            </Box>
          </AccordionItemContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
