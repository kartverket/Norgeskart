import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Link,
  List,
  ListItem,
  Text,
} from '@kvib/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import { Tip, unwrapJsonModule } from '../types/tips';
import { Contact, PrivacyPolicy } from './PrivacyPolicyAndContact';

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  nb: () =>
    import('../locales/nb/tipsandtricks.json', { assert: { type: 'json' } }),
  nn: () =>
    import('../locales/nn/tipsandtricks.json', { assert: { type: 'json' } }),
  en: () =>
    import('../locales/en/tipsandtricks.json', { assert: { type: 'json' } }),
};

export const InfoDrawer = () => {
  const { i18n, t } = useTranslation();
  const [tipsData, setTipsData] = useState<Tip[]>([]);

  useEffect(() => {
    let cancelled = false;
    const lang = (i18n.language || 'nb').split('-')[0];
    const load = loaders[lang] || loaders.nb;

    load()
      .then((m) => {
        if (cancelled) return;
        const data = unwrapJsonModule<Tip[]>(m);
        setTipsData(data);
      })
      .catch((err) => {
        console.error('Feil ved lasting av tips:', err);
        if (!cancelled) setTipsData([]);
      });

    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  return (
    <Accordion collapsible multiple variant="outline">
      <AccordionItem value="tips">
        <AccordionItemTrigger>
          {t('tipsandtricks.heading')}
        </AccordionItemTrigger>
        <AccordionItemContent>
          <Accordion collapsible multiple size="md" variant="outline">
            {tipsData.map((tip, index) => (
              <AccordionItem key={index} value={`item${index + 1}`}>
                <AccordionItemTrigger>{tip.title}</AccordionItemTrigger>
                <AccordionItemContent>
                  {tip.content.map((block, i) => {
                    switch (block.type) {
                      case 'text':
                        return (
                          <Text key={i} mb="2">
                            {block.text}
                          </Text>
                        );
                      case 'list':
                        return (
                          <List key={i} listStyleType="disc" mb="2" ml="4">
                            {block.items.map((item, j) => (
                              <ListItem key={j}>{item}</ListItem>
                            ))}
                          </List>
                        );
                      case 'link':
                        return (
                          <Text key={i} mb="2">
                            <Link
                              colorPalette="green"
                              href={block.href}
                              size="md"
                              variant="underline"
                              external
                            >
                              {block.text}
                            </Link>
                          </Text>
                        );
                      default:
                        return null;
                    }
                  })}
                </AccordionItemContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="contact">
        <AccordionItemTrigger>
          {t('privacyAndContact.contactUs')}
        </AccordionItemTrigger>
        <AccordionItemContent>
          <Contact />
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="privacy">
        <AccordionItemTrigger>
          {t('privacyAndContact.privacy')}
        </AccordionItemTrigger>
        <AccordionItemContent>
          <PrivacyPolicy />
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="status">
        <AccordionItemTrigger>
          {t('privacyAndContact.status.heading')}
        </AccordionItemTrigger>
        <AccordionItemContent>
          <Text>{t('privacyAndContact.status.infoText')}</Text>
          <Link
            colorPalette="green"
            href="https://status.kartverket.no/"
            external={true}
            target="_blank"
            variant="underline"
            ml={1}
          >
            status.kartverket.no
          </Link>
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="drawNotice">
        <AccordionItemTrigger>
          {t('draw.privacyNotice.title')}
        </AccordionItemTrigger>
        <AccordionItemContent>
          <Text>{t('draw.privacyNotice.message')}</Text>
        </AccordionItemContent>
      </AccordionItem>
      <AccordionItem value="language">
        <AccordionItemTrigger>
          {t('languageSelector.chooseLanguage')}
        </AccordionItemTrigger>
        <AccordionItemContent>
          <LanguageSwitcher />
        </AccordionItemContent>
      </AccordionItem>
    </Accordion>
  );
};
