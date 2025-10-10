import { Flex, IconButton, MaterialSymbol, Tooltip } from '@kvib/react';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { primaryColorAtom, secondaryColorAtom } from '../settings/draw/atoms';
import { DrawType, useDrawSettings } from './drawControls/hooks/drawSettings';

export const DrawToolSelector = () => {
  const { t } = useTranslation();
  const drawTypeButtons: {
    value: DrawType;
    icon: MaterialSymbol;
    tooltip: string;
  }[] = [
    {
      value: 'Polygon',
      icon: 'pentagon',
      tooltip: t('draw.controls.tool.tooltip.polygon'),
    },
    {
      value: 'Move',
      icon: 'arrow_selector_tool',
      tooltip: t('draw.controls.tool.tooltip.edit'),
    },
    {
      value: 'Point',
      icon: 'atr',
      tooltip: t('draw.controls.tool.tooltip.point'),
    },
    {
      value: 'LineString',
      icon: 'polyline',
      tooltip: t('draw.controls.tool.tooltip.linestring'),
    },
    {
      value: 'Circle',
      icon: 'circle',
      tooltip: t('draw.controls.tool.tooltip.circle'),
    },
    {
      value: 'Text',
      icon: 'text_fields',
      tooltip: t('draw.controls.tool.tooltip.text'),
    },
  ];
  return (
    <Flex gap={2}>
      {drawTypeButtons.map((button) => (
        <DrawTypeButton
          key={button.value}
          type={button.value}
          icon={button.icon}
          tooltip={button.tooltip}
        />
      ))}
    </Flex>
  );
};

const DrawTypeButton = ({
  type,
  icon,
  tooltip,
}: {
  type: DrawType;
  icon: MaterialSymbol;
  tooltip: string;
}) => {
  const { drawType, setDrawType } = useDrawSettings();
  const isCurrentTool = drawType === type;
  const setPrimaryColor = useSetAtom(primaryColorAtom);
  const setSecondaryColor = useSetAtom(secondaryColorAtom);

  return (
    <Tooltip content={tooltip}>
      <IconButton
        variant={isCurrentTool ? 'primary' : 'secondary'}
        icon={icon}
        onClick={() => {
          if (isCurrentTool) {
            return;
          }
          if (type === 'Text') {
            console.log('hi');
            setPrimaryColor('#000000');
            setSecondaryColor('#ffffffff');
          }

          setDrawType(type);
        }}
      />
    </Tooltip>
  );
};
