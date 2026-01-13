import { getEnv } from '../../env';
import { GPFeatureRecordSetLayer } from './types';

const env = getEnv();

export const submitHeightProfileRequest = async (
  polyline: GPFeatureRecordSetLayer,
  sampleDistance: number,
) => {
  const url = `${env.heightDataApiUrl}/services/TerrengprofilV2/gpserver/TerrengprofilV2/submitJob`;
  const bodyData = {
    f: 'json',
    polyline: JSON.stringify(polyline),
    dem: 'DTM',
    sampleDistance: sampleDistance.toString(),
  };
  const body = new URLSearchParams(bodyData);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body,
  });
};
