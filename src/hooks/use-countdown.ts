import { useCallback } from "react";
import { useBoolean } from "./use-boolean";
import { useCounter } from "./use-counter";
import { useInterval } from "./use-interval";

interface Options {
    start: number;
    intervalMs?: number;
    isIncrement?: boolean;
    /** When reached, the countdown stops automatically. */
    stop?: number;
}

export function useCountdown({
    start,
    intervalMs = 1000,
    isIncrement = false,
    stop,
}: Options) {
    const {
        count,
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
    }, [stopCountdown, reset]);

    const countdownCallback = useCallback(() => {
        if (stop !== undefined && count === stop) {
            stopCountdown();
            return;
        }

        (isIncrement ? increment : decrement)();
    }, [count, stop, isIncrement, stopCountdown, increment, decrement]);

    useInterval(countdownCallback, isCountdownRunning ? intervalMs : null);

    return {
        count,
        startCountdown,
        stopCountdown,
        resetCountdown,
    } as const;
}