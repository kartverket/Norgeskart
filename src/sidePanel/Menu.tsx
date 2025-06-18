import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
  List,
  ListItem,
} from '@kvib/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type AccordionTab = 'eiendom' | 'friluftsliv' | 'stedskart';

export const Menu = () => {
  const { t } = useTranslation();
  const [openTabs, setOpenTabs] = useState<AccordionTab[]>(['eiendom']);

  const toggleTab = (tab: AccordionTab) => {
    setOpenTabs((prev) =>
      prev.includes(tab) ? prev.filter((t) => t !== tab) : [...prev, tab],
    );
  };

  return (
    <AccordionRoot multiple collapsible value={openTabs}>
      <AccordionItem value="eiendom">
        <AccordionItemTrigger onClick={() => toggleTab('eiendom')}>
          Eiendom
        </AccordionItemTrigger>
        <AccordionItemContent>
          <List>
            <ListItem>Grunnbok</ListItem>
            <ListItem>Matrikkel</ListItem>
          </List>
        </AccordionItemContent>
      </AccordionItem>

      <AccordionItem value="friluftsliv">
        <AccordionItemTrigger onClick={() => toggleTab('friluftsliv')}>
          Friluftsliv
        </AccordionItemTrigger>
        <AccordionItemContent>
          <List>
            <ListItem>Turstier</ListItem>
            <ListItem>Fiskekortsoner</ListItem>
          </List>
        </AccordionItemContent>
      </AccordionItem>

      <AccordionItem value="stedskart">
        <AccordionItemTrigger onClick={() => toggleTab('stedskart')}>
          Stedsnavn
        </AccordionItemTrigger>
        <AccordionItemContent>
          <List>
            <ListItem>Topografisk kart</ListItem>
            <ListItem>Sjøkart</ListItem>
          </List>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  );
};
