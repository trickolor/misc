import { useCallback, useState } from "react";
import { useEventListener } from "./use-event-listener";

const IS_SERVER = typeof window === 'undefined';

export interface PreferredLanguageState {
    language: string | undefined;
    languages: readonly string[];
}

const readLanguage = (): PreferredLanguageState => {
    if (IS_SERVER) return { language: undefined, languages: [] };
    const { language, languages } = navigator;
    return { language, languages };
};

export function usePreferredLanguage() {
    const [state, setState] = useState<PreferredLanguageState>(readLanguage);

    const handleChange = useCallback(() => {
        setState(readLanguage());
    }, []);

    useEventListener({ event: 'languagechange', handler: handleChange });

    const { language, languages } = state;
    return [language, languages] as const;
}
