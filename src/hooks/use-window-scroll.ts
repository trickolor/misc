import { useCallback, useState } from "react";
import { useEventListener } from "./use-event-listener";

const IS_SERVER = typeof window === 'undefined';

interface ScrollPosition {
    x: number;
    y: number;
}

interface ScrollToOptions {
    x?: number;
    y?: number;
    behavior?: ScrollBehavior;
}

const readScrollPosition = (): ScrollPosition => ({
    x: IS_SERVER ? 0 : window.scrollX,
    y: IS_SERVER ? 0 : window.scrollY,
});

export function useWindowScroll(): [ScrollPosition, (options: ScrollToOptions) => void] {
    const [position, setPosition] = useState<ScrollPosition>(readScrollPosition);

    const handleScroll = useCallback(() => {
        setPosition(readScrollPosition());
    }, []);

    useEventListener({ event: 'scroll', handler: handleScroll });

    const scrollTo = useCallback(({ x, y, behavior = 'smooth' }: ScrollToOptions) => {
        window.scrollTo({
            left: x ?? window.scrollX,
            top: y ?? window.scrollY,
            behavior,
        });
    }, []);

    return [position, scrollTo];
}
