import { useEffect, useRef } from 'react';
import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

export function useInterval(callback: () => void, delay?: number | null) {
    const callbackRef = useRef(callback);

    useIsomorphicLayoutEffect(() => {
        callbackRef.current = callback;
    });

    useEffect(() => {
        if (delay === null || delay === undefined) return;

        const id = setInterval(() => {
            callbackRef.current();
        }, delay);

        return () => { clearInterval(id) }
    }, [delay]);
}