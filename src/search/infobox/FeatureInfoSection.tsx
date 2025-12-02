import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
  Badge,
  Box,
  Flex,
  Image,
  Link,
  Spinner,
  Stack,
  Text,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import type { FieldConfig } from '../../api/themeLayerConfigApi';
import {
  featureInfoLoadingAtom,
  featureInfoResultAtom,
} from '../../map/featureInfo/atoms';
import type {
  FeatureInfoFeature,
  FeatureProperties,
  LayerFeatureInfo,
} from '../../map/featureInfo/types';

const IMAGE_FIELD_PATTERN = /^bildefil\d*$/i;

const getFieldConfig = (
  fieldName: string,
  fieldConfigs?: FieldConfig[],
): FieldConfig | undefined => {
  return fieldConfigs?.find(
    (fc) => fc.name.toLowerCase() === fieldName.toLowerCase(),
  );
};

const isSpecialField = (
  fieldName: string,
  fieldConfigs?: FieldConfig[],
): boolean => {
  const config = getFieldConfig(fieldName, fieldConfigs);
  return config?.type === 'symbol' || config?.type === 'picture';
};

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

const SymbolGallery = ({
  symbols,
}: {
  symbols: Array<{ url: string; alt: string }>;
}) => {
  if (symbols.length === 0) return null;

  return (
    <Flex gap={2} mb={3} wrap="wrap">
      {symbols.map((symbol, index) => (
        <Image
          key={index}
          src={symbol.url}
          alt={symbol.alt}
          h="32px"
          title={symbol.alt}
        />
      ))}
    </Flex>
  );
};

const getSymbolFields = (
  properties: FeatureProperties,
  fieldConfigs?: FieldConfig[],
): Array<{ url: string; alt: string }> => {
  if (!fieldConfigs) return [];

  const symbols: Array<{ url: string; alt: string }> = [];

  for (const config of fieldConfigs) {
    if (config.type !== 'symbol' || !config.baseurl) continue;

    const value = properties[config.name];
    if (!value || (typeof value === 'string' && value.trim() === '')) continue;

    const filename = config.filetype
      ? `${value}.${config.filetype}`
      : String(value);
    const baseUrl = config.baseurl.endsWith('/')
      ? config.baseurl.slice(0, -1)
      : config.baseurl;
    const url = `${baseUrl}/${filename}`;
    const alt = config.alias || config.name;

    symbols.push({ url, alt });
  }

  return symbols;
};

const formatPropertyValue = (
  value: unknown,
  fieldConfig?: FieldConfig,
): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nei';

  let displayValue: string;
  if (typeof value === 'number') {
    displayValue = Number.isInteger(value)
      ? value.toString()
      : value.toFixed(2);
  } else {
    displayValue = String(value);
  }

  if (fieldConfig?.unit && displayValue !== '-') {
    displayValue = `${displayValue} ${fieldConfig.unit}`;
  }

  return displayValue;
};

const isUrl = (value: string): boolean => {
  return value.startsWith('http://') || value.startsWith('https://');
};

const buildLinkUrl = (
  value: string,
  fieldConfig?: FieldConfig,
): string | null => {
  if (!fieldConfig?.type || fieldConfig.type !== 'link') return null;

  if (isUrl(value)) return value;

  if (!fieldConfig.baseurl || fieldConfig.baseurl.trim() === '') return null;

  const baseUrl = fieldConfig.baseurl.trim().endsWith('/')
    ? fieldConfig.baseurl.trim().slice(0, -1)
    : fieldConfig.baseurl.trim();

  if (baseUrl === '') return isUrl(value) ? value : null;

  return `${baseUrl}/${value}`;
};

const PropertyItem = ({
  name,
  value,
  fieldConfig,
}: {
  name: string;
  value: unknown;
  fieldConfig?: FieldConfig;
}) => {
  const displayName = fieldConfig?.alias || name;
  const displayValue = formatPropertyValue(value, fieldConfig);

  if (name.startsWith('_') && name !== '_html') return null;

  if (name === '_html' && typeof value === 'string') {
    return (
      <Box
        p={3}
        bg="yellow.50"
        borderRadius="md"
        borderLeft="4px solid"
        borderColor="yellow.400"
      >
        <Text fontSize="sm" color="gray.700" fontWeight="medium" mb={1}>
          HTML-respons mottatt
        </Text>
        <Text fontSize="xs" color="gray.600">
          Dette laget returnerer ikke strukturert data.
        </Text>
      </Box>
    );
  }

  if (
    fieldConfig?.type === 'link' &&
    (typeof value === 'string' || typeof value === 'number') &&
    String(value).trim() !== ''
  ) {
    const linkUrl = buildLinkUrl(String(value), fieldConfig);
    if (linkUrl) {
      return (
        <Flex
          justify="space-between"
          py={1}
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {displayName}
          </Text>
          <Link
            fontSize="sm"
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            color="blue.600"
            textDecoration="underline"
          >
            {value}
          </Link>
        </Flex>
      );
    }
  }

  if (isUrl(displayValue)) {
    return (
      <Flex
        justify="space-between"
        py={1}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <Text fontSize="sm" color="gray.600" fontWeight="medium">
          {displayName}
        </Text>
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
      </Flex>
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
        {displayName}
      </Text>
      <Text fontSize="sm" textAlign="right" maxW="60%">
        {displayValue}
      </Text>
    </Flex>
  );
};

const FeatureProperties = ({
  feature,
  index,
  imageBaseUrl,
  fieldConfigs,
}: {
  feature: FeatureInfoFeature;
  index: number;
  imageBaseUrl?: string;
  fieldConfigs?: FieldConfig[];
}) => {
  const imageFilenames = imageBaseUrl ? getImageFields(feature.properties) : [];
  const symbols = getSymbolFields(feature.properties, fieldConfigs);

  const entries = Object.entries(feature.properties).filter(([key]) => {
    if (key.startsWith('_') && key !== '_html') return false;
    if (imageBaseUrl && IMAGE_FIELD_PATTERN.test(key)) return false;
    if (isSpecialField(key, fieldConfigs)) return false;
    const config = getFieldConfig(key, fieldConfigs);
    if (config?.type === 'picture') return false;
    return true;
  });

  if (
    entries.length === 0 &&
    imageFilenames.length === 0 &&
    symbols.length === 0
  ) {
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
      {symbols.length > 0 && <SymbolGallery symbols={symbols} />}
      {imageBaseUrl && imageFilenames.length > 0 && (
        <ImageGallery
          imageBaseUrl={imageBaseUrl}
          imageFilenames={imageFilenames}
        />
      )}
      {entries.map(([key, value]) => (
        <PropertyItem
          key={`${index}-${key}`}
          name={key}
          value={value}
          fieldConfig={getFieldConfig(key, fieldConfigs)}
        />
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
            <FeatureProperties
              feature={feature}
              index={index}
              imageBaseUrl={layerInfo.imageBaseUrl}
              fieldConfigs={layerInfo.fieldConfigs}
            />
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
