import { BASE_CURSOR_ANGLES } from "../constants";
import type { Corner, Side } from "../types";

// ---------- //

const CURSOR_STYLE = 'fill="#000000" stroke="#ffffff" stroke-width="1.75" stroke-linejoin="round" paint-order="stroke"';

/**
 * All three cursors share the same visual "reach" from the hotspot: each tip
 * sits 9.5 units from the center of the 24×24 viewBox, and each arrowhead is
 * 9 units wide at the base (flange 4.5 perpendicular). The rotate cursors add
 * a curved body ({@link ROTATE_SVG} a 90° banana, {@link ENDPOINT_ROTATE_SVG}
 * a 180° banana) sized so that the tips land at the same `(x, 2.5)` /
 * `(x, 21.5)` positions as {@link RESIZE_SVG}'s arrowheads. The banana uses
 * outer radius 6.5, inner radius 3.5, and the same `3 / 6 / 9` shelf pattern
 * as Figma's cursors, so arrow shape is consistent across all three.
 */

const RESIZE_SVG = (rotation: number) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <g transform="rotate(${rotation} 12 12)" ${CURSOR_STYLE}>
    <path d="M12 2.5 L16.5 7 L13.5 7 L13.5 17 L16.5 17 L12 21.5 L7.5 17 L10.5 17 L10.5 7 L7.5 7 Z"/>
  </g>
</svg>`;

const ROTATE_SVG = (rotation: number) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <g transform="rotate(${rotation} 12 12)" ${CURSOR_STYLE}>
    <path d="M5.5 12 L2.5 12 L7 16.5 L11.5 12 L8.5 12 A3.5 3.5 0 0 1 12 8.5 L12 11.5 L16.5 7 L12 2.5 L12 5.5 A6.5 6.5 0 0 0 5.5 12 Z"/>
  </g>
</svg>`;

/**
 * Endpoint rotate cursor. Same visual language as {@link ROTATE_SVG} (single
 * filled banana whose outer boundary curls into an asymmetric arrowhead at
 * each end), but spanning a full 180° semicircle so both arrows sit at
 * opposite ends of the line's rotation axis.
 *
 * Authored with the banana bulging to the LEFT and the two arrow tips on
 * the vertical axis (top and bottom) — tips land at the same
 * `(12, 2.5)` / `(12, 21.5)` positions as {@link RESIZE_SVG}. Combine with
 * {@link "../constants".ENDPOINT_ROTATE_BASE_ANGLES} so the arc always ends
 * up on the outside of the line.
 */
const ENDPOINT_ROTATE_SVG = (rotation: number) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <g transform="rotate(${rotation} 12 12)" ${CURSOR_STYLE}>
    <path d="M12 5.5 L12 2.5 L16.5 7 L12 11.5 L12 8.5 A3.5 3.5 0 0 0 12 15.5 L12 12.5 L16.5 17 L12 21.5 L12 18.5 A6.5 6.5 0 0 1 12 5.5 Z"/>
  </g>
</svg>`;

// ---------- //

function toCursorUrl(svg: string, fallback: string): string {
    const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
    return `url("data:image/svg+xml;utf8,${encoded}") 12 12, ${fallback}`;
}

// ---------- //

const resizeCache = new Map<number, string>();
const rotateCache = new Map<number, string>();
const endpointRotateCache = new Map<number, string>();

function normalizeAngle(angle: number): number {
    return ((Math.round(angle) % 360) + 360) % 360;
}

// ---------- //

export function getResizeCursor(position: Corner | Side, rotation: number): string {
    const baseAngle = BASE_CURSOR_ANGLES[position] ?? 0;
    const angle = normalizeAngle(baseAngle + rotation);

    const cached = resizeCache.get(angle);
    if (cached) return cached;

    const value = toCursorUrl(RESIZE_SVG(angle), "ew-resize");
    resizeCache.set(angle, value);
    return value;
}

/**
 * Corner rotate cursor (two arrows 90° apart, quadrant arc). Intended for
 * rectangular-node corner handles.
 *
 * @param baseAngle - degrees. `0` corresponds to the top-left corner authored
 *   in {@link ROTATE_SVG}; callers look up per-handle base angles from
 *   {@link CORNER_ROTATE_BASE_ANGLES}.
 * @param rotation - the node's current rotation in degrees, so the cursor
 *   tracks the node as it rotates.
 */
export function getRotateCursor(baseAngle: number, rotation: number): string {
    const angle = normalizeAngle(baseAngle + rotation);

    const cached = rotateCache.get(angle);
    if (cached) return cached;

    const value = toCursorUrl(ROTATE_SVG(angle), "alias");
    rotateCache.set(angle, value);
    return value;
}

/**
 * Endpoint rotate cursor (two arrows 180° apart, semicircular arc). Intended
 * for line-like nodes where the tangent to rotation at the endpoint is a
 * single axis; callers supply per-endpoint base angles from
 * {@link ENDPOINT_ROTATE_BASE_ANGLES}.
 */
export function getEndpointRotateCursor(baseAngle: number, rotation: number): string {
    const angle = normalizeAngle(baseAngle + rotation);

    const cached = endpointRotateCache.get(angle);
    if (cached) return cached;

    const value = toCursorUrl(ENDPOINT_ROTATE_SVG(angle), "alias");
    endpointRotateCache.set(angle, value);
    return value;
}
