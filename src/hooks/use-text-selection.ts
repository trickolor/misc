import { useCallback, useState } from "react";
import { useEventListener } from "./use-event-listener";

interface TextSelection {
    text: string;
    rect: DOMRect | null;
}

const EMPTY: TextSelection = { text: '', rect: null };

const readSelection = (): TextSelection => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return EMPTY;

    return {
        text: selection.toString(),
        rect: selection.getRangeAt(0).getBoundingClientRect(),
    };
};

export function useTextSelection(): TextSelection {
    const [selection, setSelection] = useState<TextSelection>(EMPTY);

    const handleSelectionChange = useCallback(() => {
        setSelection(readSelection());
    }, []);

    useEventListener({
        event: 'selectionchange',
        target: document,
        handler: handleSelectionChange,
    });

    return selection;
}
