import { CanvasNodeLineBase } from "../base";
import { LineNodeImpl } from "./impl";
import { MIN_LINE_HIT_HEIGHT } from "./constants";

export interface LineNodeProps {
    id: string;
    type: 'line';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    rotation: number;

    strokeWidth: number;
}

export function LineNode({ strokeWidth, ...base }: LineNodeProps) {
    // Guarantee a comfortable hit area for thin strokes. The visible stroke
    // sits at `y = height / 2` inside the Area, so widening the hit band
    // doesn't shift the line visually — it just grows the pointer target.
    const hitHeight = Math.max(base.height, strokeWidth, MIN_LINE_HIT_HEIGHT);

    return (
        <CanvasNodeLineBase {...base} height={hitHeight}>
            <LineNodeImpl strokeWidth={strokeWidth}>
                <LineNodeImpl.View />
            </LineNodeImpl>
        </CanvasNodeLineBase>
    );
}

export const LineNodeContext = LineNodeImpl.Context;
