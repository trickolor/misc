import { useCallback, useRef } from "react";

import { UniverseContext } from "@/designer/universe/universe-context";
import { RootContext } from "@/designer/root/root-context";
import { useStrictContext } from "@/hooks/use-strict-context";
import { useEventListener } from "@/hooks/use-event-listener";

import { CanvasNodeBaseImpl } from "../impl";

interface CanvasNodeDragState {
    isDragging: boolean;
    startMouseX: number;
    startMouseY: number;
    startNodeX: number;
    startNodeY: number;
}

interface UseCanvasNodeDragResult {
    handleCanvasNodeDrag: (e: React.MouseEvent<HTMLOrSVGElement>) => void;
}

export function useCanvasNodeDrag(): UseCanvasNodeDragResult {
    const { id, x, y } = useStrictContext(CanvasNodeBaseImpl.Context);
    const { cameraState } = useStrictContext(UniverseContext)
    const { updateNode } = useStrictContext(RootContext);

    const dragRef = useRef<CanvasNodeDragState>({
        isDragging: false,
        startMouseX: 0,
        startMouseY: 0,
        startNodeX: 0,
        startNodeY: 0,
    });

    // ---------- //

    useEventListener({
        event: 'mousemove',
        handler: (e: MouseEvent) => {
            if (!dragRef.current.isDragging) return;

            const {
                startMouseX,
                startMouseY,
                startNodeX,
                startNodeY,
            } = dragRef.current;

            const sceneDeltaX = (e.clientX - startMouseX) / cameraState.zoom
            const sceneDeltaY = (e.clientY - startMouseY) / cameraState.zoom

            updateNode(id, {
                x: startNodeX + sceneDeltaX,
                y: startNodeY + sceneDeltaY,
            });
        },
    });

    useEventListener({
        event: 'mouseup',
        handler: () => dragRef.current.isDragging = false,
    });

    const handleCanvasNodeDrag = useCallback((e: React.MouseEvent<HTMLOrSVGElement>) => {
        e.stopPropagation();

        dragRef.current = {
            isDragging: true,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startNodeX: x,
            startNodeY: y,
        }
    }, [x, y, dragRef]);

    return { handleCanvasNodeDrag }
}