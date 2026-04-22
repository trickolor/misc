import type { RefObject } from "react";

export type ResizeCursorType =
    | 'ns-resize'
    | 'nesw-resize'
    | 'ew-resize'
    | 'nwse-resize';

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

export const RESIZE_CURSORS: ResizeCursorType[] = [
    'ns-resize',
    'nesw-resize',
    'ew-resize',
    'nwse-resize',
];

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

export const BASE_CURSOR_ANGLES: Record<(Corner | Side), number> = {
    'top-left': 135,
    'top-right': 45,
    'bottom-right': 135,
    'bottom-left': 45,
    'top': 0,
    'bottom': 0,
    'left': 90,
    'right': 90,
};

export const ANGLE_OFFSET = 8;

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

    isSelected: boolean;
    handleCanvasNodeSelect: () => void;
}