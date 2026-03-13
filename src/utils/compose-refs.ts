import { type RefCallback, type RefObject } from "react";

type PossibleRef<T> = RefObject<T | null> | RefCallback<T> | null | undefined;

function assignRef<T>(ref: PossibleRef<T>, value: T | null): void {
    if (ref === null || ref === undefined) return;

    if (typeof ref === 'function') {
        ref(value);
        return;
    }

    try { ref.current = value }
    catch { throw new Error('Cannot assign value to a readonly ref.') }
}

export function composeRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T> {
    return (value: T | null) => refs.forEach(ref => assignRef(ref, value));
}
