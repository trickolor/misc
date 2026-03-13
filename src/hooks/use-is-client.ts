import { useState } from "react";

const IS_SERVER = typeof window === 'undefined';

export function useIsClient(): boolean {
    const [[isClient], setState] = useState(() => [!IS_SERVER]);
    if (!isClient && !IS_SERVER) setState([true]);
    return isClient;
}
