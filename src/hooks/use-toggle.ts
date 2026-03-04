import { useCallback, useState } from 'react'

export function useToggle(
    defaultValue?: boolean,
) {
    const [value, setValue] = useState(Boolean(defaultValue));

    const toggle = useCallback(() => {
        setValue(prev => !prev);
    }, []);

    return [value, toggle, setValue] as const;
}