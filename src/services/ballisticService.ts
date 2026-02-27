import { RifleProfile, EnvironmentalData, BallisticSolution } from "../types";

/**
 * A simplified ballistic solver.
 * In a real-world app, this would use a 4DOF or 6DOF model.
 * For this companion app, we'll use a robust approximation of the point-mass model.
 */
export class BallisticService {
  private static GRAVITY = 32.174; // ft/s^2

  static calculate(
    range: number, // yards
    profile: RifleProfile,
    env: EnvironmentalData
  ): BallisticSolution {
    const rangeFt = range * 3;
    const v0 = profile.muzzleVelocity;
    const bc = profile.ballisticCoefficient;
    
    // Density correction factor (simplified)
    // Standard atmosphere: 59F, 29.92 inHg
    const rho0 = 0.0765; // lb/ft^3
    const tempRankine = env.temperature + 459.67;
    const rho = (env.pressure * 0.491) / (0.37 * tempRankine); // simplified ideal gas
    const densityFactor = rho / rho0;
    
    const effectiveBC = bc * densityFactor;

    // Simplified drop calculation (parabolic approximation with drag)
    // t = range / (v_avg)
    // v_avg is roughly v0 - (drag effect)
    // This is a very rough approximation for UI demonstration.
    const timeOfFlight = rangeFt / (v0 * 0.9); // Rough avg velocity
    
    // Drop in inches: 0.5 * g * t^2 * 12
    const dropInches = 0.5 * this.GRAVITY * Math.pow(timeOfFlight, 2) * 12;
    
    // Convert to MOA: 1 MOA at range R is approx (R / 100) inches
    const moaAtRange = range / 100;
    const elevationMOA = dropInches / moaAtRange;
    
    // Windage calculation
    // Deflection = WindSpeed * (TimeOfFlight - Range/V0)
    const windSpeedFps = env.windSpeed * 1.46667;
    const windAngleRad = (env.windAngle * Math.PI) / 180;
    const crossWind = windSpeedFps * Math.sin(windAngleRad);
    const windageInches = crossWind * (timeOfFlight - (rangeFt / v0)) * 12;
    const windageMOA = windageInches / moaAtRange;

    return {
      range,
      elevationMOA: parseFloat(elevationMOA.toFixed(2)),
      elevationClicks: Math.round(elevationMOA / 0.25),
      windageMOA: parseFloat(windageMOA.toFixed(2)),
      windageClicks: Math.round(windageMOA / 0.25),
      timeOfFlight: parseFloat(timeOfFlight.toFixed(3)),
      velocity: Math.round(v0 * 0.8), // Placeholder
      energy: Math.round(2500), // Placeholder
    };
  }

  static getTrajectoryTable(profile: RifleProfile, env: EnvironmentalData): BallisticSolution[] {
    const table: BallisticSolution[] = [];
    for (let r = 100; r <= 1000; r += 50) {
      table.push(this.calculate(r, profile, env));
    }
    return table;
  }
}
