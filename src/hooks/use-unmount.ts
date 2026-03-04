import { useEffect, useLayoutEffect, useRef } from 'react'

const IS_SERVER = typeof window === 'undefined';

export function useUnmount(fn: () => void) {
    const ref = useRef(fn);

    (IS_SERVER ? useEffect : useLayoutEffect)(() => {
        ref.current = fn;
    });

    useEffect(() => {
        return () => ref.current();
    }, []);
}