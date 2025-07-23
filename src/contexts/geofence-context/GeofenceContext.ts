import type { GeofenceContextType } from "@/types";
import { createContext } from "react";

export const GeofenceContext = createContext<GeofenceContextType | undefined>(undefined);
