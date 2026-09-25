import { ThemeLayerConfig } from '../../themeLayerConfigApi';

/** Category only; layers are fetched at runtime (fullstendighetsdekningApi.ts). */
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
