export type HazardType = 'waterlogging' | 'pothole' | 'road_crack' | 'damaged_road' | 'debris';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type HazardStatus = 'new' | 'detected' | 'acknowledged' | 'in_progress' | 'resolved';

export interface GpsLocation {
  lat: number;
  lon: number;
  roadName: string;
  zone: string;
}

export interface BusTelemetry {
  id: string; // e.g. "BUS-102"
  routeNumber: string; // e.g. "Route 102"
  routeName: string; // e.g. "Gandhipuram → Ukkadam"
  currentSpeed: number; // km/h (e.g. 28)
  headingDeg: number;
  lat: number;
  lon: number;
  routeProgress: number; // 0 to 1
  routeDirection: 1 | -1; // forward or reverse
  status: 'active' | 'standby' | 'alert';
  aiCamera: 'ACTIVE' | 'SCANNING' | 'CALIBRATING';
  lidar: 'ACTIVE' | 'MEASURING' | 'STANDBY';
  gpsStatus: 'LOCKED' | 'SEARCHING' | 'ACQUIRING';
  network: '5G' | '4G' | 'OFFLINE';
  edgeAi: 'ACTIVE' | 'PROCESSING' | 'IDLE';
  lastDetection: string;
  sensorStatus: 'nominal' | 'measuring' | 'calibrating';
  cameraStatus: 'active' | 'warning' | 'recalibrating';
  connectivityStatus: '5G_SA' | '4G_LTE' | 'reconnecting';
  signalStrengthDbm: number; // e.g. -64
  latencyMs: number; // e.g. 12
  edgeHardware: string; // "NVIDIA Jetson Orin Nano"
  lastPing: string;
  color: string;
  batteryLevel: number;
  tempCelsius: number;
  lastCalibration: string;
}

export interface HazardRecord {
  id: string; // e.g. "INC-2048"
  type: HazardType;
  title: string;
  severity: SeverityLevel;
  confidenceScore: number; // e.g. 94 (%)
  timestamp: string;
  detectedAtMs: number;
  busId: string; // e.g. "BUS-102"
  location: GpsLocation;
  // Water depth specific (when type === 'waterlogging')
  sensorHeight?: number; // meters e.g. 1.25
  surfaceDistance?: number; // meters e.g. 0.60
  waterDepth?: number; // meters e.g. 0.65
  // Road dimensions
  dimensions?: string;
  status: HazardStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  responseTime?: string;
  resolvedAt?: string;
  suggestedAction: string;
  bbox?: { x: number; y: number; w: number; h: number }; // normalized 0-100%
}

export interface AlertItem {
  id: string;
  hazardId: string;
  type: HazardType;
  severity: SeverityLevel;
  title: string;
  depthMeters?: number;
  locationName: string;
  busId: string;
  timestamp: string;
  status: 'new' | 'unacknowledged' | 'acknowledged' | 'in_progress' | 'resolved' | 'detected';
  department: 'PWD Roads' | 'Stormwater Drainage' | 'Traffic Police' | 'Smart City Ops';
}

export interface WaterSensorReading {
  sensorHeight: number; // 1.25 m
  surfaceDistance: number; // 0.60 m
  waterDepth: number; // 0.65 m
  timestamp: string;
  status: 'dry' | 'shallow' | 'moderate' | 'critical';
  confidence: number;
  rawPingsCount: number;
  tofPulseDurationPs: number;
}

export interface EdgePipelineStep {
  id: string;
  label: string;
  sublabel: string;
  status: 'idle' | 'active' | 'completed';
  latencyMs: number;
  details: string;
}

export type NavigationTab = 
  | 'overview'
  | 'live-monitoring'
  | 'live-fleet'
  | 'ai-detection'
  | 'ai-hazard'
  | 'water-depth'
  | 'waterlogging'
  | 'edge-ai'
  | 'gis-map'
  | 'alerts'
  | 'incidents'
  | 'incident-replay'
  | 'analytics'
  | 'heatmap'
  | 'sensor-health'
  | 'detection-history'
  | 'history'
  | 'architecture'
  | 'technical-approach'
  | 'problem-solution'
  | 'data-flow'
  | 'simulated-db'
  | 'database'
  | 'presentation';

