import { useCallback, useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

interface Options {
    minDelay: number;
    maxDelay: number;
    startOnMount?: boolean;
}

const randomBetween = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

export function useRandomInterval(
    callback: () => void,
    { minDelay, maxDelay, startOnMount = true }: Options,
) {
    const callbackRef = useRef(callback);
    const minDelayRef = useRef(minDelay);
    const maxDelayRef = useRef(maxDelay);

    useIsomorphicLayoutEffect(() => {
        callbackRef.current = callback;
        minDelayRef.current = minDelay;
        maxDelayRef.current = maxDelay;
    });

    const cancelRef = useRef<(() => void) | null>(null);
    const startRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const run = () => {
            let id: ReturnType<typeof setTimeout>;
            let cancelled = false;

            const tick = () => {
                if (cancelled) return;
                callbackRef.current();
                id = setTimeout(tick, randomBetween(minDelayRef.current, maxDelayRef.current));
            };

            const stop = () => {
                cancelled = true;
                clearTimeout(id);
            };

            cancelRef.current = stop;
            id = setTimeout(tick, randomBetween(minDelayRef.current, maxDelayRef.current));
        };

        startRef.current = () => {
            cancelRef.current?.();
            run();
        };

        if (startOnMount) run();

        return () => cancelRef.current?.();
    }, [startOnMount]);

    const start = useCallback(() => { startRef.current?.(); }, []);
    const stop = useCallback(() => { cancelRef.current?.(); }, []);

    return { start, stop };
}
