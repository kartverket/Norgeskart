import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PROJECTION } from '../../map/atoms';
import { activeBackgroundLayerAtom } from '../../map/layers/atoms';
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
  const activeBackgroundLayer = useAtomValue(activeBackgroundLayerAtom);
  const isNauticalActive = activeBackgroundLayer === 'nautical-background';

  return (
    <ProjectionSelector
      onProjectionChange={setProjection}
      value={projectionId || DEFAULT_PROJECTION}
      default={projectionId || DEFAULT_PROJECTION}
      textColor="white"
      hideBorders
      isToolbar
      label={t('toolbar.crs.tooltip')}
      disabled={isNauticalActive}
      disabledReason={
        isNauticalActive
          ? t('map.settings.layers.projection.lockedByLayer')
          : undefined
      }
    />
  );
};
