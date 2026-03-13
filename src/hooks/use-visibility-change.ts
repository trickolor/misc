import { useCallback, useState } from "react";
import { useEventListener } from "./use-event-listener";

const IS_SERVER = typeof document === 'undefined';

const readVisibility = (): DocumentVisibilityState => {
    if (IS_SERVER) return 'visible';
    return document.visibilityState;
};

export function useVisibilityChange(): DocumentVisibilityState {
    const [visibilityState, setVisibilityState] = useState<DocumentVisibilityState>(readVisibility);

    const handleChange = useCallback(() => {
        setVisibilityState(readVisibility());
    }, []);

    useEventListener({
        event: 'visibilitychange',
        target: IS_SERVER ? null : document,
        handler: handleChange,
    });

    return visibilityState;
}
