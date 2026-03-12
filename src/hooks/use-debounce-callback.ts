import { useCallback, useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

interface Options {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
}

type DebouncedFn<T extends (...args: any[]) => any> = {
    (...args: Parameters<T>): ReturnType<T> | undefined;
    cancel: () => void;
    flush: (...args: Parameters<T>) => ReturnType<T> | undefined;
    isPending: () => boolean;
};

export function useDebounceCallback<T extends (...args: any[]) => any>(
    fn: T,
    delay: number | null = 500,
    { leading = false, trailing = true, maxWait }: Options = {},
): DebouncedFn<T> {
    const fnRef = useRef(fn);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const maxWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const lastArgsRef = useRef<Parameters<T> | null>(null);
    const lastResultRef = useRef<ReturnType<T> | undefined>(undefined);

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

    const flush = useCallback((...args: Parameters<T>) => {
        cancel();
        lastResultRef.current = fnRef.current(...args);
        return lastResultRef.current;
    }, [cancel]);

    const isPending = useCallback(() => timerRef.current !== null, []);

    const debounced = useCallback((...args: Parameters<T>): ReturnType<T> | undefined => {
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
    }, [delay, leading, trailing, maxWait, cancel]);

    useEffect(() => cancel, [cancel]);

    return Object.assign(debounced, {
        cancel,
        flush,
        isPending,
    }) as DebouncedFn<T>;
}