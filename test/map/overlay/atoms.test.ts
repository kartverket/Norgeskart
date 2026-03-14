import { createStore } from 'jotai';
import { describe, expect, it } from 'vitest';
import { mapToolAtom, showSearchComponentAtom } from '../../../src/map/overlay/atoms';

describe('mapToolAtom', () => {
  it('defaults to null', () => {
    const store = createStore();
    expect(store.get(mapToolAtom)).toBeNull();
  });

  it('can be set to a tool', () => {
    const store = createStore();
    store.set(mapToolAtom, 'draw');
    expect(store.get(mapToolAtom)).toBe('draw');
  });

  it('can be switched between tools', () => {
    const store = createStore();
    store.set(mapToolAtom, 'layers');
    store.set(mapToolAtom, 'draw');
    expect(store.get(mapToolAtom)).toBe('draw');
  });

  it('can be cleared back to null', () => {
    const store = createStore();
    store.set(mapToolAtom, 'draw');
    store.set(mapToolAtom, null);
    expect(store.get(mapToolAtom)).toBeNull();
  });
});

describe('showSearchComponentAtom', () => {
  it('is true when no tool is active', () => {
    const store = createStore();
    expect(store.get(showSearchComponentAtom)).toBe(true);
  });

  it('is false when a tool is active', () => {
    const store = createStore();
    store.set(mapToolAtom, 'draw');
    expect(store.get(showSearchComponentAtom)).toBe(false);
  });

  it('returns to true when tool is cleared', () => {
    const store = createStore();
    store.set(mapToolAtom, 'layers');
    store.set(mapToolAtom, null);
    expect(store.get(showSearchComponentAtom)).toBe(true);
  });
});
