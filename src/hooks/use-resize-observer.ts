import { useEffect, useRef, useState, type RefObject } from "react";

interface Size {
    width: number | null;
    height: number | null;
}

interface Options<T extends HTMLElement = HTMLElement> {
    ref: RefObject<T | null>;
    onResize?: (size: Size) => void;
    box?: ResizeObserverBoxOptions;
}

type BoxSizeKey = 'borderBoxSize' | 'contentBoxSize' | 'devicePixelContentBoxSize';

const BOX_SIZE_MAP: Record<ResizeObserverBoxOptions, BoxSizeKey> = {
    'border-box': 'borderBoxSize',
    'content-box': 'contentBoxSize',
    'device-pixel-content-box': 'devicePixelContentBoxSize',
};

const getSize = (
    entry: ResizeObserverEntry,
    box: BoxSizeKey,
    sizeType: keyof ResizeObserverSize,
): number | null => {
    if (!entry[box]) {
        const contentRectSizeKey = sizeType === 'inlineSize' ? 'width' : 'height';

        if (box === 'contentBoxSize')
            return entry.contentRect[contentRectSizeKey];

        return null;
    }

    return entry[box][0][sizeType];
}

export function useResizeObserver<T extends HTMLElement = HTMLElement>({
    ref,
    onResize,
    box = 'border-box',
}: Options<T>) {
    const [{ width, height }, setSize] = useState<Size>({ width: null, height: null });

    const prevSizeRef = useRef<Size>({ width: null, height: null });
    const onResizeRef = useRef<((size: Size) => void) | undefined>(undefined);

    useEffect(() => {
        onResizeRef.current = onResize;
    }, [onResize]);

    useEffect(() => {
        if (!ref.current) return;
        if (typeof window === 'undefined' || !('ResizeObserver' in window)) return;

        const observer = new ResizeObserver(([entry]) => {
            const boxProperty = BOX_SIZE_MAP[box];

            const [newWidth, newHeight] = (['inlineSize', 'blockSize'] as (keyof ResizeObserverSize)[])
                .map(sizeType => getSize(entry, boxProperty, sizeType));

            const hasChanged =
                prevSizeRef.current.width !== newWidth ||
                prevSizeRef.current.height !== newHeight;

            if (hasChanged) {
                const newSize: Size = { width: newWidth, height: newHeight };

                prevSizeRef.current.width = newWidth;
                prevSizeRef.current.height = newHeight;

                onResizeRef.current?.(newSize);
                setSize(newSize);
            }
        });

        observer.observe(ref.current, { box });
        return () => observer.disconnect();

    }, [box, ref]);

    return [width, height] as const;
}