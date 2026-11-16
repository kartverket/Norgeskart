import {
  createListCollection,
  HStack,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Tooltip,
  VStack,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import {
  AvailableProjections,
  ProjectionIdentifier,
} from '../../map/projections/types';
import { ProjectionPopover } from './ProjectionPopover';

const allProjections: ProjectionIdentifier[] = [
  'EPSG:4258',
  'EPSG:4326',
  'EPSG:3857',
  'EPSG:4230',
  'EPSG:25832',
  'EPSG:25833',
  'EPSG:25834',
  'EPSG:25835',
  'EPSG:25836',
  'EPSG:23031',
  'EPSG:23032',
  'EPSG:23033',
  'EPSG:23034',
  'EPSG:23035',
  'EPSG:23036',
  'EPSG:27391',
  'EPSG:27392',
  'EPSG:27393',
  'EPSG:27394',
  'EPSG:27395',
  'EPSG:27396',
  'EPSG:27397',
  'EPSG:27398',
];

export interface ProjectionSelectorProps {
  onProjectionChange: (projection: ProjectionIdentifier) => void;
  value?: ProjectionIdentifier;
  label?: string;
  textColor: 'white' | 'black' | 'green.700';
  hideBorders?: boolean;
  showAllProjections?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export const ProjectionSelector = (props: ProjectionSelectorProps) => {
  const { t } = useTranslation();

  const projectionsToDisplay = props.showAllProjections
    ? allProjections
    : AvailableProjections;

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
    <VStack border="none">
      <HStack alignItems={'center'} gap={0} w="200px">
        <SelectRoot
          size="sm"
          collection={createListCollection({ items: projectionCollection })}
          value={props.value ? [props.value] : []}
          disabled={props.disabled}
          onValueChange={(details) => {
            if (details.value.length > 0) {
              props.onProjectionChange(
                details.value[0] as ProjectionIdentifier,
              );
            }
          }}
        >
          <SelectTrigger
            className="map-control-select-trigger"
            border={'none'}
            borderWidth={0}
            outline="none"
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
              <SelectItem key={item.value} item={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
        <ProjectionPopover />
      </HStack>
    </VStack>
  );
};
