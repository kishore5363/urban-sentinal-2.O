import { BusTelemetry, HazardRecord, AlertItem, HazardType } from '../types';

export interface RouteDefinition {
  id: string;
  name: string;
  number: string;
  color: string;
  waypoints: [number, number][]; // [lat, lon]
}

// Metropolitan Smart City Corridor (Coimbatore Transit Testbed)
// Center anchor around: 11.0168, 76.9558
export const CITY_ROUTES: RouteDefinition[] = [
  {
    id: 'route-102',
    number: 'Route 102',
    name: 'Gandhipuram → Ukkadam',
    color: '#06b6d4', // cyan
    waypoints: [
      [11.0185, 76.9675], // Gandhipuram Central Bus Stand
      [11.0168, 76.9558], // Cross Cut Rd / Collectorate Underpass (Simulated Incident Spot)
      [11.0105, 76.9520], // Town Hall Junction
      [11.0025, 76.9510], // South Gate Arterial
      [10.9950, 76.9515], // Ukkadam Bus Terminal
    ]
  },
  {
    id: 'route-101',
    number: 'Route 101',
    name: 'Gandhipuram → Singanallur',
    color: '#3b82f6', // blue
    waypoints: [
      [11.0185, 76.9675], // Gandhipuram Central Bus Stand
      [11.0120, 76.9780], // Lakshmi Mills Junction
      [11.0080, 76.9940], // Nava India Signal
      [11.0040, 77.0120], // Peelamedu ESI Hospital
      [10.9980, 77.0280], // Singanallur Bus Stand
    ]
  },
  {
    id: 'route-103',
    number: 'Route 103',
    name: 'RS Puram → Peelamedu',
    color: '#10b981', // emerald
    waypoints: [
      [11.0090, 76.9420], // DB Road, RS Puram
      [11.0130, 76.9530], // Brookefields Corridor
      [11.0180, 76.9650], // Gandhipuram North
      [11.0220, 76.9850], // Hope College Bridge
      [11.0260, 77.0050], // Peelamedu Aerodrome Rd
    ]
  },
  {
    id: 'route-104',
    number: 'Route 104',
    name: 'Railway Station → Saravanampatti',
    color: '#f59e0b', // amber
    waypoints: [
      [11.0005, 76.9630], // Coimbatore Railway Terminus
      [11.0160, 76.9690], // Ramnagar Cross
      [11.0350, 76.9780], // Ganapathy Flyover
      [11.0550, 76.9890], // Sathy Road Corridor
      [11.0820, 76.9980], // Saravanampatti IT Park
    ]
  },
  {
    id: 'route-105',
    number: 'Route 105',
    name: 'Ukkadam → Thudiyalur',
    color: '#8b5cf6', // purple
    waypoints: [
      [10.9950, 76.9515], // Ukkadam Bus Terminal
      [11.0100, 76.9520], // Town Hall Clock Tower
      [11.0280, 76.9480], // Saibaba Colony Main
      [11.0520, 76.9420], // Koundampalayam Bridge
      [11.0780, 76.9380], // Thudiyalur Junction
    ]
  }
];

