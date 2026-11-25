import type { Map as OlMap } from 'ol';
import Feature from 'ol/Feature';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { unByKey } from 'ol/Observable';
import Overlay, { type Positioning } from 'ol/Overlay';
import TileState from 'ol/TileState';
import type VectorTile from 'ol/VectorTile';
import { asArray } from 'ol/color';
import type { Coordinate } from 'ol/coordinate';
import type { EventsKey } from 'ol/events';
import { type Extent, intersects } from 'ol/extent';
import MVT from 'ol/format/MVT';
import type Geometry from 'ol/geom/Geometry';
import MultiLineString from 'ol/geom/MultiLineString';
import Point from 'ol/geom/Point';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import {
  equivalent,
  get as getProjection,
  getTransform,
  transformExtent,
} from 'ol/proj';
import type Projection from 'ol/proj/Projection';
import RenderFeature, { toGeometry } from 'ol/render/Feature';
import VectorSource from 'ol/source/Vector';
import VectorTileSource from 'ol/source/VectorTile';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import i18n from '../../../../i18n';
import {
  type Band,
  HOVER_GROUPS,
  hoverBands,
  type Hovered,
  type HoverGroup,
  type HoverKind,
  inBand,
  kindOf,
  pickFeature,
  POINT_HIT_PX,
  type Properties,
  REMEMBERED_TILES,
  TILE_PROJECTION,
  type TileJson,
  TRANSPARENT,
} from './hover';
import { outlineWithoutTileCuts } from './hoverOutline';
import { mapLibreZoomForView } from './mapLibreZoom';

type LoadedTile = { z: number; extent: Extent; features: RenderFeature[] };

type HoverSource = {
  id: string;
  kind: HoverKind;
  source: VectorTileSource<RenderFeature>;
  // What has been parsed, in tile projection: the source keeps no public list.
  tiles: Map<string, LoadedTile>;
};

type BandLayers = {
  group: HoverGroup;
  band: Band;
  hoverSource: HoverSource;
  hit: VectorTileLayer<VectorTileSource<RenderFeature>>;
};

type Candidate = {
  group: HoverGroup;
  hoverSource: HoverSource;
  properties: Properties;
  point?: Coordinate;
};

// What a mark (hover or selection) shows.
type Mark = {
  hovered: Hovered;
  group: HoverGroup;
  properties: Properties;
  hoverSource: HoverSource;
  color: string;
  point?: Coordinate;
};

type MarkName = 'hover' | 'selected';

const HOVER_REST_MS = 60;

// Room the tooltip needs beside the cursor, in CSS pixels, before it flips sides.
const TOOLTIP_ROOM = [290, 150];

/** A user's look for a hover group (from the Kartdetalj's style settings). */
export type GroupStyle = {
  // undefined = the group's own colours.
  color?: string;
  widthScale: number;
  // Drawn on the map, not only highlighted on hover.
  display: boolean;
};

/** groupId → whether the current zoom shows it. */
export type HoverStatus = Record<string, boolean>;

const createHoverSource = (
  martinUrl: string,
  id: string,
  sourceLayer: string,
  kind: HoverKind,
  { minzoom, maxzoom }: TileJson,
  onLoad: (hoverSource: HoverSource) => void,
): HoverSource => {
  const tiles = new Map<string, LoadedTile>();
  const format = new MVT({ layers: [sourceLayer] });
  const source = new VectorTileSource<RenderFeature>({
    format,
    projection: TILE_PROJECTION,
    url: `${martinUrl}/${id}/{z}/{x}/{y}`,
    minZoom: minzoom ?? 0,
    maxZoom: maxzoom ?? 22,
    tileLoadFunction: (tile, url) => {
      const vectorTile = tile as VectorTile<RenderFeature>;
      const load = async (extent: Extent, projection: Projection) => {
        try {
          const response = await fetch(url);
          // Martin answers 204 for a tile with nothing in it.
          if (!response.ok) throw new Error(`${response.status} ${url}`);
          const data = await response.arrayBuffer();
          const features = data.byteLength
            ? (format.readFeatures(data, {
                extent,
                featureProjection: projection,
              }) as RenderFeature[])
            : [];
          vectorTile.setFeatures(features);
          tiles.delete(url);
          tiles.set(url, {
            z: vectorTile.getTileCoord()[0],
            extent,
            features,
          });
          if (tiles.size > REMEMBERED_TILES) {
            tiles.delete(tiles.keys().next().value!);
          }
          onLoad(hoverSource);
        } catch {
          vectorTile.setState(TileState.ERROR);
        }
      };
      vectorTile.setLoader((extent, _resolution, projection) => {
        void load(extent, projection);
      });
    },
  });
  const hoverSource: HoverSource = { id, kind, source, tiles };
  return hoverSource;
};

