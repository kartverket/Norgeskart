import { FeatureCollection } from 'geojson';
import proj4 from 'proj4';
import { getEnv } from '../env';
import { ProjectionIdentifier } from '../map/atoms';

const BASE_API_URL = getEnv().apiUrl;

export const getFeatures = async (
  drawingId: string,
): Promise<FeatureCollection> => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/get-json.py?hash=${drawingId}`,
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: FeatureCollection = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching features:', error);
    throw error;
  }
};

//https://openlayers.org/en/latest/examples/geojson.html  Stapp dette greien inn i draw layer på oppstart?

const transformFeatureCollection = (
  features: FeatureCollection,
  srcProj: ProjectionIdentifier,
  destProj: ProjectionIdentifier,
) => {
  const transformedFeatures = {
    ...features,
    features: features.features.map((feature) => {
      if (feature.geometry && feature.geometry.type === 'Point') {
        const [x, y] = feature.geometry.coordinates as [number, number];
        const [lon, lat] = proj4(srcProj, destProj, [x, y]);
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: [lon, lat],
          },
        };
      } else if (feature.geometry && feature.geometry.type === 'LineString') {
        const coords = (feature.geometry.coordinates as [number, number][]).map(
          ([x, y]) => proj4(srcProj, destProj, [x, y]),
        );
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: coords,
          },
        };
      } else if (feature.geometry && feature.geometry.type === 'Polygon') {
        const coords = (
          feature.geometry.coordinates as [number, number][][]
        ).map((ring) => ring.map(([x, y]) => proj4(srcProj, destProj, [x, y])));
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: coords,
          },
        };
      }
      return feature;
    }),
  };
  return transformedFeatures;
};

export const saveFeatures = async (
  features: FeatureCollection,
  projection: ProjectionIdentifier,
): Promise<string | null> => {
  try {
    const transformedFeatures = transformFeatureCollection(
      //Noe ble megawack med transformasjonen tror jeg
      features,
      projection,
      'EPSG:4326',
    );

    const res = await fetch(`${BASE_API_URL}/upload-json.py`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedFeatures),
    });
    if (!res.ok) {
      throw new Error('Failed to save features');
    }
    const responseText = await res.text();
    const filterRegex = /^\/((?:\w|\d|-)*)\.json$/; //the response is of type "/someGuidLikeThings.json" Capture just the guid
    const parts = filterRegex.exec(responseText);
    const id = parts ? parts[1] : null;
    return id;
  } catch (e) {
    console.error('Error saving features:', e);
    return null;
  }
};
