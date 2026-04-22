import { useCallback, useRef } from "react";

import { UniverseContext } from "@/designer/universe/context";
import { RootContext } from "@/designer/root/context";
import { useStrictContext } from "@/hooks/use-strict-context";
import { useEventListener } from "@/hooks/use-event-listener";

import { CanvasNodeBaseImpl } from "../impl";

interface CanvasNodeDragState {
    isActive: boolean;
    hasMoved: boolean;
    startMouseX: number;
    startMouseY: number;
    startNodeX: number;
    startNodeY: number;
}

interface UseCanvasNodeDragResult {
    handleCanvasNodeDrag: (e: React.MouseEvent<HTMLOrSVGElement>) => void;
}

export function useCanvasNodeDrag(): UseCanvasNodeDragResult {
    const { id, x, y, setIsDragging } = useStrictContext(CanvasNodeBaseImpl.Context);
    const { cameraState } = useStrictContext(UniverseContext)
    const { updateNode } = useStrictContext(RootContext);

    const dragRef = useRef<CanvasNodeDragState>({
        isActive: false,
        hasMoved: false,
        startMouseX: 0,
        startMouseY: 0,
        startNodeX: 0,
        startNodeY: 0,
    });

    // ---------- //

    useEventListener({
        event: 'mousemove',
        handler: (e: MouseEvent) => {
            const drag = dragRef.current;
            if (!drag.isActive) return;

            if (!drag.hasMoved) {
                drag.hasMoved = true;
                setIsDragging(true);
            }

            const sceneDeltaX = (e.clientX - drag.startMouseX) / cameraState.zoom
            const sceneDeltaY = (e.clientY - drag.startMouseY) / cameraState.zoom

            updateNode(id, {
                x: drag.startNodeX + sceneDeltaX,
                y: drag.startNodeY + sceneDeltaY,
            });
        },
    });

    useEventListener({
        event: 'mouseup',
        handler: () => {
            const drag = dragRef.current;
            if (!drag.isActive) return;
            drag.isActive = false;
            if (drag.hasMoved) {
                drag.hasMoved = false;
                setIsDragging(false);
            }
        },
    });

    const handleCanvasNodeDrag = useCallback((e: React.MouseEvent<HTMLOrSVGElement>) => {
        e.stopPropagation();
        e.preventDefault();

        dragRef.current = {
            isActive: true,
            hasMoved: false,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startNodeX: x,
            startNodeY: y,
        }
    }, [x, y]);

    return { handleCanvasNodeDrag }
}