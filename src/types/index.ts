export enum UnitSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

export enum RodeType {
  CHAIN = 'chain',
  ROPE_CHAIN = 'rope+chain',
  ROPE = 'rope',
}

export enum BottomType {
  SAND = 'sand',
  MUD = 'mud',
  CLAY = 'clay',
  GRASS_WEEDS = 'grass/weeds',
  ROCK = 'rock',
  CORAL = 'coral',
  UNKNOWN = 'unknown',
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface AnchoringSession {
  id: string;
  timestamp: number;
  location?: Location;
  depth?: number;
  bowHeight?: number;
  scopeRatio?: number;
  rodeType?: RodeType;
  chainLength?: number;
  totalRodeAvailable?: number;
  safetyMargin?: number;
  windSpeed?: number;
  gustSpeed?: number;
  windDirection?: number;
  bottomType?: BottomType;
  recommendedRodeLength?: number;
  actualRodeDeployed?: number;
  boatLength?: number;
  swingRadius?: number;
  anchorPoint?: Location;
  dragThreshold?: number;
  unitSystem: UnitSystem;
}

export interface AppSettings {
  unitSystem: UnitSystem;
  defaultScopeRatio: number;
  defaultDragThreshold: number;
  defaultUpdateInterval: number;
  defaultSmoothingWindow: number;
}

export interface AlarmState {
  isActive: boolean;
  anchorPoint?: Location;
  dragThreshold: number;
  updateInterval: number;
  smoothingWindow: number;
  currentPosition?: Location;
  smoothedPosition?: Location;
  distanceFromAnchor: number;
  isAlarmTriggered: boolean;
  alarmTriggerTime?: number;
  gpsAccuracy?: number;
}

export interface ScopeCalculationResult {
  totalVerticalDistance: number;
  recommendedRodeLength: number;
  exceedsAvailable: boolean;
  warning?: string;
}

export interface SwingRadiusResult {
  radius: number;
  diameter: number;
}

