import { useCallback, useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

interface Options {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
}

export interface DebouncedFn<A extends unknown[], R> {
    call: (...args: A) => R | undefined;
    cancel: () => void;
    flush: (...args: A) => R | undefined;
    isPending: () => boolean;
}

export function useDebounceCallback<A extends unknown[], R>(
    fn: (...args: A) => R,
    delay: number | null = 500,
    { leading = false, trailing = true, maxWait }: Options = {},
): DebouncedFn<A, R> {
    const fnRef = useRef(fn);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const maxWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const lastArgsRef = useRef<A | null>(null);
    const lastResultRef = useRef<R | undefined>(undefined);

    const leadingCalledRef = useRef(false);

    useIsomorphicLayoutEffect(() => {
        fnRef.current = fn;
    });

    const cancel = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (maxWaitTimerRef.current) {
            clearTimeout(maxWaitTimerRef.current);
            maxWaitTimerRef.current = null;
        }

        lastArgsRef.current = null;
        leadingCalledRef.current = false;
    }, []);

    const flush = useCallback((...args: A) => {
        cancel();
        lastResultRef.current = fnRef.current(...args);
        return lastResultRef.current;
    }, [cancel]);

    const isPending = useCallback(() => timerRef.current !== null, []);

    const call = useCallback((...args: A): R | undefined => {
        lastArgsRef.current = args;

        if (leading && !leadingCalledRef.current) {
            leadingCalledRef.current = true;
            lastResultRef.current = fnRef.current(...args);
        }

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            leadingCalledRef.current = false;

            if (maxWaitTimerRef.current) {
                clearTimeout(maxWaitTimerRef.current);
                maxWaitTimerRef.current = null;
            }

            if (trailing && lastArgsRef.current) {
                lastResultRef.current = fnRef.current(...lastArgsRef.current);
                lastArgsRef.current = null;
            }
        }, delay ?? undefined);

        if (maxWait !== undefined && !maxWaitTimerRef.current) maxWaitTimerRef.current = setTimeout(() => {
            maxWaitTimerRef.current = null;

            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }

            leadingCalledRef.current = false;

            if (lastArgsRef.current) {
                lastResultRef.current = fnRef.current(...lastArgsRef.current);
                lastArgsRef.current = null;
            }
        }, maxWait);

        return lastResultRef.current;
    }, [delay, leading, trailing, maxWait]);

    useEffect(() => cancel, [cancel]);
    return { call, cancel, flush, isPending };
}
