import { Flex, IconButton, MaterialSymbol, Tooltip } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { drawPanelCollapsedAtom } from '../map/overlay/atoms';
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
    <Flex w="100%" justifyContent={'space-between'}>
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

  const collapsed = useAtomValue(drawPanelCollapsedAtom);
  const setCollapsed = useSetAtom(drawPanelCollapsedAtom);

  const setPrimaryColor = useSetAtom(primaryColorAtom);
  const setSecondaryColor = useSetAtom(secondaryColorAtom);
  const ph = usePostHog();

  const effectiveIcon: MaterialSymbol =
    isCurrentTool && collapsed ? 'keyboard_arrow_up' : icon;

  const effectiveTooltip = isCurrentTool && collapsed ? 'Vis panel' : tooltip;

  return (
    <Tooltip content={effectiveTooltip}>
      <IconButton
        variant={isCurrentTool ? 'solid' : 'ghost'}
        icon={effectiveIcon}
        size="xl"
        onClick={() => {
          // Hvis panelet er skjult og du trykker på aktiv knapp -> åpne panelet
          if (isCurrentTool && collapsed) {
            setCollapsed(false);
            return;
          }

          // Hvis du trykker på aktiv knapp mens panelet er synlig -> gjør ingenting (som før)
          if (isCurrentTool) {
            return;
          }

          // Bytter tool -> åpne panelet (hvis det var skjult)
          setCollapsed(false);

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
