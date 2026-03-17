import { useCallback, useState } from "react";

export type ObjectStateUpdateFn<T extends object> = (patch: Partial<T> | ((prev: T) => Partial<T>)) => void;

export function useObjectState<T extends object>(initialValue: T | (() => T)): [T, ObjectStateUpdateFn<T>] {
    const [state, setState] = useState<T>(initialValue);

    const update: ObjectStateUpdateFn<T> = useCallback(patch => {
        setState(prev => ({
            ...prev,
            ...(patch instanceof Function ? patch(prev) : patch),
        }));
    }, []);

    return [state, update];
}
