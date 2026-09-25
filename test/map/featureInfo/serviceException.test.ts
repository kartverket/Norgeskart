import { describe, expect, it } from 'vitest';
import { isServiceException } from '../../../src/map/featureInfo/featureInfoService';

describe('isServiceException', () => {
  it('detects an OGC exception report (NVE/ArcGIS, HTTP 200 + text/xml)', () => {
    const report = `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<ServiceExceptionReport version="1.3.0" xmlns="http://www.opengis.net/ogc">
  <ServiceException code="InvalidFormat">
    Parameter 'InfoFormat' contains unacceptable value.
  </ServiceException>
</ServiceExceptionReport>`;
    expect(isServiceException(report)).toBe(true);
  });

  it('detects namespaced exceptions', () => {
    expect(
      isServiceException('<ogc:ServiceExceptionReport><ogc:ServiceException>x'),
    ).toBe(true);
  });

  it('does not flag real feature info', () => {
    expect(
      isServiceException(
        '<FeatureInfoResponse><FIELDS damnavn="Svartevatn"/></FeatureInfoResponse>',
      ),
    ).toBe(false);
    expect(isServiceException('damnavn = Svartevatn')).toBe(false);
  });
});
