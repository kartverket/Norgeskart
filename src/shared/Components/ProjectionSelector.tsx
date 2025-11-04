import {
  createListCollection,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { AvailableProjections, ProjectionIdentifier } from '../../map/atoms';

export interface ProjectionSelectorProps {
  onProjectionChange: (projection: ProjectionIdentifier) => void;
  default?: ProjectionIdentifier | null;
  label?: string;
}
export const ProjectionSelector = (props: ProjectionSelectorProps) => {
  const { t } = useTranslation();

  const defaultProjection = props.default != null ? props.default : 'EPSG:3857';

  const projectionCollection = AvailableProjections.map((projection) => ({
    value: projection,
    label: projection,
  }));

  return (
    <SelectRoot
      collection={createListCollection({ items: projectionCollection })}
      defaultValue={[defaultProjection]}
    >
      <SelectLabel>
        {props.label ? props.label : t('map.settings.layers.projection.label')}
      </SelectLabel>
      <SelectTrigger>
        <SelectValueText
          placeholder={t('map.settings.layers.projection.placeholder')}
        />
      </SelectTrigger>
      <SelectContent portalled={false}>
        {projectionCollection.map((item) => (
          <SelectItem
            key={item.value}
            item={item.value}
            onClick={() =>
              props.onProjectionChange(item.value as ProjectionIdentifier)
            }
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
