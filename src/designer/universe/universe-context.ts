import { createContext } from "react";
import { type ObjectStateUpdateFn } from "@/hooks/use-object-state";
import type { RefObject } from "react";

// ---------- //

export interface PanState {
    lastX: number; lastY: number;
    spaceHold: boolean;
    isPanning: boolean;
}

export interface CameraState {
    x: number; y: number;
    zoom: number;
}

export interface ContentBoundsState {
    left: number; right: number;
    top: number; bottom: number;
}

export interface ScrollbarDragState {
    isDragging: boolean; axis: 'x' | 'y' | null;
    startMouseX: number; startMouseY: number;
    startThumbX: number; startThumbY: number;
    thumbWidth: number; thumbHeight: number;
    trackWidth: number; trackHeight: number;
    minCameraX: number; minCameraY: number;
    maxCameraX: number; maxCameraY: number;
    panRangeX: number; panRangeY: number;
}

export type ViewportCursorType = 'grab' | 'grabbing' | 'auto';

// ---------- //

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;
export const ZOOM_INCREMENT = 1.1;
export const ZOOM_DECREMENT = 0.9;
export const SCROLL_SENSITIVITY = 0.2;
export const MIN_THUMB_SIZE = 20;
export const MAX_OFFSET = 4000;

export const DEFAULT_CONTENT_BOUNDS: ContentBoundsState = {
    left: -2000,
    right: 2000,
    top: -2000,
    bottom: 2000,
};

// ---------- //

export interface UniverseContextValue {
    cameraState: CameraState;
    updateCameraState: ObjectStateUpdateFn<CameraState>;

    contentBoundsState: ContentBoundsState;
    updateContentBoundsState: ObjectStateUpdateFn<ContentBoundsState>;

    panStateRef: RefObject<PanState>;

    vieportElementRef: RefObject<HTMLDivElement | null>;
    cameraElementRef: RefObject<HTMLDivElement | null>;

    scrollbarDragStateRef: RefObject<ScrollbarDragState>;

    horizontalScrollbarTrackElementRef: RefObject<HTMLDivElement | null>;
    horizontalScrollbarThumbElementRef: RefObject<HTMLSpanElement | null>;

    verticalScrollbarTrackElementRef: RefObject<HTMLDivElement | null>;
    verticalScrollbarThumbElementRef: RefObject<HTMLSpanElement | null>;
}

export const UniverseContext = createContext<UniverseContextValue | null>(null);