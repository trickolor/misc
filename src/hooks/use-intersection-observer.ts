import { useEffect, useRef, useState } from "react";

interface State {
    isIntersecting: boolean;
    entry?: IntersectionObserverEntry;
}

interface Options {
    root?: Element | Document | null;
    rootMargin?: string;
    threshold?: number | number[];
    freezeOnceVisible?: boolean;
    onChange?: (state: State) => void;
    initialIsIntersecting?: boolean;
}

export function useIntersectionObserver({
    root = null,
    rootMargin = '0%',
    threshold = 0,
    freezeOnceVisible = false,
    initialIsIntersecting = false,
    onChange,
}: Options = {}) {
    const [ref, setRef] = useState<Element | null>(null);

    const [state, setState] = useState<State>(() => ({
        isIntersecting: initialIsIntersecting,
    }));

    const callbackRef = useRef<Options['onChange']>(onChange);

    useEffect(() => {
        callbackRef.current = onChange;
    }, [onChange]);

    const frozen = state.entry?.isIntersecting && freezeOnceVisible;

    const thresholdKey = JSON.stringify(threshold);
    const thresholdRef = useRef(threshold);

    useEffect(() => {
        thresholdRef.current = threshold;
    }, [thresholdKey, threshold]);

    useEffect(() => {
        if (!ref) return;
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
        if (frozen) return;

        let unobserve: (() => void) | null = null;

        const observer = new IntersectionObserver(entries => {
            const thresholds = Array.isArray(observer.thresholds)
                ? observer.thresholds
                : [thresholdRef.current];

            entries.forEach(entry => {
                const isIntersecting =
                    entry.isIntersecting &&
                    thresholds.some(t => t <= entry.intersectionRatio);

                setState({ isIntersecting, entry });

                if (callbackRef.current) callbackRef.current({ isIntersecting, entry });

                if (isIntersecting && freezeOnceVisible && unobserve) {
                    unobserve();
                    unobserve = null;
                }
            });
        }, { root, rootMargin, threshold: thresholdRef.current });

        observer.observe(ref);
        unobserve = () => observer.unobserve(ref);
        return () => observer.disconnect();
    }, [ref, thresholdKey, root, rootMargin, frozen, freezeOnceVisible]);

    return [setRef, state.isIntersecting, state.entry] as const;
}