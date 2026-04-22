/**
 * Minimum vertical thickness (scene px) of a line node's bounding box. Gives
 * the Area a comfortable pointer-hit target even when the visible stroke is
 * very thin. Purely an interaction/hit-testing concern — the stroke itself
 * is drawn at `strokeWidth` centered inside this band.
 */
export const MIN_LINE_HIT_HEIGHT = 12;

export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_STROKE = '#FFFFFF';
export const DEFAULT_LINE_LENGTH = 160;

/**
 * Color of the selection overlay drawn on top of the line when the node is
 * hovered / selected / being dragged. Matches Tailwind's `sky-500` so it
 * looks consistent with the resize handles' border.
 */
export const SELECTION_OVERLAY_COLOR = '#0ea5e9';

/**
 * Extra px added to `strokeWidth` when drawing the selection overlay, so a
 * thin band of blue bleeds past the visible stroke on each side.
 */
export const SELECTION_OVERLAY_EXTRA_WIDTH = 2;
