import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

interface Options {
    durationMs: number;
    when: boolean;
    startImmediately?: boolean;
}

export function useScheduledInterval(
    callback: () => void,
    { durationMs, when, startImmediately = false }: Options,
) {
    const callbackRef = useRef(callback);

    useIsomorphicLayoutEffect(() => {
        callbackRef.current = callback;
    });

    useEffect(() => {
        if (!when) return;

        if (startImmediately) callbackRef.current();

        const id = setInterval(() => {
            callbackRef.current();
        }, durationMs);

        return () => clearInterval(id);
    }, [when, durationMs, startImmediately]);
}
