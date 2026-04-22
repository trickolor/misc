import { MAX_OFFSET, MIN_THUMB_SIZE } from "../constants";
import type { CameraState, ContentBoundsState } from "../types";

/**
 * Given a zoom level, viewport width, and the universe's content bounds,
 * returns the allowed camera-X range plus the total panable range along X.
 * Used both to clamp the camera while panning and to size/position the
 * horizontal scrollbar thumb.
 */
export function getPanBoundsX(zoom: number, width: number, bounds: ContentBoundsState) {
    const maxX = -(bounds.left - MAX_OFFSET) * zoom;
    const minX = -((bounds.right + MAX_OFFSET) * zoom - width);
    const panRangeX = Math.max(0, maxX - minX);
    return { minX, maxX, panRangeX };
}

/**
 * Y-axis counterpart of `getPanBoundsX`.
 */
export function getPanBoundsY(zoom: number, height: number, bounds: ContentBoundsState) {
    const maxY = -(bounds.top - MAX_OFFSET) * zoom;
    const minY = -((bounds.bottom + MAX_OFFSET) * zoom - height);
    const panRangeY = Math.max(0, maxY - minY);
    return { minY, maxY, panRangeY };
}

/**
 * Computes the horizontal scrollbar thumb geometry for the current camera
 * state. Returns `visible: false` when content fits entirely inside the
 * viewport (no pan range).
 */
export function getThumbX(trackWidth: number, cameraState: CameraState, bounds: ContentBoundsState) {
    const { maxX, panRangeX } = getPanBoundsX(cameraState.zoom, trackWidth, bounds);
    if (panRangeX === 0) return { thumbWidth: 0, thumbX: 0, visible: false };
    const thumbWidth = Math.max(MIN_THUMB_SIZE, trackWidth * trackWidth / (trackWidth + panRangeX));
    const scrollProgress = Math.min(1, Math.max(0, (maxX - cameraState.x) / panRangeX));
    return { thumbWidth, thumbX: scrollProgress * (trackWidth - thumbWidth), visible: true };
}

/**
 * Y-axis counterpart of `getThumbX`.
 */
export function getThumbY(trackHeight: number, cameraState: CameraState, bounds: ContentBoundsState) {
    const { maxY, panRangeY } = getPanBoundsY(cameraState.zoom, trackHeight, bounds);
    if (panRangeY === 0) return { thumbHeight: 0, thumbY: 0, visible: false };
    const thumbHeight = Math.max(MIN_THUMB_SIZE, trackHeight * trackHeight / (trackHeight + panRangeY));
    const scrollProgress = Math.min(1, Math.max(0, (maxY - cameraState.y) / panRangeY));
    return { thumbHeight, thumbY: scrollProgress * (trackHeight - thumbHeight), visible: true };
}
