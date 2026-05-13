import {
  Box,
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Separator,
  Spinner,
  Text,
  Tooltip,
  VStack,
} from '@kvib/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mapAtom } from '../../../map/atoms';
import { createUrlWmsLayer, urlWmsLayersAtom } from '../../../map/layers/urlWms';

const KARTKATALOG_SEARCH_URL = 'https://kartkatalog.geonorge.no/api/search';

type GeonorgeResult = {
  Uuid: string;
  Title: string;
  Type?: string;
  Organization: string;
  Abstract?: string;
  DistributionProtocol?: string;
  GetCapabilitiesUrl?: string;
  DistributionUrl?: string;
  ShowDetailsUrl?: string;
  /** For dataset results: the GetCapabilities URL of the linked WMS service. */
  ServiceDistributionUrlForDataset?: string;
};

type GeonorgeResponse = {
  NumFound: number;
  Results: GeonorgeResult[];
};

const searchGeonorge = async (query: string): Promise<GeonorgeResult[]> => {
  const url = new URL(KARTKATALOG_SEARCH_URL);
  url.searchParams.set('text', query);
  url.searchParams.set('limit', '10');
  url.searchParams.set('facets[0]name', 'distributionProtocol');
  url.searchParams.set('facets[0]value', 'OGC:WMS');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as GeonorgeResponse;
  return data.Results ?? [];
};

const getWmsUrl = (result: GeonorgeResult): string | null => {
  // Dataset results: top-level GetCapabilitiesUrl points to the download service,
  // not WMS. The linked WMS URL lives in ServiceDistributionUrlForDataset.
  if (result.ServiceDistributionUrlForDataset) {
    return result.ServiceDistributionUrlForDataset;
  }
  // Service results with OGC:WMS protocol have the real WMS URL at the top level.
  if (result.DistributionProtocol === 'OGC:WMS') {
    return result.GetCapabilitiesUrl || result.DistributionUrl || null;
  }
  return null;
};

export const GeonorgeWmsSearch = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeonorgeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addError, setAddError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const map = useAtomValue(mapAtom);
  const setUrlWmsLayers = useSetAtom(urlWmsLayersAtom);
  const urlWmsLayers = useAtomValue(urlWmsLayersAtom);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setSearching(true);
    setSearchError(null);
    setResults([]);

    try {
      const hits = await searchGeonorge(trimmed);
      setResults(hits);
      if (hits.length === 0) {
        setSearchError(t('map.settings.layers.theme.geonorgeSearch.noResults'));
      }
    } catch {
      setSearchError(t('map.settings.layers.theme.geonorgeSearch.searchError'));
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (result: GeonorgeResult) => {
    const wmsUrl = getWmsUrl(result);
    if (!wmsUrl) return;

    setAddingId(result.Uuid);
    setAddError(null);
    try {
      const mapProjection = map.getView().getProjection().getCode();
      const index = urlWmsLayers.length;
      const layer = await createUrlWmsLayer(wmsUrl, undefined, mapProjection, index);
      if (!layer) {
        setAddError(t('map.settings.layers.theme.geonorgeSearch.addError'));
        return;
      }
      layer.set('layerTitle', result.Title);
      if (result.ShowDetailsUrl) {
        layer.set('geonorgeDetailsUrl', result.ShowDetailsUrl);
      }
      map.addLayer(layer);
      setUrlWmsLayers((prev) => [...prev, layer]);
      setAddedIds((prev) => new Set(prev).add(result.Uuid));
    } catch {
      setAddError(t('map.settings.layers.theme.geonorgeSearch.addError'));
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Box marginTop={4}>
      <Separator marginBottom={3} />
      <Heading size={{ base: 'xs', md: 'sm' }} marginBottom={2}>
        {t('map.settings.layers.theme.geonorgeSearch.heading')}
      </Heading>

      <Flex gap={2} align="flex-start">
        <InputGroup flex={1} endElement={searching ? <Spinner size="xs" /> : undefined}>
          <Input
            size="sm"
            placeholder={t('map.settings.layers.theme.geonorgeSearch.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleSearch();
            }}
            disabled={searching}
          />
        </InputGroup>
        <IconButton
          size="sm"
          icon="search"
          aria-label={t('map.settings.layers.theme.geonorgeSearch.searchButton')}
          onClick={() => void handleSearch()}
          disabled={!query.trim() || searching}
          colorPalette="blue"
          variant="surface"
        />
      </Flex>

      {searchError && (
        <Text fontSize="xs" color="gray.500" marginTop={2}>
          {searchError}
        </Text>
      )}

      {addError && (
        <Text fontSize="xs" color="red.500" marginTop={2}>
          {addError}
        </Text>
      )}

      {results.length > 0 && (
        <VStack align="stretch" gap={0} marginTop={2} maxH="240px" overflowY="auto">
          {results.map((result) => {
            const wmsUrl = getWmsUrl(result);
            const isAdded = addedIds.has(result.Uuid);
            const isAdding = addingId === result.Uuid;
            return (
              <Flex
                key={result.Uuid}
                align="center"
                gap={2}
                py={1.5}
                px={1}
                borderRadius="md"
                _hover={{ bg: 'gray.50' }}
              >
                <Box flex={1} minW={0}>
                  <Text fontSize="xs" fontWeight="medium" lineClamp={1} title={result.Title}>
                    {result.Title}
                  </Text>
                  {result.Organization && (
                    <Text fontSize="xs" color="gray.500" lineClamp={1}>
                      {result.Organization}
                    </Text>
                  )}
                </Box>
                <Tooltip
                  content={
                    !wmsUrl
                      ? t('map.settings.layers.theme.geonorgeSearch.noUrl')
                      : isAdded
                        ? t('map.settings.layers.theme.geonorgeSearch.added')
                        : t('map.settings.layers.theme.geonorgeSearch.addButton')
                  }
                >
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={isAdded ? 'check' : 'add'}
                    aria-label={t('map.settings.layers.theme.geonorgeSearch.addButton')}
                    colorPalette={isAdded ? 'green' : 'blue'}
                    disabled={!wmsUrl || isAdded || isAdding}
                    onClick={() => void handleAdd(result)}
                  >
                    {isAdding && <Spinner size="xs" />}
                  </IconButton>
                </Tooltip>
              </Flex>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};
