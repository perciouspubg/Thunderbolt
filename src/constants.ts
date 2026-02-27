import { RifleVariant } from "./types";

export const LEUPOLD_SCOPES = [
  { id: "mark4hd-4.5-18", name: "Mark 4HD 4.5-18x52", adjustment: 0.25 },
  { id: "mark4hd-6-24", name: "Mark 4HD 6-24x52", adjustment: 0.25 },
  { id: "mark4hd-8-32", name: "Mark 4HD 8-32x56", adjustment: 0.25 },
  { id: "vx6hd-3-18", name: "VX-6HD 3-18x50", adjustment: 0.25 },
  { id: "vx6hd-4-24", name: "VX-6HD 4-24x52", adjustment: 0.25 },
  { id: "vx3hd-4.5-14", name: "VX-3HD 4.5-14x40", adjustment: 0.25 },
  { id: "vxfreedom-3-9", name: "VX-Freedom 3-9x40", adjustment: 0.25 },
];

export const DEFAULT_RIFLE_PROFILES = [
  {
    id: "default-sc76",
    name: "Standard SC-76",
    variant: RifleVariant.SC76,
    barrelLength: 26,
    muzzleVelocity: 2650,
    twistRate: 10,
    sightHeight: 1.5,
    zeroRange: 100,
    scopeModel: "Mark 4HD 6-24x52",
    reticleType: "TMR",
    bulletWeight: 168,
    ballisticCoefficient: 0.462,
    bcType: 'G1' as const,
  }
];

export const RIFLE_VARIANTS = Object.values(RifleVariant);
