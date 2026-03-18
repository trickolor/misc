import { useCallback, useState } from "react";
import { useEventListener } from "@/hooks/use-event-listener";
import { useStrictContext } from "@/hooks/use-strict-context";
import { useKeyPress } from "@/hooks/use-key-press";

import { UniverseContext, SCROLL_SENSITIVITY, type ViewportCursorType } from "./universe-context";

// ---------- //

interface UseUniversePanOptions {
    clampX: (x: number, zoom: number) => number;
    clampY: (y: number, zoom: number) => number;
}

interface UseUniversePanResult {
    cursorType: ViewportCursorType;
    handleViewport: (e: React.MouseEvent<HTMLDivElement>) => void;
}

// ---------- //

export function useUniversePan({ clampX, clampY }: UseUniversePanOptions): UseUniversePanResult {
    const { panStateRef, updateCameraState } = useStrictContext(UniverseContext);

    const [cursorType, setCursorType] = useState<ViewportCursorType>('auto');

    const updateCursorType = useCallback(() => {
        if (panStateRef.current.isPanning) setCursorType('grabbing');
        else if (panStateRef.current.spaceHold) setCursorType('grab');
        else setCursorType('auto');
    }, [panStateRef]);

    // ---------- //

    useKeyPress(' ', () => {
        panStateRef.current.spaceHold = true;
        updateCursorType();
    });

    useKeyPress(' ', () => {
        panStateRef.current.spaceHold = false;
        updateCursorType();
    }, { eventType: 'keyup' });

    // ---------- //

    useEventListener({
        event: 'mousemove',
        handler: (e: MouseEvent) => {
            if (!panStateRef.current.isPanning) return;

            const deltaX = e.clientX - panStateRef.current.lastX;
            const deltaY = e.clientY - panStateRef.current.lastY;
            panStateRef.current.lastX = e.clientX;
            panStateRef.current.lastY = e.clientY;

            updateCameraState(prev => ({
                x: clampX(prev.x + deltaX, prev.zoom),
                y: clampY(prev.y + deltaY, prev.zoom),
            }));
        },
    });

    useEventListener({
        event: 'mouseup',
        handler: () => {
            panStateRef.current.isPanning = false;
            updateCursorType();
        },
    });

    useEventListener({
        event: 'wheel',
        eventListenerOptions: { passive: false },
        handler: (e: WheelEvent) => {
            if (e.ctrlKey) return;
            e.preventDefault();

            updateCameraState(prev => ({
                x: clampX(prev.x - e.deltaX * SCROLL_SENSITIVITY, prev.zoom),
                y: clampY(prev.y - e.deltaY * SCROLL_SENSITIVITY, prev.zoom),
            }));
        },
    });

    // ---------- //

    const handleViewport = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button === 1 || (e.button === 0 && panStateRef.current.spaceHold)) {
            panStateRef.current.isPanning = true;
            panStateRef.current.lastX = e.clientX;
            panStateRef.current.lastY = e.clientY;
            updateCursorType();
        }
    }, [panStateRef, updateCursorType]);

    return { cursorType, handleViewport };
}