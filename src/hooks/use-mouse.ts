import { useCallback, useState } from "react";
import { useEventListener } from "./use-event-listener";

interface MouseState {
    x: number;
    y: number;
    elementX: number;
    elementY: number;
    elementPositionX: number;
    elementPositionY: number;
}

const INITIAL_STATE: MouseState = {
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
    elementPositionX: 0,
    elementPositionY: 0,
};

export function useMouse(): [MouseState, (element: HTMLElement | null) => void] {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const [state, setState] = useState<MouseState>(INITIAL_STATE);

    const handleMouseMove = useCallback((event: MouseEvent) => {
        const newState: MouseState = {
            x: event.pageX,
            y: event.pageY,
            elementX: 0,
            elementY: 0,
            elementPositionX: 0,
            elementPositionY: 0,
        };

        if (element) {
            const rect = element.getBoundingClientRect();
            newState.elementPositionX = rect.left + window.scrollX;
            newState.elementPositionY = rect.top + window.scrollY;
            newState.elementX = event.pageX - newState.elementPositionX;
            newState.elementY = event.pageY - newState.elementPositionY;
        }

        setState(newState);
    }, [element]);

    useEventListener({ event: 'mousemove', handler: handleMouseMove });

    return [state, setElement];
}
