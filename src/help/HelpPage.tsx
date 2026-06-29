import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Box,
  Card,
  CardBody,
  CardTitle,
  Flex,
  Header,
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
import { useNavigate } from 'react-router-dom';
import { Contact, PrivacyPolicy } from '../sidePanel/PrivacyPolicyAndContact';
import { ContentBlock, Tip, unwrapJsonModule } from '../types/tips';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';

type TipsContentProps = {
  content: ContentBlock[];
};

type IconName = 'edit' | 'map' | 'search' | 'share';

const categories: {
  id: string;
  title: string;
  icon: IconName;
}[] = [
  {
    id: 'drawing',
    title: 'Tegning og måling',
    icon: 'edit',
  },
  {
    id: 'map',
    title: 'Kart og visning',
    icon: 'map',
  },
  {
    id: 'search',
    title: 'Søk',
    icon: 'search',
  },
  {
    id: 'sharing',
    title: 'Dele og eksport',
    icon: 'share',
  },
];

const TipsAndTricksContent = ({ content }: TipsContentProps) => {
  return (
    <>
      {content.map((block, i) => {
        if (block.type === 'text') {
          return (
            <Text textStyle="md" key={i} mb="2">
              {block.text}
            </Text>
          );
        }

        if (block.type === 'list') {
          return (
            <List key={i} listStyleType="disc" mb="2" ml="4">
              {block.items.map((item, j) => (
                <ListItem key={j} textStyle="md">
                  {item}
                </ListItem>
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
    </>
  );
};

const boxStyles = {
  bg: "white",
  boxShadow: "md",
  borderRadius: "lg",
  mt: 4,
  p: 5,
}

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  nb: () => import('../locales/nb/tipsandtricks.json'),
  nn: () => import('../locales/nn/tipsandtricks.json'),
  en: () => import('../locales/en/tipsandtricks.json'),
};

export const HelpPage = () => {
  const { i18n, t } = useTranslation();
  const [tipsData, setTipsData] = useState<Tip[]>([]);
  const navigate = useNavigate();

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
    <>
      <Header
        title="Norgeskart"
        titleLink="/"
        logoLink="https://kartverket.no"
        content={
          <Link fontSize={{ base: 'sm', md: 'md'}} onClick={() => navigate(-1)}>{t('helpPage.header.link')}</Link>
        }
      />
      <Box minH="100vh" bg="green.50" p={10}>
        <Heading size={{ base: '3xl', md: '4xl', lg: '5xl'}}>{t('helpPage.title')}</Heading>
        <Box {...boxStyles}>
          <Heading size={{ base: '2xl', md: '3xl'}} fontWeight="bold">
            {t('tipsandtricks.heading')}
          </Heading>
          <Text mt={1}>{t('tipsandtricks.description')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} gap={4} mt={4}>
            {categories.map((category) => {
              const items = tipsData.filter(
                (tip) => tip.category === category.id,
              );

              if (!items.length) return null;

              return (
                <Card key={category.id} borderRadius={10} boxShadow="lg">
                  <CardBody>
                    <Flex align="center" gap={2}>
                      <Icon icon={category.icon} />
                      <CardTitle>{category.title}</CardTitle>
                    </Flex>

                    <Accordion mt={2} collapsible>
                      {items.map((tip) => (
                        <AccordionItem key={tip.title} value={tip.title}>
                          <AccordionItemTrigger>
                            {tip.title}
                          </AccordionItemTrigger>

                          <AccordionItemContent>
                            <TipsAndTricksContent content={tip.content} />
                          </AccordionItemContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        </Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
          <Box {...boxStyles}>
            <PrivacyPolicy />
          </Box>
          <Box {...boxStyles}>
            <Heading size={{ base: '2xl', md: '3xl'}} fontWeight="bold">
              {t('helpPage.termsOfUse.heading')}
            </Heading>
            <Text mt={2}>{t('helpPage.termsOfUse.text')}</Text>
            <Link
              mt={2}
              colorPalette="green"
              href="https://www.kartverket.no/api-og-data/vilkar-for-bruk"
              external
              target="_blank"
              variant="underline"
            >
              kartverket.no
            </Link>
          </Box>
        </SimpleGrid>
        <Box {...boxStyles}>
          <Heading size={{ base: '2xl', md: '3xl'}} fontWeight="bold">
            {t('about.heading')}
          </Heading>
          <Text> {t('about.textone')}</Text>
          <Text textStyle="md">{t('about.texttwo')} </Text>
          <Text>{t('about.textthree')}</Text>
          <Text marginTop="4" textStyle="xs" color="fg.muted">
            {t('about.version')}: {__COMMIT_HASH__} | {t('about.buildDate')}:{' '}
            {new Date(__BUILD_DATE__).toLocaleDateString()}
          </Text>
        </Box>

        <Box {...boxStyles}>
          <Contact />
        </Box>
      
        <Box {...boxStyles}>
          <Heading size={{ base: '2xl', md: '3xl'}} fontWeight="bold">
            {t('privacyAndContact.status.heading')}
          </Heading>
          <Text mt={2} textStyle="md">
            {t('privacyAndContact.status.infoText')}
          </Text>
          <Link
            colorPalette="green"
            href="https://status.kartverket.no/"
            external={true}
            target="_blank"
            variant="underline"
            mt={2}
            textStyle="md"
          >
            status.kartverket.no
          </Link>
        </Box>
      </Box>
    </>
  );
};
