import { Heading, Stack } from '@kvib/react';
import { XMLParser } from 'fast-xml-parser';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getEffectiveLegendUrl,
  getThemeLayerById,
  themeLayerConfigLoadableAtom,
} from '../../api/themeLayerConfigApi';
import { ThemeLayerName } from '../layers/themeWMS';
import { StyledLayerDescriptor } from '../types/StyledMapDescriptor';
const parser = new XMLParser({ removeNSPrefix: true });

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
  const [legendData, setLegendData] = useState<StyledLayerDescriptor | null>(
    null,
  );

  const layer = getThemeLayerById(config.data, layerName);
  if (!layer) {
    return null;
  }
  const currentLang = i18n.language as 'nb' | 'nn' | 'en';

  const legendUrl = getEffectiveLegendUrl(
    config.data,
    layer.id as ThemeLayerName,
  );

  const lmao = useMemo(async () => {
    if (!legendUrl) return;
    const res = await fetch(legendUrl);
    const text = await res.text();
    const styleObject = parser.parse(text);
    return styleObject as StyledLayerDescriptor;
  }, [layerName]);

  lmao.then((r) => {
    if (r) {
      setLegendData(r);
    }
  });

  return (
    <Stack>
      <Heading size={'sm'}>{layer.name[currentLang]}</Heading>
      {legendData?.Name}
    </Stack>
  );
};
