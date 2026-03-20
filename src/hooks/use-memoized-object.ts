import { useMemo } from "react";

export function useMemoizedObject<T extends object>(object: T): T {
    return useMemo(() => object, Object.values(object));
}