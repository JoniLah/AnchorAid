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

export enum AnchorType {
  DANFORTH = 'danforth',
  BRUCE = 'bruce',
  PLOW = 'plow',
  DELTA = 'delta',
  ROCNA = 'rocna',
  MANTUS = 'mantus',
  FORTRESS = 'fortress',
  AC14 = 'ac14',
  SPADE = 'spade',
  COBRA = 'cobra',
  HERRESHOFF = 'herreshoff',
  NORTHILL = 'northill',
  ULTRA = 'ultra',
  EXCEL = 'excel',
  VULCAN = 'vulcan',
  SUPREME = 'supreme',
  STOCKLESS = 'stockless',
  NAVY_STOCKLESS = 'navy_stockless',
  KEDGE = 'kedge',
  GRAPNEL = 'grapnel',
  MUSHROOM = 'mushroom',
  OTHER = 'other',
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
  anchorType?: AnchorType;
  recommendedRodeLength?: number;
  actualRodeDeployed?: number;
  boatLength?: number;
  swingRadius?: number;
  anchorPoint?: Location;
  dragThreshold?: number;
  unitSystem: UnitSystem;
  notes?: string;
}

export enum AlarmSoundType {
  DEFAULT = 'default',
  LOUD = 'loud',
  PERSISTENT = 'persistent',
  SIREN = 'siren',
  BEEP = 'beep',
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  unitSystem: UnitSystem;
  defaultScopeRatio: number;
  defaultDragThreshold: number;
  defaultUpdateInterval: number;
  defaultSmoothingWindow: number;
  defaultBowHeight?: number;
  defaultSafetyMargin?: number;
  defaultChainLength?: number;
  defaultTotalRodeAvailable?: number;
  defaultRodeType?: RodeType;
  language?: 'en' | 'fi' | 'sv';
  alarmSoundType?: AlarmSoundType;
  alarmVolume?: number; // 0.0 to 1.0
  theme?: Theme;
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

