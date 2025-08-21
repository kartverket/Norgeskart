import { FeatureCollection } from 'geojson';
import { Color } from 'ol/color';
import { ColorLike, PatternDescriptor } from 'ol/colorlike';
import { getEnv } from '../env';

const BASE_API_URL = getEnv().apiUrl;

export type StyleForStorage = {
  fill: { color: Color | ColorLike | PatternDescriptor | null };
  stroke: {
    color: Color | ColorLike | undefined;
    width: number | undefined;
  };
};

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

export const saveFeatures = async (
  features: FeatureCollection,
): Promise<string | null> => {
  try {
    const res = await fetch(`${BASE_API_URL}/upload-json.py`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(features),
    });
    if (!res.ok) {
      throw new Error('Failed to save features');
    }
    const responseText = await res.text();
    const filterRegex = /^\/([\w-]*)\.json$/; //the response is of type "/someGuidLikeThings.json" Capture just the guid
    const parts = filterRegex.exec(responseText);
    const id = parts ? parts[1] : null;
    return id;
  } catch (e) {
    console.error('Error saving features:', e);
    return null;
  }
};
