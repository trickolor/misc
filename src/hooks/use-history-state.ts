import { useCallback, useState } from "react";

interface HistoryState<T> {
    state: T | undefined;
    set: (value: T) => void;
    undo: () => void;
    redo: () => void;
    clear: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

interface HistoryStateT<T> {
    past: T[];
    present: T | undefined;
    future: T[];
}

export function useHistoryState<T>(initialValue?: T): HistoryState<T> {
    const [history, setHistory] = useState<HistoryStateT<T>>({
        past: [],
        present: initialValue,
        future: [],
    });

    const set = useCallback((value: T) => {
        setHistory(prev => ({
            past: prev.present !== undefined ? [...prev.past, prev.present] : prev.past,
            present: value,
            future: [],
        }));
    }, []);

    const undo = useCallback(() => {
        setHistory(prev => {
            if (prev.past.length === 0) return prev;
            const previous = prev.past[prev.past.length - 1];
            return {
                past: prev.past.slice(0, -1),
                present: previous,
                future: prev.present !== undefined
                    ? [prev.present, ...prev.future]
                    : prev.future,
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory(prev => {
            if (prev.future.length === 0) return prev;
            const [next, ...remainingFuture] = prev.future;
            return {
                past: prev.present !== undefined
                    ? [...prev.past, prev.present]
                    : prev.past,
                present: next,
                future: remainingFuture,
            };
        });
    }, []);

    const clear = useCallback(() => {
        setHistory(prev => ({
            past: [],
            present: prev.present,
            future: [],
        }));
    }, []);

    return {
        state: history.present,
        set,
        undo,
        redo,
        clear,
        canUndo: !!history.past.length,
        canRedo: !!history.future.length,
    };
}
