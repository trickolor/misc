import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
    intervalMs?: number;
    maxRetries?: number;
}

interface RetryState {
    retries: number;
    hasSucceeded: boolean;
    hasExhausted: boolean;
}

interface RetryResult extends RetryState {
    reset: () => void;
}

export function useRetry(
    callback: () => boolean,
    { intervalMs = 1000, maxRetries = 10 }: Options = {},
): RetryResult {
    const [state, setState] = useState<RetryState>({
        retries: 0,
        hasSucceeded: false,
        hasExhausted: false,
    });

    const callbackRef = useRef(callback);
    useEffect(() => { callbackRef.current = callback; }, [callback]);

    const isActive = !state.hasSucceeded && !state.hasExhausted;

    useEffect(() => {
        if (!isActive) return;

        const id = setInterval(() => {
            const succeeded = callbackRef.current();

            setState(prev => {
                const retries = prev.retries + 1;
                return {
                    retries,
                    hasSucceeded: succeeded,
                    hasExhausted: !succeeded && retries >= maxRetries,
                };
            });
        }, intervalMs);

        return () => clearInterval(id);
    }, [isActive, intervalMs, maxRetries]);

    const reset = useCallback(() => {
        setState({ retries: 0, hasSucceeded: false, hasExhausted: false });
    }, []);

    return { ...state, reset }
}
