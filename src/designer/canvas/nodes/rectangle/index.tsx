import { CanvasNodeBase } from "../base";
import { RectangleNodeImpl } from "./impl";

export interface RectangleNodeProps {
    id: string;
    type: 'rectangle';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    rotation: number;
}

export function RectangleNode(props: RectangleNodeProps) {
    return (
        <CanvasNodeBase {...props}>
            <RectangleNodeImpl {...{}}>
                <RectangleNodeImpl.View />
            </RectangleNodeImpl>
        </CanvasNodeBase>
    );
}

export const RectangleNodeContext = RectangleNodeImpl.Context;