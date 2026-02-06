import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Tooltip,
} from '@kvib/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AvailableProjections, ProjectionIdentifier } from '../../map/atoms';

export interface ProjectionSelectorProps {
  onProjectionChange: (projection: ProjectionIdentifier) => void;
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
  const [selectedProjection, setSelectedProjection] =
    useState<ProjectionIdentifier>(props.default);

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
    <SelectRoot
      width="180px"
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
              setSelectedProjection(item.value as ProjectionIdentifier);
            }}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
