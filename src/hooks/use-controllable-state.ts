import { useCallback, useState } from "react";

interface Options<T> {
    value?: T;
    defaultValue?: T;
    onChange?: (value: T) => void;
}

export function useControllableState<T>({
    value,
    defaultValue,
    onChange,
}: Options<T>): [T | undefined, (next: T | ((prev: T | undefined) => T)) => void] {
    const isControlled = value !== undefined;

    const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);

    const resolvedValue = isControlled ? value : internalValue;

    const setValue = useCallback((next: T | ((prev: T | undefined) => T)) => {
        const nextValue = next instanceof Function ? next(resolvedValue) : next;

        if (!isControlled) setInternalValue(nextValue);

        onChange?.(nextValue);
    }, [isControlled, resolvedValue, onChange]);

    return [resolvedValue, setValue];
}
