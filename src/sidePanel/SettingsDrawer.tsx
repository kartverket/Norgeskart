import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Link,
  List,
  ListItem,
  SimpleGrid,
  Text,
} from '@kvib/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';
import PrivacyPolicy from './PrivacyPolicyAndContact';

// ✅ importer typer og utils fra tips.ts
import { Tip, unwrapJsonModule } from '../types/tips';

// --------------------
// JSON-loaders
// --------------------
const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  nb: () =>
    import('../locales/nb/tipsandtricks.json', { assert: { type: 'json' } }),
  nn: () =>
    import('../locales/nn/tipsandtricks.json', { assert: { type: 'json' } }),
  en: () =>
    import('../locales/en/tipsandtricks.json', { assert: { type: 'json' } }),
};

// --------------------
// COMPONENT
// --------------------
export const SettingsDrawer = () => {
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

        // ✅ typesikker håndtering av ESM-JSON
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
      <LanguageSwitcher />
      <Collapsible
        open={tipsOpen}
        onOpenChange={(details) => setTipsOpen(details.open)}
      >
        <CollapsibleTrigger
          mb={2}
          _hover={{
            cursor: 'pointer',
          }}
        >
          {tipsOpen
            ? t('tipsandtricks.headingOpen')
            : t('tipsandtricks.headingClosed')}
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
    </SimpleGrid>
  );
};
