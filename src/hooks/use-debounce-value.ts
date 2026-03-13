import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "./use-debounce-callback";

interface Options<T> {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
    equalityFn?: (first: T, second: T) => boolean;
}

export function useDebounceValue<T>(
    value: T,
    delay: number | null = 500,
    { leading = false, trailing = true, maxWait, equalityFn }: Options<T> = {},
) {
    const equalityFnRef = useRef(equalityFn);
    useEffect(() => { equalityFnRef.current = equalityFn; }, [equalityFn]);

    const isEqual = useCallback((a: T, b: T) => {
        return equalityFnRef.current ? equalityFnRef.current(a, b) : Object.is(a, b);
    }, []);

    const [debouncedValue, setDebouncedValue] = useState(value);
    const prevValueRef = useRef(value);

    const update = useDebounceCallback(
        setDebouncedValue,
        delay,
        { leading, trailing, maxWait },
    );

    useEffect(() => {
        if (!isEqual(prevValueRef.current, value)) {
            update.call(value);
            prevValueRef.current = value;
        }
    }, [value, isEqual, update]);

    return [debouncedValue, update] as const;
}