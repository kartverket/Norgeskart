import { Heading, Stack } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  getEffectiveWmsUrl,
  getThemeLayerById,
  themeLayerConfigLoadableAtom,
} from '../../api/themeLayerConfigApi';
import { ThemeLayerName } from '../layers/themeWMS';

export const SingleLayerLegend = ({
  layerName,
}: {
  layerName: ThemeLayerName;
}) => {
  const { i18n } = useTranslation();
  const config = useAtomValue(themeLayerConfigLoadableAtom);
  if (config.state !== 'hasData') {
    return null;
  }

  const layer = getThemeLayerById(config.data, layerName);
  if (!layer) {
    return null;
  }
  const currentLang = i18n.language as 'nb' | 'nn' | 'en';

  const wmsUrl = getEffectiveWmsUrl(config.data, layer!);
  return (
    <Stack>
      <Heading size={'sm'}>{layer.name[currentLang]}</Heading>
    </Stack>
  );
};
