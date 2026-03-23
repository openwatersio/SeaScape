import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from "zustand/middleware";

export type SpeedUnit = 'knot' | 'mph' | 'km/h';
export type DistanceUnit = 'nm' | 'mi' | 'km';
export type DepthUnit = 'm' | 'ft' | 'fathom';
export type TemperatureUnit = 'C' | 'F';

interface UnitInfo {
  abbr: string;
  singular: string;
  plural: string;
}

const speedUnits: Record<SpeedUnit, UnitInfo & { fromMps: number }> = {
  'knot': { abbr: 'kn', singular: 'Knot', plural: 'Knots', fromMps: 1.9438444924406 },
  'mph': { abbr: 'mph', singular: 'Mile per hour', plural: 'Miles per hour', fromMps: 2.2369362920544 },
  'km/h': { abbr: 'km/h', singular: 'Kilometer per hour', plural: 'Kilometers per hour', fromMps: 3.6 },
};

const distanceUnitDefs: Record<DistanceUnit, UnitInfo & { fromMeters: number }> = {
  'nm': { abbr: 'nm', singular: 'Nautical Mile', plural: 'Nautical Miles', fromMeters: 1 / 1852 },
  'mi': { abbr: 'mi', singular: 'Mile', plural: 'Miles', fromMeters: 1 / 1609.344 },
  'km': { abbr: 'km', singular: 'Kilometer', plural: 'Kilometers', fromMeters: 0.001 },
};

const depthUnitDefs: Record<DepthUnit, UnitInfo & { fromMeters: number }> = {
  'm': { abbr: 'm', singular: 'Meter', plural: 'Meters', fromMeters: 1 },
  'ft': { abbr: 'ft', singular: 'Foot', plural: 'Feet', fromMeters: 3.28084 },
  'fathom': { abbr: 'fm', singular: 'Fathom', plural: 'Fathoms', fromMeters: 1 / 1.8288 },
};

const temperatureUnitDefs: Record<TemperatureUnit, UnitInfo> = {
  'C': { abbr: '°C', singular: 'Celsius', plural: 'Celsius' },
  'F': { abbr: '°F', singular: 'Fahrenheit', plural: 'Fahrenheit' },
};

interface State {
  speed: SpeedUnit;
  distance: DistanceUnit;
  depth: DepthUnit;
  temperature: TemperatureUnit;
}

export const usePreferredUnits = create<State>()(
  persist(
    (): State => ({
      speed: 'knot',
      distance: 'nm',
      depth: 'm',
      temperature: 'C',
    }),
    {
      name: "preferred-units",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate(persisted, version) {
        const state = persisted as Record<string, unknown>;
        if (version === 0) {
          // Map old convert-units keys to new keys
          if (state.distance === 'nMi') state.distance = 'nm';
          if (state.speed === 'm/s') state.speed = 'knot';
        }
        return state as unknown as State;
      },
    }
  )
)

export function setPreferredUnits(state: Partial<State>) {
  usePreferredUnits.setState(state);
}

export function getSpeedUnits(): SpeedUnit[] {
  return Object.keys(speedUnits) as SpeedUnit[];
}

export function getDistanceUnits(): DistanceUnit[] {
  return Object.keys(distanceUnitDefs) as DistanceUnit[];
}

export function getDepthUnits(): DepthUnit[] {
  return Object.keys(depthUnitDefs) as DepthUnit[];
}

export function getTemperatureUnits(): TemperatureUnit[] {
  return Object.keys(temperatureUnitDefs) as TemperatureUnit[];
}

export function describeUnit(unit: SpeedUnit | DistanceUnit | DepthUnit | TemperatureUnit): UnitInfo {
  return speedUnits[unit as SpeedUnit]
    ?? distanceUnitDefs[unit as DistanceUnit]
    ?? depthUnitDefs[unit as DepthUnit]
    ?? temperatureUnitDefs[unit as TemperatureUnit];
}

export function toSpeed(measure: number | undefined, { decimals = 1 } = {}): { value: string } & UnitInfo {
  const unit = speedUnits[usePreferredUnits.getState().speed];
  const value = ((measure ?? 0) * unit.fromMps).toFixed(decimals);
  return { value, ...unit };
}

export function toDistance(meters: number | undefined, { decimals = 1 } = {}): { value: string } & UnitInfo {
  const def = distanceUnitDefs[usePreferredUnits.getState().distance];
  const value = ((meters ?? 0) * def.fromMeters).toFixed(decimals);
  return { value, ...def };
}

export function toDepth(meters: number | undefined, { decimals = 1 } = {}): { value: string } & UnitInfo {
  const def = depthUnitDefs[usePreferredUnits.getState().depth];
  const value = ((meters ?? 0) * def.fromMeters).toFixed(decimals);
  return { value, ...def };
}

/** Convert Kelvin to preferred temperature unit */
export function toTemperature(kelvin: number | undefined, { decimals = 1 } = {}): { value: string } & UnitInfo {
  const unit = usePreferredUnits.getState().temperature;
  const def = temperatureUnitDefs[unit];
  const celsius = (kelvin ?? 273.15) - 273.15;
  const converted = unit === 'F' ? celsius * 9 / 5 + 32 : celsius;
  return { value: converted.toFixed(decimals), ...def };
}
