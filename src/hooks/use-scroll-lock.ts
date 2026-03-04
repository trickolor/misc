import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

type Target = HTMLElement | string | RefObject<HTMLElement | string | null> | null;
type Axis = "x" | "y" | "both";

const IS_SERVER = typeof window === 'undefined';

type TargetStyleRules = "overflowX" | "overflowY" | "paddingBottom" | "paddingRight";
type OriginalStyles = Partial<Pick<CSSStyleDeclaration, TargetStyleRules>>;

interface Options {
    target?: Target;
    axis?: Axis;
}

export function useScrollLock(options?: Options) {
    const [isLocked, setIsLocked] = useState(false);

    const { target, axis = "y" } = options ?? {}

    const targetRef = useRef<HTMLElement | null>(null);
    const originalStylesRef = useRef<OriginalStyles | null>(null);

    const handleAxisX = () => {
        if (!targetRef.current) return;

        const { overflowX, paddingRight } = targetRef.current.style;
        originalStylesRef.current = { ...originalStylesRef.current, overflowX, paddingRight }

        const isBody = Object.is(targetRef.current, document.body);
        const scrollbarWidth = isBody
            ? window.innerWidth - document.documentElement.clientWidth
            : targetRef.current.offsetWidth - targetRef.current.clientWidth;

        const currentPaddingRight = parseInt(
            window.getComputedStyle(targetRef.current).paddingRight, 10
        ) || 0;

        targetRef.current.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
        targetRef.current.style.overflowX = 'hidden';
    }

    const handleAxisY = () => {
        if (!targetRef.current) return;

        const { overflowY, paddingBottom } = targetRef.current.style;
        originalStylesRef.current = { ...originalStylesRef.current, overflowY, paddingBottom }

        const isBody = Object.is(targetRef.current, document.body);
        const scrollbarHeight = isBody
            ? window.innerHeight - document.documentElement.clientHeight
            : targetRef.current.offsetHeight - targetRef.current.clientHeight;

        const currentPaddingBottom = parseInt(
            window.getComputedStyle(targetRef.current).paddingBottom, 10
        ) || 0;

        targetRef.current.style.paddingBottom = `${currentPaddingBottom + scrollbarHeight}px`;
        targetRef.current.style.overflowY = 'hidden';
    }

    const lock = () => {
        if (isLocked) return;

        switch (axis) {
            case 'x': handleAxisX(); break;
            case 'y': handleAxisY(); break;
            case 'both': [handleAxisX, handleAxisY].forEach(fn => fn()); break;
            default: throw new Error('Invalid "axis" value');
        }

        setIsLocked(true);
    }

    const unlock = () => {
        if (!isLocked) return;

        if (!targetRef.current || !originalStylesRef.current) return;

        ([
            'overflowX',
            'overflowY',
            'paddingRight',
            'paddingBottom',
        ] satisfies TargetStyleRules[]).forEach(rule => {
            const value = originalStylesRef.current![rule];
            if (value !== undefined) targetRef.current!.style[rule] = value;
        });

        setIsLocked(false);
    }

    const toggle = () => (isLocked ? unlock : lock)();

    (IS_SERVER ? useEffect : useLayoutEffect)(() => {
        if (IS_SERVER) return;

        if (target) {
            const isSelector = typeof target === 'string';
            if (isSelector) targetRef.current = document.querySelector(target);

            else if (target instanceof HTMLElement) targetRef.current = target;

            else targetRef.current = typeof target.current === 'string'
                ? document.querySelector(target.current)
                : target.current;
        }

        if (!targetRef.current) targetRef.current = document.body;

        return () => { if (isLocked) unlock(); }
    }, [target]);

    return [isLocked, lock, unlock, toggle] as const;
}