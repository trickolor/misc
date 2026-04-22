import type { ReactNode } from "react";

import { CanvasNodeBaseImpl } from "./impl";
import { CORNERS, SIDES } from "./context";

export interface CanvasNodeBaseProps {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    rotation: number;
    children?: ReactNode;
}

export function CanvasNodeBase({ children, ...rest }: CanvasNodeBaseProps) {
    return (
        <CanvasNodeBaseImpl {...rest}>
            <CanvasNodeBaseImpl.Area>
                {CORNERS.map(corner => <CanvasNodeBaseImpl.AngleResizer key={corner} angle={corner} />)}
                {CORNERS.map(corner => <CanvasNodeBaseImpl.Rotation key={corner} angle={corner} />)}
                {SIDES.map(side => <CanvasNodeBaseImpl.SideResizer key={side} side={side} />)}
                <CanvasNodeBaseImpl.Center />
                {children}
            </CanvasNodeBaseImpl.Area>
        </CanvasNodeBaseImpl>
    )
}

export const CanvasNodeBaseContext = CanvasNodeBaseImpl.Context;