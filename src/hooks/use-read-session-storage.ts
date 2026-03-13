import { useCallback, useState } from "react";
import { useEventListener } from "./use-event-listener";

const IS_SERVER = typeof window === 'undefined';

interface Options<T> {
    deserializerFn?: (value: string) => T;
}

export function useReadSessionStorage<T>(
    key: string,
    { deserializerFn }: Options<T> = {},
): T | null {
    const deserialize = useCallback((raw: string): T | null => {
        if (deserializerFn) return deserializerFn(raw);
        if (raw === String(undefined)) return null;

        try {
            return JSON.parse(raw) as T;
        } catch {
            console.error(`Failed to parse sessionStorage value for key "${key}"`);
            return null;
        }
    }, [deserializerFn, key]);

    const read = useCallback((): T | null => {
        if (IS_SERVER) return null;

        try {
            const raw = sessionStorage.getItem(key);
            return raw !== null ? deserialize(raw) : null;
        } catch (error) {
            console.warn(`Failed to read sessionStorage key "${key}"`, error);
            return null;
        }
    }, [key, deserialize]);

    const [value, setValue] = useState<T | null>(read);

    const handleStorageChange = useCallback((event: StorageEvent | CustomEvent) => {
        const eventKey = 'detail' in event ? event.detail?.key : event.key;
        if (eventKey !== undefined && eventKey !== key) return;
        setValue(read());
    }, [key, read]);

    useEventListener({ event: 'storage', handler: handleStorageChange });
    useEventListener({
        event: 'session-storage' as keyof WindowEventMap,
        handler: handleStorageChange as EventListener,
    });

    return value;
}
