import { useCallback, useState } from "react"

export function useCopyToClipboard() {
    const [text, setText] = useState<string | null>(null);

    const copy = useCallback(async (text: string) => {
        if (!navigator.clipboard) {
            console.warn('Clipboard API not supported');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            setText(text);
            return true;
        }

        catch (error) {
            console.error('Failed to copy text to clipboard', error);
            setText(null);
            return false;
        }
    }, []);

    return [text, copy] as const;
}