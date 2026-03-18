import { useEventListener } from "@/hooks/use-event-listener";
import { useStrictContext } from "@/hooks/use-strict-context";
import { useKeyPress } from "@/hooks/use-key-press";

import { UniverseContext, MIN_ZOOM, MAX_ZOOM, ZOOM_INCREMENT, ZOOM_DECREMENT } from "./universe-context";

// ---------- //

interface UseUniverseZoomOptions {
    clampX: (x: number, zoom: number) => number;
    clampY: (y: number, zoom: number) => number;
}

// ---------- //

export function useUniverseZoom({ clampX, clampY }: UseUniverseZoomOptions): void {
    const { vieportElementRef, updateCameraState } = useStrictContext(UniverseContext);

    const applyZoom = (cursorX: number, cursorY: number, zoomFactor: number) => {
        updateCameraState(prev => {
            const sceneX = (cursorX - prev.x) / prev.zoom;
            const sceneY = (cursorY - prev.y) / prev.zoom;
            const newZoom = Math.min(Math.max(prev.zoom * zoomFactor, MIN_ZOOM), MAX_ZOOM);

            return {
                zoom: newZoom,
                x: clampX(cursorX - sceneX * newZoom, newZoom),
                y: clampY(cursorY - sceneY * newZoom, newZoom),
            };
        });
    };

    // ---------- //

    useEventListener({
        event: 'wheel',
        eventListenerOptions: { passive: false },
        handler: (e: WheelEvent) => {
            if (!e.ctrlKey) return;

            e.preventDefault();

            if (!vieportElementRef.current) return;
            const rect = vieportElementRef.current.getBoundingClientRect();

            applyZoom(
                e.clientX - rect.left,
                e.clientY - rect.top,
                e.deltaY < 0 ? ZOOM_INCREMENT : ZOOM_DECREMENT,
            );
        },
    });

    useKeyPress(['+', '-', '=', '0'], (e) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();

        if (!vieportElementRef.current) return;
        const rect = vieportElementRef.current.getBoundingClientRect();

        switch (e.key) {
            case '+':
            case '=': applyZoom(rect.width / 2, rect.height / 2, ZOOM_INCREMENT); break;
            case '-': applyZoom(rect.width / 2, rect.height / 2, ZOOM_DECREMENT); break;
            case '0': updateCameraState({ x: 0, y: 0, zoom: 1 }); break;
            default: break;
        }
    });
}