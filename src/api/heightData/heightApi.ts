import { getEnv } from '../../env';
import {
  GPFeatureRecordSetLayer,
  JobResultResponse,
  JobStatusResponse,
  OutputType,
  SubmitJobResponse,
} from './types';

const env = getEnv();

export const submitHeightProfileRequest = async (
  polyline: GPFeatureRecordSetLayer,
  sampleDistance: number,
) => {
  const url = `${env.heightDataApiUrl}/services/TerrengprofilV2/gpserver/TerrengprofilV2/submitJob`;
  const bodyData = {
    f: 'json',
    polyline: JSON.stringify(polyline),
    dem: 'DOM',
    sample_distance: sampleDistance.toString(),
  };
  const body = new URLSearchParams(bodyData);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body,
  });

  const data: SubmitJobResponse = await response.json();
  return data;
};

export const getHeightProfileJobStatus = async (jobId: string) => {
  const url = `${env.heightDataApiUrl}/services/TerrengprofilV2/gpserver/TerrengprofilV2/jobs/${jobId}?f=json`;

  const response = await fetch(url, {
    method: 'GET',
  });

  const data: JobStatusResponse = await response.json();
  return data;
};

export const getHeightProfileResult = async (
  jobId: string,
  outputType: OutputType,
) => {
  const url = `${env.heightDataApiUrl}/services/TerrengprofilV2/gpserver/TerrengprofilV2/jobs/${jobId}/results/${outputType}?f=json`;

  const response = await fetch(url, {
    method: 'GET',
  });

  const data: JobResultResponse = await response.json();
  return data;
};
