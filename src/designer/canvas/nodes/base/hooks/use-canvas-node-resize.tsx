import { useCallback, useRef } from "react";

import { useStrictContext } from "@/hooks/use-strict-context";
import { useEventListener } from "@/hooks/use-event-listener";
import { UniverseContext } from "@/designer/universe/context";
import { RootContext } from "@/designer/root/context";

import { CanvasNodeBaseImpl } from "../impl";
import { ANCHOR_SIGNS, MIN_NODE_SIZE } from "../constants";
import type { Corner, Side } from "../types";

// ---------- //

interface CanvasNodeResizeState {
    isActive: boolean;
    hasMoved: boolean;
    position: (Side | Corner) | null;
    startMouseX: number;
    startMouseY: number;
    startWidth: number;
    startHeight: number;
    startRotation: number;
    anchorWorldX: number;
    anchorWorldY: number;
    anchorSignX: number;
    anchorSignY: number;
}

// ---------- //

interface UseCanvasNodeResizeResult {
    handleCanvasNodeResize: (position: (Side | Corner)) => ((e: React.MouseEvent<HTMLElement>) => void);
}

// ---------- //

export function useCanvasNodeResize(): UseCanvasNodeResizeResult {
    const { id, x, y, width, height, rotation, setIsDragging } = useStrictContext(CanvasNodeBaseImpl.Context);
    const { cameraState } = useStrictContext(UniverseContext);
    const { updateNode } = useStrictContext(RootContext);

    const dragRef = useRef<CanvasNodeResizeState>({
        isActive: false,
        hasMoved: false,
        position: null,
        startMouseX: 0,
        startMouseY: 0,
        startWidth: 0,
        startHeight: 0,
        startRotation: 0,
        anchorWorldX: 0,
        anchorWorldY: 0,
        anchorSignX: 0,
        anchorSignY: 0,
    });

    useEventListener({
        event: 'mousemove',
        handler: (e: MouseEvent) => {
            const drag = dragRef.current;
            if (!drag.isActive || !drag.position) return;

            if (!drag.hasMoved) {
                drag.hasMoved = true;
                setIsDragging(true);
            }

            const sceneDeltaX = (e.clientX - drag.startMouseX) / cameraState.zoom;
            const sceneDeltaY = (e.clientY - drag.startMouseY) / cameraState.zoom;

            const negRad = -drag.startRotation * (Math.PI / 180);
            const localDeltaX = sceneDeltaX * Math.cos(negRad) - sceneDeltaY * Math.sin(negRad);
            const localDeltaY = sceneDeltaX * Math.sin(negRad) + sceneDeltaY * Math.cos(negRad);

            const movesLeft = drag.position.includes('left');
            const movesRight = drag.position.includes('right');
            const movesTop = drag.position.includes('top');
            const movesBottom = drag.position.includes('bottom');

            let newWidth = drag.startWidth;
            let newHeight = drag.startHeight;

            if (movesRight) newWidth = Math.max(MIN_NODE_SIZE, drag.startWidth + localDeltaX);
            if (movesLeft) newWidth = Math.max(MIN_NODE_SIZE, drag.startWidth - localDeltaX);
            if (movesBottom) newHeight = Math.max(MIN_NODE_SIZE, drag.startHeight + localDeltaY);
            if (movesTop) newHeight = Math.max(MIN_NODE_SIZE, drag.startHeight - localDeltaY);

            const rad = drag.startRotation * (Math.PI / 180);
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            const newAnchorLocalX = drag.anchorSignX * newWidth / 2;
            const newAnchorLocalY = drag.anchorSignY * newHeight / 2;

            const newCenterX = drag.anchorWorldX - (newAnchorLocalX * cos - newAnchorLocalY * sin);
            const newCenterY = drag.anchorWorldY - (newAnchorLocalX * sin + newAnchorLocalY * cos);

            updateNode(id, {
                x: newCenterX - newWidth / 2,
                y: newCenterY - newHeight / 2,
                width: newWidth,
                height: newHeight,
            });
        },
    });

    useEventListener({
        event: 'mouseup',
        handler: () => {
            const drag = dragRef.current;
            if (!drag.isActive) return;
            drag.isActive = false;
            drag.position = null;
            if (drag.hasMoved) {
                drag.hasMoved = false;
                setIsDragging(false);
            }
        },
    });


    const handleCanvasNodeResize = useCallback((position: (Side | Corner)) => {
        return (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            e.preventDefault();

            const rad = rotation * (Math.PI / 180);
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            const centerX = x + width / 2;
            const centerY = y + height / 2;

            const { sx, sy } = ANCHOR_SIGNS[position];
            const anchorLocalX = sx * width / 2;
            const anchorLocalY = sy * height / 2;

            dragRef.current = {
                isActive: true,
                hasMoved: false,
                position,
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                startWidth: width,
                startHeight: height,
                startRotation: rotation,
                anchorWorldX: centerX + (anchorLocalX * cos - anchorLocalY * sin),
                anchorWorldY: centerY + (anchorLocalX * sin + anchorLocalY * cos),
                anchorSignX: sx,
                anchorSignY: sy,
            };
        }
    }, [x, y, width, height, rotation]);

    return { handleCanvasNodeResize };
}
