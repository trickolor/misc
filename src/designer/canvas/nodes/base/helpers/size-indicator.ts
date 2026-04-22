import type { Side } from "../types";

/**
 * Picks the local side of a rotated node whose midpoint currently maps to
 * the bottom of the screen, so the `SizeIndicator` badge never ends up
 * above the node.
 *
 * @param rotation Node rotation in degrees (clockwise positive).
 * @returns `side` — the local side to anchor to; `quadrant` — the number of
 * 90° CW steps between that side and the node's local bottom (0..3).
 */
export function getScreenBottomSide(rotation: number): { side: Side; quadrant: number } {
    const normalized = ((rotation % 360) + 360) % 360;
    const quadrant = Math.round(normalized / 90) % 4;
    const side = (['bottom', 'right', 'top', 'left'] as const)[quadrant];
    return { side, quadrant };
}
