import { Flex, IconButton, MaterialSymbol, Tooltip } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  drawTypeAtom,
  primaryColorAtom,
  secondaryColorAtom,
} from '../settings/draw/atoms';
import { DrawType } from './drawControls/hooks/drawSettings';

export const DrawToolSelector = () => {
  const { t } = useTranslation();
  const drawTypeButtons: {
    value: DrawType;
    icon: MaterialSymbol;
    tooltip: string;
  }[] = [
    {
      value: 'Move',
      icon: 'arrow_selector_tool',
      tooltip: t('draw.controls.tool.tooltip.edit'),
    },
    {
      value: 'Polygon',
      icon: 'pentagon',
      tooltip: t('draw.controls.tool.tooltip.polygon'),
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
    <Flex
      w="100%"
      justifyContent={'space-between'}
      padding={1}
      boxShadow="sm"
      borderRadius={5}
    >
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
  const [drawType, setDrawType] = useAtom(drawTypeAtom);
  const isCurrentTool = drawType === type;
  const setPrimaryColor = useSetAtom(primaryColorAtom);
  const setSecondaryColor = useSetAtom(secondaryColorAtom);
  const ph = usePostHog();

  return (
    <Tooltip content={tooltip}>
      <IconButton
        variant={isCurrentTool ? 'solid' : 'ghost'}
        icon={icon}
        size="sm"
        onClick={() => {
          if (isCurrentTool) {
            return;
          }
          if (type === 'Text') {
            setPrimaryColor('#000000');
            setSecondaryColor('#ffffffff');
          }
          ph.capture('draw_tool_selected', { tool: type });
          setDrawType(type);
        }}
      />
    </Tooltip>
  );
};
