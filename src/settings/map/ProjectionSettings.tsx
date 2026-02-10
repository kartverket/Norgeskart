import { HStack } from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PROJECTION } from '../../map/atoms';
import { activeBackgroundLayerAtom } from '../../map/layers/atoms';
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
  const { t } = useTranslation();
  const activeBackgroundLayer = useAtomValue(activeBackgroundLayerAtom);
  const isNauticalActive = activeBackgroundLayer === 'nautical-background';

  return (
    <HStack
      borderRight={'white 1px solid'}
      borderLeft={'white 1px solid'}
      pr={2}
    >
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
      <ProjectionPopover isToolbar />
    </HStack>
  );
};