const withAlpha = (color: string, alpha: number) => {
  const [r, g, b] = asArray(color);
  return [r, g, b, alpha];
};

// Hit and display style of a band's layer. Points are hit-tested from the parsed
// tiles (findPoints): OL's hit detection misses symbols on vector tile layers.
const bandStyle = (group: HoverGroup, kind: HoverKind, look: GroupStyle) => {
  const cache = new Map<string, Style | Style[]>();
  const wideHit = new Stroke({ color: TRANSPARENT, width: 14 });
  const make = (
    color: string,
    dash?: number[],
  ): Style | Style[] | undefined => {
    if (kind === 'fill') {
      const drawn = look.display && !group.displaySource;
      return new Style({
        fill: new Fill({ color: drawn ? color : TRANSPARENT }),
      });
    }
    if (kind === 'line') {
      const width = 1.5 * look.widthScale;
      return look.display
        ? [
            new Style({
              stroke: new Stroke({
                color,
                width,
                lineDash: dash?.map((d) => d * width),
                lineCap: dash ? 'butt' : 'round',
              }),
            }),
            new Style({ stroke: wideHit }),
          ]
        : new Style({ stroke: wideHit });
    }
    return look.display
      ? new Style({
          image: new Circle({
            radius: 3.5 * look.widthScale,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: '#ffffff', width: 1 }),
          }),
        })
      : undefined;
  };
  return (feature: RenderFeature | Feature) => {
    const properties = feature.getProperties();
    if (group.filter && !group.filter(properties)) return undefined;
    const color = look.color ?? group.color(properties);
    const dash = group.dash?.(properties);
    const key = `${color}|${dash ?? ''}`;
    if (!cache.has(key)) {
      const style = make(color, dash);
      if (!style) return undefined;
      cache.set(key, style);
    }
    return cache.get(key);
  };
};

const markStyles = (
  kind: HoverKind,
  color: string,
  strong: boolean,
  scale: number,
) => {
  const width = (strong ? 3 : 2) * scale;
  const halo = new Stroke({ color: '#ffffff', width: width + 4 });
  if (kind === 'fill') {
    return {
      fill: new Style({ fill: new Fill({ color }) }),
      stroke: [
        new Style({ stroke: halo }),
        new Style({ stroke: new Stroke({ color, width }) }),
      ],
    };
  }
  if (kind === 'line') {
    return {
      fill: undefined,
      stroke: [
        new Style({ stroke: halo }),
        new Style({ stroke: new Stroke({ color, width: width + 2 }) }),
      ],
    };
  }
  return {
    fill: undefined,
    stroke: new Style({
      image: new Circle({
        radius: (strong ? 10 : 8) * Math.max(1, scale * 0.8),
        fill: new Fill({ color: withAlpha(color, 0.3) }),
        stroke: new Stroke({ color, width: width + 0.5 }),
      }),
    }),
  };
};

const swatch = (kind: HoverKind, color: string) => {
  const el = document.createElement('span');
  Object.assign(el.style, {
    display: 'inline-block',
    flex: 'none',
    width: kind === 'line' ? '16px' : '12px',
    height: kind === 'line' ? '4px' : '12px',
    borderRadius: kind === 'circle' ? '50%' : '2px',
    background: kind === 'fill' ? `${color}55` : color,
    border: kind === 'fill' ? `2px solid ${color}` : 'none',
    boxSizing: 'border-box',
  });
  return el;
};

