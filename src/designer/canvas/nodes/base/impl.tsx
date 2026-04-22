import {
    createContext,
    useCallback,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { RootContext } from "@/designer/root/context";
import { useMemoizedObject } from "@/hooks/use-memoized-object";
import { useStrictContext } from "@/hooks/use-strict-context";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { useHover } from "@/hooks/use-hover";

import { useCanvasNodeDrag } from "./hooks/use-canvas-node-drag";
import { useCanvasNodeRotate } from "./hooks/use-canvas-node-rotate";
import { useCanvasNodeResize } from "./hooks/use-canvas-node-resize";
import { useCanvasNodeEndpointRotate } from "./hooks/use-canvas-node-endpoint-rotate";

import {
    getEndpointRotateCursor,
    getResizeCursor,
    getRotateCursor,
} from "./helpers/cursors";
import { getScreenBottomSide } from "./helpers/size-indicator";

import {
    ANGLE_OFFSET,
    CORNER_ROTATE_BASE_ANGLES,
    ENDPOINT_ROTATE_BASE_ANGLES,
    ENDPOINT_ROTATION_SIZE,
    SIZE_INDICATOR_WRAPPER_OFFSETS,
    SIZE_INDICATOR_WRAPPER_POSITIONS,
} from "./constants";
import type {
    CanvasNodeBaseContext,
    CanvasNodeStatus,
    Corner,
    Endpoint,
    Side,
} from "./types";

// ---------- //

const Context = createContext<CanvasNodeBaseContext | null>(null);

// ---------- //

interface RootProps {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    rotation: number;
    children?: ReactNode;
}

function Root({
    id, x, y, width, height,
    fill, opacity, rotation,
    children,
}: RootProps) {
    const {
        addSelectedNodeId,
        removeSelectedNodeId,
    } = useStrictContext(RootContext);

    const areaElementRef = useRef<HTMLDivElement>(null);
    const [isSelected, setIsSelected] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const isHovered = useHover(areaElementRef);

    const handleCanvasNodeSelect = useCallback(() => {
        addSelectedNodeId(id);
        setIsSelected(true);
    }, [addSelectedNodeId, id]);

    const handleCanvasNodeDeselect = useCallback(() => {
        removeSelectedNodeId(id);
        setIsSelected(false);
    }, [removeSelectedNodeId, id]);

    useOutsideClick({
        ref: areaElementRef,
        handler: handleCanvasNodeDeselect,
    });

    const status = useMemo<CanvasNodeStatus>(() => {
        if (isDragging) return 'drag';
        if (isSelected) return 'selected';
        if (isHovered) return 'hover';
        return 'idle';
    }, [isDragging, isSelected, isHovered]);

    const contextValue = useMemoizedObject({
        id, x, y, width, height,
        fill, opacity, rotation,
        status,
        areaElementRef,
        handleCanvasNodeSelect,
        setIsDragging,
    });

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
}

// ---------- //

interface AreaProps {
    children: ReactNode;
}

function Area({ children }: AreaProps) {
    const {
        id, x, y,
        width, height,
        rotation,
        handleCanvasNodeSelect,
        areaElementRef,
    } = useStrictContext(Context);

    const { handleCanvasNodeDrag } = useCanvasNodeDrag();

    const transform = useMemo(() => {
        return `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
    }, [x, y, rotation]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        handleCanvasNodeSelect();
        handleCanvasNodeDrag(e);
    }, [handleCanvasNodeSelect, handleCanvasNodeDrag]);

    return (
        <div
            data-family="canvas-node-base"
            data-component="area"
            data-node-id={id}

            ref={areaElementRef}

            onMouseDown={handleMouseDown}

            className="absolute"
            style={{ width, height, transform }}
        >
            {children}
        </div>
    );
}

// ---------- //

interface AngleResizerProps {
    angle: Corner;
}

function AngleResizer({ angle }: AngleResizerProps) {
    const { id, rotation, status } = useStrictContext(Context);
    const { handleCanvasNodeResize } = useCanvasNodeResize();

    const computedPosition = useMemo(() => {
        const result: Record<string, string> = {}
        angle.split('-').forEach((side) => { result[side] = `-${ANGLE_OFFSET}px` });
        return result;
    }, [angle]);

    const cursor = useMemo(() => getResizeCursor(angle, rotation), [angle, rotation]);

    if (status !== 'selected') return null;

    return (
        <span
            data-family="canvas-node-base"
            data-component="angle-resizer"
            data-node-id={id}

            onMouseDown={handleCanvasNodeResize(angle)}

            className="block size-2 absolute z-30 bg-white border border-sky-500"
            style={{ ...computedPosition, cursor }}
        />
    );
}

// ---------- //

interface SideResizerProps {
    side: Side;
}

function SideResizer({ side }: SideResizerProps) {
    const { id, width: nodeWidth, height: nodeHeight, rotation, status } = useStrictContext(Context);
    const { handleCanvasNodeResize } = useCanvasNodeResize();

    const computedStyle = useMemo(() => {
        switch (side) {
            case 'top': return { width: nodeWidth, height: '4px', top: '-2px', left: 0 }
            case 'bottom': return { width: nodeWidth, height: '4px', bottom: '-2px', left: 0 }
            case 'left': return { width: '4px', height: nodeHeight, top: 0, left: '-2px' }
            case 'right': return { width: '4px', height: nodeHeight, top: 0, right: '-2px' }
        }
    }, [side, nodeWidth, nodeHeight]);

    const cursor = useMemo(() => getResizeCursor(side, rotation), [side, rotation]);

    if (status !== 'selected') return null;

    return (
        <span
            data-family="canvas-node-base"
            data-component="side-resizer"
            data-node-id={id}

            onMouseDown={handleCanvasNodeResize(side)}

            className="block absolute z-10"
            style={{ ...computedStyle, cursor }}
        />
    );
}

// ---------- //

interface RotationProps {
    angle: Corner;
}

function Rotation({ angle }: RotationProps) {
    const { id, rotation, status } = useStrictContext(Context);
    const { handleCanvasNodeRotate } = useCanvasNodeRotate();

    const computedPosition = useMemo(() => {
        const result: Record<string, string> = {}
        angle.split('-').forEach((side) => { result[side] = `-${ANGLE_OFFSET * 2}px` });
        return result;
    }, [angle]);

    const cursor = useMemo(
        () => getRotateCursor(CORNER_ROTATE_BASE_ANGLES[angle], rotation),
        [angle, rotation],
    );

    if (status !== 'selected') return null;

    return (
        <span
            data-family="canvas-node-base"
            data-component="rotation"
            data-node-id={id}

            onMouseDown={handleCanvasNodeRotate}

            className="block size-2 absolute z-20"
            style={{ ...computedPosition, cursor }}
        />
    );
}

// ---------- //

interface EndpointResizerProps {
    endpoint: Endpoint;
}

/**
 * Resize handle for a line-like (1D) node. Grabs an endpoint and drags it
 * along any direction; the opposite endpoint stays pinned. Reuses
 * {@link useCanvasNodeResize} under the hood with `left`/`right` semantics,
 * since a line's internal box model has `width = length` and its endpoints
 * live on the left/right edges.
 *
 * Styled identically to {@link AngleResizer} (8px white square with a sky
 * border) so all resize handles look consistent across shapes.
 */
function EndpointResizer({ endpoint }: EndpointResizerProps) {
    const { id, rotation, status } = useStrictContext(Context);
    const { handleCanvasNodeResize } = useCanvasNodeResize();

    const side: Side = endpoint === 'start' ? 'left' : 'right';
    const cursor = useMemo(() => getResizeCursor(side, rotation), [side, rotation]);

    if (status !== 'selected') return null;

    const position = endpoint === 'start'
        ? { left: 0, top: '50%' }
        : { left: '100%', top: '50%' };

    return (
        <span
            data-family="canvas-node-base"
            data-component="endpoint-resizer"
            data-endpoint={endpoint}
            data-node-id={id}

            onMouseDown={handleCanvasNodeResize(side)}

            className="block size-2 absolute z-30 bg-white border border-sky-500 -translate-x-1/2 -translate-y-1/2"
            style={{ ...position, cursor }}
        />
    );
}

// ---------- //

interface EndpointRotationProps {
    endpoint: Endpoint;
}

/**
 * Rotation handle for a line-like (1D) node. Transparent, sits centered on
 * the endpoint behind the visible {@link EndpointResizer} — the annular
 * region around the resizer is what picks up rotate events (same pattern as
 * Figma). Uses a rotate cursor aligned to the current node orientation.
 */
function EndpointRotation({ endpoint }: EndpointRotationProps) {
    const { id, rotation, status } = useStrictContext(Context);
    const { handleCanvasNodeEndpointRotate } = useCanvasNodeEndpointRotate();

    const cursor = useMemo(
        () => getEndpointRotateCursor(ENDPOINT_ROTATE_BASE_ANGLES[endpoint], rotation),
        [endpoint, rotation],
    );

    if (status !== 'selected') return null;

    const position = endpoint === 'start'
        ? { left: 0, top: '50%' }
        : { left: '100%', top: '50%' };

    return (
        <span
            data-family="canvas-node-base"
            data-component="endpoint-rotation"
            data-endpoint={endpoint}
            data-node-id={id}

            onMouseDown={handleCanvasNodeEndpointRotate(endpoint)}

            className="block absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{
                width: ENDPOINT_ROTATION_SIZE,
                height: ENDPOINT_ROTATION_SIZE,
                ...position,
                cursor,
            }}
        />
    );
}

// ---------- //

function SelectionFrame() {
    const { id, status } = useStrictContext(Context);
    if (status === 'idle') return null;

    return (
        <div
            data-family="canvas-node-base"
            data-component="selection-frame"
            data-node-id={id}

            className="absolute -inset-px border-2 border-sky-500 pointer-events-none z-0"
        />
    );
}

// ---------- //

function SizeIndicator() {
    const {
        id, width, height, rotation,
        status,
    } = useStrictContext(Context);
    if (status !== 'selected') return null;

    const label = `${Math.round(width)} × ${Math.round(height)}`;
    const { side, quadrant } = getScreenBottomSide(rotation);
    const adaptRotation = -quadrant * 90;

    return (
        <div
            className="absolute pointer-events-none z-40"
            style={{
                ...SIZE_INDICATOR_WRAPPER_POSITIONS[side],
                width: 0,
                height: 0,
                transform: `${SIZE_INDICATOR_WRAPPER_OFFSETS[side]} rotate(${adaptRotation}deg)`,
            }}
        >
            <div
                data-family="canvas-node-base"
                data-component="size-indicator"
                data-node-id={id}
                data-side={side}

                className="absolute px-1.5 py-0.5 rounded-sm bg-sky-500 text-white text-[10px]/none font-medium whitespace-nowrap select-none"
                style={{ top: 0, left: 0, transform: 'translate(-50%, 0)' }}
            >
                {label}
            </div>
        </div>
    );
}

// ---------- //

function Center() {
    const { id, status } = useStrictContext(Context);
    if (status !== 'selected') return null;

    return (
        <div
            data-family="canvas-node-base"
            data-component="center"
            data-node-id={id}

            className="size-2 bg-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
        </div>
    );
}

// ---------- //

export const CanvasNodeBaseImpl = Object.assign(Root, {
    Area,
    SelectionFrame,
    SizeIndicator,
    AngleResizer,
    SideResizer,
    Rotation,
    EndpointResizer,
    EndpointRotation,
    Center,
    Context,
});
