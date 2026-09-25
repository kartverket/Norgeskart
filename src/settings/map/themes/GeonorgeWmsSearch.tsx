import {
  Box,
  createListCollection,
  FieldLabel,
  FieldRoot,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Separator,
  Spinner,
  Text,
  Tooltip,
  VStack,
} from '@kvib/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../../map/atoms';
import { InfoFormat } from '../../../map/featureInfo/types';
import {
  assignZIndices,
  createUrlWmsLayer,
  urlWmsLayersAtom,
  WmsScaleRange,
} from '../../../map/layers/urlWms';

/** Generated and render-tested by scripts/generateGeonorgeWmsLayers.js. */
type GeonorgeWmsLayer = {
  id: string;
  title: string;
  organization: string;
  category: string;
  url: string;
  layer: string;
  /** WMS scale denominators the layer draws between, when limited. */
  minScale?: number;
  maxScale?: number;
  /** First sentence of the catalog abstract: what the data actually is. */
  summary: string | null;
  detailsUrl: string | null;
  type: string;
  /** false when the capabilities mark the layer(s) queryable="0". */
  queryable?: false;
  /** Requests the whole service rather than one layer of it. */
  whole?: boolean;
  /** Zoomed-in-only twin of an overview layer (NVE "Dam" next to "Dam_N250"). */
  variant?: 'detailed';
};

type GeonorgeWmsService = {
  title: string;
  organization: string;
  summary: string | null;
  detailsUrl: string | null;
  /** Best GetFeatureInfo format the service offers; null = none. */
  infoFormat: InfoFormat | null;
};

type GeonorgeWmsData = {
  services: Record<string, GeonorgeWmsService>;
  layers: GeonorgeWmsLayer[];
};

type ServiceGroup = {
  url: string;
  service: GeonorgeWmsService;
  whole?: GeonorgeWmsLayer;
  layers: GeonorgeWmsLayer[];
};

// Order of the nasjonal temainndeling on geonorge.no/kartdata/datasett-i-geonorge/.
const CATEGORY_ORDER = [
  'basisGeodata',
  'befolkning',
  'eiendom',
  'energi',
  'flyfoto',
  'forurensning',
  'friluftsliv',
  'geologi',
  'hoydedata',
  'kulturminner',
  'kystOgFiskeri',
  'landbruk',
  'landskap',
  'natur',
  'plan',
  'samferdsel',
  'samfunnssikkerhet',
  'varOgKlima',
  'annet',
];
const ALL_CATEGORIES = 'all';
const MAX_VISIBLE_RESULTS = 50;
const MIN_QUERY_LENGTH = 2;

// ~80 kB gzipped, so only fetched once the section is opened.
const loadData = async (): Promise<GeonorgeWmsData> =>
  (await import('./geonorgeWmsLayers.json')).default as GeonorgeWmsData;

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/\bwms\b/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

// One group per WMS. Its whole-service entry is the header's add action, taken
// from all data: a "Dam" search doesn't match the entry titled "Vannkraft WMS".
const groupByService = (
  layers: GeonorgeWmsLayer[],
  { services, layers: allLayers }: GeonorgeWmsData,
): ServiceGroup[] => {
  const byUrl = new Map<string, GeonorgeWmsLayer[]>();
  for (const layer of layers) {
    byUrl.set(layer.url, [...(byUrl.get(layer.url) ?? []), layer]);
  }
  return [...byUrl]
    .map(([url, entries]) => ({
      url,
      service: services[url],
      whole: allLayers.find((e) => e.url === url && e.whole),
      layers: entries.filter((e) => !e.whole),
    }))
    .sort((a, b) => a.service.title.localeCompare(b.service.title, 'nb'));
};

