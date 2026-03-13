import { useCallback, useState } from "react";

interface MapType<K, V> {
    set: (key: K, value: V) => void;
    delete: (key: K) => void;
    clear: () => void;
    get: (key: K) => V | undefined;
    has: (key: K) => boolean;
    keys: () => K[];
    values: () => V[];
    entries: () => [K, V][];
    size: number;
    map: ReadonlyMap<K, V>;
    isEmpty: boolean;
}

export function useMap<K, V>(initialEntries: [K, V][] = []): MapType<K, V> {
    const [map, setMap] = useState<ReadonlyMap<K, V>>(
        () => new Map(initialEntries)
    );

    const set = useCallback((key: K, value: V) => {
        setMap(prev => new Map(prev).set(key, value));
    }, []);

    const remove = useCallback((key: K) => {
        setMap(prev => {
            const next = new Map(prev);
            next.delete(key);
            return next;
        });
    }, []);

    const clear = useCallback(() => {
        setMap(new Map());
    }, []);

    const get = useCallback((key: K) => map.get(key), [map]);
    const has = useCallback((key: K) => map.has(key), [map]);
    const keys = useCallback(() => Array.from(map.keys()), [map]);
    const values = useCallback(() => Array.from(map.values()), [map]);
    const entries = useCallback(() => Array.from(map.entries()), [map]);

    return {
        set,
        delete: remove,
        clear,
        get,
        has,
        keys,
        values,
        entries,
        size: map.size,
        isEmpty: !map.size,
        map,
    };
}
