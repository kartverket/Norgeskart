import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentProjectionAtom } from '../../map/atoms';
import { activeBackgroundLayerAtom } from '../../map/layers/atoms';
import { useMapSettings } from '../../map/mapHooks';
import { ProjectionSelector } from '../../shared/Components/ProjectionSelector';

export const ProjectionSettings = () => {
  const { setProjection } = useMapSettings();
  const currentProjection = useAtomValue(currentProjectionAtom);
  const { t } = useTranslation();
  const activeBackgroundLayer = useAtomValue(activeBackgroundLayerAtom);
  const isNauticalActive = activeBackgroundLayer === 'nautical-background';

  return (
    <ProjectionSelector
      onProjectionChange={setProjection}
      value={currentProjection}
      default={currentProjection}
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
