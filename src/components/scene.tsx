import { createContext, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useObjectState, type ObjectStateUpdateFn } from "@/hooks/use-object-state";
import { useEventListener } from "@/hooks/use-event-listener";
import { useStrictContext } from "@/hooks/use-strict-context";
import { cn } from "@/utils/cn";
import { useKeyPress } from "@/hooks/use-key-press";

// ---------- //

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

type ViewportCursorState =
    | 'grab'
    | 'grabbing'
    | 'auto';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_INCREMENT = 1.1;
const ZOOM_DECREMENT = 0.9;
const SCROLL_SENSITIVITY = 0.2;

// ---------- //

interface SceneContext {
    cameraState: CameraState;
    updateCameraState: ObjectStateUpdateFn<CameraState>;

    panRef: RefObject<PanState>;

    viewportRef: RefObject<HTMLDivElement | null>;
    cameraRef: RefObject<HTMLDivElement | null>;
}

const SceneContext = createContext<SceneContext | null>(null);

// ---------- //

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

    const zoom = (cursorX: number, cursorY: number, zoomFactor: number) => {
        updateCameraState(prev => {
            const sceneX = (cursorX - prev.x) / prev.zoom;
            const sceneY = (cursorY - prev.y) / prev.zoom;

            const newZoom = Math.min(Math.max(prev.zoom * zoomFactor, MIN_ZOOM), MAX_ZOOM);

            return {
                x: cursorX - sceneX * newZoom,
                y: cursorY - sceneY * newZoom,
                zoom: newZoom,
            };
        });
    };

    // ---------- //

    useKeyPress(' ', () => {
        panRef.current.spaceHold = true;
        updateCursor();
    });

    useKeyPress(' ', () => {
        panRef.current.spaceHold = false;
        updateCursor();
    }, { eventType: 'keyup' });

    useKeyPress(['+', '-', '=', '0'], (e) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();

        if (!viewportRef.current) return;
        const viewportRect = viewportRef.current.getBoundingClientRect();

        switch (e.key) {
            case '+': case '=': zoom(viewportRect.width / 2, viewportRect.height / 2, ZOOM_INCREMENT); break;
            case '-': zoom(viewportRect.width / 2, viewportRect.height / 2, ZOOM_DECREMENT); break;
            case '0': updateCameraState({ x: 0, y: 0, zoom: 1 }); break;
            default: break;
        }
    });

    // ---------- //

    const handleMouseUp = () => {
        panRef.current.isPanning = false;
        updateCursor();
    };

    useEventListener({
        event: 'mouseup',
        handler: handleMouseUp,
    });

    // ---------- //

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

    // ---------- //

    const handleMouseMove = (e: MouseEvent) => {
        if (!panRef.current.isPanning) return;

        const deltaX = e.clientX - panRef.current.lastX;
        const deltaY = e.clientY - panRef.current.lastY;

        panRef.current.lastX = e.clientX;
        panRef.current.lastY = e.clientY;

        updateCameraState(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
        }));
    };

    useEventListener({
        event: 'mousemove',
        handler: handleMouseMove,
    });

    // ---------- //

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();

        if (!e.ctrlKey) updateCameraState(prev => ({
            x: prev.x - e.deltaX * SCROLL_SENSITIVITY,
            y: prev.y - e.deltaY * SCROLL_SENSITIVITY,
        }));

        else {
            if (!viewportRef.current) return;
            const viewportRect = viewportRef.current.getBoundingClientRect();

            const cursorX = e.clientX - viewportRect.left;
            const cursorY = e.clientY - viewportRect.top;
            const zoomFactor = e.deltaY < 0 ? ZOOM_INCREMENT : ZOOM_DECREMENT;

            zoom(cursorX, cursorY, zoomFactor);
        }
    };

    useEventListener({
        event: 'wheel',
        handler: handleWheel,
        eventListenerOptions: { passive: false },
    });

    // ---------- //

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