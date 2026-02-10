import {
  createListCollection,
  HStack,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SwitchControl,
  SwitchHiddenInput,
  SwitchLabel,
  SwitchRoot,
  Tooltip,
  VStack,
} from '@kvib/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AvailableProjections } from '../../map/atoms';
import { ProjectionIdentifier } from '../../map/projections/types';
import { ProjectionPopover } from './ProjectionPopover';

const basicProjections: ProjectionIdentifier[] = [
  'EPSG:4326', // wgs84
  'EPSG:3857', // webmercator
  'EPSG:25832', // utm32n
  'EPSG:25833', // utm33n
  'EPSG:25835', // utm35n
  'EPSG:25836', // utm36n
];

const allProjections: ProjectionIdentifier[] = [
  ...basicProjections,
  'EPSG:4230', // ed50 geografisk
  'EPSG:23031', // ed50 utm31n
  'EPSG:23032', // ed50 utm32n
  'EPSG:23033', // ed50 utm33n
  'EPSG:23034', // ed50 utm34n
  'EPSG:23035', // ed50 utm35n
  'EPSG:23036', // ed50 utm36n
  'EPSG:27391', // NGO 1948 / Gauss-Kruger sone 1
  'EPSG:27392', // NGO 1948 / Gauss-Kruger sone 2
  'EPSG:27393', // NGO 1948 / Gauss-Kruger sone 3
  'EPSG:27394', // NGO 1948 / Gauss-Kruger sone 4
  'EPSG:27395', // NGO 1948 / Gauss-Kruger sone 5
  'EPSG:27396', // NGO 1948 / Gauss-Kruger sone 6
  'EPSG:27397', // NGO 1948 / Gauss-Kruger sone 7
  'EPSG:27398', // NGO 1948 / Gauss-Kruger sone 8
];

export interface ProjectionSelectorProps {
  onProjectionChange: (projection: ProjectionIdentifier) => void;
  value?: ProjectionIdentifier;
  default: ProjectionIdentifier;
  label?: string;
  textColor: 'white' | 'black';
  hideBorders?: boolean;
  isToolbar?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export const ProjectionSelector = (props: ProjectionSelectorProps) => {
  const { t } = useTranslation();
  const [displayAllProjections, setDisplayAllProjections] =
    useState<boolean>(false);
  const selectedProjection = props.value ?? props.default;

  const projectionsToDisplay = props.isToolbar
    ? AvailableProjections
    : displayAllProjections
      ? allProjections
      : basicProjections;

  const projectionCollection = projectionsToDisplay.map((projection) => {
    const label = t(
      `map.settings.layers.projection.projections.${projection.replace(':', '').toLowerCase()}.displayName`,
    );
    return {
      value: projection,
      label: label,
    };
  });

  return (
    <VStack
      borderLeft={props.isToolbar == true ? 'solid white 1px' : undefined}
      borderRight={props.isToolbar == true ? 'solid white 1px' : undefined}
      pr={props.isToolbar == true ? 2 : undefined}
    >
      <HStack alignItems={'baseline'}>
        <SelectRoot
          minWidth="180px"
          size="sm"
          collection={createListCollection({ items: projectionCollection })}
          value={[selectedProjection]}
          disabled={props.disabled}
        >
          <SelectTrigger
            className={props.isToolbar ? 'toolbar-select' : ''}
            border={'none'}
            id={props.hideBorders ? 'crs-select-trigger' : ''}
          >
            {props.label ? (
              <Tooltip
                content={props.disabledReason || props.label}
                portalled={false}
                positioning={{ placement: 'top' }}
              >
                <SelectValueText color={props.textColor} />
              </Tooltip>
            ) : (
              <SelectValueText color={props.textColor} />
            )}
          </SelectTrigger>
          <SelectContent portalled={true}>
            {projectionCollection.map((item) => (
              <SelectItem
                key={item.value}
                item={item.value}
                onClick={() => {
                  props.onProjectionChange(item.value as ProjectionIdentifier);
                }}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
        <ProjectionPopover isToolbar={props.isToolbar == true} />
      </HStack>
      {!props.isToolbar && (
        <SwitchRoot
          pl={3}
          checked={displayAllProjections}
          onCheckedChange={(e) => setDisplayAllProjections(e.checked)}
        >
          <SwitchHiddenInput />
          <SwitchControl />
          <SwitchLabel>
            {t('map.settings.layers.projection.showAllProjections')}
          </SwitchLabel>
        </SwitchRoot>
      )}
    </VStack>
  );
};