export const INITIAL_BUSES: BusTelemetry[] = [
  {
    id: 'BUS-101',
    routeNumber: 'Route 101',
    routeName: 'Gandhipuram → Singanallur',
    currentSpeed: 31,
    headingDeg: 110,
    lat: 11.0080,
    lon: 76.9940,
    routeProgress: 0.45,
    routeDirection: 1,
    status: 'active',
    aiCamera: 'ACTIVE',
    lidar: 'ACTIVE',
    gpsStatus: 'LOCKED',
    network: '5G',
    edgeAi: 'ACTIVE',
    lastDetection: 'Asphalt rutting (30m)',
    sensorStatus: 'nominal',
    cameraStatus: 'active',
    connectivityStatus: '5G_SA',
    signalStrengthDbm: -66,
    latencyMs: 14,
    edgeHardware: 'NVIDIA Jetson Orin Nano (40 TOPS)',
    lastPing: '1s ago',
    color: '#3b82f6',
    batteryLevel: 98,
    tempCelsius: 41,
    lastCalibration: '2026-09-18',
  },
  {
    id: 'BUS-102',
    routeNumber: 'Route 102',
    routeName: 'Gandhipuram → Ukkadam',
    currentSpeed: 28,
    headingDeg: 195,
    lat: 11.0168,
    lon: 76.9558,
    routeProgress: 0.25,
    routeDirection: 1,
    status: 'alert',
    aiCamera: 'ACTIVE',
    lidar: 'ACTIVE',
    gpsStatus: 'LOCKED',
    network: '5G',
    edgeAi: 'PROCESSING',
    lastDetection: 'Waterlogging (0.65m)',
    sensorStatus: 'measuring',
    cameraStatus: 'active',
    connectivityStatus: '5G_SA',
    signalStrengthDbm: -64,
    latencyMs: 12,
    edgeHardware: 'NVIDIA Jetson Orin Nano (40 TOPS)',
    lastPing: 'Just now',
    color: '#06b6d4',
    batteryLevel: 96,
    tempCelsius: 43,
    lastCalibration: '2026-09-19',
  },
  {
    id: 'BUS-103',
    routeNumber: 'Route 103',
    routeName: 'RS Puram → Peelamedu',
    currentSpeed: 34,
    headingDeg: 65,
    lat: 11.0180,
    lon: 76.9650,
    routeProgress: 0.52,
    routeDirection: 1,
    status: 'active',
    aiCamera: 'ACTIVE',
    lidar: 'ACTIVE',
    gpsStatus: 'LOCKED',
    network: '5G',
    edgeAi: 'ACTIVE',
    lastDetection: 'Road seam crack (4.2m)',
    sensorStatus: 'nominal',
    cameraStatus: 'active',
    connectivityStatus: '5G_SA',
    signalStrengthDbm: -68,
    latencyMs: 15,
    edgeHardware: 'NVIDIA Jetson Orin Nano (40 TOPS)',
    lastPing: '2s ago',
    color: '#10b981',
    batteryLevel: 94,
    tempCelsius: 42,
    lastCalibration: '2026-09-17',
  },
  {
    id: 'BUS-104',
    routeNumber: 'Route 104',
    routeName: 'Railway Station → Saravanampatti',
    currentSpeed: 26,
    headingDeg: 28,
    lat: 11.0350,
    lon: 76.9780,
    routeProgress: 0.40,
    routeDirection: 1,
    status: 'active',
    aiCamera: 'ACTIVE',
    lidar: 'ACTIVE',
    gpsStatus: 'LOCKED',
    network: '5G',
    edgeAi: 'ACTIVE',
    lastDetection: 'Severe Pothole (14cm)',
    sensorStatus: 'nominal',
    cameraStatus: 'active',
    connectivityStatus: '5G_SA',
    signalStrengthDbm: -71,
    latencyMs: 17,
    edgeHardware: 'NVIDIA Jetson Orin Nano (40 TOPS)',
    lastPing: '3s ago',
    color: '#f59e0b',
    batteryLevel: 91,
    tempCelsius: 45,
    lastCalibration: '2026-09-16',
  },
  {
    id: 'BUS-105',
    routeNumber: 'Route 105',
    routeName: 'Ukkadam → Thudiyalur',
    currentSpeed: 30,
    headingDeg: 345,
    lat: 11.0520,
    lon: 76.9420,
    routeProgress: 0.68,
    routeDirection: 1,
    status: 'active',
    aiCamera: 'ACTIVE',
    lidar: 'ACTIVE',
    gpsStatus: 'LOCKED',
    network: '5G',
    edgeAi: 'ACTIVE',
    lastDetection: 'Debris clear',
    sensorStatus: 'nominal',
    cameraStatus: 'active',
    connectivityStatus: '5G_SA',
    signalStrengthDbm: -65,
    latencyMs: 13,
    edgeHardware: 'NVIDIA Jetson Orin Nano (40 TOPS)',
    lastPing: '2s ago',
    color: '#8b5cf6',
    batteryLevel: 95,
    tempCelsius: 40,
    lastCalibration: '2026-09-19',
  }
];

