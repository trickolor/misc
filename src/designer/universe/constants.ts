import type { ContentBoundsState } from "./types";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;
export const ZOOM_INCREMENT = 1.1;
export const ZOOM_DECREMENT = 0.9;
export const SCROLL_SENSITIVITY = 0.5;
export const MIN_THUMB_SIZE = 20;
export const MAX_OFFSET = 4000;
export const ARROW_KEY_PAN_STEP = 20;
export const SHIFT_ARROW_KEY_PAN_STEP = 100;

export const DEFAULT_CONTENT_BOUNDS: ContentBoundsState = {
    left: -2000,
    right: 2000,
    top: -2000,
    bottom: 2000,
};
