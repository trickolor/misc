import type { RefObject } from "react";
import { useEventListener } from "./use-event-listener";

type InteractionEventType =
    | "mousedown"
    | "mouseup"
    | "touchstart"
    | "touchend"
    | "focusin"
    | "focusout";

interface Options<T extends HTMLElement = HTMLElement> {
    ref: RefObject<T> | RefObject<T>[] | null;
    handler: (event: Event) => void;
    eventType?: InteractionEventType;
    eventListenerOptions?: boolean | AddEventListenerOptions;
}

export function useOutsideClick<T extends HTMLElement = HTMLElement>({
    ref,
    handler,
    eventType = "mousedown",
    eventListenerOptions
}: Options<T>) {
    useEventListener({
        event: eventType,
        eventListenerOptions,

        handler: event => {
            const target = event.target as Node;
            if (!target || !target.isConnected) return;

            const refs = Array.isArray(ref) ? ref : [ref];

            const isOutside = refs
                .filter((ref): ref is RefObject<T> => ref?.current != null)
                .every(ref => !ref.current!.contains(target));

            if (isOutside) handler(event);
        },
    });
}