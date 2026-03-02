

// src/lib/amenityIcons.js
import {
  Dumbbell,
  TreePine,
  Waves,
  Shield,
  ParkingCircle,
  Building2,
  Baby,
  Home,
} from "lucide-react";

export function amenityTitleToIconComponent(title = "") {
  const key = title.toLowerCase().trim();

  const map = {
    "fitness center": Dumbbell,
    fitness: Dumbbell,
    gym: Dumbbell,

    garden: TreePine,
    park: TreePine,

    "infinity pool": Waves,
    pool: Waves,
    swimming: Waves,

    security: Shield,
    "24/7 security": Shield,

    parking: ParkingCircle,
    "car parking": ParkingCircle,

    clubhouse: Building2,
    kids: Baby,
    home: Home,
  };

  return map[key] || Home; // default fallback
}
