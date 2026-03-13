import { useCallback, useState } from "react";
import { useEventListener } from "./use-event-listener";

const IS_SERVER = typeof window === 'undefined';

interface Size {
    width: number;
    height: number;
}

export function useWindowSize() {
    const [size, setSize] = useState<Size>(() => ({
        width: IS_SERVER ? 0 : window.innerWidth,
        height: IS_SERVER ? 0 : window.innerHeight,
    }));

    const handleResize = useCallback(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    useEventListener({ event: 'resize', handler: handleResize });
    return [size.width, size.height] as const;
}