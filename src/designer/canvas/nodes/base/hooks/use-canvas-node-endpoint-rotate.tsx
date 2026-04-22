import { useCallback, useRef } from "react";

import { useStrictContext } from "@/hooks/use-strict-context";
import { useEventListener } from "@/hooks/use-event-listener";

import { UniverseContext } from "@/designer/universe/context";
import { RootContext } from "@/designer/root/context";

import { CanvasNodeBaseImpl } from "../impl";
import { ROTATION_SNAP_DEGREES } from "../constants";
import type { Endpoint } from "../types";

// ---------- //

/**
 * Rotation of a one-dimensional (line-like) node by grabbing one of its
 * endpoints. The opposite endpoint is the pivot: its world position stays
 * fixed while the node rotates so that the dragged endpoint follows the
 * pointer angle (length preserved — length changes are the resizer's job).
 *
 * Math lives in local box coordinates (the base still models a line as a
 * rectangle where `width = length`, `height = hit thickness`). The endpoints
 * are at `(0, height/2)` and `(width, height/2)`; the center is at
 * `(width/2, height/2)`. Because both endpoints share the center's y, the
 * local offset from the center to either endpoint reduces to `(±width/2, 0)`,
 * which is why the math below never touches `height`.
 */

// ---------- //

interface CanvasNodeEndpointRotateState {
    isActive: boolean;
    hasMoved: boolean;
    endpoint: Endpoint;
    pivotScreenX: number;
    pivotScreenY: number;
    angleOffset: number;
    width: number;
    height: number;
}

interface UseCanvasNodeEndpointRotateResult {
    handleCanvasNodeEndpointRotate: (endpoint: Endpoint) => (e: React.MouseEvent<HTMLElement>) => void;
}

// ---------- //

export function useCanvasNodeEndpointRotate(): UseCanvasNodeEndpointRotateResult {
    const { id, x, y, width, height, rotation, setIsDragging } = useStrictContext(CanvasNodeBaseImpl.Context);
    const { cameraState } = useStrictContext(UniverseContext);
    const { updateNode } = useStrictContext(RootContext);

    const dragRef = useRef<CanvasNodeEndpointRotateState>({
        isActive: false,
        hasMoved: false,
        endpoint: 'end',
        pivotScreenX: 0,
        pivotScreenY: 0,
        angleOffset: 0,
        width: 0,
        height: 0,
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
                e.clientY - drag.pivotScreenY,
                e.clientX - drag.pivotScreenX,
            ) * (180 / Math.PI);

            let newRotation = currentAngle + drag.angleOffset;

            if (e.shiftKey) newRotation =
                Math.round(newRotation / ROTATION_SNAP_DEGREES) * ROTATION_SNAP_DEGREES;

            // Offset from pivot to center in the node's local frame:
            //   endpoint='start' → pivot is end ⇒ center lies at (−w/2, 0)
            //   endpoint='end'   → pivot is start ⇒ center lies at (+w/2, 0)
            const centerLocalDx = (drag.endpoint === 'start' ? -1 : 1) * drag.width / 2;

            const rad = newRotation * (Math.PI / 180);
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            const pivotSceneX = (drag.pivotScreenX - cameraState.x) / cameraState.zoom;
            const pivotSceneY = (drag.pivotScreenY - cameraState.y) / cameraState.zoom;

            const newCenterSceneX = pivotSceneX + centerLocalDx * cos;
            const newCenterSceneY = pivotSceneY + centerLocalDx * sin;

            updateNode(id, {
                rotation: newRotation,
                x: newCenterSceneX - drag.width / 2,
                y: newCenterSceneY - drag.height / 2,
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

    const handleCanvasNodeEndpointRotate = useCallback((endpoint: Endpoint) => {
        return (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            e.preventDefault();

            // Opposite endpoint (= pivot) in local coords. Shifted into
            // center-relative form so rotation math applies uniformly.
            const pivotLocalDx = (endpoint === 'start' ? 1 : -1) * width / 2;

            const rad = rotation * (Math.PI / 180);
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            const centerSceneX = x + width / 2;
            const centerSceneY = y + height / 2;

            const pivotSceneX = centerSceneX + pivotLocalDx * cos;
            const pivotSceneY = centerSceneY + pivotLocalDx * sin;

            const pivotScreenX = pivotSceneX * cameraState.zoom + cameraState.x;
            const pivotScreenY = pivotSceneY * cameraState.zoom + cameraState.y;

            const startMouseAngle = Math.atan2(
                e.clientY - pivotScreenY,
                e.clientX - pivotScreenX,
            ) * (180 / Math.PI);

            // Preserves current rotation at t=0: at mousemove t=0,
            // `newRotation = startMouseAngle + (rotation - startMouseAngle) = rotation`.
            const angleOffset = rotation - startMouseAngle;

            dragRef.current = {
                isActive: true,
                hasMoved: false,
                endpoint,
                pivotScreenX,
                pivotScreenY,
                angleOffset,
                width,
                height,
            };
        };
    }, [x, y, width, height, rotation, cameraState]);

    return { handleCanvasNodeEndpointRotate };
}
