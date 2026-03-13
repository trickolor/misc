import { useCallback } from "react";
import { useBoolean } from "./use-boolean";
import { useCounter } from "./use-counter";
import { useInterval } from "./use-interval";

interface Options {
    start: number;
    intervalMs?: number;
    isIncrement?: boolean;
    stop?: number;
}

export function useCountdown({
    start,
    intervalMs = 1000,
    isIncrement = false,
    stop = 0,
}: Options) {
    const {
        count,
        setCount,
        increment,
        decrement,
        reset,
    } = useCounter(start);

    const {
        value: isCountdownRunning,
        setTrue: startCountdown,
        setFalse: stopCountdown,
    } = useBoolean(false)

    const resetCountdown = useCallback(() => {
        stopCountdown();
        reset();
    }, []);

    const countdownCallback = useCallback(() => {
        if (count === stop) {
            stopCountdown();
            return;
        }

        (isIncrement ? increment : decrement)();
    }, [count, stop, isIncrement]);

    useInterval(countdownCallback, isCountdownRunning ? intervalMs : null);

    return { count, startCountdown, stopCountdown, resetCountdown } as const;
}