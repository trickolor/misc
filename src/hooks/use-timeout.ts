import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

export function useTimeout(callback: () => void, delay?: number | null) {
    const callbackRef = useRef(callback);

    useIsomorphicLayoutEffect(() => {
        callbackRef.current = callback;
    });

    useEffect(() => {
        if (delay === null || delay === undefined) return;

        const id = setTimeout(() => {
            callbackRef.current();
        }, delay);

        return () => { clearTimeout(id) }
    }, [delay]);
}