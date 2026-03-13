import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { useEventListener } from "./use-event-listener";

interface Options<T> {
    serializerFn?: (value: T) => string;
    deserializerFn?: (value: string) => T;
}

const IS_SERVER = typeof window === 'undefined';

export function useSessionStorage<T>(
    key: string,
    initialValue: T | (() => T) | null,
    { serializerFn, deserializerFn }: Options<T> = {},
) {
    const serialize = useCallback((value: T | null): string => {
        return (serializerFn ?? JSON.stringify)(value);
    }, [serializerFn]);

    const deserialize = useCallback((value: string): T | null => {
        if (deserializerFn) return deserializerFn(value);
        if (value === String(undefined)) return null;

        const fallback = (initialValue instanceof Function)
            ? initialValue()
            : initialValue;

        const parsed = (() => {
            try { return JSON.parse(value) as T }

            catch {
                console.error(`Failed to parse value for key "${key}"`);
                return fallback;
            }
        })();

        return parsed;
    }, [deserializerFn, initialValue, key]);

    const get = useCallback(() => {
        const resolvedInitialValue = (initialValue instanceof Function
            ? initialValue() : initialValue);

        if (IS_SERVER) return resolvedInitialValue;

        try {
            const raw = sessionStorage.getItem(key);
            return raw ? deserialize(raw) : resolvedInitialValue;
        }

        catch (error) {
            console.warn(`Failed to read value for key "${key}"`, error);
            return resolvedInitialValue;
        }
    }, [key, initialValue, deserialize]);

    const [[storedKey, storedValue], setStored] = useState<[string, T | null]>(() => [key, get()]);

    const setStoredValue = useCallback((value: T | null) => {
        setStored([key, value]);
    }, [key]);

    if (storedKey !== key) setStored([key, get()]);

    const set: Dispatch<SetStateAction<T | null>> = useCallback(value => {
        if (IS_SERVER) { console.warn('Key set attempted on non-client env'); return; }

        try {
            const currentValue = get();

            const newValue = value instanceof Function
                ? currentValue !== null ? value(currentValue) : null
                : value;

            window.sessionStorage.setItem(key, serialize(newValue));
            setStoredValue(newValue);

            window.dispatchEvent(new CustomEvent('session-storage', { detail: { key } }));
        }

        catch (error) {
            console.warn(`Failed to set value for key "${key}"`, error);
        }
    }, [key, get, serialize, setStoredValue]);

    const remove = useCallback(() => {
        if (IS_SERVER) { console.warn('Key remove attempted on non-client env'); return; }

        const resolvedInitialValue = initialValue instanceof Function
            ? initialValue()
            : initialValue;

        window.sessionStorage.removeItem(key);
        setStoredValue(resolvedInitialValue);

        window.dispatchEvent(new CustomEvent('session-storage', { detail: { key } }));
    }, [key, initialValue, setStoredValue]);

    const handleStorageChange = useCallback((event: StorageEvent | CustomEvent) => {
        const eventKey = 'detail' in event ? event.detail?.key : event.key;
        if (eventKey !== undefined && eventKey !== key) return;
        setStoredValue(get());
    }, [key, get, setStoredValue]);

    useEventListener({ event: 'storage', handler: handleStorageChange });

    useEventListener({
        event: 'session-storage' as keyof WindowEventMap,
        handler: handleStorageChange as EventListener,
    });

    return [storedValue, set, remove] as const;
}