const createTooltip = (pinned: boolean) => {
  const el = document.createElement('div');
  el.className = pinned
    ? 'hover-tooltip hover-tooltip-pinned'
    : 'hover-tooltip';
  el.setAttribute('role', pinned ? 'dialog' : 'tooltip');
  Object.assign(el.style, {
    background: '#ffffff',
    color: '#1c2a24',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    padding: '6px 10px',
    font: '13px/1.35 Mulish, Arial, sans-serif',
    maxWidth: '260px',
    pointerEvents: pinned ? 'auto' : 'none',
    whiteSpace: 'normal',
  });
  return el;
};

const fillTooltip = (el: HTMLElement, mark: Mark, onClose?: () => void) => {
  const t = i18n.t.bind(i18n);
  const { hovered, color, hoverSource } = mark;
  el.replaceChildren();

  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#55645c',
    fontSize: '12px',
  });
  const type = document.createElement('span');
  type.textContent = t(`map.hover.types.${hovered.type}`, {
    defaultValue: hovered.type,
  });
  header.append(swatch(hoverSource.kind, color), type);
  if (onClose) {
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', t('map.hover.close'));
    Object.assign(close.style, {
      marginLeft: 'auto',
      border: 'none',
      background: 'none',
      fontSize: '18px',
      lineHeight: '1',
      cursor: 'pointer',
      color: '#55645c',
      padding: '0 0 0 8px',
    });
    close.addEventListener('click', onClose);
    header.append(close);
  }

  const name = document.createElement('div');
  name.textContent = hovered.label;
  Object.assign(name.style, { fontWeight: '700', fontSize: '14px' });
  el.append(header, name);

  if (onClose && hovered.details?.length) {
    const list = document.createElement('dl');
    Object.assign(list.style, {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '0 8px',
      margin: '4px 0 0',
      fontSize: '12px',
    });
    for (const [field, value] of hovered.details) {
      const dt = document.createElement('dt');
      dt.textContent = t(`map.hover.fields.${field}`, { defaultValue: field });
      dt.style.color = '#55645c';
      const dd = document.createElement('dd');
      dd.textContent = value;
      dd.style.margin = '0';
      list.append(dt, dd);
    }
    el.append(list);
  }
};

/**
 * Hover and click for our vector-tile data, drawn by OpenLayers so it lines up in
 * any view projection. Groups are switched on from Kartdetaljer (setActiveGroups).
 *
 * Hits come from vector tile layers (and parsed tiles, for points). Highlights are
 * the feature's pieces from the loaded tiles, reprojected into plain vector layers.
 */
