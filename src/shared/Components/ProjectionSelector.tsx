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

export interface ProjectionSelectorProps {
  onProjectionChange: (projection: ProjectionIdentifier) => void;
  default: ProjectionIdentifier;
  label?: string;
  textColor: 'white' | 'black';
  hideBorders?: boolean;
  isToolbar?: boolean;
}

export const ProjectionSelector = (props: ProjectionSelectorProps) => {
  const { t } = useTranslation();
  const [selectedProjection, setSelectedProjection] =
    useState<ProjectionIdentifier>(props.default);

  const [displayAllProjections, setDisplayAllProjections] =
    useState<boolean>(false);

  const projectionCollection = AvailableProjections.map((projection) => {
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
          width="180px"
          size="sm"
          collection={createListCollection({ items: projectionCollection })}
          value={[selectedProjection]}
        >
          <SelectTrigger
            className={props.isToolbar ? 'toolbar-select' : ''}
            border={'none'}
            id={props.hideBorders ? 'crs-select-trigger' : ''}
          >
            {props.label ? (
              <Tooltip
                content={props.label}
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
                  setSelectedProjection(item.value as ProjectionIdentifier);
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
