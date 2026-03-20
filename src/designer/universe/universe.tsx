import { useMemo, useRef, type ReactNode } from "react";
import { useObjectState } from "@/hooks/use-object-state";
import { useStrictContext } from "@/hooks/use-strict-context";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { useMemoizedObject } from "@/hooks/use-memoized-object";
import { cn } from "@/utils/cn";

import { useUniverseScroll } from "./use-universe-scroll";
import { useUniverseZoom } from "./use-universe-zoom";
import { useUniversePan } from "./use-universe-pan";

import {
    UniverseContext,
    DEFAULT_CONTENT_BOUNDS,
    MAX_OFFSET,
    MIN_THUMB_SIZE,
    type CameraState,
    type ContentBoundsState,
    type PanState,
    type ScrollbarDragState,
    type UniverseContextValue,
} from "./universe-context";


// ---------- //

function getPanBoundsX(zoom: number, width: number, bounds: ContentBoundsState) {
    const maxX = -(bounds.left - MAX_OFFSET) * zoom;
    const minX = -((bounds.right + MAX_OFFSET) * zoom - width);
    const panRangeX = Math.max(0, maxX - minX);
    return { minX, maxX, panRangeX };
}

function getPanBoundsY(zoom: number, height: number, bounds: ContentBoundsState) {
    const maxY = -(bounds.top - MAX_OFFSET) * zoom;
    const minY = -((bounds.bottom + MAX_OFFSET) * zoom - height);
    const panRangeY = Math.max(0, maxY - minY);
    return { minY, maxY, panRangeY };
}

function getThumbX(trackWidth: number, cameraState: CameraState, bounds: ContentBoundsState) {
    const { maxX, panRangeX } = getPanBoundsX(cameraState.zoom, trackWidth, bounds);
    if (panRangeX === 0) return { thumbWidth: 0, thumbX: 0, visible: false };
    const thumbWidth = Math.max(MIN_THUMB_SIZE, trackWidth * trackWidth / (trackWidth + panRangeX));
    const scrollProgress = Math.min(1, Math.max(0, (maxX - cameraState.x) / panRangeX));
    return { thumbWidth, thumbX: scrollProgress * (trackWidth - thumbWidth), visible: true };
}

function getThumbY(trackHeight: number, cameraState: CameraState, bounds: ContentBoundsState) {
    const { maxY, panRangeY } = getPanBoundsY(cameraState.zoom, trackHeight, bounds);
    if (panRangeY === 0) return { thumbHeight: 0, thumbY: 0, visible: false };
    const thumbHeight = Math.max(MIN_THUMB_SIZE, trackHeight * trackHeight / (trackHeight + panRangeY));
    const scrollProgress = Math.min(1, Math.max(0, (maxY - cameraState.y) / panRangeY));
    return { thumbHeight, thumbY: scrollProgress * (trackHeight - thumbHeight), visible: true };
}

// ---------- //

interface UniverseProps {
    children?: ReactNode;
}

function Root({ children }: UniverseProps) {
    const vieportElementRef = useRef<HTMLDivElement | null>(null);
    const cameraElementRef = useRef<HTMLDivElement | null>(null);

    const horizontalScrollbarTrackElementRef = useRef<HTMLDivElement | null>(null);
    const horizontalScrollbarThumbElementRef = useRef<HTMLSpanElement | null>(null);
    const verticalScrollbarTrackElementRef = useRef<HTMLDivElement | null>(null);
    const verticalScrollbarThumbElementRef = useRef<HTMLSpanElement | null>(null);

    const scrollbarDragStateRef = useRef<ScrollbarDragState>({
        isDragging: false, axis: null,
        startMouseX: 0, startMouseY: 0,
        startThumbX: 0, startThumbY: 0,
        thumbWidth: 0, thumbHeight: 0,
        trackWidth: 0, trackHeight: 0,
        minCameraX: 0, minCameraY: 0,
        maxCameraX: 0, maxCameraY: 0,
        panRangeX: 0, panRangeY: 0,
    });

    const [cameraState, updateCameraState] = useObjectState<CameraState>({ x: 0, y: 0, zoom: 1 });
    const [contentBoundsState, updateContentBoundsState] = useObjectState<ContentBoundsState>(DEFAULT_CONTENT_BOUNDS);
    const panStateRef = useRef<PanState>({ lastX: 0, lastY: 0, spaceHold: false, isPanning: false });

    // ---------- //

    const contextValue: UniverseContextValue = useMemoizedObject({
        cameraState,
        updateCameraState,
        contentBoundsState,
        updateContentBoundsState,
        panStateRef,
        vieportElementRef,
        cameraElementRef,
        scrollbarDragStateRef,
        horizontalScrollbarTrackElementRef,
        horizontalScrollbarThumbElementRef,
        verticalScrollbarTrackElementRef,
        verticalScrollbarThumbElementRef,
    });

    return (
        <UniverseContext.Provider value={contextValue}>
            {children}
        </UniverseContext.Provider>
    );
}

// ---------- //

interface ViewportProps {
    children?: ReactNode;
}

