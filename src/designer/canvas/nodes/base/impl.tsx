import {
    createContext,
    useCallback,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { RootContext } from "@/designer/root/root-context";
import { useMemoizedObject } from "@/hooks/use-memoized-object";
import { useStrictContext } from "@/hooks/use-strict-context";
import { useOutsideClick } from "@/hooks/use-outside-click";

import { useCanvasNodeDrag } from "./hooks/use-canvas-node-drag";
import { useCanvasNodeRotate } from "./hooks/use-canvas-node-rotate";
import { useCanvasNodeResize } from "./hooks/use-canvas-node-resize";

import {
    ANGLE_OFFSET,
    BASE_CURSOR_ANGLES,
    RESIZE_CURSORS,
    type CanvasNodeBaseContext,
    type Corner,
    type ResizeCursorType,
    type Side,
} from "./context";

// ---------- //

function getResizeCursor(position: Corner | Side, rotation: number): ResizeCursorType {
    const baseAngle = BASE_CURSOR_ANGLES[position] ?? 0;
    const angle = ((baseAngle + rotation) % 180 + 180) % 180;
    const index = Math.round(angle / 45) % 4;
    return RESIZE_CURSORS[index];
}

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

    const contextValue = useMemoizedObject({
        id, x, y, width, height,
        fill, opacity, rotation,
        isSelected, areaElementRef,
        handleCanvasNodeSelect,
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

    return (
        <div
            data-family="canvas-node-base"
            data-component="area"
            data-node-id={id}

            ref={areaElementRef}

            onMouseDown={handleCanvasNodeDrag}
            onClick={handleCanvasNodeSelect}

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
    const { id, rotation } = useStrictContext(Context);
    const { handleCanvasNodeResize } = useCanvasNodeResize();

    const computedPosition = useMemo(() => {
        const result: Record<string, string> = {}
        angle.split('-').forEach((side) => { result[side] = `-${ANGLE_OFFSET}px` });
        return result;
    }, [angle]);

    const cursor = useMemo(() => getResizeCursor(angle, rotation), [angle, rotation]);

    return (
        <span
            data-family="canvas-node-base"
            data-component="angle-resizer"
            data-node-id={id}

            onMouseDown={handleCanvasNodeResize(angle)}

            className="block size-4 absolute z-30 bg-sky-500"
            style={{ ...computedPosition, cursor }}
        />
    );
}

// ---------- //

interface SideResizerProps {
    side: Side;
}

function SideResizer({ side }: SideResizerProps) {
    const { id, width: nodeWidth, height: nodeHeight, rotation } = useStrictContext(Context);
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
    const { id } = useStrictContext(Context);
    const { handleCanvasNodeRotate } = useCanvasNodeRotate();

    const computedPosition = useMemo(() => {
        const result: Record<string, string> = {}
        angle.split('-').forEach((side) => { result[side] = `-${ANGLE_OFFSET * 2}px` });
        return result;
    }, [angle]);

    return (
        <span
            data-family="canvas-node-base"
            data-component="rotation"
            data-node-id={id}

            onMouseDown={handleCanvasNodeRotate}

            className="block size-4 absolute z-20 bg-sky-500/50 cursor-alias"
            style={computedPosition}
        />
    );
}

// ---------- //

function Center() {
    const { id, isSelected } = useStrictContext(Context);
    if (!isSelected) return null;

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
    AngleResizer,
    SideResizer,
    Rotation,
    Center,
    Context,
});
