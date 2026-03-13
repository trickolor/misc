import { useCallback, useRef } from "react";

interface Options {
    threshold?: number;
    onStart?: (event: MouseEvent | TouchEvent) => void;
    onFinish?: (event: MouseEvent | TouchEvent) => void;
    onCancel?: (event: MouseEvent | TouchEvent) => void;
}

interface LongPressHandlers {
    onMouseDown: (event: React.MouseEvent) => void;
    onMouseUp: (event: React.MouseEvent) => void;
    onMouseLeave: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
    onTouchEnd: (event: React.TouchEvent) => void;
}

export function useLongPress(
    callback: (event: MouseEvent | TouchEvent) => void,
    { threshold = 500, onStart, onFinish, onCancel }: Options = {},
): LongPressHandlers {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPressRef = useRef(false);

    const start = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        isLongPressRef.current = false;
        onStart?.(event.nativeEvent);

        timerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            callback(event.nativeEvent);
        }, threshold);
    }, [callback, threshold, onStart]);

    const cancel = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        (isLongPressRef.current ? onFinish : onCancel)?.(event.nativeEvent);
    }, [onFinish, onCancel]);

    return {
        onMouseDown: start,
        onMouseUp: cancel,
        onMouseLeave: cancel,
        onTouchStart: start,
        onTouchEnd: cancel,
    };
}
