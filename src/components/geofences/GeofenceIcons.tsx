import { 
    Building2,
    Users,
    Landmark,
    Earth
} from "lucide-react";
import type { GeofenceType } from "@/types";
import { GeofenceTypes } from "@/constants";
import { type JSX } from "react";

export const GeofenceTypeIcons: Record<GeofenceType, JSX.Element> = {
  [GeofenceTypes.COUNTRY]: <Earth className="w-4 h-4" />,
  [GeofenceTypes.BRANCH]: <Landmark className="w-4 h-4" />,
  [GeofenceTypes.SUBBRANCH]: <Building2 className="w-4 h-4" />,
  [GeofenceTypes.FIELD_OFFICER]: <Users className="w-4 h-4" />,
};