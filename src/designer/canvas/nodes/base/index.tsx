import { CanvasNodeBaseImpl } from "./impl";

export { CanvasNodeBase, type CanvasNodeBaseProps } from "./templates/rect";
export { CanvasNodeLineBase, type CanvasNodeLineBaseProps } from "./templates/line";

export const CanvasNodeBaseContext = CanvasNodeBaseImpl.Context;
