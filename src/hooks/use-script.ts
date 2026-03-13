import { useEffect, useState } from "react";

type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

interface Options {
    preventLoading?: boolean;
    removeOnUnmount?: boolean;
    id?: string;
}

const statusCache = new Map<string, ScriptStatus | undefined>();

function getScriptNode(src: string) {
    const node: HTMLScriptElement | null = document.querySelector(`script[src="${src}"]`);
    const status = node?.getAttribute('data-status') as ScriptStatus | undefined;
    return { node, status };
}

const IS_SERVER = typeof window === 'undefined';

export function useScript(
    src: string,
    { preventLoading, removeOnUnmount, id }: Options = {}
) {
    const [status, setStatus] = useState<ScriptStatus>(() => {
        if (!src || preventLoading) return 'ready';
        if (IS_SERVER) return 'loading';
        return statusCache.get(src) ?? getScriptNode(src).status ?? 'loading';
    });

    useEffect(() => {
        if (!src || preventLoading) return;

        const cachedStatus = statusCache.get(src);
        if (cachedStatus === 'ready' || cachedStatus === 'error') return;

        const scriptNode = getScriptNode(src);
        let resolvedScriptNode = scriptNode.node;

        if (!resolvedScriptNode) {
            resolvedScriptNode = document.createElement('script');
            resolvedScriptNode.src = src;
            resolvedScriptNode.async = true;

            if (id) resolvedScriptNode.id = id;

            resolvedScriptNode.dataset.status = 'loading';
            statusCache.set(src, 'loading');
            document.body.appendChild(resolvedScriptNode);

            const setAttributeFromEvent = (event: Event) => {
                const scriptStatus: ScriptStatus = event.type === 'load'
                    ? 'ready'
                    : 'error';

                resolvedScriptNode?.setAttribute('data-status', scriptStatus);
            }

            ['load', 'error'].forEach(eventType => {
                resolvedScriptNode?.addEventListener(eventType, setAttributeFromEvent);
            });
        }

        else {
            const existingStatus = scriptNode.status ?? cachedStatus ?? 'loading';
            statusCache.set(src, existingStatus);
        }

        const setStateFromEvent = (event: Event) => {
            const newStatus: ScriptStatus = event.type === 'load'
                ? 'ready'
                : 'error';

            setStatus(newStatus);
            statusCache.set(src, newStatus);
        }

        ['load', 'error'].forEach(eventType => {
            resolvedScriptNode?.addEventListener(eventType, setStateFromEvent);
        });

        return () => {
            if (resolvedScriptNode) ['load', 'error'].forEach(eventType => {
                resolvedScriptNode?.removeEventListener(eventType, setStateFromEvent);
            });

            if (resolvedScriptNode && removeOnUnmount) resolvedScriptNode.remove();
        }
    }, [src, preventLoading, removeOnUnmount, id]);

    return status;
}