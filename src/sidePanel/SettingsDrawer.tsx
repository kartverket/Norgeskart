import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Heading,
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

type TextBlock = { type: 'text'; text: string };
type ListBlock = { type: 'list'; items: string[] };
type LinkBlock = { type: 'link'; text: string; href: string };
type ContentBlock = TextBlock | ListBlock | LinkBlock;
type Tip = { title: string; content: ContentBlock[] };

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  nb: () =>
    import('../locales/nb/tipsandtricks.json', { assert: { type: 'json' } }),
  nn: () =>
    import('../locales/nn/tipsandtricks.json', { assert: { type: 'json' } }),
  en: () =>
    import('../locales/en/tipsandtricks.json', { assert: { type: 'json' } }),
};

export const SettingsDrawer = () => {
  const { i18n, t } = useTranslation();
  const [tipsData, setTipsData] = useState<Tip[]>([]);

  useEffect(() => {
    let cancelled = false;
    const lang = (i18n.language || 'nb').split('-')[0];
    const load = loaders[lang] || loaders.nb;

    load()
      .then((m) => {
        if (cancelled) return;

        // Støtter begge typer JSON-import (m eller m.default)
        const data = (m as any).default ?? m;

        setTipsData(data as Tip[]);
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
    <SimpleGrid columns={1} gap="7">
      <Heading size="md">{t(`tipsandtricks.heading`)}</Heading>

      <Accordion collapsible multiple size="md" variant="outline">
        {tipsData.map((tip, index) => (
          <AccordionItem key={index} value={`item${index + 1}`}>
            <AccordionItemTrigger>{tip.title}</AccordionItemTrigger>
            <AccordionItemContent>
              {tip.content.map((block, i) => {
                if (block.type === 'text') {
                  return (
                    <Text key={i} mb="2">
                      {block.text}
                    </Text>
                  );
                }
                if (block.type === 'list') {
                  return (
                    <List key={i} listStyleType="disc" mb="2" ml="4">
                      {block.items.map((item, j) => (
                        <ListItem key={j}>{item}</ListItem>
                      ))}
                    </List>
                  );
                }
                if (block.type === 'link') {
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
                }
                return null;
              })}
            </AccordionItemContent>
          </AccordionItem>
        ))}
      </Accordion>

      <LanguageSwitcher />
      <PrivacyPolicy />
    </SimpleGrid>
  );
};
