import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Alert,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Heading,
  Icon,
  Link,
  List,
  ListItem,
  SimpleGrid,
  Text,
} from '@kvib/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrivacyPolicy from './PrivacyPolicyAndContact';

import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import { Tip, unwrapJsonModule } from '../types/tips';

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
  const [tipsOpen, setTipsOpen] = useState(false);

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
    <SimpleGrid columns={1} gap="6">
      <Collapsible
        open={tipsOpen}
        onOpenChange={(details) => setTipsOpen(details.open)}
      >
        <CollapsibleTrigger
          fontWeight={600}
          textDecoration={'underline'}
          mb={2}
          _hover={{
            cursor: 'pointer',
          }}
        >
          {tipsOpen ? (
            <>
              {t('tipsandtricks.headingOpen')}
              <Icon icon={'arrow_drop_up'} />
            </>
          ) : (
            <>
              {t('tipsandtricks.headingClosed')}
              <Icon icon={'arrow_drop_down'} />
            </>
          )}
          {}
        </CollapsibleTrigger>
        <CollapsibleContent>
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
        </CollapsibleContent>
      </Collapsible>
      <PrivacyPolicy />
      <Alert status="info" title={t('draw.privacyNotice.title')} mb={3}>
        {t('draw.privacyNotice.message')}
      </Alert>
      <Heading size="md">{t('languageSelector.chooseLanguage')}</Heading>
      <LanguageSwitcher />
    </SimpleGrid>
  );
};
