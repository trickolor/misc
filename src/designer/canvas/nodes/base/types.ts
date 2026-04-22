import type { CSSProperties, RefObject } from "react";

export type Corner =
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';

export type Side =
    | 'top'
    | 'bottom'
    | 'left'
    | 'right';

/**
 * Endpoint of a one-dimensional (line-like) node.
 * - `start` corresponds to the local left edge midpoint `(0, height/2)`.
 * - `end` corresponds to the local right edge midpoint `(width, height/2)`.
 */
export type Endpoint = 'start' | 'end';

/**
 * Lifecycle status of a canvas node, ordered by priority:
 * `drag` > `selected` > `hover` > `idle`.
 *
 * - `idle`: not selected, not hovered.
 * - `hover`: hovered (but not selected).
 * - `selected`: selected; pointer may also be held down, but no movement yet.
 * - `drag`: actively being manipulated (drag / resize / rotate). Registered
 *   only once the pointer has actually moved after mousedown; plain
 *   click-and-hold stays in `selected`.
 */
export type CanvasNodeStatus = 'idle' | 'hover' | 'selected' | 'drag';

export interface CanvasNodeBaseContext {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    rotation: number;

    areaElementRef: RefObject<HTMLDivElement | null>;

    status: CanvasNodeStatus;

    handleCanvasNodeSelect: () => void;
    setIsDragging: (value: boolean) => void;
}

/**
 * Anchor-axis sign for a given resize handle. `sx`/`sy` are in `{-1, 0, +1}`
 * and describe which corner/edge stays fixed while the opposite one moves.
 */
export interface AnchorSign {
    sx: number;
    sy: number;
}

/**
 * CSS properties used to position the `SizeIndicator` wrapper, keyed by the
 * side of the node it is currently anchored to.
 */
export type SideCssProperties = Record<Side, CSSProperties>;
