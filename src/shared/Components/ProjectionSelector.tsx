import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
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
    >
      <SelectTrigger
        border={'none'}
        id={props.hideBorders ? 'crs-select-trigger' : ''}
      >
        <SelectValueText color={props.textColor} />
      </SelectTrigger>
      <SelectContent portalled={false}>
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
