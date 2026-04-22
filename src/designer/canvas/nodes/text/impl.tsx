import { createContext, type ReactNode } from "react";

import { useMemoizedObject } from "@/hooks/use-memoized-object";
import { useStrictContext } from "@/hooks/use-strict-context";

import { CanvasNodeBaseContext } from "../base";

import type { TextNodeContext } from "./types";

// ---------- //

const Context = createContext<TextNodeContext | null>(null);

// ---------- //

interface RootProps extends TextNodeContext {
    children?: ReactNode;
}

function Root({
    content,
    font,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    children,
}: RootProps) {
    const contextValue = useMemoizedObject({
        content,
        font,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
    });

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
}

// ---------- //

function View() {
    const {
        id, width, height,
        fill, opacity,
    } = useStrictContext(CanvasNodeBaseContext);

    const {
        content,
        font,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
    } = useStrictContext(Context);

    return (
        <div
            data-family="text-node"
            data-component="view"
            data-node-id={id}

            className="absolute whitespace-pre-wrap wrap-break-word"
            style={{
                width,
                height,
                color: fill,
                opacity,
                fontFamily: font,
                fontSize,
                fontWeight,
                lineHeight,
                letterSpacing,
            }}
        >
            {content}
        </div>
    );
}

// ---------- //

export const TextNodeImpl = Object.assign(Root, {
    View,
    Context,
});
