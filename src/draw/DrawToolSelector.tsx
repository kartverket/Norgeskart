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
    label: string;
  }[] = [
    {
      value: 'Move',
      icon: 'arrow_selector_tool',
      label: t('draw.controls.tool.label.edit'),
    },
    {
      value: 'Polygon',
      icon: 'pentagon',
      label: t('draw.controls.tool.label.polygon'),
    },
    {
      value: 'Point',
      icon: 'atr',
      label: t('draw.controls.tool.label.point'),
    },
    {
      value: 'LineString',
      icon: 'diagonal_line',
      label: t('draw.controls.tool.label.linestring'),
    },
    {
      value: 'Circle',
      icon: 'circle',
      label: t('draw.controls.tool.label.circle'),
    },
    {
      value: 'Text',
      icon: 'text_fields',
      label: t('draw.controls.tool.label.text'),
    },
  ];
  return (
    <Flex w="100%" justifyContent={'space-between'}>
      {drawTypeButtons.map((button) => (
        <DrawTypeButton
          key={button.value}
          type={button.value}
          icon={button.icon}
          label={button.label}
        />
      ))}
    </Flex>
  );
};

const DrawTypeButton = ({
  type,
  icon,
  label,
}: {
  type: DrawType;
  icon: MaterialSymbol;
  label: string;
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

  // const effectiveTooltip = isCurrentTool && collapsed ? 'Vis panel' : tooltip;

  return (
    <Flex direction="column" align="center" gap={1}>
      <IconButton
        variant="ghost"
        iconFill  
        icon={effectiveIcon}
        backgroundColor={isCurrentTool ? '#D0ECD6' : ''}
        size={{ base: 'xs', md: 'sm' }}
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
      <span style={{fontSize: 12, textAlign: 'center'}}>
        {label}
      </span>
    </Flex>
  );
};