export const GeonorgeWmsSearch = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<GeonorgeWmsData | null>(null);
  const layers = data?.layers ?? null;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addError, setAddError] = useState<string | null>(null);

  const map = useAtomValue(mapAtom);
  const setUrlWmsLayers = useSetAtom(urlWmsLayersAtom);
  const urlWmsLayers = useAtomValue(urlWmsLayersAtom);

  useEffect(() => {
    void loadData().then(setData);
  }, []);

  const categoryCollection = useMemo(() => {
    const present = new Set(layers?.map((l) => l.category));
    const items = [
      {
        value: ALL_CATEGORIES,
        label: t('map.settings.layers.theme.geonorgeSearch.allCategories'),
      },
      ...CATEGORY_ORDER.filter((c) => present.has(c)).map((c) => ({
        value: c,
        label: t(`map.settings.layers.theme.geonorgeSearch.categories.${c}`),
      })),
    ];
    return createListCollection({ items });
  }, [layers, t]);

  const trimmedQuery = query.trim().toLowerCase();
  const isFiltering =
    category !== ALL_CATEGORIES || trimmedQuery.length >= MIN_QUERY_LENGTH;
  const results = useMemo(() => {
    if (!data || !isFiltering) return [];
    return data.layers.filter((l) => {
      if (category !== ALL_CATEGORIES && l.category !== category) return false;
      const service = data.services[l.url];
      return [l.title, l.organization, l.summary, service?.title]
        .filter(Boolean)
        .some((text) => text!.toLowerCase().includes(trimmedQuery));
    });
  }, [data, category, trimmedQuery, isFiltering]);

  // Cap by layer count, but never split a service group.
  const visibleGroups = useMemo(() => {
    if (!data) return [];
    const groups = groupByService(results, data);
    const visible: ServiceGroup[] = [];
    let count = 0;
    for (const group of groups) {
      if (count >= MAX_VISIBLE_RESULTS) break;
      visible.push(group);
      count += group.layers.length + (group.whole ? 1 : 0);
    }
    return visible;
  }, [data, results]);

  const displayTitle = (entry: GeonorgeWmsLayer) => {
    if (entry.whole) return data?.services[entry.url]?.title ?? entry.title;
    return entry.variant === 'detailed'
      ? t('map.settings.layers.theme.geonorgeSearch.detailedTitle', {
          title: entry.title,
        })
      : entry.title;
  };

  const handleAdd = async (entry: GeonorgeWmsLayer) => {
    setAddingId(entry.id);
    setAddError(null);
    try {
      const mapProjection = map.getView().getProjection().getCode();
      const layer = await createUrlWmsLayer(
        entry.url,
        entry.layer,
        mapProjection,
        urlWmsLayers.length,
      );
      if (!layer) {
        setAddError(t('map.settings.layers.theme.geonorgeSearch.addError'));
        return;
      }
      layer.set('layerTitle', displayTitle(entry));
      const service = data?.services[entry.url];
      layer.set('serviceTitle', service?.title);
      // Ask for a format the service supports instead of trial-and-error.
      if (service?.infoFormat === null || entry.queryable === false) {
        layer.set('queryable', false);
      } else if (service?.infoFormat) {
        layer.set('infoFormat', service.infoFormat);
      }
      layer.set('scaleRange', {
        minScale: entry.minScale,
        maxScale: entry.maxScale,
      } satisfies WmsScaleRange);
      if (entry.detailsUrl) {
        layer.set('geonorgeDetailsUrl', entry.detailsUrl);
      }
      map.addLayer(layer);
      setUrlWmsLayers((prev) => {
        const next = [...prev, layer];
        assignZIndices(next);
        return next;
      });
      setAddedIds((prev) => new Set(prev).add(entry.id));
    } catch {
      setAddError(t('map.settings.layers.theme.geonorgeSearch.addError'));
    } finally {
      setAddingId(null);
    }
  };

  const renderAddButton = (entry: GeonorgeWmsLayer, label?: string) => {
    const isAdded = addedIds.has(entry.id);
    const addLabel =
      label ?? t('map.settings.layers.theme.geonorgeSearch.addButton');
    return (
      <Tooltip
        content={
          isAdded
            ? t('map.settings.layers.theme.geonorgeSearch.added')
            : addLabel
        }
      >
        <IconButton
          size="xs"
          variant="ghost"
          icon={isAdded ? 'check' : 'add'}
          aria-label={`${addLabel}: ${displayTitle(entry)}`}
          colorPalette={isAdded ? 'green' : 'blue'}
          disabled={isAdded || addingId === entry.id}
          onClick={() => void handleAdd(entry)}
        >
          {addingId === entry.id && <Spinner size="xs" />}
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <Box marginTop={4}>
      <Separator marginBottom={3} />
      <Heading size={{ base: 'xs', md: 'sm' }} marginBottom={2}>
        {t('map.settings.layers.theme.geonorgeSearch.heading')}
      </Heading>

      {/* Labels, not placeholders (design.kartverket.no); role=search is a landmark. */}
      <VStack align="stretch" gap={2} role="search">
        <SelectRoot
          size="sm"
          collection={categoryCollection}
          value={[category]}
          onValueChange={(details) => {
            if (details.value.length > 0) setCategory(details.value[0]);
          }}
          disabled={!layers}
        >
          <SelectLabel fontSize="xs">
            {t('map.settings.layers.theme.geonorgeSearch.categoryLabel')}
          </SelectLabel>
          <SelectTrigger>
            <SelectValueText />
          </SelectTrigger>
          <SelectContent>
            {categoryCollection.items.map((item) => (
              <SelectItem key={item.value} item={item}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>

        <FieldRoot disabled={!layers}>
          <FieldLabel fontSize="xs">
            {t('map.settings.layers.theme.geonorgeSearch.filterLabel')}
          </FieldLabel>
          <InputGroup endElement={!layers ? <Spinner size="xs" /> : undefined}>
            <Input
              size="sm"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
        </FieldRoot>
      </VStack>

      {/* Filtering is live, so result/error messages must be announced. */}
      <Box aria-live="polite">
        {isFiltering && layers && results.length === 0 && (
          <Text fontSize="xs" color="gray.500" marginTop={2}>
            {t('map.settings.layers.theme.geonorgeSearch.noResults')}
          </Text>
        )}

        {results.length > MAX_VISIBLE_RESULTS && (
          <Text fontSize="xs" color="gray.500" marginTop={2}>
            {t('map.settings.layers.theme.geonorgeSearch.tooManyResults', {
              shown: MAX_VISIBLE_RESULTS,
              total: results.length,
            })}
          </Text>
        )}

        {addError && (
          <Text fontSize="xs" color="red.500" marginTop={2}>
            {addError}
          </Text>
        )}
      </Box>

      {visibleGroups.length > 0 && (
        <VStack
          align="stretch"
          gap={1}
          marginTop={2}
          maxH="360px"
          overflowY="auto"
        >
          {visibleGroups.map((group) => {
            // HI publishes one WMS per layer: one row, not a header + a repeat.
            const single =
              !group.whole &&
              group.layers.length === 1 &&
              normalize(group.layers[0].title) ===
                normalize(group.service.title);
            if (single) {
              const [entry] = group.layers;
              return (
                <ResultRow
                  key={group.url}
                  title={entry.title}
                  summary={entry.summary}
                  addButton={renderAddButton(entry)}
                />
              );
            }
            return (
              <Box
                key={group.url}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
              >
                <ResultRow
                  title={group.service.title}
                  summary={group.service.summary}
                  strong
                  addButton={
                    group.whole &&
                    renderAddButton(
                      group.whole,
                      t('map.settings.layers.theme.geonorgeSearch.addService'),
                    )
                  }
                />
                {group.layers.length > 0 && (
                  <VStack
                    align="stretch"
                    gap={0}
                    borderTopWidth="1px"
                    borderColor="gray.100"
                    pl={3}
                  >
                    {group.layers.map((entry) => (
                      <ResultRow
                        key={entry.id}
                        title={displayTitle(entry)}
                        subtitle={
                          entry.variant === 'detailed' && entry.maxScale
                            ? t(
                                'map.settings.layers.theme.geonorgeSearch.detailedNote',
                                {
                                  scale: entry.maxScale.toLocaleString('nb-NO'),
                                },
                              )
                            : undefined
                        }
                        summary={entry.summary}
                        addButton={renderAddButton(entry)}
                      />
                    ))}
                  </VStack>
                )}
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

const ResultRow = ({
  title,
  subtitle,
  summary,
  strong,
  addButton,
}: {
  title: string;
  subtitle?: string;
  summary: string | null;
  strong?: boolean;
  addButton?: ReactNode;
}) => (
  <Flex align="flex-start" gap={2} py={1.5} px={1}>
    <Box flex={1} minW={0}>
      <Text
        fontSize="xs"
        fontWeight={strong ? 'semibold' : 'medium'}
        lineClamp={2}
        title={title}
      >
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="xs" color="gray.500" lineClamp={1}>
          {subtitle}
        </Text>
      )}
      {summary && (
        <Text fontSize="xs" color="gray.600" lineClamp={2} title={summary}>
          {summary}
        </Text>
      )}
    </Box>
    {addButton}
  </Flex>
);
