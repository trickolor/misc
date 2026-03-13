import { useCallback, useState } from "react";

interface Queue<T> {
    enqueue: (...items: T[]) => void;
    dequeue: () => T | undefined;
    peek: () => T | undefined;
    last: () => T | undefined;
    clear: () => void;
    size: number;
    isEmpty: boolean;
    items: readonly T[];
}

export function useQueue<T>(initialItems: T[] = []): Queue<T> {
    const [items, setItems] = useState<T[]>(initialItems);

    const enqueue = useCallback((...newItems: T[]) => {
        setItems(prev => [...prev, ...newItems]);
    }, []);

    const dequeue = useCallback((): T | undefined => {
        let dequeued: T | undefined;

        setItems(prev => {
            if (prev.length === 0) return prev;
            [dequeued] = prev;
            return prev.slice(1);
        });

        return dequeued;
    }, []);

    const peek = useCallback((): T | undefined => {
        return items[0];
    }, [items]);

    const last = useCallback((): T | undefined => {
        return items[items.length - 1];
    }, [items]);

    const clear = useCallback(() => {
        setItems([]);
    }, []);

    return {
        enqueue,
        dequeue,
        peek,
        last,
        clear,
        size: items.length,
        isEmpty: !items.length,
        items,
    };
}
