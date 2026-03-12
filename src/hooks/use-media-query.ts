import { useState } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

const IS_SERVER = typeof window === 'undefined';

export function useMediaQuery(query: string, fallback: boolean = false) {
    const getMatches = (query: string) => IS_SERVER
        ? fallback
        : window.matchMedia(query).matches;

    const [matches, setMatches] = useState(getMatches(query));
    const handleChange = () => setMatches(getMatches(query));

    useIsomorphicLayoutEffect(() => {
        const media = window.matchMedia(query);
        handleChange();

        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
}