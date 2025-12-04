import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
  Badge,
  Box,
  Flex,
  Heading,
  IconButton,
  Image,
  Link,
  Spinner,
  Stack,
  Text,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import type {
  FeatureInfoFeature,
  FeatureProperties,
  LayerFeatureInfo,
} from './types';
import { useFeatureInfo } from './useFeatureInfo';

const IMAGE_FIELD_PATTERN = /^bildefil\d*$/i;

const getImageFields = (properties: FeatureProperties): string[] => {
  return Object.entries(properties)
    .filter(
      ([key, value]) =>
        IMAGE_FIELD_PATTERN.test(key) &&
        typeof value === 'string' &&
        value.trim() !== '',
    )
    .map(([, value]) => value as string);
};

const ImageGallery = ({
  imageBaseUrl,
  imageFilenames,
}: {
  imageBaseUrl: string;
  imageFilenames: string[];
}) => {
  if (imageFilenames.length === 0) return null;

  return (
    <Stack gap={2} mb={3}>
      {imageFilenames.map((filename, index) => {
        const imageUrl = `${imageBaseUrl}/${filename}`;
        return (
          <Box key={index}>
            <Link href={imageUrl} target="_blank" rel="noopener noreferrer">
              <Image
                src={imageUrl}
                alt={`Bilde ${index + 1}`}
                maxW="100%"
                borderRadius="md"
              />
            </Link>
          </Box>
        );
      })}
    </Stack>
  );
};

const formatPropertyValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nei';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(2);
  }
  return String(value);
};

const isUrl = (value: string): boolean => {
  return value.startsWith('http://') || value.startsWith('https://');
};

const PropertyItem = ({ name, value }: { name: string; value: unknown }) => {
  const displayValue = formatPropertyValue(value);

  if (name.startsWith('_') && name !== '_html') return null;

  if (name === '_html' && typeof value === 'string') {
    return (
      <Box
        dangerouslySetInnerHTML={{ __html: value }}
        fontSize="sm"
        css={{
          '& table': { width: '100%', borderCollapse: 'collapse' },
          '& td, & th': {
            padding: '4px 8px',
            borderBottom: '1px solid #e2e8f0',
          },
        }}
      />
    );
  }

  return (
    <Flex
      justify="space-between"
      py={1}
      borderBottom="1px solid"
      borderColor="gray.100"
    >
      <Text fontSize="sm" color="gray.600" fontWeight="medium">
        {name}
      </Text>
      {isUrl(displayValue) ? (
        <Link
          fontSize="sm"
          href={displayValue}
          target="_blank"
          rel="noopener noreferrer"
          color="blue.600"
          textDecoration="underline"
        >
          Link
        </Link>
      ) : (
        <Text fontSize="sm" textAlign="right" maxW="60%">
          {displayValue}
        </Text>
      )}
    </Flex>
  );
};

const FeaturePropertiesDisplay = ({
  feature,
  index,
  imageBaseUrl,
}: {
  feature: FeatureInfoFeature;
  index: number;
  imageBaseUrl?: string;
}) => {
  const imageFilenames = imageBaseUrl ? getImageFields(feature.properties) : [];
  const entries = Object.entries(feature.properties).filter(
    ([key]) =>
      (!key.startsWith('_') || key === '_html') &&
      !IMAGE_FIELD_PATTERN.test(key),
  );

  if (entries.length === 0 && imageFilenames.length === 0) {
    return (
      <Text fontSize="sm" color="gray.500">
        Ingen egenskaper
      </Text>
    );
  }

  if (feature.properties._html) {
    return <PropertyItem name="_html" value={feature.properties._html} />;
  }

  return (
    <Box>
      {feature.id && (
        <Text fontSize="xs" color="gray.400" mb={2}>
          Feature ID: {feature.id}
        </Text>
      )}
      {imageBaseUrl && imageFilenames.length > 0 && (
        <ImageGallery
          imageBaseUrl={imageBaseUrl}
          imageFilenames={imageFilenames}
        />
      )}
      {entries.map(([key, value]) => (
        <PropertyItem key={`${index}-${key}`} name={key} value={value} />
      ))}
    </Box>
  );
};

