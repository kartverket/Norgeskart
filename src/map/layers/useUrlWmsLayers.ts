import { toaster } from '@kvib/react';
import type { TFunction } from 'i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import type TileLayer from 'ol/layer/Tile';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobileScreen } from '../../shared/hooks';
import {
  getAllUrlParameters,
  getUrlParameter,
  removeUrlParameter,
  setAllUrlParameters,
  setUrlParameter,
} from '../../shared/utils/urlUtils';
import { mapAtom } from '../atoms';
import { mapToolAtom } from '../overlay/atoms';
import {
  createGeonorgeLayer,
  geonorgeDetailsUrl,
  GeonorgeLayerError,
} from './geonorgeLayers';
import {
  assignZIndices,
  claimUrlWmsLoadAtom,
  createUrlWmsLayer,
  failedUrlWmsAtom,
  parseWmsUrl,
  urlWmsLayersAtom,
  urlWmsLoadAtom,
  watchTileErrors,
} from './urlWms';
import {
  formatGeonorgeToken,
  parseGeonorgeParam,
  serializeUrlWmsLayers,
} from './urlWmsState';

type Failure = { title: string; detailsUrl?: string };

const showFailure = ({ title, detailsUrl }: Failure, t: TFunction) =>
  toaster.create({
    type: 'warning',
    title: t('map.settings.layers.theme.addWms.loadError', { title }),
    duration: 10_000,
    ...(detailsUrl
      ? {
          action: {
            label: t('map.settings.layers.theme.addWms.geonorgeLink'),
            onClick: () => window.open(detailsUrl, '_blank', 'noopener'),
          },
        }
      : {}),
  });

const watchedLayers = new WeakSet<TileLayer>();

/** Loads ?geonorge= and ?wmsUrl= layers once, then keeps the URL in step. */
export const useUrlWmsLayers = () => {
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const [layers, setLayers] = useAtom(urlWmsLayersAtom);
  const setMapTool = useSetAtom(mapToolAtom);
  const isMobile = useIsMobileScreen();
  const [loadState, setLoadState] = useAtom(urlWmsLoadAtom);
  const claimLoad = useSetAtom(claimUrlWmsLoadAtom);
  const [failed, setFailed] = useAtom(failedUrlWmsAtom);

  useEffect(() => {
    if (!map || !claimLoad()) return;

    const projection = map.getView().getProjection().getCode();
    const tokens = parseGeonorgeParam(getUrlParameter('geonorge'));
    const wmsUrls = getAllUrlParameters('wmsUrl');
    // Legacy: paired by position. New links put LAYERS in wmsUrl itself.
    const wmsLayers = getAllUrlParameters('wmsLayer');
    const failures: Failure[] = [];
    const failedNow = { geonorge: [] as string[], wmsUrls: [] as string[] };

    const load = async (
      promise: Promise<TileLayer>,
      onFail: (e: unknown) => Failure,
    ) => {
      try {
        return await promise;
      } catch (e) {
        console.error('[urlWms] could not load layer:', e);
        failures.push(onFail(e));
        return null;
      }
    };

    const requests = [
      ...tokens.map((token) =>
        load(createGeonorgeLayer(token, projection), (e) => {
          failedNow.geonorge.push(formatGeonorgeToken(token));
          return {
            title: (e instanceof GeonorgeLayerError && e.title) || token.id,
            detailsUrl: geonorgeDetailsUrl(token.id),
          };
        }),
      ),
      ...wmsUrls.map((url, i) =>
        load(
          createUrlWmsLayer({
            url,
            wanted: wmsLayers[i]?.split(',').filter(Boolean),
            projection,
            allowUnverified: true,
          }),
          () => {
            const parsed = parseWmsUrl(url);
            if (parsed) failedNow.wmsUrls.push(url);
            return { title: parsed ? new URL(parsed.baseUrl).host : url };
          },
        ),
      ),
    ];

    void Promise.all(requests).then((results) => {
      const loaded = results.filter((l) => l !== null);
      loaded.forEach((layer) => map.addLayer(layer));
      setLayers((prev) => {
        const next = [...loaded, ...prev];
        assignZIndices(next);
        return next;
      });
      if (
        loaded.length > 0 &&
        tokens.length > 0 &&
        !isMobile &&
        getUrlParameter('showMenu') !== 'false'
      ) {
        setMapTool('layers');
      }
      failures.forEach((failure) => showFailure(failure, t));
      setFailed(failedNow);
      setLoadState('done');
    });
  }, [
    map,
    claimLoad,
    isMobile,
    setFailed,
    setLayers,
    setLoadState,
    setMapTool,
    t,
  ]);

  useEffect(() => {
    for (const layer of layers) {
      if (watchedLayers.has(layer)) continue;
      watchedLayers.add(layer);
      watchTileErrors(
        layer,
        () => setLayers((prev) => [...prev]),
        () =>
          showFailure(
            {
              title: layer.get('layerTitle') as string,
              detailsUrl: layer.get('geonorgeDetailsUrl') as string | undefined,
            },
            t,
          ),
      );
    }
  }, [layers, setLayers, t]);

  useEffect(() => {
    if (loadState !== 'done') return;
    const { geonorge, wmsUrls } = serializeUrlWmsLayers(layers);
    const ids = [...geonorge, ...failed.geonorge];
    if (ids.length > 0) setUrlParameter('geonorge', ids.join(','));
    else removeUrlParameter('geonorge');
    setAllUrlParameters('wmsUrl', [...wmsUrls, ...failed.wmsUrls]);
    removeUrlParameter('wmsLayer');
  }, [failed, layers, loadState]);
};
