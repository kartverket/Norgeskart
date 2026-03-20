import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentProjectionAtom } from '../../map/atoms';
import { backgroundLayerAtom } from '../../map/layers/config/backgroundLayers/atoms';
import { ProjectionSelector } from '../../shared/Components/ProjectionSelector';

export const ProjectionSettings = () => {
  const setCurrentProjection = useSetAtom(currentProjectionAtom);
  const currentProjection = useAtomValue(currentProjectionAtom);
  const { t } = useTranslation();
  const activeBackgroundLayer = useAtomValue(backgroundLayerAtom);
  const isNauticalActive = activeBackgroundLayer === 'nautical-background';

  return (
    <ProjectionSelector
      onProjectionChange={setCurrentProjection}
      value={currentProjection}
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