export const INITIAL_HAZARDS: HazardRecord[] = [
  {
    id: 'INC-2048',
    type: 'waterlogging',
    title: 'CRITICAL WATERLOGGING UNDERPASS',
    severity: 'critical',
    confidenceScore: 94.0,
    timestamp: '14:22:08 IST',
    detectedAtMs: Date.now() - 120000,
    busId: 'BUS-102',
    location: {
      lat: 11.0168,
      lon: 76.9558,
      roadName: 'Gandhipuram - Ukkadam Underpass KM 4.2',
      zone: 'Central Transit Sector'
    },
    sensorHeight: 1.25,
    surfaceDistance: 0.60,
    waterDepth: 0.65,
    dimensions: 'Submerged length 34m, max depth 65cm',
    status: 'new',
    responseTime: 'Pending Dispatch',
    suggestedAction: 'Immediate high-capacity dewatering pump deployment and lane diversion via Service Corridor',
    bbox: { x: 20, y: 52, w: 60, h: 36 }
  },
  {
    id: 'INC-2045',
    type: 'pothole',
    title: 'Severe Impact Pothole Cluster',
    severity: 'high',
    confidenceScore: 95.2,
    timestamp: '14:15:32 IST',
    detectedAtMs: Date.now() - 520000,
    busId: 'BUS-104',
    location: {
      lat: 11.0350,
      lon: 76.9780,
      roadName: 'Ganapathy Flyover Approach, Left Lane',
      zone: 'North Corridor'
    },
    dimensions: '1.3m diameter, depth ~15cm, exposed aggregate',
    status: 'acknowledged',
    acknowledgedBy: 'PWD Corridor Supervisor',
    acknowledgedAt: '14:18:10 IST',
    responseTime: '2.6 min',
    suggestedAction: 'Cold-mix bituminous patch within 4 hours; cautionary traffic marker placed',
    bbox: { x: 34, y: 58, w: 32, h: 26 }
  },
  {
    id: 'INC-2041',
    type: 'road_crack',
    title: 'Structural Longitudinal Fatigue Crack',
    severity: 'medium',
    confidenceScore: 89.8,
    timestamp: '13:58:19 IST',
    detectedAtMs: Date.now() - 1500000,
    busId: 'BUS-103',
    location: {
      lat: 11.0180,
      lon: 76.9650,
      roadName: 'Gandhipuram North Cross Arterial',
      zone: 'Central Sector'
    },
    dimensions: 'Crack width 18mm, length 6.2m',
    status: 'in_progress',
    acknowledgedBy: 'Road Maintenance Unit 3',
    acknowledgedAt: '14:04:00 IST',
    responseTime: '5.7 min',
    suggestedAction: 'Bituminous hot-pour sealant injection to halt rainwater infiltration',
    bbox: { x: 38, y: 56, w: 26, h: 30 }
  },
  {
    id: 'INC-2038',
    type: 'damaged_road',
    title: 'Asphalt Shear & Surface Stripping',
    severity: 'high',
    confidenceScore: 92.4,
    timestamp: '13:30:15 IST',
    detectedAtMs: Date.now() - 3200000,
    busId: 'BUS-101',
    location: {
      lat: 11.0080,
      lon: 76.9940,
      roadName: 'Nava India Signal Transit Bay',
      zone: 'East Zone'
    },
    dimensions: '42m washboard ripple surface',
    status: 'resolved',
    acknowledgedBy: 'PWD Asphalt Ops',
    acknowledgedAt: '13:35:00 IST',
    resolvedAt: '14:10:00 IST',
    responseTime: '4.8 min',
    suggestedAction: 'Surface milled and cold-planed by emergency road maintenance unit',
    bbox: { x: 16, y: 48, w: 68, h: 42 }
  },
  {
    id: 'INC-2035',
    type: 'debris',
    title: 'Loose Aggregate / Construction Debris',
    severity: 'medium',
    confidenceScore: 91.0,
    timestamp: '12:45:00 IST',
    detectedAtMs: Date.now() - 5900000,
    busId: 'BUS-105',
    location: {
      lat: 11.0520,
      lon: 76.9420,
      roadName: 'Koundampalayam Bridge Descent',
      zone: 'North-West Corridor'
    },
    dimensions: 'Spread across 4m width',
    status: 'acknowledged',
    acknowledgedBy: 'Sanitation Quick Dispatch',
    acknowledgedAt: '12:50:00 IST',
    responseTime: '5.0 min',
    suggestedAction: 'Sweeper truck dispatched to clear loose rubble',
    bbox: { x: 28, y: 64, w: 44, h: 22 }
  },
  {
    id: 'INC-2031',
    type: 'waterlogging',
    title: 'Moderate Street Gutter Waterlogging',
    severity: 'medium',
    confidenceScore: 93.5,
    timestamp: '11:20:00 IST',
    detectedAtMs: Date.now() - 10900000,
    busId: 'BUS-103',
    location: {
      lat: 11.0220,
      lon: 76.9850,
      roadName: 'Hope College Bridge Underpass',
      zone: 'East Zone'
    },
    sensorHeight: 1.25,
    surfaceDistance: 0.97,
    waterDepth: 0.28,
    dimensions: 'Spread 14m, avg depth 28cm',
    status: 'resolved',
    acknowledgedBy: 'Stormwater Unit 2',
    acknowledgedAt: '11:25:00 IST',
    resolvedAt: '12:40:00 IST',
    responseTime: '5.0 min',
    suggestedAction: 'Stormwater grate cleared of debris; standing water drained',
    bbox: { x: 22, y: 55, w: 52, h: 30 }
  }
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-2048',
    hazardId: 'INC-2048',
    type: 'waterlogging',
    severity: 'critical',
    title: 'CRITICAL WATERLOGGING',
    depthMeters: 0.65,
    locationName: 'Gandhipuram - Ukkadam Underpass KM 4.2',
    busId: 'BUS-102',
    timestamp: '14:22:08 IST (Just now)',
    status: 'new',
    department: 'Stormwater Drainage'
  },
  {
    id: 'ALT-2045',
    hazardId: 'INC-2045',
    type: 'pothole',
    severity: 'high',
    title: 'HIGH ALERT: Severe Impact Pothole',
    locationName: 'Ganapathy Flyover Approach, Left Lane',
    busId: 'BUS-104',
    timestamp: '14:15:32 IST (7m ago)',
    status: 'acknowledged',
    department: 'PWD Roads'
  },
  {
    id: 'ALT-2041',
    hazardId: 'INC-2041',
    type: 'road_crack',
    severity: 'medium',
    title: 'ALERT: Structural Crack Infiltration Risk',
    locationName: 'Gandhipuram North Cross Arterial',
    busId: 'BUS-103',
    timestamp: '13:58:19 IST (24m ago)',
    status: 'in_progress',
    department: 'PWD Roads'
  },
  {
    id: 'ALT-2038',
    hazardId: 'INC-2038',
    type: 'damaged_road',
    severity: 'high',
    title: 'ALERT: Asphalt Stripping Corrugated Bay',
    locationName: 'Nava India Signal Transit Bay',
    busId: 'BUS-101',
    timestamp: '13:30:15 IST (52m ago)',
    status: 'resolved',
    department: 'PWD Roads'
  }
];

