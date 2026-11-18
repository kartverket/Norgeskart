import {
  Box,
  Button,
  Flex,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  SegmentedControl,
  SwitchControl,
  SwitchHiddenInput,
  SwitchRoot,
  Text,
  VStack,
} from '@kvib/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { shownByDefault } from '../../../map/layers/config/themeLayers/vectorData';
import {
  type LineWidth,
  STYLE_COLORS,
  type UserStyle,
  userStylesAtom,
} from '../../../map/layers/userStyles';

const Swatch = ({
  label,
  background,
  selected,
  onClick,
}: {
  label: string;
  background: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <Box
    as="button"
    aria-label={label}
    aria-pressed={selected}
    title={label}
    onClick={onClick}
    width="24px"
    height="24px"
    borderRadius="full"
    background={background}
    borderWidth="2px"
    borderColor={selected ? 'green.700' : 'gray.300'}
    outline={selected ? '2px solid' : 'none'}
    outlineColor="green.700"
    outlineOffset="1px"
    cursor="pointer"
  />
);

/** A user's own look for a vector Kartdetalj: colour, line width, drawn or not. */
export const VectorStyleButton = ({ layerName }: { layerName: string }) => {
  const { t } = useTranslation();
  const [styles, setStyles] = useAtom(userStylesAtom);
  const style: UserStyle = styles[layerName] ?? {};
  const show = style.show ?? shownByDefault(layerName);

  const update = (patch: Partial<UserStyle>) =>
    setStyles((prev) => ({
      ...prev,
      [layerName]: { ...prev[layerName], ...patch },
    }));
  const reset = () =>
    setStyles((prev) => {
      const next = { ...prev };
      delete next[layerName];
      return next;
    });

  return (
    // The row toggles the layer on click; the style controls must not.
    <Box onClick={(event) => event.stopPropagation()}>
      {/* Mounted on open: the width control can't measure itself while hidden. */}
      <Popover lazyMount unmountOnExit>
        <PopoverTrigger asChild>
          <IconButton
            icon="palette"
            variant="ghost"
            colorPalette="green"
            size="xs"
            aria-label={t('map.settings.layers.style.button')}
          />
        </PopoverTrigger>
        <PopoverContent width="250px">
          <PopoverBody>
            <VStack align="stretch" gap={3}>
              <Text fontSize="sm" fontWeight="600">
                {t('map.settings.layers.style.color')}
              </Text>
              <Flex wrap="wrap" gap={2}>
                <Swatch
                  label={t('map.settings.layers.style.original')}
                  background="conic-gradient(#2e7d32, #1565c0, #c62828, #ffd600, #2e7d32)"
                  selected={!style.color}
                  onClick={() => update({ color: undefined })}
                />
                {STYLE_COLORS.map(({ key, value }) => (
                  <Swatch
                    key={key}
                    label={t(`map.settings.layers.style.colors.${key}`)}
                    background={value}
                    selected={style.color === value}
                    onClick={() => update({ color: value })}
                  />
                ))}
              </Flex>
              <Text fontSize="sm" fontWeight="600">
                {t('map.settings.layers.style.width')}
              </Text>
              <SegmentedControl
                size="sm"
                value={style.width ?? 'normal'}
                items={(['thin', 'normal', 'thick'] as LineWidth[]).map(
                  (width) => ({
                    value: width,
                    label: t(`map.settings.layers.style.widths.${width}`),
                  }),
                )}
                onValueChange={(details) =>
                  details.value && update({ width: details.value as LineWidth })
                }
              />
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontSize="sm">{t('map.settings.layers.style.show')}</Text>
                <SwitchRoot
                  checked={show}
                  size="sm"
                  colorPalette="green"
                  onCheckedChange={(details) =>
                    update({ show: details.checked })
                  }
                >
                  <SwitchHiddenInput />
                  <SwitchControl />
                </SwitchRoot>
              </Flex>
              <Button
                variant="ghost"
                colorPalette="green"
                size="xs"
                alignSelf="flex-start"
                onClick={reset}
              >
                {t('map.settings.layers.style.reset')}
              </Button>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};
