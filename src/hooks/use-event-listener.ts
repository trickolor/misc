import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

const IS_SERVER = typeof window === 'undefined';

interface WithEventListenerOptions {
    eventListenerOptions?: boolean | AddEventListenerOptions;
}

interface OptionsMQL<E extends 'change'> extends WithEventListenerOptions {
    event: E;
    handler: (event: MediaQueryListEventMap[E]) => void;
    target: RefObject<MediaQueryList> | MediaQueryList | null;
}

interface OptionsHTMLElement<E extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLElement> extends WithEventListenerOptions {
    event: E;
    handler: (event: HTMLElementEventMap[E]) => void;
    target: RefObject<T | null> | T | null;
}

interface OptionsSVGElement<E extends keyof SVGElementEventMap, T extends SVGElement = SVGElement> extends WithEventListenerOptions {
    event: E;
    handler: (event: SVGElementEventMap[E]) => void;
    target: RefObject<T | null> | T | null;
}

interface OptionsDocument<E extends keyof DocumentEventMap, T extends Document = Document> extends WithEventListenerOptions {
    event: E;
    handler: (event: DocumentEventMap[E]) => void;
    target: RefObject<T | null> | T | null;
}

interface OptionsWindow<E extends keyof WindowEventMap> extends WithEventListenerOptions {
    event: E;
    handler: (event: WindowEventMap[E]) => void;
    target?: null;
}

type EventTarget =
    | RefObject<MediaQueryList> | MediaQueryList
    | RefObject<HTMLElement> | HTMLElement
    | RefObject<SVGElement> | SVGElement
    | RefObject<Document> | Document
    | null
    | undefined;

interface OptionsImpl extends WithEventListenerOptions {
    event: string;
    handler: (event: Event) => void;
    target?: EventTarget;
}

export function useEventListener<E extends 'change'>(options: OptionsMQL<E>): void;
export function useEventListener<E extends keyof HTMLElementEventMap, T extends HTMLElement>(options: OptionsHTMLElement<E, T>): void;
export function useEventListener<E extends keyof SVGElementEventMap, T extends SVGElement>(options: OptionsSVGElement<E, T>): void;
export function useEventListener<E extends keyof DocumentEventMap, T extends Document>(options: OptionsDocument<E, T>): void;
export function useEventListener<E extends keyof WindowEventMap>(options: OptionsWindow<E>): void;
export function useEventListener({
    event,
    handler,
    target,
    eventListenerOptions,
}: OptionsImpl) {
    const savedHandler = useRef<(event: Event) => void>(handler);

    (IS_SERVER ? useEffect : useLayoutEffect)(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const consumer = target
            ? 'current' in target ? target.current : target
            : window;

        if (!(consumer && 'addEventListener' in consumer)) return;

        const listener = (event: Event) => savedHandler.current(event);

        consumer.addEventListener(event, listener, eventListenerOptions);
        return () => consumer.removeEventListener(event, listener, eventListenerOptions);
    }, [event, eventListenerOptions, target]);
}