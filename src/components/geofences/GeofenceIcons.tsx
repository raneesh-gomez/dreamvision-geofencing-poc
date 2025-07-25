import { 
    LandPlot,
    Building2,
    Users,
    Locate
} from "lucide-react";
import type { GeofenceType } from "@/types";
import { GeofenceTypes } from "@/constants";
import { type JSX } from "react";

export const GeofenceTypeIcons: Record<GeofenceType, JSX.Element> = {
  [GeofenceTypes.COUNTRY]: <LandPlot className="w-4 h-4" />,
  [GeofenceTypes.BRANCH]: <Building2 className="w-4 h-4" />,
  [GeofenceTypes.SUBBRANCH]: <Locate className="w-4 h-4" />,
  [GeofenceTypes.FIELD_OFFICER]: <Users className="w-4 h-4" />,
};