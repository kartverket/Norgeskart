import { useAtomValue } from 'jotai';
import {
  getThemeLayerById,
  themeLayerConfigLoadableAtom,
} from '../../api/themeLayerConfigApi';
import {
  addToUrlListParameter,
  removeFromUrlListParameter,
} from '../../shared/utils/urlUtils';
import { mapAtom } from '../atoms';
import {
  createThemeLayerFromConfig,
  getThemeWMSLayer,
  ThemeLayerName,
} from './themeWMS';

export const MAX_THEME_LAYERS = 10; // Maximum number of theme layers allowed on the map, what is a good number here?

export const mapLegacyThemeLayerId = (
  legacyId: string,
  configLoadable?: ReturnType<
    typeof useAtomValue<typeof themeLayerConfigLoadableAtom>
  >,
  projectName?: string,
): string | undefined => {
  if (configLoadable?.state === 'hasData') {
    const normalizedProject = projectName?.toLowerCase();

    const layer = configLoadable.data.layers.find((l) => {
      if (l.legacyId !== legacyId) return false;

      if (!normalizedProject) return true;

      const category = configLoadable.data.categories.find(
        (cat) => cat.id === l.categoryId,
      );

      return (
        category?.id === normalizedProject ||
        category?.parentId === normalizedProject
      );
    });

    if (layer) {
      return layer.id;
    }
  }

  const legacyMap: Record<string, string> = {
    // Property/Cadastre
    adresses: 'adresses',
    buildings: 'buildings',
    parcels: 'parcels',
    // Historical maps
    economicMapFirstEdition: 'economicMapFirstEdition',
    amtMap: 'amtMap',
  };

  return legacyMap[legacyId];
};

export const parseLegacyLayersParameter = (
  layersParam: string,
): { backgroundLayerId: string; themeLayerIds: string[] } => {
  const parts = layersParam.split(',').map((s) => s.trim());
  const backgroundLayerId = parts[0];
  const themeLayerIds = parts.slice(1);

  return {
    backgroundLayerId,
    themeLayerIds,
  };
};

export const useThemeLayers = () => {
  const map = useAtomValue(mapAtom);
  const mapProjection = map.getView().getProjection().getCode();
  const configLoadable = useAtomValue(themeLayerConfigLoadableAtom);

  const addThemeLayerToMap = (layerName: ThemeLayerName): boolean => {
    const layerExists = map
      .getLayers()
      .getArray()
      .some((layer) => layer.get('id') === `theme.${layerName}`);
    if (layerExists) {
      console.warn('Layer already exists on map');
      return false;
    }

    const activeThemeLayers = map
      .getLayers()
      .getArray()
      .filter((layer) => {
        const id = layer.get('id');
        return typeof id === 'string' && id.startsWith('theme.');
      });

    if (activeThemeLayers.length >= MAX_THEME_LAYERS) {
      console.warn(
        `Maximum theme layers limit (${MAX_THEME_LAYERS}) reached. Please deactivate some layers before adding more.`,
      );
      return false;
    }

    let layerToAdd = getThemeWMSLayer(layerName, mapProjection);

    if (!layerToAdd && configLoadable.state === 'hasData') {
      const layerDef = getThemeLayerById(configLoadable.data, layerName);
      if (layerDef) {
        layerToAdd = createThemeLayerFromConfig(
          configLoadable.data,
          layerDef,
          mapProjection,
        );
      }
    }

    if (!layerToAdd) {
      console.warn(
        `Could not create theme layer: ${layerName} for projection: ${mapProjection}`,
      );
      return false;
    }
    layerToAdd.setZIndex(10);
    map.addLayer(layerToAdd);
    addToUrlListParameter('themeLayers', layerName);
    return true;
  };

  const removeThemeLayerFromMap = (layerName: ThemeLayerName) => {
    const layer = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get('id') === `theme.${layerName}`);
    if (layer) {
      map.removeLayer(layer);
    }
    removeFromUrlListParameter('themeLayers', layerName);
  };

  const getActiveThemeLayerCount = (): number => {
    return map
      .getLayers()
      .getArray()
      .filter((layer) => {
        const id = layer.get('id');
        return typeof id === 'string' && id.startsWith('theme.');
      }).length;
  };

  return {
    addThemeLayerToMap,
    removeThemeLayerFromMap,
    getActiveThemeLayerCount,
  };
};
