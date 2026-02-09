import { useTranslation } from 'react-i18next';
import { DEFAULT_PROJECTION } from '../../map/atoms';
import { useMapSettings } from '../../map/mapHooks';
import { ProjectionSelector } from '../../shared/Components/ProjectionSelector';
import { validateProjectionIdString } from '../../shared/utils/enumUtils';
import { getUrlParameter } from '../../shared/utils/urlUtils';

export const ProjectionSettings = () => {
  const { setProjection } = useMapSettings();
  const projectionId = validateProjectionIdString(
    getUrlParameter('projection'),
  );
  const { t } = useTranslation();

  return (
    <ProjectionSelector
      onProjectionChange={setProjection}
      default={projectionId || DEFAULT_PROJECTION}
      textColor="white"
      hideBorders
      isToolbar
      label={t('toolbar.crs.tooltip')}
    />
  );
};
