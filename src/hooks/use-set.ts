import { useCallback, useState } from "react";

interface SetType<T> {
    add: (...items: T[]) => void;
    delete: (item: T) => void;
    clear: () => void;
    has: (item: T) => boolean;
    values: () => T[];
    size: number;
    isEmpty: boolean;
    set: ReadonlySet<T>;
}

export function useSet<T>(initialItems: T[] = []): SetType<T> {
    const [set, setSet] = useState<ReadonlySet<T>>(
        () => new Set(initialItems)
    );

    const add = useCallback((...items: T[]) => {
        setSet(prev => {
            const next = new Set(prev);
            items.forEach(item => next.add(item));
            return next;
        });
    }, []);

    const remove = useCallback((item: T) => {
        setSet(prev => {
            const next = new Set(prev);
            next.delete(item);
            return next;
        });
    }, []);

    const clear = useCallback(() => {
        setSet(new Set());
    }, []);

    const has = useCallback((item: T) => set.has(item), [set]);
    const values = useCallback(() => Array.from(set.values()), [set]);

    return {
        add,
        delete: remove,
        clear,
        has,
        values,
        size: set.size,
        isEmpty: !set.size,
        set,
    };
}
