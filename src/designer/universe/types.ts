import type { RefObject } from "react";
import type { ObjectStateUpdateFn } from "@/hooks/use-object-state";

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
