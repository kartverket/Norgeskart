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
  const [openTabs, setOpenTabs] = useState<AccordionTab[]>(['eiendom']);
  const { t } = useTranslation();

  const toggleTab = (tab: AccordionTab) => {
    setOpenTabs((prev) =>
      prev.includes(tab) ? prev.filter((t) => t !== tab) : [...prev, tab],
    );
  };

  return (
    <AccordionRoot multiple collapsible value={openTabs} pt={10}>
      <AccordionItem value="eiendom">
        <AccordionItemTrigger onClick={() => toggleTab('eiendom')}>
          {t('locationType.property')}
        </AccordionItemTrigger>
        <AccordionItemContent>
          <List>
            <ListItem>{t('propertyInfo.landRegistration')}</ListItem>
            <ListItem>{t('propertyInfo.cadastre')}</ListItem>
          </List>
        </AccordionItemContent>
      </AccordionItem>

      <AccordionItem value="friluftsliv">
        <AccordionItemTrigger onClick={() => toggleTab('friluftsliv')}>
          {t('placeInfo.recreation.recreation')}
        </AccordionItemTrigger>
        <AccordionItemContent>
          <List>
            <ListItem>{t('placeInfo.recreation.hikingTrail')}</ListItem>
            <ListItem>{t('placeInfo.recreation.fishingZone')}</ListItem>
          </List>
        </AccordionItemContent>
      </AccordionItem>

      <AccordionItem value="stedskart">
        <AccordionItemTrigger onClick={() => toggleTab('stedskart')}>
          {t('locationType.place')}
        </AccordionItemTrigger>
        <AccordionItemContent>
          <List>
            <ListItem>{t('maps.topographic')}</ListItem>
            <ListItem>{t('maps.naval')}</ListItem>
          </List>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  );
};
