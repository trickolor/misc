import { useLocalStorage } from "./use-local-storage";
import { useMediaQuery } from "./use-meida-query";

const LOCAL_STORAGE_KEY = 'dark-mode';
const QUERY = '(prefers-color-scheme: dark)';

interface Options {
    storageKey?: string;
    fallback?: boolean;
}

export function useDarkMode({
    storageKey = LOCAL_STORAGE_KEY,
    fallback = false,
}: Options = {}) {
    const matches = useMediaQuery(QUERY, fallback);
    const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(storageKey, matches);

    return {
        isDarkMode,
        toggle: () => setIsDarkMode(prev => !prev),
        enable: () => setIsDarkMode(true),
        disable: () => setIsDarkMode(false),
        set: (value: boolean) => setIsDarkMode(value),
    } as const;
}