export interface CameraScenario {
  id: string;
  type: HazardType | 'clear';
  title: string;
  roadName: string;
  busId: string;
  confidence: number;
  depthMeters?: number;
  sensorDistance?: number;
  description: string;
  weather: 'heavy_rain' | 'overcast' | 'sunny' | 'dusk';
  bbox: { x: number; y: number; w: number; h: number; label: string };
  metrics: {
    fps: number;
    latencyMs: number;
    model: string;
    resolution: string;
  };
}

export const CAMERA_SCENARIOS: CameraScenario[] = [
  {
    id: 'scn-waterlogging',
    type: 'waterlogging',
    title: 'Waterlogging Detected (0.65m Depth)',
    roadName: 'Gandhipuram - Ukkadam Underpass KM 4.2',
    busId: 'BUS-102',
    confidence: 94.0,
    depthMeters: 0.65,
    sensorDistance: 0.60,
    description: 'Significant surface reflection and optical boundary detected. LiDAR sensor confirms 0.65m standing water exceeding vehicle safety threshold.',
    weather: 'heavy_rain',
    bbox: { x: 20, y: 52, w: 60, h: 36, label: 'WATERLOGGING_CRITICAL (94.0%) [0.65m]' },
    metrics: { fps: 30.0, latencyMs: 14.2, model: 'YOLOv8-UrbanEdge-FP16', resolution: '1920x1080 HDR' }
  },
  {
    id: 'scn-pothole',
    type: 'pothole',
    title: 'Severe Rim-Fracture Pothole',
    roadName: 'Ganapathy Flyover Approach, Left Lane',
    busId: 'BUS-104',
    confidence: 95.2,
    description: 'Radial asphalt breakup with exposed aggregate ballast. Depth estimated at ~15cm, high danger to two-wheelers and bus axles.',
    weather: 'overcast',
    bbox: { x: 34, y: 58, w: 32, h: 26, label: 'POTHOLE_CLASS_A (95.2%)' },
    metrics: { fps: 30.0, latencyMs: 13.8, model: 'YOLOv8-UrbanEdge-FP16', resolution: '1920x1080 HDR' }
  },
  {
    id: 'scn-road-crack',
    type: 'road_crack',
    title: 'Transverse Fatigue Road Crack',
    roadName: 'Gandhipuram North Cross Arterial',
    busId: 'BUS-103',
    confidence: 89.8,
    description: 'Longitudinal seam separation along road crown. Early bituminous injection required before monsoon downpours induce potholing.',
    weather: 'dusk',
    bbox: { x: 38, y: 56, w: 26, h: 30, label: 'ROAD_CRACK_SEAM (89.8%)' },
    metrics: { fps: 30.1, latencyMs: 15.2, model: 'YOLOv8-UrbanEdge-FP16', resolution: '1920x1080 HDR' }
  },
  {
    id: 'scn-damaged-road',
    type: 'damaged_road',
    title: 'Asphalt Stripping & Washboard Corrugation',
    roadName: 'Nava India Signal Transit Bay',
    busId: 'BUS-101',
    confidence: 92.4,
    description: 'Continuous asphalt shear and bituminous rutting spanning 42 meters. Severe ride quality degradation and vehicle alignment wear.',
    weather: 'sunny',
    bbox: { x: 16, y: 48, w: 68, h: 42, label: 'DAMAGED_ASPHALT (92.4%)' },
    metrics: { fps: 29.9, latencyMs: 14.1, model: 'YOLOv8-UrbanEdge-FP16', resolution: '1920x1080 HDR' }
  },
  {
    id: 'scn-debris',
    type: 'debris',
    title: 'Construction Debris / Road Obstruction',
    roadName: 'Koundampalayam Bridge Descent',
    busId: 'BUS-105',
    confidence: 91.0,
    description: 'Fallen brick and aggregate obstruction detected in right busway corridor. Low collision impact but puncture threat.',
    weather: 'sunny',
    bbox: { x: 28, y: 64, w: 44, h: 22, label: 'DEBRIS_OBSTRUCTION (91.0%)' },
    metrics: { fps: 30.2, latencyMs: 12.5, model: 'YOLOv8-UrbanEdge-FP16', resolution: '1920x1080 HDR' }
  }
];
