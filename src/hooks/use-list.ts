import { useCallback, useState } from "react";

interface ListActions<T> {
    set: (list: T[]) => void;
    push: (...items: T[]) => void;
    removeAt: (index: number) => void;
    insertAt: (index: number, item: T) => void;
    updateAt: (index: number, item: T) => void;
    clear: () => void;
}

export function useList<T>(initialList: T[] = []): [T[], ListActions<T>] {
    const [list, setList] = useState<T[]>(initialList);

    const set = useCallback((newList: T[]) => {
        setList(newList);
    }, []);

    const push = useCallback((...items: T[]) => {
        setList(prev => [...prev, ...items]);
    }, []);

    const removeAt = useCallback((index: number) => {
        setList(prev => prev.filter((_, i) => i !== index));
    }, []);

    const insertAt = useCallback((index: number, item: T) => {
        setList(prev => [
            ...prev.slice(0, index),
            item,
            ...prev.slice(index),
        ]);
    }, []);

    const updateAt = useCallback((index: number, item: T) => {
        setList(prev => prev.map((current, i) => i === index ? item : current));
    }, []);

    const clear = useCallback(() => {
        setList([]);
    }, []);

    return [list, { set, push, removeAt, insertAt, updateAt, clear }];
}
