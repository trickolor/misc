import { createContext } from "react";

import type { RootContextValue } from "./types";

export const RootContext = createContext<RootContextValue | null>(null);
