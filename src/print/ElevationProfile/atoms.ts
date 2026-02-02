import { atom, getDefaultStore } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { LineString } from 'ol/geom';
import {
  getelevationProfileJobStatus,
  getelevationProfileResult,
  submitelevationProfileRequest,
} from '../../api/heightData/heightApi';
import {
  GPFeatureRecordSetLayer,
  JobResultResponse,
} from '../../api/heightData/types';
import { mapAtom } from '../../map/atoms';
import { disableDrawInteraction, enableDrawInteraction } from './drawUtils';
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
    const submitResponse = await submitelevationProfileRequest(
      body,
      stepLength,
    );
    set(profileJobStatusAtom, 'running');
    disableDrawInteraction();
    while (true) {
      const status = await getelevationProfileJobStatus(submitResponse.jobId);
      if (status.jobStatus === 'esriJobSucceeded') {
        console.log('Job succeeded:', status);
        const result = await getelevationProfileResult(
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
    enableDrawInteraction();
  };
  set(profileResponseAtom, null);
  effect();
});
