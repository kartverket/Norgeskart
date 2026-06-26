import { Box, Card, CardBody, CardTitle, Drawer, Flex, Heading, Link, List, ListItem, SimpleGrid, Text, VStack } from '@kvib/react';
import { useNavigate } from 'react-router-dom';
import { ContentBlock, Tip, unwrapJsonModule } from '../types/tips';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

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


export const HelpPage2 = () => {
  const navigate = useNavigate();
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
    <>
      <Flex
        align="center"
        justify="space-between"
        px={6}
        py={4}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Text color="green.600" fontSize="xl" fontWeight="bold">
          Norgeskart
        </Text>
        <Link onClick={() => navigate(-1)}>Tilbake til kartet</Link>
      </Flex>


      <Box bg="green.50" p={10} minH="100vh">
        <Heading size="3xl">Hvordan kan vi hjelpe deg?</Heading>
        <Text mt={2} fontSize="xl">
          Finn nyttig informasjon, tips og triks for å få mest mulig ut av
          Norgeskart
        </Text>
        <SimpleGrid mt={4} columns={{ base: 1, md: 2, lg: 2}} gap={4}>
            <Card borderRadius={10} boxShadow="lg">
                <CardBody>
        <CardTitle>Tips og triks</CardTitle>
        </CardBody>
      </Card>

            <Card>
        <CardTitle>Tips og triks</CardTitle>
      </Card>

            <Card>
        <CardTitle>Tips og triks</CardTitle>
      </Card>

        </SimpleGrid>
         
      </Box>

     
    </>
  );
};
