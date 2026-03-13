import { useCallback, useState } from "react";

export function useCounter(initialValue?: number) {
    const [count, setCount] = useState(initialValue ?? 0);

    const increment = useCallback(() => {
        setCount(prev => prev + 1)
    }, []);

    const decrement = useCallback(() => {
        setCount(prev => prev - 1)
    }, []);

    const reset = useCallback(() => {
        setCount(initialValue ?? 0);
    }, [initialValue]);

    return { count, setCount, increment, decrement, reset } as const;
}