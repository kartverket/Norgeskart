import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { useState } from 'react';
import { AvailableProjections, ProjectionIdentifier } from '../../map/atoms';

export interface ProjectionSelectorProps {
  onProjectionChange: (projection: ProjectionIdentifier) => void;
  default: ProjectionIdentifier;
  label?: string;
  textColor: 'white' | 'black';
}
export const ProjectionSelector = (props: ProjectionSelectorProps) => {
  const [selectedProjection, setSelectedProjection] =
    useState<ProjectionIdentifier>(props.default);

  const projectionCollection = AvailableProjections.map((projection) => ({
    value: projection,
    label: projection,
  }));

  return (
    <SelectRoot
      width="140px"
      size="sm"
      collection={createListCollection({ items: projectionCollection })}
      value={[selectedProjection]}
    >
      <SelectTrigger>
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