function Viewport({ children }: ViewportProps) {
    const { vieportElementRef, contentBoundsState } = useStrictContext(UniverseContext);

    const getViewportSize = () => {
        const rect = vieportElementRef.current?.getBoundingClientRect();
        return { width: rect?.width ?? 0, height: rect?.height ?? 0 };
    };

    const clampX = (x: number, zoom: number) => {
        const { width } = getViewportSize();
        const { minX, maxX } = getPanBoundsX(zoom, width, contentBoundsState);
        return Math.min(maxX, Math.max(minX, x));
    };

    const clampY = (y: number, zoom: number) => {
        const { height } = getViewportSize();
        const { minY, maxY } = getPanBoundsY(zoom, height, contentBoundsState);
        return Math.min(maxY, Math.max(minY, y));
    };

    const { cursorType, handleViewport } = useUniversePan({ clampX, clampY });
    useUniverseZoom({ clampX, clampY });

    return (
        <div
            onMouseDown={handleViewport}
            data-cursor={cursorType}
            data-component="viewport"
            className={cn(
                'size-full relative overflow-hidden bg-zinc-900',
                'data-[cursor=grabbing]:cursor-grabbing',
                'data-[cursor=grab]:cursor-grab',
                'data-[cursor=auto]:cursor-auto',
            )}
            ref={vieportElementRef}
        >
            {children}
        </div>
    );
}

// ---------- //

interface CameraProps {
    children?: ReactNode;
}

function Camera({ children }: CameraProps) {
    const { cameraElementRef, cameraState } = useStrictContext(UniverseContext);

    const transform = useMemo(() => {
        return `translate(${cameraState.x}px, ${cameraState.y}px) scale(${cameraState.zoom})`;
    }, [cameraState]);

    return (
        <div
            data-component="camera"
            className={cn('size-0 absolute top-0 left-0 origin-top-left')}
            style={{ transform }}
            ref={cameraElementRef}
        >
            {children}
        </div>
    );
}


// ---------- //

interface HorizontalScrollbarTrackProps {
    children?: ReactNode;
    className?: string;
}

function HorizontalScrollbarTrack({ children, className }: HorizontalScrollbarTrackProps) {
    const { horizontalScrollbarTrackElementRef } = useStrictContext(UniverseContext);

    return (
        <div
            data-component="horizontal-scrollbar-track"
            className={cn('w-full h-2 absolute z-50 bottom-0 left-0', className)}
            ref={horizontalScrollbarTrackElementRef}
        >
            {children}
        </div>
    );
}

interface HorizontalScrollbarThumbProps {
    className?: string;
}

function HorizontalScrollbarThumb({ className }: HorizontalScrollbarThumbProps) {
    const {
        cameraState,
        contentBoundsState,
        horizontalScrollbarThumbElementRef,
        horizontalScrollbarTrackElementRef,
    } = useStrictContext(UniverseContext);

    const [trackWidth] = useResizeObserver({ ref: horizontalScrollbarTrackElementRef });
    const { handleThumbX } = useUniverseScroll();

    const { thumbWidth, thumbX, visible } = useMemo(() => {
        return getThumbX(trackWidth ?? 0, cameraState, contentBoundsState);
    }, [trackWidth, cameraState, contentBoundsState]);

    if (!visible) return null;

    return (
        <span
            onMouseDown={handleThumbX}
            data-component="horizontal-scrollbar-thumb"
            className={cn('rounded-full h-full bg-zinc-100 absolute top-0', className)}
            style={{ width: thumbWidth, left: thumbX }}
            ref={horizontalScrollbarThumbElementRef}
        />
    );
}

// ---------- //

interface VerticalScrollbarTrackProps {
    children?: ReactNode;
    className?: string;
}

function VerticalScrollbarTrack({ children, className }: VerticalScrollbarTrackProps) {
    const { verticalScrollbarTrackElementRef } = useStrictContext(UniverseContext);

    return (
        <div
            data-component="vertical-scrollbar-track"
            className={cn('h-full w-2 absolute z-50 right-0 top-0', className)}
            ref={verticalScrollbarTrackElementRef}
        >
            {children}
        </div>
    );
}

interface VerticalScrollbarThumbProps {
    className?: string;
}

function VerticalScrollbarThumb({ className }: VerticalScrollbarThumbProps) {
    const {
        cameraState,
        contentBoundsState,
        verticalScrollbarThumbElementRef,
        verticalScrollbarTrackElementRef,
    } = useStrictContext(UniverseContext);

    const [, trackHeight] = useResizeObserver({ ref: verticalScrollbarTrackElementRef });
    const { handleThumbY } = useUniverseScroll();

    const { thumbHeight, thumbY, visible } = useMemo(() => {
        return getThumbY(trackHeight ?? 0, cameraState, contentBoundsState);
    }, [trackHeight, cameraState, contentBoundsState]);

    if (!visible) return null;

    return (
        <span
            onMouseDown={handleThumbY}
            data-component="vertical-scrollbar-thumb"
            className={cn('rounded-full w-full bg-zinc-100 absolute left-0', className)}
            style={{ height: thumbHeight, top: thumbY }}
            ref={verticalScrollbarThumbElementRef}
        />
    );
}

// ---------- //

Root.displayName = 'Universe.Root';
Viewport.displayName = 'Universe.Viewport';
Camera.displayName = 'Universe.Camera';
HorizontalScrollbarTrack.displayName = 'Universe.HorizontalScrollbarTrack';
HorizontalScrollbarThumb.displayName = 'Universe.HorizontalScrollbarThumb';
VerticalScrollbarTrack.displayName = 'Universe.VerticalScrollbarTrack';
VerticalScrollbarThumb.displayName = 'Universe.VerticalScrollbarThumb';

export const Universe = Object.assign(Root, {
    Viewport,
    Camera,
    HorizontalScrollbarTrack,
    HorizontalScrollbarThumb,
    VerticalScrollbarTrack,
    VerticalScrollbarThumb,
});
