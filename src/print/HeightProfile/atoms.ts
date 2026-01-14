import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { LineString } from 'ol/geom';
import {
  getHeightProfileJobStatus,
  getHeightProfileResult,
  submitHeightProfileRequest,
} from '../../api/heightData/heightApi';
import {
  GPFeatureRecordSetLayer,
  JobResultResponse,
} from '../../api/heightData/types';
import { mapAtom } from '../../map/atoms';

export const profileLineAtom = atom<LineString | null>(null);
export const profileResponseAtom = atom<JobResultResponse | null>(null);

export const profileEffect = atomEffect((get, set) => {
  const line = get(profileLineAtom);
  if (line === null) return;
  const store = getDefaultStore();

  const mapProjection = store.get(mapAtom).getView().getProjection().getCode();
  const wkid = parseInt(mapProjection.replace('EPSG:', ''), 10);

  const featureLength = line.getLength();
  const stepLength = Math.max(featureLength / 400, 10); // max 400 samples, min 10 meters, unsure if the api cares

  const lineCoordinates = line.getCoordinates();
  const body = new GPFeatureRecordSetLayer([lineCoordinates], wkid);

  const effect = async () => {
    const submitResponse = await submitHeightProfileRequest(body, stepLength);

    while (true) {
      const status = await getHeightProfileJobStatus(submitResponse.jobId);
      if (status.jobStatus === 'esriJobSucceeded') {
        console.log('Job succeeded:', status);
        const result = await getHeightProfileResult(
          submitResponse.jobId,
          'output_points',
        );
        console.log('Profile result:', result);
        set(profileResponseAtom, result);

        break;
      } else if (status.jobStatus === 'esriJobFailed') {
        console.error('Job failed:', status);
        break;
      } else {
        console.log('Job status:', status.jobStatus);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };
  set(profileResponseAtom, null);
  effect();

  console.log('Profile line changed:', line);
});
