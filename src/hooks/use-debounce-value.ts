import { useRef, useState } from "react";
import { useDebounceCallback } from "./use-debounce-callback";

interface Options<T> {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
    equalityFn?: (first: T, second: T) => boolean;
}

export function useDebounceValue<T>(
    initialValue: T | (() => T),
    delay: number | null = 500,
    { leading = false, trailing = true, maxWait, equalityFn }: Options<T> = {},
) {
    const isEqual = equalityFn ?? ((first: T, second: T) => Object.is(first, second));

    const resolvedInitialValue = (initialValue instanceof Function)
        ? initialValue()
        : initialValue;

    const [debouncedValue, setDebouncedValue] = useState(resolvedInitialValue);
    const prevValueRef = useRef<T>(resolvedInitialValue);

    const update = useDebounceCallback(
        setDebouncedValue,
        delay,
        { leading, trailing, maxWait },
    );

    if (!isEqual(prevValueRef.current, resolvedInitialValue)) {
        update(resolvedInitialValue);
        prevValueRef.current = resolvedInitialValue;
    }

    return [debouncedValue, update] as const;
}