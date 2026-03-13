import { useState, type Dispatch, type SetStateAction } from "react";

export function useDefault<T>(
    defaultValue: T,
    initialValue?: T | null,
): [T, Dispatch<SetStateAction<T | null | undefined>>] {
    const [state, setState] = useState<T | null | undefined>(initialValue);
    return [state ?? defaultValue, setState];
}
