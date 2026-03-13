import { useCallback } from "react";
import { useEventListener } from "./use-event-listener";

export function usePageLeave(callback: () => void) {
    const handleMouseOut = useCallback((event: MouseEvent) => {
        if (event.relatedTarget === null) callback();
    }, [callback]);

    const handleVisibilityChange = useCallback(() => {
        if (document.visibilityState === 'hidden') callback();
    }, [callback]);

    useEventListener({ event: 'mouseout', handler: handleMouseOut });
    useEventListener({ event: 'visibilitychange', target: document, handler: handleVisibilityChange });
    useEventListener({ event: 'beforeunload', handler: callback });
}
