import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
  Badge,
  Box,
  Flex,
  Link,
  Spinner,
  Text,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  featureInfoLoadingAtom,
  featureInfoResultAtom,
} from '../../map/featureInfo/atoms';
import type {
  FeatureInfoFeature,
  LayerFeatureInfo,
} from '../../map/featureInfo/types';

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

const FeatureProperties = ({
  feature,
  index,
}: {
  feature: FeatureInfoFeature;
  index: number;
}) => {
  const entries = Object.entries(feature.properties).filter(
    ([key]) => !key.startsWith('_') || key === '_html',
  );

  if (entries.length === 0) {
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
            <FeatureProperties feature={feature} index={index} />
          </Box>
        ))}
      </AccordionItemContent>
    </AccordionItem>
  );
};

export const FeatureInfoSection = () => {
  const { t } = useTranslation();
  const result = useAtomValue(featureInfoResultAtom);
  const loading = useAtomValue(featureInfoLoadingAtom);

  if (loading) {
    return (
      <AccordionItem value="featureInfo">
        <AccordionItemTrigger pl={0}>
          {t('featureInfo.title', 'Objektinformasjon')}
        </AccordionItemTrigger>
        <AccordionItemContent>
          <Flex align="center" gap={3}>
            <Spinner size="sm" />
            <Text fontSize="sm">
              {t('featureInfo.loading', 'Henter informasjon...')}
            </Text>
          </Flex>
        </AccordionItemContent>
      </AccordionItem>
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
    <AccordionItem value="featureInfo">
      <AccordionItemTrigger pl={0}>
        <Flex align="center" gap={2}>
          <Text>{t('featureInfo.title', 'Objektinformasjon')}</Text>
          <Badge colorPalette="blue" size="sm">
            {totalFeatures} {totalFeatures === 1 ? 'treff' : 'treff'}
          </Badge>
        </Flex>
      </AccordionItemTrigger>
      <AccordionItemContent>
        <AccordionRoot collapsible defaultValue={defaultExpanded}>
          {result.layers.map((layerInfo) => (
            <LayerFeatureInfoSection
              key={layerInfo.layerId}
              layerInfo={layerInfo}
            />
          ))}
        </AccordionRoot>
      </AccordionItemContent>
    </AccordionItem>
  );
};
