import { useCallback, useEffect, useState } from "react";

const IS_SERVER = typeof window === 'undefined';

export interface OrientationState {
    type: OrientationType | undefined;
    angle: number | undefined;
}

const readOrientation = (): OrientationState => {
    if (IS_SERVER || !screen.orientation) return { type: undefined, angle: undefined };
    const { type, angle } = screen.orientation;
    return { type, angle };
};

export function useOrientation() {
    const [orientation, setOrientation] = useState<OrientationState>(readOrientation);

    const handleChange = useCallback(() => {
        setOrientation(readOrientation());
    }, []);

    useEffect(() => {
        if (IS_SERVER || !screen.orientation) return;

        screen.orientation.addEventListener('change', handleChange);
        return () => screen.orientation.removeEventListener('change', handleChange);
    }, [handleChange]);

    const { type, angle } = orientation;
    return [type, angle] as const;
}
