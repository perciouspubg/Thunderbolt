export enum RifleVariant {
  SC76 = "SC-76 Thunderbolt (7.62mm)",
  SC86 = "SC-86 (.338 Lapua)",
  SC127 = "SC-127 (.50 BMG)"
}

export interface RifleProfile {
  id: string;
  name: string;
  variant: RifleVariant;
  barrelLength: number; // inches
  muzzleVelocity: number; // fps
  twistRate: number; // 1:x
  sightHeight: number; // inches
  zeroRange: number; // yards
  scopeModel: string;
  reticleType: string;
  bulletWeight: number; // grains
  ballisticCoefficient: number; // G1 or G7
  bcType: 'G1' | 'G7';
}

export interface EnvironmentalData {
  temperature: number; // Fahrenheit
  pressure: number; // inHg
  humidity: number; // %
  altitude: number; // feet
  windSpeed: number; // mph
  windAngle: number; // degrees (0-360)
  inclination: number; // degrees
}

export interface BallisticSolution {
  range: number;
  elevationMOA: number;
  elevationClicks: number;
  windageMOA: number;
  windageClicks: number;
  timeOfFlight: number;
  velocity: number;
  energy: number;
}
