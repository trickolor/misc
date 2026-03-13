import { useState } from "react";

export function useIsFirstRender(): boolean {
    const [[isFirstRender], setState] = useState(() => [true]);
    if (isFirstRender) setState([false]);
    return isFirstRender;
}
