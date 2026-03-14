import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getUrlParameter,
  removeUrlParameter,
  setUrlParameter,
} from './urlUtils';

describe('urlUtils', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  describe('setUrlParameter', () => {
    it('sets a query parameter', () => {
      setUrlParameter('zoom', 10);
      expect(window.location.search).toContain('zoom=10');
    });

    it('sets a string parameter', () => {
      setUrlParameter('backgroundLayer', 'topo');
      expect(window.location.search).toContain('backgroundLayer=topo');
    });

    it('overwrites an existing parameter', () => {
      setUrlParameter('zoom', 8);
      setUrlParameter('zoom', 12);
      expect(window.location.search).toContain('zoom=12');
      expect(window.location.search).not.toContain('zoom=8');
    });
  });

  describe('getUrlParameter', () => {
    it('returns null when parameter does not exist', () => {
      expect(getUrlParameter('zoom')).toBeNull();
    });

    it('returns the value of an existing parameter', () => {
      setUrlParameter('zoom', 10);
      expect(getUrlParameter('zoom')).toBe('10');
    });
  });

  describe('removeUrlParameter', () => {
    it('removes an existing parameter', () => {
      setUrlParameter('zoom', 10);
      removeUrlParameter('zoom');
      expect(getUrlParameter('zoom')).toBeNull();
    });

    it('does not throw when parameter does not exist', () => {
      expect(() => removeUrlParameter('zoom')).not.toThrow();
    });
  });
});
