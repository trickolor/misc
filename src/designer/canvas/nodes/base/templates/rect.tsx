import type { ReactNode } from "react";

import { CanvasNodeBaseImpl } from "../impl";
import { CORNERS, SIDES } from "../constants";

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
                {children}
                <CanvasNodeBaseImpl.SelectionFrame />
                {SIDES.map(side => <CanvasNodeBaseImpl.SideResizer key={side} side={side} />)}
                {CORNERS.map(corner => <CanvasNodeBaseImpl.Rotation key={corner} angle={corner} />)}
                {CORNERS.map(corner => <CanvasNodeBaseImpl.AngleResizer key={corner} angle={corner} />)}
                <CanvasNodeBaseImpl.Center />
                <CanvasNodeBaseImpl.SizeIndicator />
            </CanvasNodeBaseImpl.Area>
        </CanvasNodeBaseImpl>
    );
}
