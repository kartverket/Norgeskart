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
import { getSamleDistance } from './utils';

export type ProfileJobStatus =
  | 'notStarted'
  | 'running'
  | 'succeeded'
  | 'failed';

export const profileLineAtom = atom<LineString | null>(null);
export const profileResponseAtom = atom<JobResultResponse | null>(null);
export const profileJobStatusAtom = atom<string | null>(null);
export const profileSampleDistanceAtom = atom<number>(10);

export const profileEffect = atomEffect((get, set) => {
  const line = get(profileLineAtom);
  if (line === null) {
    set(profileJobStatusAtom, 'notStarted');
    return;
  }
  const store = getDefaultStore();

  const mapProjection = store.get(mapAtom).getView().getProjection().getCode();
  const wkid = parseInt(mapProjection.replace('EPSG:', ''), 10);

  const featureLength = line.getLength();
  const stepLength = getSamleDistance(featureLength);
  set(profileSampleDistanceAtom, stepLength);

  const lineCoordinates = line.getCoordinates();
  const body = new GPFeatureRecordSetLayer([lineCoordinates], wkid);

  const effect = async () => {
    const submitResponse = await submitHeightProfileRequest(body, stepLength);
    set(profileJobStatusAtom, 'running');

    while (true) {
      const status = await getHeightProfileJobStatus(submitResponse.jobId);
      if (status.jobStatus === 'esriJobSucceeded') {
        console.log('Job succeeded:', status);
        const result = await getHeightProfileResult(
          submitResponse.jobId,
          'output_points',
        );
        set(profileResponseAtom, result);
        set(profileJobStatusAtom, 'succeeded');

        break;
      } else if (status.jobStatus === 'esriJobFailed') {
        set(profileJobStatusAtom, 'failed');
        console.error('Job failed:', status);
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };
  set(profileResponseAtom, null);
  effect();
});
