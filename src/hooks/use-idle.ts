import { useEffect, useState } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

const ACTIVITY_EVENTS = [
    'mousemove',
    'mousedown',
    'keydown',
    'touchstart',
    'scroll',
    'visibilitychange',
] as const;

export function useIdle(durationMs: number = 5000): boolean {
    const [isIdle, setIsIdle] = useState(false);

    useIsomorphicLayoutEffect(() => {
        setIsIdle(false);
    }, [durationMs]);

    useEffect(() => {
        let id: ReturnType<typeof setTimeout>;

        const onActivity = () => {
            setIsIdle(false);
            clearTimeout(id);
            id = setTimeout(() => setIsIdle(true), durationMs);
        };

        id = setTimeout(() => setIsIdle(true), durationMs);

        ACTIVITY_EVENTS.forEach(event => {
            window.addEventListener(event, onActivity, { passive: true });
        });

        return () => {
            clearTimeout(id);
            ACTIVITY_EVENTS.forEach(event => {
                window.removeEventListener(event, onActivity);
            });
        };
    }, [durationMs]);

    return isIdle;
}
