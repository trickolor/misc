import { useCallback, useState } from "react";

interface SetActions<T> {
    add: (...items: T[]) => void;
    delete: (item: T) => void;
    clear: () => void;
    has: (item: T) => boolean;
    values: () => T[];
    size: number;
    isEmpty: boolean;
}

export function useSet<T>(initialItems: T[] = []): [ReadonlySet<T>, SetActions<T>] {
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

    const actions = {
        add,
        delete: remove,
        clear,
        has,
        values,
        size: set.size,
        isEmpty: !set.size,
    };

    return [set, actions];
}
