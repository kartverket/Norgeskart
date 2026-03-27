import { ThemeLayerConfig } from '../../themeLayerConfigApi';

/**
 * Initial config for Fullstendighetsdekning — only the category.
 * Layers are fetched dynamically at runtime from the Geonorge directory listing
 * so that new datasets appear automatically without code changes.
 * See fullstendighetsdekningApi.ts for the fetch logic.
 */
export const fullstendighetsdekningConfig: ThemeLayerConfig = {
  categories: [
    {
      id: 'fullstendighetsdekning',
      groupid: 19,
      name: {
        nb: 'Fullstendighetsdekning',
        nn: 'Fullstendigheitsdekning',
        en: 'Completeness coverage',
      },
    },
  ],
  layers: [],
};
