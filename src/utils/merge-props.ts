import { type CSSProperties, type RefObject, type RefCallback } from "react";
import { composeEventHandlers } from "./compose-event-handlers";
import { composeRefs } from "./compose-refs";
import { mergeStyles } from "./merge-styles";
import { cn } from "./cn";

type AnyRef<T> = RefObject<T | null> | RefCallback<T>;
type Props = Record<string, unknown>;

function isEventHandler(key: string, value: unknown): value is (e: unknown) => void {
    return /^on[A-Z]/.test(key) && typeof value === 'function';
}

function isClassName(key: string, value: unknown): value is string | undefined {
    return key === 'className' && (value === undefined || typeof value === 'string');
}

function isStyle(key: string, value: unknown): value is CSSProperties | undefined {
    return key === 'style' && (value === undefined || (typeof value === 'object' && !Array.isArray(value)));
}

function isRef<T>(key: string, value: unknown): value is AnyRef<T> | undefined {
    return key === 'ref' && (
        value === undefined ||
        typeof value === 'function' ||
        (typeof value === 'object' && value !== null && 'current' in value)
    );
}

function mergeKey(key: string, existing: unknown, incoming: unknown): unknown {
    if (isClassName(key, existing) && isClassName(key, incoming))
        return cn(existing, incoming);

    if (isStyle(key, existing) && isStyle(key, incoming))
        return mergeStyles(existing, incoming);

    if (isRef(key, existing) && isRef(key, incoming)) {
        const refs = [existing, incoming].filter(Boolean) as AnyRef<unknown>[];
        return refs.length === 1 ? refs[0] : composeRefs(...refs);
    }

    if (isEventHandler(key, existing) && isEventHandler(key, incoming))
        return composeEventHandlers(existing, incoming);

    return incoming;
}

export function mergeProps<T extends Props>(...propGroups: Partial<T>[]): Partial<T> {
    const result: Props = {};

    for (const props of propGroups)
        for (const key in props)
            result[key] = mergeKey(key, result[key], props[key]);

    return result as Partial<T>;
}
