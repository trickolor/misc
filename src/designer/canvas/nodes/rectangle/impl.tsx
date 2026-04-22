import { createContext, type ReactNode } from "react";

import { useStrictContext } from "@/hooks/use-strict-context";

import type { RectangleNodeContext } from "./types";
import { CanvasNodeBaseContext } from "../base";

// ---------- //

const Context = createContext<RectangleNodeContext | null>(null);

// ---------- //

interface RootProps {
    children?: ReactNode;
}

function Root({ children }: RootProps) {
    const contextValue = {};

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

    return (
        <div
            data-family="rectangle-node"
            data-component="view"
            data-node-id={id}

            className="absolute"
            style={{ width, height, backgroundColor: fill, opacity }}
        />
    );
}

export const RectangleNodeImpl = Object.assign(Root, {
    View,
    Context,
});