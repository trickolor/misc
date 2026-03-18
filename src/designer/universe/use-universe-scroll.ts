import { useCallback } from "react";
import { useEventListener } from "@/hooks/use-event-listener";
import { useStrictContext } from "@/hooks/use-strict-context";

import { UniverseContext, MAX_OFFSET, type ContentBoundsState } from "./universe-context";

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

// ---------- //

interface UseUniverseScrollResult {
    handleThumbX: (e: React.MouseEvent<HTMLSpanElement>) => void;
    handleThumbY: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

// ---------- //

export function useUniverseScroll(): UseUniverseScrollResult {
    const {
        cameraState,
        updateCameraState,
        contentBoundsState,
        scrollbarDragStateRef,
        horizontalScrollbarTrackElementRef,
        horizontalScrollbarThumbElementRef,
        verticalScrollbarTrackElementRef,
        verticalScrollbarThumbElementRef,
    } = useStrictContext(UniverseContext);

    // ---------- //

    const handleThumbMouseDown = useCallback((e: React.MouseEvent<HTMLSpanElement>, axis: 'x' | 'y') => {
        e.preventDefault();
        e.stopPropagation();

        const params = [
            horizontalScrollbarTrackElementRef,
            verticalScrollbarTrackElementRef,
            horizontalScrollbarThumbElementRef,
            verticalScrollbarThumbElementRef,
        ].map((ref) => ref.current);

        if (params.some((ref) => !ref)) return;

        const [
            hTrackRect,
            vTrackRect,
            hThumbRect,
            vThumbRect,
        ] = params.map((ref) => ref!.getBoundingClientRect());

        const {
            minX,
            maxX,
            panRangeX
        } = getPanBoundsX(
            cameraState.zoom,
            hTrackRect.width,
            contentBoundsState,
        );

        const {
            minY,
            maxY,
            panRangeY,
        } = getPanBoundsY(
            cameraState.zoom,
            vTrackRect.height,
            contentBoundsState,
        );

        scrollbarDragStateRef.current = {
            isDragging: true, axis,
            startMouseX: e.clientX, startMouseY: e.clientY,
            startThumbX: hThumbRect.left - hTrackRect.left,
            startThumbY: vThumbRect.top - vTrackRect.top,
            thumbWidth: hThumbRect.width, thumbHeight: vThumbRect.height,
            trackWidth: hTrackRect.width, trackHeight: vTrackRect.height,
            minCameraX: minX, minCameraY: minY,
            maxCameraX: maxX, maxCameraY: maxY,
            panRangeX, panRangeY,
        };
    }, [
        cameraState.zoom,
        contentBoundsState,
        scrollbarDragStateRef,
        horizontalScrollbarTrackElementRef,
        horizontalScrollbarThumbElementRef,
        verticalScrollbarTrackElementRef,
        verticalScrollbarThumbElementRef,
    ]);

    // ---------- //

    useEventListener({
        event: 'mousemove',
        handler: (e: MouseEvent) => {
            const drag = scrollbarDragStateRef.current;
            if (!drag.isDragging) return;

            if (drag.axis === 'x') {
                const mouseDeltaX = e.clientX - drag.startMouseX;

                const newThumbX = Math.min(
                    Math.max(0, drag.startThumbX + mouseDeltaX),
                    drag.trackWidth - drag.thumbWidth,
                );

                const scrollProgress = (drag.trackWidth - drag.thumbWidth) > 0
                    ? newThumbX / (drag.trackWidth - drag.thumbWidth)
                    : 0;

                updateCameraState({
                    x: drag.maxCameraX - scrollProgress * drag.panRangeX,
                });
            }

            if (drag.axis === 'y') {
                const mouseDeltaY = e.clientY - drag.startMouseY;

                const newThumbY = Math.min(
                    Math.max(0, drag.startThumbY + mouseDeltaY),
                    drag.trackHeight - drag.thumbHeight,
                );

                const scrollProgress = (drag.trackHeight - drag.thumbHeight) > 0
                    ? newThumbY / (drag.trackHeight - drag.thumbHeight)
                    : 0;

                updateCameraState({
                    y: drag.maxCameraY - scrollProgress * drag.panRangeY,
                });
            }
        },
    });

    useEventListener({
        event: 'mouseup',
        handler: () => {
            scrollbarDragStateRef.current.isDragging = false;
            scrollbarDragStateRef.current.axis = null;
        },
    });

    // ---------- //

    const handleThumbX = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
        handleThumbMouseDown(e, 'x');
    }, [handleThumbMouseDown]);

    const handleThumbY = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
        handleThumbMouseDown(e, 'y');
    }, [handleThumbMouseDown]);

    return { handleThumbX, handleThumbY };
}