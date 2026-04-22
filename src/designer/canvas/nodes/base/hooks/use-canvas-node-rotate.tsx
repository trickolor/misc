import { useCallback, useRef } from "react";

import { useStrictContext } from "@/hooks/use-strict-context";
import { useEventListener } from "@/hooks/use-event-listener";

import { UniverseContext } from "@/designer/universe/universe-context";
import { RootContext } from "@/designer/root/root-context";

import { CanvasNodeBaseImpl } from "../impl";

// ---------- //

const ROTATION_SNAP_DEGREES = 15;

interface CanvasNodeRotateState {
    isDragging: boolean;
    centerX: number;
    centerY: number;
    angleOffset: number;
}

interface UseCanvasNodeRotateResult {
    handleCanvasNodeRotate: (e: React.MouseEvent<HTMLElement>) => void;
}

// ---------- //

export function useCanvasNodeRotate(): UseCanvasNodeRotateResult {
    const { id, x, y, width, height, rotation } = useStrictContext(CanvasNodeBaseImpl.Context);
    const { cameraState } = useStrictContext(UniverseContext);
    const { updateNode } = useStrictContext(RootContext);

    const dragRef = useRef<CanvasNodeRotateState>({
        isDragging: false,
        centerX: 0,
        centerY: 0,
        angleOffset: 0,
    });

    useEventListener({
        event: 'mousemove',
        handler: (e: MouseEvent) => {
            const drag = dragRef.current;
            if (!drag.isDragging) return;

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
        handler: () => dragRef.current.isDragging = false,
    });

    const handleCanvasNodeRotate = useCallback((e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();

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
            isDragging: true,
            centerX,
            centerY,
            angleOffset,
        };
    }, [x, y, width, height, rotation, cameraState]);

    return { handleCanvasNodeRotate };
}