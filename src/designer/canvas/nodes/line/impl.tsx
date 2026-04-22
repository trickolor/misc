import { createContext, type ReactNode } from "react";

import { useMemoizedObject } from "@/hooks/use-memoized-object";
import { useStrictContext } from "@/hooks/use-strict-context";

import { CanvasNodeBaseContext } from "../base";

import type { LineNodeContext } from "./types";
import {
    SELECTION_OVERLAY_COLOR,
    SELECTION_OVERLAY_EXTRA_WIDTH,
} from "./constants";

// ---------- //

const Context = createContext<LineNodeContext | null>(null);

// ---------- //

interface RootProps extends LineNodeContext {
    children?: ReactNode;
}

function Root({ strokeWidth, children }: RootProps) {
    const contextValue = useMemoizedObject({ strokeWidth });

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
}

// ---------- //

/**
 * Renders the visible line as an SVG `<path>`. SVG is used (rather than an
 * HTML rotated div) because the roadmap calls for curve/split functionality —
 * both are trivially expressed as path edits and would otherwise require a
 * full rewrite. Today the path is a straight segment; tomorrow it becomes
 * `M x y Q cx cy x y` for a quadratic curve with no structural changes.
 *
 * The SVG sits inside the base's {@link Area} which remains the DOM hit target,
 * so clicks on the line still feed the standard select/drag pipeline. The
 * stroke is drawn at `y = height/2` so it's centered within the (larger)
 * hit band; `overflow: visible` leaves room for future curves that bulge
 * outside the bounding box.
 *
 * Selection feedback lives here (and not in a base `SelectionFrame`) because
 * the "frame" for a line is shape-specific: it must hug the actual stroke,
 * not the rectangular hit band. We draw a blue overlay path beneath the
 * visible one, slightly thicker, so the node's selection halo reads as a
 * blue outline around the line itself.
 */
function View() {
    const {
        id, width, height,
        fill, opacity,
        status,
    } = useStrictContext(CanvasNodeBaseContext);

    const { strokeWidth } = useStrictContext(Context);

    const midY = height / 2;
    const path = `M 0 ${midY} L ${width} ${midY}`;
    const isHighlighted = status !== 'idle';

    return (
        <svg
            data-family="line-node"
            data-component="view"
            data-node-id={id}

            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            overflow="visible"
            className="absolute inset-0 pointer-events-none block"
            style={{ opacity }}
        >
            {isHighlighted && (
                <path
                    data-component="selection-overlay"
                    d={path}
                    stroke={SELECTION_OVERLAY_COLOR}
                    strokeWidth={strokeWidth + SELECTION_OVERLAY_EXTRA_WIDTH}
                    strokeLinecap="round"
                    fill="none"
                />
            )}
            <path
                d={path}
                stroke={fill}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}

// ---------- //

export const LineNodeImpl = Object.assign(Root, {
    View,
    Context,
});
