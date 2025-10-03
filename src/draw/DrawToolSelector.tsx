import { Flex, IconButton, MaterialSymbol, Tooltip } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { DrawType, useDrawSettings } from './drawHooks';

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
      tooltip: 'Text', // no translation yet
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

  return (
    <Tooltip content={tooltip}>
      <IconButton
        variant={isCurrentTool ? 'primary' : 'secondary'}
        icon={icon}
        onClick={() => setDrawType(type)}
      />
    </Tooltip>
  );
};
