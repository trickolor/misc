import { useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

export function useThrottle<T>(value: T, intervalMs: number = 500): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastUpdatedRef = useRef<number>(0);

    useIsomorphicLayoutEffect(() => {
        lastUpdatedRef.current = Date.now();
    }, []);

    useEffect(() => {
        const elapsed = Date.now() - lastUpdatedRef.current;
        const remaining = intervalMs - elapsed;

        const id = setTimeout(() => {
            lastUpdatedRef.current = Date.now();
            setThrottledValue(value);
        }, remaining <= 0 ? 0 : remaining);

        return () => clearTimeout(id);
    }, [value, intervalMs]);

    return throttledValue;
}
