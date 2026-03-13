import { useCallback, useEffect, useRef } from "react";
import { useEventListener } from "./use-event-listener";
import type { RefObject } from "react";

interface Options<T extends HTMLElement = HTMLElement> {
    eventType?: 'keydown' | 'keyup';
    target?: RefObject<T | null> | T | null;
    eventListenerOptions?: boolean | AddEventListenerOptions;
}

export function useKeyPress<T extends HTMLElement = HTMLElement>(
    key: string | string[],
    callback: (event: KeyboardEvent) => void,
    { eventType = 'keydown', target, eventListenerOptions }: Options<T> = {},
) {
    const keysAsString = Array.isArray(key) ? key.join(',') : key;

    const keysRef = useRef<string[]>([]);
    const callbackRef = useRef(callback);

    useEffect(() => {
        keysRef.current = Array.isArray(key) ? key : [key];
        callbackRef.current = callback;
    }, [keysAsString, callback, key]);

    const handler = useCallback((event: KeyboardEvent) => {
        if (keysRef.current.includes(event.key)) callbackRef.current(event);
    }, []);

    useEventListener({
        event: eventType,
        handler,
        target,
        eventListenerOptions,
    } as Parameters<typeof useEventListener>[0]);
}