const LayerFeatureInfoSection = ({
  layerInfo,
}: {
  layerInfo: LayerFeatureInfo;
}) => {
  const featureCount = layerInfo.features.length;

  if (layerInfo.error) {
    return (
      <AccordionItem value={layerInfo.layerId}>
        <AccordionItemTrigger pl={0}>
          <Flex align="center" gap={2}>
            <Text>{layerInfo.layerTitle}</Text>
            <Badge colorPalette="red" size="sm">
              Feil
            </Badge>
          </Flex>
        </AccordionItemTrigger>
        <AccordionItemContent>
          <Text color="red.500" fontSize="sm">
            {layerInfo.error}
          </Text>
        </AccordionItemContent>
      </AccordionItem>
    );
  }

  return (
    <AccordionItem value={layerInfo.layerId}>
      <AccordionItemTrigger pl={0}>
        <Flex align="center" gap={2}>
          <Text>{layerInfo.layerTitle}</Text>
          <Badge colorPalette="green" size="sm">
            {featureCount} {featureCount === 1 ? 'objekt' : 'objekter'}
          </Badge>
        </Flex>
      </AccordionItemTrigger>
      <AccordionItemContent>
        {layerInfo.features.map((feature, index) => (
          <Box key={index} mb={index < featureCount - 1 ? 4 : 0}>
            {featureCount > 1 && (
              <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                Objekt {index + 1}
              </Text>
            )}
            <FeaturePropertiesDisplay
              feature={feature}
              index={index}
              imageBaseUrl={layerInfo.imageBaseUrl}
            />
          </Box>
        ))}
      </AccordionItemContent>
    </AccordionItem>
  );
};

export const WMSFeatureInfoPanel = () => {
  const { t } = useTranslation();
  const { result, loading, panelOpen, closePanel } = useFeatureInfo();

  if (!panelOpen) return null;

  if (loading) {
    return (
      <Stack
        position="fixed"
        left="16px"
        top="80px"
        w="350px"
        p={4}
        borderRadius="16px"
        bg="white"
        boxShadow="lg"
        zIndex="overlay"
      >
        <Flex align="center" gap={3}>
          <Spinner size="sm" />
          <Text>{t('featureInfo.loading', 'Henter informasjon...')}</Text>
        </Flex>
      </Stack>
    );
  }

  if (!result || result.layers.length === 0) {
    return null;
  }

  const totalFeatures = result.layers.reduce(
    (sum, layer) => sum + layer.features.length,
    0,
  );

  const defaultExpanded =
    result.layers.length > 0 ? [result.layers[0].layerId] : [];

  return (
    <Stack
      position="fixed"
      left="16px"
      top="80px"
      w="350px"
      maxH="calc(100vh - 120px)"
      p={4}
      borderRadius="16px"
      bg="white"
      boxShadow="lg"
      zIndex="overlay"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md">
          {t('featureInfo.title', 'Objektinformasjon')}
        </Heading>
        <Flex align="center" gap={2}>
          <Badge colorPalette="blue">
            {totalFeatures} {totalFeatures === 1 ? 'treff' : 'treff'}
          </Badge>
          <IconButton
            onClick={closePanel}
            icon="close"
            variant="ghost"
            size="sm"
            aria-label={t('featureInfo.close', 'Lukk')}
          />
        </Flex>
      </Flex>

      <Box overflowY="auto" overflowX="hidden" maxH="calc(100vh - 200px)">
        <AccordionRoot collapsible defaultValue={defaultExpanded}>
          {result.layers.map((layerInfo) => (
            <LayerFeatureInfoSection
              key={layerInfo.layerId}
              layerInfo={layerInfo}
            />
          ))}
        </AccordionRoot>
      </Box>
    </Stack>
  );
};