export const createHoverLayers = (
  olMap: OlMap,
  martinUrl: string,
  tileJsons: Record<string, TileJson>,
  onStatus?: (status: HoverStatus) => void,
) => {
  let activeGroups = new Set<string>();
  let groupStyles: Record<string, GroupStyle> = {};
  const lookOf = (group: HoverGroup): GroupStyle =>
    groupStyles[group.id] ?? { widthScale: 1, display: Boolean(group.display) };
  const colorOf = (group: HoverGroup, properties: Properties) =>
    lookOf(group).color ?? group.color(properties);
  const marks: Record<MarkName, Mark | undefined> = {
    hover: undefined,
    selected: undefined,
  };
  let redraw: number | undefined;

  const hoverSources = new Map<string, HoverSource>();
  const sourceFor = (group: HoverGroup, id: string) => {
    let hoverSource = hoverSources.get(id);
    if (!hoverSource) {
      hoverSource = createHoverSource(
        martinUrl,
        id,
        group.sourceLayer(id),
        kindOf(group, id),
        tileJsons[id],
        // More of a marked feature came in: draw it, once per frame at most.
        (loaded) => {
          if (
            marks.hover?.hoverSource !== loaded &&
            marks.selected?.hoverSource !== loaded
          ) {
            return;
          }
          redraw ??= requestAnimationFrame(() => {
            redraw = undefined;
            drawAll();
          });
        },
      );
      hoverSources.set(id, hoverSource);
    }
    return hoverSource;
  };

  const bands: BandLayers[] = [];
  // Lowest priority first, so the first added ends up underneath.
  for (const group of [...HOVER_GROUPS].reverse()) {
    for (const band of hoverBands(group, tileJsons)) {
      const hoverSource = sourceFor(group, band.source);
      const hit = new VectorTileLayer({
        source: hoverSource.source,
        style: bandStyle(group, hoverSource.kind, lookOf(group)),
        // Only what's drawn faintly is seen; the rest is there to be hit.
        opacity: hoverSource.kind === 'fill' ? 0.25 : 0.8,
        visible: false,
      });
      bands.push({ group, band, hoverSource, hit });
    }
  }
  const hitLayers = new Map(bands.map((b) => [b.hit, b]));

  // Groups drawn from another archive (displaySource): display only, never hit.
  const displayStyle = (group: HoverGroup) => {
    const look = lookOf(group);
    const source = group.displaySource!;
    const cache = new Map<number, Style>();
    return (feature: RenderFeature | Feature) => {
      const properties = feature.getProperties();
      if (!source.filter(properties, zoom())) return undefined;
      const weight = source.weight?.(properties) ?? 1;
      if (!cache.has(weight)) {
        cache.set(
          weight,
          new Style({
            stroke: new Stroke({
              color: look.color ?? group.color(properties),
              width: 1.2 * weight * look.widthScale,
            }),
          }),
        );
      }
      return cache.get(weight);
    };
  };
  const displays = HOVER_GROUPS.flatMap((group) => {
    const source = group.displaySource;
    if (!source || !tileJsons[source.source]) return [];
    const { source: tiles } = createHoverSource(
      martinUrl,
      source.source,
      source.sourceLayer,
      'line',
      tileJsons[source.source],
      () => undefined,
    );
    return [
      {
        group,
        layer: new VectorTileLayer({
          source: tiles,
          style: displayStyle(group),
          visible: false,
        }),
      },
    ];
  });

  const markLayers = Object.fromEntries(
    (['selected', 'hover'] as MarkName[]).map((name) => [
      name,
      {
        fill: new VectorLayer({ source: new VectorSource() }),
        stroke: new VectorLayer({ source: new VectorSource() }),
      },
    ]),
  ) as Record<MarkName, { fill: VectorLayer; stroke: VectorLayer }>;

  const tooltips: Record<MarkName, { element: HTMLElement; overlay: Overlay }> =
    {
      hover: (() => {
        const element = createTooltip(false);
        return {
          element,
          overlay: new Overlay({
            element,
            offset: [16, 16],
            positioning: 'top-left',
            stopEvent: false,
          }),
        };
      })(),
      selected: (() => {
        const element = createTooltip(true);
        return {
          element,
          overlay: new Overlay({
            element,
            offset: [14, 14],
            positioning: 'top-left',
            stopEvent: true,
          }),
        };
      })(),
    };
  olMap.addOverlay(tooltips.hover.overlay);
  olMap.addOverlay(tooltips.selected.overlay);

  const layerGroup = new LayerGroup({
    layers: [
      ...bands.map((b) => b.hit),
      ...displays.map((d) => d.layer),
      markLayers.selected.fill,
      markLayers.selected.stroke,
      markLayers.hover.fill,
      markLayers.hover.stroke,
    ],
    properties: { id: 'overlay.hover' },
  });

  const zoom = () => {
    const view = olMap.getView();
    return mapLibreZoomForView(view) ?? (view.getZoom() ?? 0) - 1;
  };

  // The tile zoom OL is showing for a source: finer or coarser leftovers in the
  // cache would draw a different outline, or find points twice.
  const sourceZ = ({ source }: HoverSource) => {
    const view = olMap.getView();
    const sourceResolution =
      (view.getResolution()! * view.getProjection().getMetersPerUnit()!) /
      getProjection(TILE_PROJECTION)!.getMetersPerUnit()!;
    return source
      .getTileGrid()!
      .getZForResolution(sourceResolution, source.zDirection);
  };

  // The marked feature's pieces on screen, each with the tile it came from.
  const piecesOf = (mark: Mark) => {
    const view = olMap.getView();
    const viewExtent = view.calculateExtent(olMap.getSize());
    const tileExtent = transformExtent(
      viewExtent,
      view.getProjection(),
      TILE_PROJECTION,
    );
    const z = sourceZ(mark.hoverSource);
    const { matches } = mark.hovered;
    return [...mark.hoverSource.tiles.values()]
      .filter((tile) => tile.z === z && intersects(tile.extent, tileExtent))
      .flatMap((tile) =>
        tile.features
          .filter((f) => matches(f.getProperties()))
          .map((feature) => ({ feature, extent: tile.extent })),
      );
  };

  const reprojects = () =>
    !equivalent(
      getProjection(TILE_PROJECTION)!,
      olMap.getView().getProjection(),
    );

  const toView = (feature: RenderFeature): Geometry => {
    // toGeometry shares the tile's coordinate array: transforming that in place
    // would reproject the cached tile again on every redraw.
    const geometry = toGeometry(feature.clone());
    if (reprojects()) {
      geometry.transform(TILE_PROJECTION, olMap.getView().getProjection());
    }
    return geometry;
  };

  // Beside the cursor, flipped to the other side near the map's right or bottom
  // edge so the card stays on screen.
  const placeTooltip = (name: MarkName, at: Coordinate) => {
    const { overlay } = tooltips[name];
    const pixel = olMap.getPixelFromCoordinate(at);
    const size = olMap.getSize();
    if (!pixel || !size) return overlay.setPosition(at);
    const left = pixel[0] > size[0] - TOOLTIP_ROOM[0];
    const up = pixel[1] > size[1] - TOOLTIP_ROOM[1];
    overlay.setPositioning(
      `${up ? 'bottom' : 'top'}-${left ? 'right' : 'left'}` as Positioning,
    );
    overlay.setOffset([left ? -16 : 16, up ? -16 : 16]);
    overlay.setPosition(at);
  };

  const showTooltip = (name: MarkName, at?: Coordinate) => {
    const mark = marks[name];
    const { element, overlay } = tooltips[name];
    // The pinned card already says it; don't repeat it under the cursor.
    const duplicate =
      name === 'hover' && mark?.hovered.key === marks.selected?.hovered.key;
    if (!mark || duplicate) {
      overlay.setPosition(undefined);
      return;
    }
    fillTooltip(
      element,
      mark,
      name === 'selected' ? () => setMark('selected', undefined) : undefined,
    );
    if (at) placeTooltip(name, at);
  };

  const drawMark = (name: MarkName) => {
    const mark = marks[name];
    const { fill, stroke } = markLayers[name];
    fill.getSource()!.clear();
    stroke.getSource()!.clear();
    if (!mark) return;
    if (name === 'hover' && mark.hovered.key === marks.selected?.hovered.key) {
      return; // drawn stronger as the selection
    }

    const strong = name === 'selected';
    const { kind } = mark.hoverSource;
    const styles = markStyles(
      kind,
      mark.color,
      strong,
      lookOf(mark.group).widthScale,
    );
    stroke.setStyle(styles.stroke);
    if (styles.fill) fill.setStyle(styles.fill);
    fill.setOpacity((mark.group.fillOpacity ?? 0.15) + (strong ? 0.12 : 0));

    if (mark.point) {
      stroke.getSource()!.addFeature(new Feature(new Point(mark.point)));
      return;
    }
    const pieces = piecesOf(mark);
    if (kind === 'line') {
      stroke
        .getSource()!
        .addFeatures(pieces.map(({ feature }) => new Feature(toView(feature))));
      return;
    }
    fill
      .getSource()!
      .addFeatures(pieces.map(({ feature }) => new Feature(toView(feature))));
    const project = reprojects()
      ? getTransform(TILE_PROJECTION, olMap.getView().getProjection())!
      : (c: number[]) => c;
    const outlines = pieces.flatMap(({ feature, extent }) =>
      outlineWithoutTileCuts(
        feature.getFlatCoordinates(),
        feature.getEnds() as number[],
        extent,
        feature.getStride(),
      ),
    );
    stroke
      .getSource()!
      .addFeature(
        new Feature(
          new MultiLineString(
            outlines.map((line) => line.map((c) => project(c))),
          ),
        ),
      );
  };

  const drawAll = () => {
    drawMark('selected');
    drawMark('hover');
  };

  const setCursor = (pointer: boolean) => {
    const target = olMap.getTargetElement();
    if (target) target.style.cursor = pointer ? 'pointer' : '';
  };

  const setMark = (name: MarkName, mark: Mark | undefined, at?: Coordinate) => {
    marks[name] = mark;
    drawAll();
    showTooltip(name, at);
    if (name === 'selected') showTooltip('hover');
    if (name === 'hover') setCursor(Boolean(mark));
  };

  // Points within POINT_HIT_PX of the cursor, nearest first.
  const findPoints = (pixel: number[]): Candidate[] => {
    const view = olMap.getView();
    const viewProjection = view.getProjection();
    const fromTiles = getTransform(TILE_PROJECTION, viewProjection)!;
    const [x, y] = olMap.getCoordinateFromPixel(pixel);
    const r = POINT_HIT_PX * view.getResolution()!;
    const box = transformExtent(
      [x - r, y - r, x + r, y + r],
      viewProjection,
      TILE_PROJECTION,
    );
    const found: (Candidate & { distance: number })[] = [];
    for (const { group, hoverSource, hit } of bands) {
      if (hoverSource.kind !== 'circle' || !hit.getVisible()) continue;
      const z = sourceZ(hoverSource);
      for (const tile of hoverSource.tiles.values()) {
        if (tile.z !== z || !intersects(tile.extent, box)) continue;
        for (const feature of tile.features) {
          const [fx, fy] = feature.getFlatCoordinates();
          if (fx < box[0] || fx > box[2] || fy < box[1] || fy > box[3]) {
            continue;
          }
          const properties = feature.getProperties();
          if (group.filter && !group.filter(properties)) continue;
          const point = fromTiles([fx, fy]);
          const [px, py] = olMap.getPixelFromCoordinate(point);
          const distance = Math.hypot(px - pixel[0], py - pixel[1]);
          if (distance <= POINT_HIT_PX) {
            found.push({ group, hoverSource, properties, point, distance });
          }
        }
      }
    }
    return found.sort((a, b) => a.distance - b.distance);
  };

  const markAt = (pixel: number[]): Mark | undefined => {
    const candidates = findPoints(pixel);
    olMap.forEachFeatureAtPixel(
      pixel,
      (feature, layer) => {
        const band = hitLayers.get(
          layer as VectorTileLayer<VectorTileSource<RenderFeature>>,
        );
        if (band) {
          candidates.push({
            group: band.group,
            hoverSource: band.hoverSource,
            properties: feature.getProperties(),
          });
        }
        return undefined;
      },
      {
        layerFilter: (layer) =>
          hitLayers.has(
            layer as VectorTileLayer<VectorTileSource<RenderFeature>>,
          ),
      },
    );
    const picked = pickFeature(candidates);
    if (!picked) return undefined;
    return {
      hovered: picked.group.describe(picked.properties, zoom()),
      group: picked.group,
      properties: picked.properties,
      hoverSource: picked.hoverSource,
      color: colorOf(picked.group, picked.properties),
      point: picked.point,
    };
  };

  const hoverAt = (pixel: number[]) => {
    const mark = markAt(pixel);
    const at = olMap.getCoordinateFromPixel(pixel);
    if (!mark) {
      if (marks.hover) setMark('hover', undefined);
      return;
    }
    if (marks.hover?.hovered.key === mark.hovered.key) {
      // Same feature: the card follows the cursor.
      if (mark.hovered.key !== marks.selected?.hovered.key) {
        placeTooltip('hover', at);
      }
      return;
    }
    setMark('hover', mark, at);
  };

  const selectAt = (pixel: number[]) => {
    const mark = markAt(pixel);
    setMark(
      'selected',
      mark,
      mark ? (mark.point ?? olMap.getCoordinateFromPixel(pixel)) : undefined,
    );
  };

  const clearAll = () => {
    cancelPending();
    if (marks.hover) setMark('hover', undefined);
    if (marks.selected) setMark('selected', undefined);
  };

  // Hit-testing takes from a few ms to a few hundred (new tiles), so it waits until
  // the pointer rests, and never runs with a button held: a drag (mouse or
  // trackpad) must have the main thread to itself.
  let pending: number[] | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancelPending = () => {
    pending = undefined;
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  const schedule = (event: unknown) => {
    if (!(event instanceof MapBrowserEvent)) return;
    const held = (event.originalEvent as PointerEvent).buttons > 0;
    if (event.dragging || held) return cancelPending();
    if (!layerGroup.getVisible() || activeGroups.size === 0) return;
    pending = event.pixel;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      if (pending) hoverAt(pending);
    }, HOVER_REST_MS);
  };
  // A press starts a drag or a click: drop the hover card, it would only be in the way.
  const onPress = () => {
    cancelPending();
    if (marks.hover) setMark('hover', undefined);
  };

  // A click (or a tap, on screens without hover) pins the card.
  const onClick = (event: unknown) => {
    if (!(event instanceof MapBrowserEvent)) return;
    if (!layerGroup.getVisible() || activeGroups.size === 0) return;
    selectAt(event.pixel);
  };

  let lastStatus = '';
  const reportStatus = () => {
    if (!onStatus) return;
    const z = zoom();
    const status: HoverStatus = {};
    for (const { group, band } of bands) {
      status[group.id] = (status[group.id] ?? false) || inBand(band, z);
    }
    const key = JSON.stringify(status);
    if (key === lastStatus) return;
    lastStatus = key;
    onStatus(status);
  };

  // Bands are cut by Mercator zoom, which in UTM depends on latitude as well as scale.
  const updateBands = () => {
    const z = zoom();
    for (const { group, band, hit } of bands) {
      hit.setVisible(activeGroups.has(group.id) && inBand(band, z));
    }
    for (const { group, layer } of displays) {
      const shown =
        activeGroups.has(group.id) &&
        lookOf(group).display &&
        bands.some((b) => b.group === group && inBand(b.band, z));
      layer.setVisible(shown);
      // Its filter depends on zoom (fylke vs kommune borders).
      if (shown && Math.floor(z) !== lastDisplayZoom) layer.changed();
    }
    lastDisplayZoom = Math.floor(z);
    reportStatus();
  };

  let lastDisplayZoom = -1;
  let viewKeys: EventsKey[] = [];
  const watchView = () => {
    unByKey(viewKeys);
    const view = olMap.getView();
    viewKeys = [
      view.on('change:resolution', updateBands) as EventsKey,
      view.on('change:center', updateBands) as EventsKey,
    ];
    updateBands();
  };
  watchView();

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && marks.selected) {
      setMark('selected', undefined);
    }
  };
  const onLeave = () => {
    cancelPending();
    if (marks.hover) setMark('hover', undefined);
  };

  const viewport = olMap.getViewport();
  viewport?.addEventListener('mouseleave', onLeave);
  document.addEventListener('keydown', onKey);
  const keys: EventsKey[] = [
    olMap.on('pointermove', schedule),
    olMap.on('pointerdown' as 'pointermove', onPress),
    olMap.on('singleclick', onClick),
    olMap.on('moveend', drawAll),
    // Projection changes swap in a new view.
    olMap.on('change:view', () => {
      clearAll();
      watchView();
    }),
    // Paused (a drawing tool is open): don't leave anything behind.
    layerGroup.on('change:visible', () => {
      if (!layerGroup.getVisible()) clearAll();
    }),
  ];

  /** The hover groups to make interactive, from the active Kartdetaljer. */
  const setActiveGroups = (groups: Set<string>) => {
    activeGroups = groups;
    updateBands();
    for (const name of ['hover', 'selected'] as MarkName[]) {
      const mark = marks[name];
      if (mark && !groups.has(mark.group.id)) setMark(name, undefined);
    }
  };

  const dispose = () => {
    unByKey(keys);
    unByKey(viewKeys);
    viewport?.removeEventListener('mouseleave', onLeave);
    document.removeEventListener('keydown', onKey);
    olMap.removeOverlay(tooltips.hover.overlay);
    olMap.removeOverlay(tooltips.selected.overlay);
    setCursor(false);
    cancelPending();
    if (redraw !== undefined) cancelAnimationFrame(redraw);
  };

  /** Each group's look, from the Kartdetaljer style settings. */
  const setGroupStyles = (styles: Record<string, GroupStyle>) => {
    groupStyles = styles;
    for (const { group, hoverSource, hit } of bands) {
      hit.setStyle(bandStyle(group, hoverSource.kind, lookOf(group)));
    }
    for (const { group, layer } of displays)
      layer.setStyle(displayStyle(group));
    updateBands();
    for (const mark of Object.values(marks)) {
      if (mark) mark.color = colorOf(mark.group, mark.properties);
    }
    drawAll();
    if (marks.hover) showTooltip('hover');
    if (marks.selected) showTooltip('selected');
  };

  return { layer: layerGroup, dispose, setActiveGroups, setGroupStyles };
};
