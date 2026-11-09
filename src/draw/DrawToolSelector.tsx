import { Box, Grid, Icon, MaterialSymbol, Text } from '@kvib/react';
import { usePostHog } from '@posthog/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { drawPanelCollapsedAtom } from '../map/overlay/atoms';
import {
  clearInteractions,
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
      value: 'LineString',
      icon: 'diagonal_line',
      label: t('draw.controls.tool.label.linestring'),
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
      value: 'Circle',
      icon: 'circle',
      label: t('draw.controls.tool.label.circle'),
    },
    {
      value: 'Text',
      icon: 'text_fields',
      label: t('draw.controls.tool.label.text'),
    },
    {
      value: 'Move',
      icon: 'arrow_selector_tool',
      label: t('draw.controls.tool.label.edit'),
    },
  ];
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={2} w="100%">
      {drawTypeButtons.map((button) => (
        <DrawTypeButton
          key={button.value}
          type={button.value}
          icon={button.icon}
          label={button.label}
        />
      ))}
    </Grid>
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
    <Box
      as="button"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={0}
      p={1}
      minHeight="54px"
      border="1px solid"
      borderColor={isCurrentTool ? 'green.500' : '#E0E0E0'}
      borderRadius="8px"
      backgroundColor="#FFFFFF"
      boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
      cursor="pointer"
      aria-label={label}
      aria-pressed={isCurrentTool}
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

        if (drawType === 'Move') {
          clearInteractions();
        }

        if (type === 'Text') {
          setPrimaryColor('#000000');
          setSecondaryColor('#ffffffff');
        }
        ph.capture('draw_tool_selected', { tool: type });
        setDrawType(type);
      }}
    >
      <Icon
        icon={effectiveIcon}
        size={24}
        color={isCurrentTool ? 'green.500' : '#000000'}
      />
      <Text fontSize={12} color={isCurrentTool ? 'green.500' : '#000000'}>
        {label}
      </Text>
    </Box>
  );
};
