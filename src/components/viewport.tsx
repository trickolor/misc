import { createContext, useCallback, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

import { useObjectState, type ObjectStateUpdateFn } from "@/hooks/use-object-state";
import { useEventListener } from "@/hooks/use-event-listener";
import { useStrictContext } from "@/hooks/use-strict-context";
import { cn } from "@/utils/cn";

interface PanState {
    lastX: number;
    lastY: number;
    spaceHold: boolean;
    isPanning: boolean;
}

interface CameraState {
    x: number;
    y: number;
    zoom: number;
}

interface SceneContext {
    cameraState: CameraState;
    updateCameraState: ObjectStateUpdateFn<CameraState>;

    panRef: RefObject<PanState>;

    viewportRef: RefObject<HTMLDivElement | null>;
    cameraRef: RefObject<HTMLDivElement | null>;
}

const SceneContext = createContext<SceneContext | null>(null);

interface SceneProps {
    children?: ReactNode;
}

function Scene({ children }: SceneProps) {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const cameraRef = useRef<HTMLDivElement | null>(null);

    const [cameraState, updateCameraState] = useObjectState<CameraState>({
        x: 0, y: 0,
        zoom: 1,
    });

    const panRef = useRef<PanState>({
        lastX: 0,
        lastY: 0,
        spaceHold: false,
        isPanning: false,
    });

    const contextValue: SceneContext = useMemo(() => {
        return {
            cameraState,
            updateCameraState,
            panRef,
            viewportRef,
            cameraRef,
        };
    }, [cameraState, updateCameraState, panRef, viewportRef, cameraRef]);

    return (
        <SceneContext.Provider value={contextValue}>
            {children}
        </SceneContext.Provider>
    );
}

Scene.displayName = 'Scene';

// ---------- //

interface ViewportProps {
    children?: ReactNode;
}

// ---------- //

type ViewportCursorState = 'grab' | 'grabbing' | 'auto';

function Viewport({ children }: ViewportProps) {
    const {
        viewportRef,
        panRef,
        updateCameraState,
    } = useStrictContext(SceneContext);

    const [cursorState, setCursorState] = useState<ViewportCursorState>('auto');

    const updateCursor = () => {
        if (panRef.current.isPanning) setCursorState('grabbing');
        else if (panRef.current.spaceHold) setCursorState('grab');
        else setCursorState('auto');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === ' ') {
            panRef.current.spaceHold = true;
            updateCursor();
        }
    };

    useEventListener({
        event: 'keydown',
        handler: handleKeyDown,
    });

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === ' ') {
            panRef.current.spaceHold = false;
            updateCursor();
        }
    };

    useEventListener({
        event: 'keyup',
        handler: handleKeyUp,
    });

    const handleMouseUp = () => {
        panRef.current.isPanning = false;
        updateCursor();
    }

    useEventListener({
        event: 'mouseup',
        handler: handleMouseUp,
    });

    const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && panRef.current.spaceHold)) {
            panRef.current.isPanning = true;
            panRef.current.lastX = e.clientX;
            panRef.current.lastY = e.clientY;

            updateCursor();
        }
    };

    useEventListener({
        target: viewportRef,
        event: 'mousedown',
        handler: handleMouseDown,
    });

    const handleMouseMove = (e: MouseEvent) => {
        if (!panRef.current.isPanning) return;

        const deltaX = e.clientX - panRef.current.lastX;
        const deltaY = e.clientY - panRef.current.lastY;

        panRef.current.lastX = e.clientX
        panRef.current.lastY = e.clientY

        updateCameraState(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
        }));
    };

    useEventListener({
        event: 'mousemove',
        handler: handleMouseMove,
    });

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();

        if (!e.ctrlKey) updateCameraState(prev => ({
            x: prev.x - e.deltaX,
            y: prev.y - e.deltaY,
        }));
    }

    useEventListener({
        event: 'wheel',
        handler: handleWheel,
        eventListenerOptions: { passive: false },
    });

    return (
        <div
            data-cursor={cursorState}
            data-component="viewport"
            className={cn(
                'size-full relative overflow-hidden bg-zinc-900',
                'data-[cursor=grabbing]:cursor-grabbing',
                'data-[cursor=grab]:cursor-grab',
                'data-[cursor=auto]:cursor-auto',
            )}
            ref={viewportRef}
        >
            {children}
        </div>
    );
}

Viewport.displayName = 'Viewport';

// ---------- //

interface CameraProps {
    children?: ReactNode;
}

function Camera({ children }: CameraProps) {
    const { cameraRef, cameraState } = useStrictContext(SceneContext);

    const transform = useMemo(() => {
        return `translate(${cameraState.x}px, ${cameraState.y}px) scale(${cameraState.zoom})`;
    }, [cameraState]);

    return (
        <div
            data-component="camera"
            className={cn('size-0 absolute top-0 left-0 origin-top-left')}
            style={{ transform }}
            ref={cameraRef}
        >
            {children}
        </div>
    );
}

Camera.displayName = 'Camera';

// ---------- //

export { Scene, Viewport, Camera };