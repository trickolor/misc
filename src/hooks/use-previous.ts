import { useState } from "react";

interface State<T> {
    current: T;
    previous: T | undefined;
}

export function usePrevious<T>(value: T): T | undefined {
    const [state, setState] = useState<State<T>>({
        current: value,
        previous: undefined,
    });

    if (state.current !== value)
        setState({ current: value, previous: state.current });

    return state.previous;
}
