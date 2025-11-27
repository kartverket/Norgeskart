import { INITIAL_PROJECTION } from '../../map/atoms';
import { useMapSettings } from '../../map/mapHooks';
import { ProjectionSelector } from '../../shared/Components/ProjectionSelector';
import { validateProjectionIdString } from '../../shared/utils/enumUtils';
import { getUrlParameter } from '../../shared/utils/urlUtils';

export const ProjectionSettings = () => {
  const { setProjection } = useMapSettings();
  const projectionId = validateProjectionIdString(
    getUrlParameter('projection'),
  );

  return (
    <ProjectionSelector
      onProjectionChange={setProjection}
      default={projectionId || INITIAL_PROJECTION}
      textColor="white"
    />
  );
};
