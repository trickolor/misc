import { useCallback, useState } from "react";
import { useDebounceCallback } from "./use-debounce-callback";
import { useEventListener } from "./use-event-listener";

const IS_SERVER = typeof window === 'undefined';

interface ScreenSnapshot {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelDepth: number;
    orientation: ScreenOrientation;
}

const readScreen = (): ScreenSnapshot | null => {
    if (IS_SERVER) return null;
    const { width, height, availWidth, availHeight, colorDepth, pixelDepth, orientation } = window.screen;
    return { width, height, availWidth, availHeight, colorDepth, pixelDepth, orientation };
};

export function useScreen(debounceDelay?: number) {
    const [screen, setScreen] = useState<ScreenSnapshot | null>(readScreen);

    const handleResize = useCallback(() => {
        setScreen(readScreen());
    }, []);

    const debouncedHandleResize = useDebounceCallback(handleResize, debounceDelay ?? null);

    useEventListener({ event: 'resize', handler: debounceDelay ? debouncedHandleResize : handleResize });

    return screen;
}