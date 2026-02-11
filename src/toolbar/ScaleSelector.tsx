import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Tooltip,
} from '@kvib/react';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { availableScales, mapAtom, scaleAtom } from '../map/atoms';

export const ScaleSelector = () => {
  const [scale, setScale] = useAtom(scaleAtom);
  const { t } = useTranslation();
  const map = useAtomValue(mapAtom);
  const [isIntegerZoom, setIsIntegerZoom] = useState(() =>
    map.getView().getConstrainResolution(),
  );

  useEffect(() => {
    const registerViewListener = () => {
      const view = map.getView();
      const updateConstrainResolution = () => {
        setIsIntegerZoom(view.getConstrainResolution());
      };

      view.on('change', updateConstrainResolution);
      updateConstrainResolution();

      return () => {
        view.un('change', updateConstrainResolution);
      };
    };

    let cleanupViewListener = registerViewListener();

    const onViewChange = () => {
      cleanupViewListener();
      cleanupViewListener = registerViewListener();
    };

    map.on('change:view', onViewChange);

    return () => {
      cleanupViewListener();
      map.un('change:view', onViewChange);
    };
  }, [map]);

  const scaleCollection = [...availableScales].map((s) => ({
    value: String(s),
    label: `1 : ${s.toLocaleString('no-NO')}`,
  }));

  const label = scale ? `1: ${scale.toLocaleString('no-NO')}` : '';

  const tooltipText = isIntegerZoom
    ? t('toolbar.scale.disabledTooltip')
    : t('toolbar.scale.tooltip');

  return (
    <SelectRoot
      className={'toolbar-select'}
      width="180px"
      size="sm"
      collection={createListCollection({ items: scaleCollection })}
      value={[]}
      disabled={isIntegerZoom}
      onValueChange={(details) => {
        if (details.value.length > 0) {
          setScale(Number(details.value[0]));
        }
      }}
    >
      <Tooltip content={tooltipText}>
        <SelectTrigger className={'toolbar-select-trigger'}>
          <SelectValueText color="white" placeholder={label}></SelectValueText>
        </SelectTrigger>
      </Tooltip>
      <SelectContent>
        {scaleCollection.map((item) => (
          <SelectItem
            key={item.value}
            item={item.value}
            onClick={() => setScale(Number(item.value))}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
