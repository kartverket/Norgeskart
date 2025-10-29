import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Heading,
  Link,
  SimpleGrid,
} from '@kvib/react';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import PrivacyPolicy from './PrivacyPolicyAndContact';

export const SettingsDrawer = () => {
  return (
    <>
      <SimpleGrid columns={1} gap="7">
        <Heading size="md">Tips og triks</Heading>
        <Accordion collapsible multiple size="md" variant="subtle">
          <AccordionItem value="item1">
            <AccordionItemTrigger>
              Er det mulig å måle avstand med knekkpunkt?
            </AccordionItemTrigger>
            <AccordionItemContent>
              Ja. Velg "Tegne og måle" i verktøymenyen til venstre. Velg linje
              og merk av for vis mål i kartet. Klikk i kartet der du ønsker å
              starte. Klikk deg videre til på de stedene du ønsker knekkpunkt og
              avslutt med dobbeltklikk. Lengden vises på linjen i kartet.
            </AccordionItemContent>
          </AccordionItem>
          <AccordionItem value="item2">
            <AccordionItemTrigger>
              Hvilke søkekriterier håndteres i søkefeltet?
            </AccordionItemTrigger>
            <AccordionItemContent>
              I tillegg til søk på stedsnavn og gateadresser kan du søke på
              følgende kombinasjoner: - kommunenavn-gnr/bnr -
              kommunenavn-gnr/bnr/fnr - kommunenavn-gnr/bnr/snr/fnr -
              kommunenavn/gnr/bnr - kommunenavn/gnr/bnr/fnr -
              kommunenavn/gnr/bnr/snr/fnr - kommunenr-gnr/bnr -
              kommunenr-gnr/bnr/fnr - kommunenr-gnr/bnr/snr/fnr -
              kommunenr/gnr/bnr - kommunenr/gnr/bnr/fnr -
              kommunenr/gnr/bnr/snr/fnr For eksempel: - Hole-195/15 -
              0612-195/15 - 0612/195/15
            </AccordionItemContent>
          </AccordionItem>
          <AccordionItem value="item3">
            <AccordionItemTrigger>
              Hva er forskjellen på de ulike koordinatene?
            </AccordionItemTrigger>
            <AccordionItemContent>
              Lær mer om koordinater og referanserammer på{' '}
              <Link
                colorPalette="green"
                href="/?path=/"
                size="md"
                variant="underline"
              >
                kartverket.no
              </Link>
            </AccordionItemContent>
          </AccordionItem>
        </Accordion>

        <LanguageSwitcher />
        <PrivacyPolicy />
      </SimpleGrid>
    </>
  );
};
