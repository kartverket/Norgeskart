import { HStack } from '@kvib/react';
import { DEFAULT_PROJECTION } from '../../map/atoms';
import { useMapSettings } from '../../map/mapHooks';
import { ProjectionPopover } from '../../shared/Components/ProjectionPopover';
import { ProjectionSelector } from '../../shared/Components/ProjectionSelector';
import { validateProjectionIdString } from '../../shared/utils/enumUtils';
import { getUrlParameter } from '../../shared/utils/urlUtils';

export const ProjectionSettings = () => {
  const { setProjection } = useMapSettings();
  const projectionId = validateProjectionIdString(
    getUrlParameter('projection'),
  );

  return (
    <HStack
      borderRight={'white 1px solid'}
      borderLeft={'white 1px solid'}
      pr={2}
    >
      <ProjectionSelector
        onProjectionChange={setProjection}
        default={projectionId || DEFAULT_PROJECTION}
        textColor="white"
        hideBorders
        isToolbar
      />
      <ProjectionPopover isToolbar />
    </HStack>
  );
};
