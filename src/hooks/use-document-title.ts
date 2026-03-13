import { useEffect } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

const IS_SERVER = typeof document === 'undefined';

interface Options {
    restoreOnUnmount?: boolean;
}

export function useDocumentTitle(title: string, { restoreOnUnmount = false }: Options = {}) {
    useIsomorphicLayoutEffect(() => {
        if (IS_SERVER) return;
        document.title = title;
    }, [title]);

    useEffect(() => {
        if (IS_SERVER || !restoreOnUnmount) return;
        const originalTitle = document.title;
        return () => { document.title = originalTitle; };
    }, [restoreOnUnmount]);
}
