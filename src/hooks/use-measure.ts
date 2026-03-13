import { useState, type RefObject } from "react";
import { useResizeObserver } from "./use-resize-observer";

interface Rect {
    width: number;
    height: number;
}

export function useMeasure<T extends HTMLElement>(): [
    ref: (element: T | null) => void,
    rect: Rect,
] {
    const [element, setElement] = useState<T | null>(null);

    const [width, height] = useResizeObserver({
        ref: { current: element } as RefObject<T>,
        box: 'content-box',
    });

    return [setElement, { width: width ?? 0, height: height ?? 0 }];
}
