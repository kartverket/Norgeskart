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
import { Contact, PrivacyPolicy } from '../sidePanel/PrivacyPolicyAndContact';
import { ContentBlock, Tip, unwrapJsonModule } from '../types/tips';

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

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  nb: () => import('../locales/nb/tipsandtricks.json'),
  nn: () => import('../locales/nn/tipsandtricks.json'),
  en: () => import('../locales/en/tipsandtricks.json'),
};

export const HelpPage = () => {
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
    <Box minH="100vh" bg="green.50" p={10}>
      <Heading size="5xl">Noe du trenger hjelp med?</Heading>
      <Text mt={2} fontSize="xl">
        Finn svar på vanlige spørsmål og bla bla bla
      </Text>
      <Box bg="white" boxShadow="md" borderRadius="lg" mt={4} p={5}>
        <Heading size="3xl" fontWeight="bold">
          {t('tipsandtricks.heading')}
        </Heading>
        <Text mt={1}>Vanlige spørsmål og nyttige tips</Text>
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
                        <AccordionItemTrigger>{tip.title}</AccordionItemTrigger>

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

          {/* <Card borderRadius={10} boxShadow="lg">
            <CardBody>
              <Flex align="center" gap={2}>
                <Icon color="green" icon="edit"></Icon>
                <CardTitle>Tegne og måle</CardTitle>
              </Flex>
              <Accordion collapsible mt={2}>
                <AccordionItem value="knekkpunkt">
                  <AccordionItemTrigger>
                    Kan jeg måle avstand med knekkpunkt?
                  </AccordionItemTrigger>
                  <AccordionItemContent>
                    Ja. Du kan måle avstand med flere knekkpunkter i kartet.
                  </AccordionItemContent>
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>

          <Card borderRadius={10} gap={2} boxShadow="lg">
            <CardBody>
              <Flex align="center" gap={2}>
                <Icon color="green" icon="map" />
                <CardTitle>Kart og visning</CardTitle>
              </Flex>
              <Accordion>
                <AccordionItem value="">
                  <AccordionItemTrigger></AccordionItemTrigger>
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>

          <Card borderRadius={10} gap={2} boxShadow="lg">
            <CardBody>
              <Flex align="center" gap={2}>
                <Icon color="green" icon="search" />
                <CardTitle>Søk</CardTitle>
              </Flex>
              <Accordion>
                <AccordionItem value="">
                  <AccordionItemTrigger></AccordionItemTrigger>
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>

          <Card borderRadius={10} gap={2} boxShadow="lg">
            <CardBody>
              <Flex align="center" gap={2}>
                <Icon color="green" icon="share" />
                <CardTitle>Deling og eksport</CardTitle>
              </Flex>
            </CardBody>
          </Card> */}
        </SimpleGrid>
      </Box>

      <Box bg="white" boxShadow="md" borderRadius="lg" mt={4} p={5}>
        <Heading size="3xl" fontWeight="bold">
          {t('privacyAndContact.contactUs')}
        </Heading>
        <Contact />
      </Box>

      <Box bg="white" boxShadow="md" borderRadius="lg" mt={4} p={5}>
        <Heading size="3xl" fontWeight="bold">
          {t('privacyAndContact.privacy')}
        </Heading>
        <PrivacyPolicy />
      </Box>

      <Box bg="white" boxShadow="md" borderRadius="lg" mt={4} p={5}>
        <Heading size="3xl" fontWeight="bold">
          Vilkår for bruk
        </Heading>
      </Box>

      <Box bg="white" boxShadow="md" borderRadius="lg" mt={4} p={5}>
        <Heading size="3xl" fontWeight="bold">
          {t('about.heading')}
        </Heading>
        <Text mt={2} textStyle="md">
          {t('about.textone')} {t('about.texttwo')}{' '}
        </Text>
        <Text>{t('about.textthree')}</Text>
        <Text marginTop="4" textStyle="xs" color="fg.muted">
          {t('about.version')}: {__COMMIT_HASH__} | {t('about.buildDate')}:{' '}
          {new Date(__BUILD_DATE__).toLocaleDateString()}
        </Text>
      </Box>

      <Box bg="white" boxShadow="md" borderRadius="lg" mt={4} p={5}>
        <Heading size="3xl" fontWeight="bold">
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

      {/* <VStack>
            
            <Heading  size="2xl" mt={4}>Hva trenger du hjelp med?</Heading>

        

            <SimpleGrid columns={{base: 1, md: 2, lg: 3}} gap={4} mt={4}>

                <Card backgroundColor="">
                    <CardBody>
                        <Heading>Tegning og måling</Heading>
                        <Accordion collapsible>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Kan jeg måle avstand med knekkpunkt?</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Kan jeg slette enkeltobjekter når jeg tegner?</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Hvordan finner jeg høydeprofil?</AccordionItemTrigger>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Lagring av tegninger</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                        </Accordion>
                        
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Heading>Kart og visning</Heading>
                         <Accordion collapsible>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Hvordan aktiverer jeg fullskjermsmodus?</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Skjul menyen med tastatur</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                             <AccordionItem value="">
                                <AccordionItemTrigger>Hvor ofte oppdateres kartet?</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                             <AccordionItem value="">
                                <AccordionItemTrigger>Finnes det tegnforklaring for kartlagene?</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                        </Accordion>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Heading>Søk</Heading>
                         <Accordion collapsible>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Hvilke søkekriterier støttes i søkefeltet?</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Hvordan søker jeg på koordinater?</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                             <AccordionItem value="">
                                <AccordionItemTrigger>Hvor finner jeg eiendomsinformasjon?</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                        </Accordion>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Heading>Deling og eskport</Heading>
                         <Accordion collapsible>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Hvordan deler jeg kartutsnitt?</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Hvordan deler jeg kart med tegninger?</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                             <AccordionItem value="">
                                <AccordionItemTrigger>Kan jeg skrive ut i andre formater enn A4?</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                             <AccordionItem value="">
                                <AccordionItemTrigger>Hvorfor kan jeg ikke skrive ut i flyfoto?</AccordionItemTrigger>
                                    <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                        </Accordion>
                    </CardBody>
                </Card>

                     <Card>
                    <CardBody>
                        <Heading>Regler og info</Heading>
                         <Accordion collapsible>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Hva er vilkårene for bruk?</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            <AccordionItem value="">
                                <AccordionItemTrigger>Status</AccordionItemTrigger>
                                <AccordionItemContent>
                                    Blablablablabla
                                </AccordionItemContent>
                            </AccordionItem>
                            
                        </Accordion>
                    </CardBody>
                </Card>

                </SimpleGrid>
        
        </VStack> */}
    </Box>
  );
};
