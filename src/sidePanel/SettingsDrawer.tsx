import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemIndicator,
  AccordionItemTrigger,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  Heading,
  IconButton,
  Link,
  SimpleGrid,
  Tooltip,
} from '@kvib/react';
import { useState } from 'react';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import PrivacyPolicy from './PrivacyPolicyAndContact';
import ShareOrPrintMap from './ShareOrPrintMap';

export const SettingsDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* COG/X-knapp – åpner/lukker Drawer */}
      <Tooltip content={isOpen ? 'Lukk innstillinger' : 'Åpne innstillinger'}>
        <IconButton
          icon="settings"
          variant={isOpen ? 'ghost' : 'solid'} // skifter variant/farge
          aria-label={isOpen ? 'Lukk innstillinger' : 'Åpne innstillinger'}
          onClick={toggleDrawer}
          zIndex={1500}
        />
      </Tooltip>

      {/* Drawer */}
      <Drawer open={isOpen} placement="start" size="sm">
        <DrawerPositioner>
          <DrawerContent>
            <DrawerCloseTrigger onClick={() => setIsOpen(false)} />
            <DrawerHeader>
              <Heading size="lg">Innstillinger for Norgeskart</Heading>
            </DrawerHeader>

            <DrawerBody>
              <SimpleGrid columns={1} gap="7">
              <Heading size="md">Tips og triks</Heading>
              <Accordion  collapsible
                multiple
                size="md"
                variant="subtle">
                <AccordionItem value="item1">
                  <AccordionItemTrigger>
                    Er det mulig å måle avstand med knekkpunkt?
                    
                  </AccordionItemTrigger>
                  <AccordionItemContent>
                    Ja. Velg "Tegne og måle" i verktøymenyen til venstre. Velg linje og merk av for vis mål i kartet. Klikk i kartet der du ønsker å starte. Klikk deg videre til på de stedene du ønsker knekkpunkt og avslutt med dobbeltklikk. Lengden vises på linjen i kartet.
                  </AccordionItemContent>
                </AccordionItem>
                <AccordionItem value="item2">
                  <AccordionItemTrigger>
                    Hvilke søkekriterier håndteres i søkefeltet?
                  </AccordionItemTrigger>
                  <AccordionItemContent>
                   I tillegg til søk på stedsnavn og gateadresser kan du søke på følgende kombinasjoner:

                  - kommunenavn-gnr/bnr
                  - kommunenavn-gnr/bnr/fnr
                  - kommunenavn-gnr/bnr/snr/fnr
                  - kommunenavn/gnr/bnr
                  - kommunenavn/gnr/bnr/fnr
                  - kommunenavn/gnr/bnr/snr/fnr
                  - kommunenr-gnr/bnr
                  - kommunenr-gnr/bnr/fnr
                  - kommunenr-gnr/bnr/snr/fnr
                  - kommunenr/gnr/bnr
                  - kommunenr/gnr/bnr/fnr
                  - kommunenr/gnr/bnr/snr/fnr

                  For eksempel:

                  - Hole-195/15
                  - 0612-195/15
                  - 0612/195/15
                  </AccordionItemContent>
                </AccordionItem>
                <AccordionItem value="item3">
                  <AccordionItemTrigger>
                    Hva er forskjellen på de ulike koordinatene?
                  </AccordionItemTrigger>
                  <AccordionItemContent>
                    Lær mer om koordinater og referanserammer på <Link
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


                
                <ShareOrPrintMap />
                <LanguageSwitcher />
                <PrivacyPolicy />
              </SimpleGrid>
            </DrawerBody>

            <DrawerFooter>
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Lukk
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </DrawerPositioner>
      </Drawer>
    </>
  );
};
