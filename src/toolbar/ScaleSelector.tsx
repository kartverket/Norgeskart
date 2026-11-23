import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Tooltip,
} from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { availableScales, scaleAtom } from '../map/atoms';

export const ScaleSelector = () => {
  const [scale, setScale] = useAtom(scaleAtom);
  const { t } = useTranslation();
  const ph = usePostHog();

  const scaleCollection = [...availableScales].map((s) => ({
    value: String(s),
    label: `1 : ${s.toLocaleString('no-NO')}`,
  }));

  const label = scale ? `1: ${scale.toLocaleString('no-NO')}` : '';

  const tooltipText = t('toolbar.scale.tooltip');

  return (
    <SelectRoot
      className="map-control-select"
      width="180px"
      size="sm"
      collection={createListCollection({ items: scaleCollection })}
      value={scale ? [String(scale)] : []}
      onValueChange={(details) => {
        if (details.value.length > 0) {
          const newScale = Number(details.value[0]);
          ph.capture('scale_changed', { scale: newScale });
          setScale(newScale);
        }
      }}
    >
      <Tooltip content={tooltipText}>
        <SelectTrigger
          className="map-control-select-trigger"
          border="none"
          borderWidth={0}
          outline="none"
        >
          <SelectValueText
            color="green.700"
            placeholder={label}
          ></SelectValueText>
        </SelectTrigger>
      </Tooltip>
      <SelectContent portalled>
        {scaleCollection.map((item) => (
          <SelectItem key={item.value} item={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
