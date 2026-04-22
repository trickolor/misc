import { useCallback, useRef } from "react";

import { useStrictContext } from "@/hooks/use-strict-context";
import { useEventListener } from "@/hooks/use-event-listener";

import { UniverseContext } from "@/designer/universe/context";
import { RootContext } from "@/designer/root/context";

import { CanvasNodeBaseImpl } from "../impl";
import { ROTATION_SNAP_DEGREES } from "../constants";

// ---------- //

interface CanvasNodeRotateState {
    isActive: boolean;
    hasMoved: boolean;
    centerX: number;
    centerY: number;
    angleOffset: number;
}

interface UseCanvasNodeRotateResult {
    handleCanvasNodeRotate: (e: React.MouseEvent<HTMLElement>) => void;
}

// ---------- //

export function useCanvasNodeRotate(): UseCanvasNodeRotateResult {
    const { id, x, y, width, height, rotation, setIsDragging } = useStrictContext(CanvasNodeBaseImpl.Context);
    const { cameraState } = useStrictContext(UniverseContext);
    const { updateNode } = useStrictContext(RootContext);

    const dragRef = useRef<CanvasNodeRotateState>({
        isActive: false,
        hasMoved: false,
        centerX: 0,
        centerY: 0,
        angleOffset: 0,
    });

    useEventListener({
        event: 'mousemove',
        handler: (e: MouseEvent) => {
            const drag = dragRef.current;
            if (!drag.isActive) return;

            if (!drag.hasMoved) {
                drag.hasMoved = true;
                setIsDragging(true);
            }

            const currentAngle = Math.atan2(
                e.clientY - drag.centerY,
                e.clientX - drag.centerX,
            ) * (180 / Math.PI);

            let newRotation = currentAngle + drag.angleOffset;

            if (e.shiftKey) newRotation =
                Math.round(newRotation / ROTATION_SNAP_DEGREES) * ROTATION_SNAP_DEGREES;

            updateNode(id, { rotation: newRotation });
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

    const handleCanvasNodeRotate = useCallback((e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        e.preventDefault();

        const screenNodeX = x * cameraState.zoom + cameraState.x;
        const screenNodeY = y * cameraState.zoom + cameraState.y;
        const screenWidth = width * cameraState.zoom;
        const screenHeight = height * cameraState.zoom;

        const centerX = screenNodeX + screenWidth / 2;
        const centerY = screenNodeY + screenHeight / 2;

        const startAngle = Math.atan2(
            e.clientY - centerY,
            e.clientX - centerX,
        ) * (180 / Math.PI);

        const angleOffset = rotation - startAngle;

        dragRef.current = {
            isActive: true,
            hasMoved: false,
            centerX,
            centerY,
            angleOffset,
        };
    }, [x, y, width, height, rotation, cameraState]);

    return { handleCanvasNodeRotate };
}