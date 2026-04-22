import { createContext } from "react";

import type { UniverseContextValue } from "./types";

export const UniverseContext = createContext<UniverseContextValue | null>(null);
