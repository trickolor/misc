import type { AnchorSign, Corner, Endpoint, Side, SideCssProperties } from "./types";

// ---------- geometry ---------- //

export const CORNERS: Corner[] = [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
];

export const SIDES: Side[] = [
    'top',
    'bottom',
    'left',
    'right',
];

export const ENDPOINTS: Endpoint[] = ['start', 'end'];

export const ANGLE_OFFSET = 4;

/**
 * Side length (px) of the transparent rotate hit zone rendered by
 * {@link "./impl".EndpointRotation} around each endpoint. Must be larger
 * than the resize handle inside it; the annular difference is the rotate
 * hit region (Figma-style).
 */
export const ENDPOINT_ROTATION_SIZE = 20;

// ---------- cursor orientation ---------- //

/**
 * Base rotation (degrees) of the straight-arrow resize cursor for each
 * handle position. 0° is a vertical (ns) arrow, 90° is horizontal (ew).
 */
export const BASE_CURSOR_ANGLES: Record<Corner | Side, number> = {
    'top': 0,
    'bottom': 0,
    'left': 90,
    'right': 90,
    'top-left': 135,
    'top-right': 45,
    'bottom-right': 135,
    'bottom-left': 45,
};

/**
 * Base rotation (degrees) of the curved-arrow rotate cursor for each corner.
 * The SVG is authored so that 0° corresponds to the top-left corner; rotating
 * 90° clockwise walks around to top-right, bottom-right, bottom-left.
 */
export const CORNER_ROTATE_BASE_ANGLES: Record<Corner, number> = {
    'top-left': 0,
    'top-right': 90,
    'bottom-right': 180,
    'bottom-left': 270,
};

/**
 * Base rotation (degrees) of the rotate cursor at each line endpoint. Mirror
 * symmetric across the line's center so the cursor's arc always appears on
 * the "outside" of the node:
 *   - `start` uses the top-left corner framing  (arc in upper-left quadrant)
 *   - `end`   uses the bottom-right corner framing (arc in lower-right)
 *
 * The pair rotates together with the node so the cursor visually follows
 * the endpoint it sits on.
 */
export const ENDPOINT_ROTATE_BASE_ANGLES: Record<Endpoint, number> = {
    start: 0,
    end: 180,
};

// ---------- resize anchors ---------- //

export const MIN_NODE_SIZE = 10;

export const ANCHOR_SIGNS: Record<Corner | Side, AnchorSign> = {
    'top-left': { sx: 1, sy: 1 },
    'top-right': { sx: -1, sy: 1 },
    'bottom-left': { sx: 1, sy: -1 },
    'bottom-right': { sx: -1, sy: -1 },
    'top': { sx: 0, sy: 1 },
    'bottom': { sx: 0, sy: -1 },
    'left': { sx: 1, sy: 0 },
    'right': { sx: -1, sy: 0 },
};

// ---------- rotation ---------- //

export const ROTATION_SNAP_DEGREES = 15;

// ---------- size indicator ---------- //

export const SIZE_INDICATOR_OFFSET = 4;

export const SIZE_INDICATOR_WRAPPER_POSITIONS: SideCssProperties = {
    bottom: { left: '50%', top: '100%' },
    right:  { left: '100%', top: '50%' },
    top:    { left: '50%', top: 0 },
    left:   { left: 0, top: '50%' },
};

export const SIZE_INDICATOR_WRAPPER_OFFSETS: Record<Side, string> = {
    bottom: `translateY(${SIZE_INDICATOR_OFFSET}px)`,
    right:  `translateX(${SIZE_INDICATOR_OFFSET}px)`,
    top:    `translateY(-${SIZE_INDICATOR_OFFSET}px)`,
    left:   `translateX(-${SIZE_INDICATOR_OFFSET}px)`,
};
