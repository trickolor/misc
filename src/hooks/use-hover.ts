import { useState, type RefObject } from "react";
import { useEventListener } from "./use-event-listener";

export function useHover<T extends HTMLElement = HTMLElement>(elementRef: RefObject<T>) {
    const [isHovered, setIsHovered] = useState(false);

    useEventListener({
        event: 'mouseenter',
        handler: () => setIsHovered(true),
        target: elementRef,
    });

    useEventListener({
        event: 'mouseleave',
        handler: () => setIsHovered(false),
        target: elementRef,
    });

    return isHovered;
}