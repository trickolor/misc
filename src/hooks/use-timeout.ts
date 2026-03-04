import { useEffect, useLayoutEffect, useRef } from "react";

const IS_SERVER = typeof window === 'undefined';

export function useTimeout(callback: () => void, delay?: number | null) {
    const callbackRef = useRef(callback);

    (IS_SERVER ? useEffect : useLayoutEffect)(() => {
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