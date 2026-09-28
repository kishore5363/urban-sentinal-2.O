import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  BusTelemetry, 
  HazardRecord, 
  AlertItem, 
  WaterSensorReading, 
  NavigationTab, 
  HazardType,
  HazardStatus
} from '../types';
import { 
  INITIAL_BUSES, 
  INITIAL_HAZARDS, 
  INITIAL_ALERTS, 
  CITY_ROUTES, 
  RouteDefinition 
} from '../data/mockData';
import { soundManager } from '../utils/audio';

export type PipelineStage = 
  | 'SENSE' 
  | 'DETECT' 
  | 'MEASURE' 
  | 'LOCATE' 
  | 'PROCESS' 
  | 'TRANSMIT' 
  | 'ANALYZE' 
  | 'ALERT' 
  | 'RESPOND';

export interface LiveDemoState {
  isRunning: boolean;
  isCompleted: boolean;
  stepIndex: number; // 0 to 9
  secondsElapsed: number; // 0 to 30
  currentStage: PipelineStage;
  stageMessage: string;
  stageDetail: string;
  bus102Metrics: {
    isMoving: boolean;
    speed: number;
    lat: number;
    lon: number;
    cameraScanning: boolean;
    detectedObject: string | null;
    confidence: number | null;
    lidarActive: boolean;
    sensorHeight: number;
    surfaceDistance: number;
    waterDepth: number;
    edgeAiActive: boolean;
    connectivity: 'Connected' | 'Transmitting' | 'Idle';
    cloudSync: boolean;
    gisMarkerCreated: boolean;
    alertGenerated: boolean;
  };
}

export interface DispatchPayload {
  department: string;
  teamName: string;
  etaMinutes: number;
  equipment: string;
  notes: string;
}

interface SentinelContextType {
  buses: BusTelemetry[];
  hazards: HazardRecord[];
  alerts: AlertItem[];
  waterReading: WaterSensorReading;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedBusId: string;
  setSelectedBusId: (id: string) => void;
  selectedHazardId: string | null;
  setSelectedHazardId: (id: string | null) => void;
  simulateSensorReading: (manualDistance?: number) => void;
  simulateNewHazardDetection: (customType?: HazardType) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  updateHazardStatus: (hazardId: string, newStatus: HazardStatus) => void;
  acknowledgeHazard: (hazardId: string) => void;
  resolveHazard: (hazardId: string) => void;
  dispatchIncident: (hazardId: string, payload: DispatchPayload) => void;
  isSimulationRunning: boolean;
  toggleSimulation: () => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  viewHazardOnMap: (hazardId: string) => void;
  replayIncident: (hazardId: string) => void;
  // Live Demo Engine
  demoState: LiveDemoState;
  startLiveDemo: () => void;
  resetDemo: () => void;
  jumpToDemoStage: (stage: PipelineStage) => void;
  // UI Modals
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isPresentationMode: boolean;
  setIsPresentationMode: (mode: boolean) => void;
  // Dynamic SIH Metrics
  metrics: {
    activeBuses: number;
    hazardsDetected: number;
    waterloggingIncidents: number;
    criticalAlerts: number;
    roadsMonitoredKm: number;
    aiAccuracyPercent: number;
    avgResponseTimeMin: number;
    fleetHealthPercent: number;
    resolvedCount: number;
  };
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

// Interpolate GPS coordinates along route
function getInterpolatedPosition(
  route: RouteDefinition, 
  progress: number
): { lat: number; lon: number; heading: number } {
  const points = route.waypoints;
  if (points.length < 2) return { lat: points[0][0], lon: points[0][1], heading: 0 };

  const totalSegments = points.length - 1;
  const scaledProgress = Math.max(0, Math.min(0.9999, progress)) * totalSegments;
  const segmentIndex = Math.floor(scaledProgress);
  const segmentFraction = scaledProgress - segmentIndex;

  const p1 = points[segmentIndex];
  const p2 = points[segmentIndex + 1];

  const lat = p1[0] + (p2[0] - p1[0]) * segmentFraction;
  const lon = p1[1] + (p2[1] - p1[1]) * segmentFraction;

  const dLat = p2[0] - p1[0];
  const dLon = p2[1] - p1[1];
  const headingRad = Math.atan2(dLon, dLat);
  const headingDeg = (headingRad * (180 / Math.PI) + 360) % 360;

  return { lat, lon, heading: Math.round(headingDeg) };
}

const INITIAL_DEMO_STATE: LiveDemoState = {
  isRunning: false,
  isCompleted: false,
  stepIndex: 0,
  secondsElapsed: 0,
  currentStage: 'SENSE',
  stageMessage: 'Ready to launch 30-second live simulation of BUS-102',
  stageDetail: 'Click START LIVE DEMO to execute full pipeline: Sense → Detect → Measure → Locate → Process → Transmit → Analyze → Alert → Respond',
  bus102Metrics: {
    isMoving: false,
    speed: 0,
    lat: 11.0185,
    lon: 76.9675,
    cameraScanning: false,
    detectedObject: null,
    confidence: null,
    lidarActive: false,
    sensorHeight: 1.25,
    surfaceDistance: 1.25,
    waterDepth: 0.00,
    edgeAiActive: false,
    connectivity: 'Idle',
    cloudSync: false,
    gisMarkerCreated: false,
    alertGenerated: false,
  }
};

export const SentinelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [buses, setBuses] = useState<BusTelemetry[]>(INITIAL_BUSES);
  const [hazards, setHazards] = useState<HazardRecord[]>(INITIAL_HAZARDS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [selectedBusId, setSelectedBusId] = useState<string>('BUS-102');
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>('INC-2048');
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      soundManager.enabled = next;
      if (next) soundManager.playClick();
      return next;
    });
  }, []);

  // Modals
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Dynamic baseline stats that update as simulations run
  const [metricDeltas, setMetricDeltas] = useState({
    hazardsAdded: 0,
    waterloggingAdded: 0,
    criticalAdded: 0,
    resolvedIncidents: 19,
    kmSurveyed: 186.4,
  });

  // Water reading (Formula: Water Depth = Sensor Height - Surface Distance)
  const [waterReading, setWaterReading] = useState<WaterSensorReading>({
    sensorHeight: 1.25,
    surfaceDistance: 0.60,
    waterDepth: 0.65,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    status: 'critical',
    confidence: 94.0,
    rawPingsCount: 142,
    tofPulseDurationPs: 4002,
  });

  // Live Demo State
  const [demoState, setDemoState] = useState<LiveDemoState>(INITIAL_DEMO_STATE);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Normal Background bus movement
  useEffect(() => {
    if (!isSimulationRunning || demoState.isRunning) return;

    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const route = CITY_ROUTES.find((r) => r.number === bus.routeNumber) || CITY_ROUTES[0];
          const speedDelta = (Math.random() - 0.48) * 3;
          const newSpeed = Math.max(18, Math.min(48, Math.round(bus.currentSpeed + speedDelta)));
          const stepSize = (newSpeed / 3600) * 0.35;
          let nextProgress = bus.routeProgress + stepSize * bus.routeDirection;
          let nextDir = bus.routeDirection;

          if (nextProgress >= 1.0) {
            nextProgress = 0.99;
            nextDir = -1;
          } else if (nextProgress <= 0.0) {
            nextProgress = 0.01;
            nextDir = 1;
          }

          const { lat, lon, heading } = getInterpolatedPosition(route, nextProgress);
          const adjustedHeading = nextDir === -1 ? (heading + 180) % 360 : heading;

          return {
            ...bus,
            currentSpeed: newSpeed,
            routeProgress: nextProgress,
            routeDirection: nextDir,
            lat,
            lon,
            headingDeg: adjustedHeading,
            latencyMs: Math.max(9, Math.min(22, bus.latencyMs + Math.floor((Math.random() - 0.5) * 2))),
            lastPing: 'Just now',
          };
        })
      );

      // Increment distance slightly for realism
      setMetricDeltas((prev) => ({
        ...prev,
        kmSurveyed: Number((prev.kmSurveyed + 0.02).toFixed(1)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulationRunning, demoState.isRunning]);

  // Periodic subtle sensor drift for realistic live feeling
  useEffect(() => {
    if (!isSimulationRunning || demoState.isRunning) return;

    const sensorInterval = setInterval(() => {
      setWaterReading((prev) => {
        const jitter = (Math.random() - 0.5) * 0.008;
        const currentDist = Math.max(0.30, Math.min(prev.sensorHeight, prev.surfaceDistance + jitter));
        const currentDepth = Math.max(0, Number((prev.sensorHeight - currentDist).toFixed(2)));
        
        let status: WaterSensorReading['status'] = 'dry';
        if (currentDepth > 0.50) status = 'critical';
        else if (currentDepth > 0.30) status = 'moderate';
        else if (currentDepth > 0.10) status = 'shallow';

        return {
          ...prev,
          surfaceDistance: Number(currentDist.toFixed(2)),
          waterDepth: currentDepth,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          rawPingsCount: prev.rawPingsCount + 1,
          status,
        };
      });
    }, 3000);

    return () => clearInterval(sensorInterval);
  }, [isSimulationRunning, demoState.isRunning]);

  // START LIVE DEMO: 30-second realistic timeline
  const startLiveDemo = useCallback(() => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);

    setSelectedBusId('BUS-102');
    let elapsed = 0;

    setDemoState({
      isRunning: true,
      isCompleted: false,
      stepIndex: 0,
      secondsElapsed: 0,
      currentStage: 'SENSE',
      stageMessage: 'BUS-102 departing Gandhipuram Terminal onto Ukkadam Corridor',
      stageDetail: 'Vehicle velocity: 28 km/h. Mobile sensing payload initiated.',
      bus102Metrics: {
        isMoving: true,
        speed: 28,
        lat: 11.0185,
        lon: 76.9675,
        cameraScanning: true,
        detectedObject: null,
        confidence: null,
        lidarActive: false,
        sensorHeight: 1.25,
        surfaceDistance: 1.25,
        waterDepth: 0.00,
        edgeAiActive: true,
        connectivity: 'Connected',
        cloudSync: false,
        gisMarkerCreated: false,
        alertGenerated: false,
      }
    });

    soundManager.playRadarPing();
    const intervalMs = Math.max(150, Math.round(1000 / simulationSpeed));
    demoTimerRef.current = setInterval(() => {
      elapsed += 1;

      if (elapsed <= 3) {
        setDemoState((prev) => ({
          ...prev,
          secondsElapsed: elapsed,
          stepIndex: 1,
          currentStage: 'SENSE',
          stageMessage: 'BUS-102 moving along Gandhipuram - Ukkadam corridor (28 km/h)',
          stageDetail: 'Sensors online: High-res road camera, Time-of-Flight LiDAR, GNSS locked.',
          bus102Metrics: {
            ...prev.bus102Metrics,
            isMoving: true,
            speed: 28,
            lat: 11.0180,
            lon: 76.9640,
            edgeAiActive: true,
            connectivity: 'Connected',
          }
        }));
      } else if (elapsed <= 6) {
        setDemoState((prev) => ({
          ...prev,
          secondsElapsed: elapsed,
          stepIndex: 2,
          currentStage: 'LOCATE',
          stageMessage: 'Simulated GPS coordinates continuously updating: 11.0174° N, 76.9592° E',
          stageDetail: 'Precision RTK GNSS locked with sub-meter spatial accuracy.',
          bus102Metrics: {
            ...prev.bus102Metrics,
            isMoving: true,
            speed: 27,
            lat: 11.0174,
            lon: 76.9592,
          }
        }));
      } else if (elapsed <= 9) {
        setDemoState((prev) => ({
          ...prev,
          secondsElapsed: elapsed,
          stepIndex: 3,
          currentStage: 'DETECT',
          stageMessage: 'AI edge camera actively scanning asphalt surface and reflection indices',
          stageDetail: 'YOLOv8-UrbanEdge running at 30 FPS on NVIDIA Jetson Orin Nano.',
          bus102Metrics: {
            ...prev.bus102Metrics,
            cameraScanning: true,
            lat: 11.0169,
            lon: 76.9565,
          }
        }));
      } else if (elapsed <= 12) {
        soundManager.playDetectionChime();
        setDemoState((prev) => ({
          ...prev,
          secondsElapsed: elapsed,
          stepIndex: 4,
          currentStage: 'DETECT',
          stageMessage: 'AI Optical Detection Confirmed: "WATERLOGGING" hazard identified',
          stageDetail: 'Road surface reflection anomaly detected under the railway underpass.',
          bus102Metrics: {
            ...prev.bus102Metrics,
            detectedObject: 'Waterlogging',
            lat: 11.0168,
            lon: 76.9558,
          }
        }));
      } else if (elapsed <= 15) {
        setDemoState((prev) => ({
          ...prev,
          secondsElapsed: elapsed,
          stepIndex: 5,
          currentStage: 'DETECT',
          stageMessage: 'AI Detection Confidence: 94% (High Certainty)',
          stageDetail: 'Threshold exceeded (>85%). Triggering active LiDAR/ToF rangefinder sensor.',
          bus102Metrics: {
            ...prev.bus102Metrics,
            confidence: 94,
          }
        }));
      } else if (elapsed <= 18) {
        soundManager.playRadarPing();
        // LiDAR calculation: 1.25m - 0.60m = 0.65m
        setWaterReading({
          sensorHeight: 1.25,
          surfaceDistance: 0.60,
          waterDepth: 0.65,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: 'critical',
          confidence: 94.0,
          rawPingsCount: 160,
          tofPulseDurationPs: 4002,
        });

        setDemoState((prev) => ({
          ...prev,
          secondsElapsed: elapsed,
          stepIndex: 6,
          currentStage: 'MEASURE',
          stageMessage: 'LiDAR/ToF Active: Sensor Height = 1.25m | Surface = 0.60m | Water Depth = 0.65m',
          stageDetail: 'Formula: Water Depth = 1.25m - 0.60m = 0.65m (CRITICAL SEVERITY: >0.50m).',
          bus102Metrics: {
            ...prev.bus102Metrics,
            lidarActive: true,
            sensorHeight: 1.25,
            surfaceDistance: 0.60,
            waterDepth: 0.65,
          }
        }));
      } else if (elapsed <= 21) {
        setDemoState((prev) => ({
          ...prev,
          secondsElapsed: elapsed,
          stepIndex: 7,
          currentStage: 'LOCATE',
          stageMessage: 'Exact Incident GPS Captured: 11.0168° N, 76.9558° E (Underpass KM 4.2)',
          stageDetail: 'Georeferenced timestamped telemetry packet packaged for edge dispatch.',
          bus102Metrics: {
            ...prev.bus102Metrics,
            lat: 11.0168,
            lon: 76.9558,
          }
        }));
      } else if (elapsed <= 24) {
        setDemoState((prev) => ({
          ...prev,
          secondsElapsed: elapsed,
          stepIndex: 8,
          currentStage: 'PROCESS',
          stageMessage: 'Edge AI Processing: ACTIVE (NVIDIA Jetson Orin Nano - 40 TOPS)',
          stageDetail: 'Local payload encrypted; edge inference latency: 12.4 ms.',
          bus102Metrics: {
            ...prev.bus102Metrics,
            edgeAiActive: true,
          }
        }));
      } else if (elapsed <= 27) {
        setDemoState((prev) => ({
          ...prev,
          secondsElapsed: elapsed,
          stepIndex: 9,
          currentStage: 'TRANSMIT',
          stageMessage: '5G Connectivity: CONNECTED (Transmitting telemetry packet to Cloud)',
          stageDetail: '5G SA link active, signal: -64 dBm, upload latency: 9 ms.',
          bus102Metrics: {
            ...prev.bus102Metrics,
            connectivity: 'Transmitting',
            cloudSync: true,
          }
        }));
      } else if (elapsed <= 29) {
        setDemoState((prev) => ({
          ...prev,
          secondsElapsed: elapsed,
          stepIndex: 10,
          currentStage: 'ANALYZE',
          stageMessage: 'Cloud Ingestion & GIS Marker Placed on Municipal Smart City Map',
          stageDetail: 'Incident INC-2048 tagged on Gandhipuram - Ukkadam Underpass KM 4.2.',
          bus102Metrics: {
            ...prev.bus102Metrics,
            connectivity: 'Connected',
            gisMarkerCreated: true,
          }
        }));
      } else {
        // 30 seconds reached: Final alert generated!
        if (demoTimerRef.current) clearInterval(demoTimerRef.current);
        soundManager.playCriticalAlert();

        setDemoState((prev) => ({
          ...prev,
          secondsElapsed: 30,
          stepIndex: 10,
          isRunning: false,
          isCompleted: true,
          currentStage: 'RESPOND',
          stageMessage: 'CRITICAL MUNICIPAL ALERT GENERATED for Incident INC-2048',
          stageDetail: 'Authority notified: Stormwater Drainage & Traffic Police alerted. De-watering team dispatched.',
          bus102Metrics: {
            ...prev.bus102Metrics,
            alertGenerated: true,
            gisMarkerCreated: true,
          }
        }));

        // Dynamically increment stats as required by user prompt
        setMetricDeltas((prev) => ({
          ...prev,
          hazardsAdded: prev.hazardsAdded + 1,
          waterloggingAdded: prev.waterloggingAdded + 1,
          criticalAdded: prev.criticalAdded + 1,
        }));
      }
    }, intervalMs);
  }, [simulationSpeed]);

  const resetDemo = useCallback(() => {
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current);
      demoTimerRef.current = null;
    }
    soundManager.playClick();
    setDemoState(INITIAL_DEMO_STATE);
  }, []);

  // Jump to specific stage instantly (crucial for quick judge inspection)
  const jumpToDemoStage = useCallback((stage: PipelineStage) => {
    setSelectedBusId('BUS-102');
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);

    if (stage === 'SENSE') {
      soundManager.playRadarPing();
      setDemoState({
        isRunning: true,
        isCompleted: false,
        stepIndex: 1,
        secondsElapsed: 3,
        currentStage: 'SENSE',
        stageMessage: 'BUS-102 moving along Gandhipuram - Ukkadam corridor (28 km/h)',
        stageDetail: 'Sensors online: High-res road camera, Time-of-Flight LiDAR, GNSS locked.',
        bus102Metrics: {
          isMoving: true,
          speed: 28,
          lat: 11.0180,
          lon: 76.9640,
          cameraScanning: true,
          detectedObject: null,
          confidence: null,
          lidarActive: false,
          sensorHeight: 1.25,
          surfaceDistance: 1.25,
          waterDepth: 0.00,
          edgeAiActive: true,
          connectivity: 'Connected',
          cloudSync: false,
          gisMarkerCreated: false,
          alertGenerated: false,
        }
      });
    } else if (stage === 'DETECT') {
      soundManager.playDetectionChime();
      setDemoState(prev => ({
        ...prev,
        isRunning: true,
        isCompleted: false,
        stepIndex: 4,
        secondsElapsed: 12,
        currentStage: 'DETECT',
        stageMessage: 'AI Optical Detection Confirmed: "WATERLOGGING" hazard identified (94.6% confidence)',
        stageDetail: 'Road surface reflection anomaly detected under the railway underpass.',
        bus102Metrics: {
          ...prev.bus102Metrics,
          isMoving: true,
          speed: 22,
          cameraScanning: true,
          detectedObject: 'Waterlogging',
          confidence: 94.6,
          lat: 11.0168,
          lon: 76.9558,
        }
      }));
    } else if (stage === 'MEASURE') {
      soundManager.playRadarPing();
      setWaterReading({
        sensorHeight: 1.25,
        surfaceDistance: 0.60,
        waterDepth: 0.65,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: 'critical',
        confidence: 94.0,
        rawPingsCount: 160,
        tofPulseDurationPs: 4002,
      });
      setDemoState(prev => ({
        ...prev,
        isRunning: true,
        isCompleted: false,
        stepIndex: 6,
        secondsElapsed: 18,
        currentStage: 'MEASURE',
        stageMessage: 'LiDAR/ToF Active: Sensor Height = 1.25m | Surface = 0.60m | Water Depth = 0.65m',
        stageDetail: 'Formula: Water Depth = 1.25m - 0.60m = 0.65m (CRITICAL SEVERITY: >0.50m).',
        bus102Metrics: {
          ...prev.bus102Metrics,
          lidarActive: true,
          sensorHeight: 1.25,
          surfaceDistance: 0.60,
          waterDepth: 0.65,
        }
      }));
    } else if (stage === 'LOCATE' || stage === 'PROCESS' || stage === 'TRANSMIT') {
      soundManager.playClick();
      setDemoState(prev => ({
        ...prev,
        isRunning: true,
        isCompleted: false,
        stepIndex: 8,
        secondsElapsed: 24,
        currentStage: stage,
        stageMessage: 'Sub-meter RTK GPS Geocoded + NVIDIA Jetson Orin Nano Edge Inference + 5G SA Transmission',
        stageDetail: 'Incident packet georeferenced at 11.0168° N, 76.9558° E encrypted for cloud uplink.',
        bus102Metrics: {
          ...prev.bus102Metrics,
          edgeAiActive: true,
          connectivity: 'Transmitting',
          cloudSync: true,
          lat: 11.0168,
          lon: 76.9558,
        }
      }));
    } else {
      soundManager.playCriticalAlert();
      setDemoState(prev => ({
        ...prev,
        isRunning: false,
        isCompleted: true,
        stepIndex: 10,
        secondsElapsed: 30,
        currentStage: 'RESPOND',
        stageMessage: 'CRITICAL MUNICIPAL ALERT GENERATED for Incident INC-2048',
        stageDetail: 'Stormwater Drainage & Traffic Police alerted. De-watering team dispatched to Underpass KM 4.2.',
        bus102Metrics: {
          ...prev.bus102Metrics,
          alertGenerated: true,
          gisMarkerCreated: true,
        }
      }));
    }
  }, []);

  // Dedicated Simulate Sensor Reading function
  const simulateSensorReading = useCallback((manualDistance?: number) => {
    const sensorHeight = 1.25;
    let surfaceDistance: number;
    if (manualDistance !== undefined) {
      surfaceDistance = manualDistance;
    } else {
      const rand = Math.random();
      if (rand < 0.5) {
        surfaceDistance = Number((0.55 + Math.random() * 0.20).toFixed(2));
      } else {
        surfaceDistance = Number((0.85 + Math.random() * 0.35).toFixed(2));
      }
    }

    const waterDepth = Math.max(0, Number((sensorHeight - surfaceDistance).toFixed(2)));
    let status: WaterSensorReading['status'] = 'dry';
    if (waterDepth > 0.50) status = 'critical';
    else if (waterDepth > 0.25) status = 'moderate';
    else if (waterDepth > 0.05) status = 'shallow';

    const tofPs = Math.round((surfaceDistance / 299792458) * 2 * 1e12);

    setWaterReading({
      sensorHeight,
      surfaceDistance,
      waterDepth,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status,
      confidence: Number((93 + Math.random() * 5).toFixed(1)),
      rawPingsCount: 150 + Math.floor(Math.random() * 40),
      tofPulseDurationPs: tofPs,
    });
  }, []);

  // Trigger random simulated hazard
  const simulateNewHazardDetection = useCallback((customType?: HazardType) => {
    const types: HazardType[] = ['waterlogging', 'pothole', 'road_crack', 'damaged_road', 'debris'];
    const chosenType = customType || types[Math.floor(Math.random() * types.length)];
    const randomBus = buses[Math.floor(Math.random() * buses.length)];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
    const hazardId = `INC-${Math.floor(2050 + Math.random() * 100)}`;

    let title = '';
    let severity: HazardRecord['severity'] = 'high';
    let waterDepth: number | undefined;
    let surfaceDistance: number | undefined;
    let sensorHeight: number | undefined;
    let dimensions = '';
    let suggestedAction = '';

    if (chosenType === 'waterlogging') {
      sensorHeight = 1.25;
      surfaceDistance = Number((0.55 + Math.random() * 0.25).toFixed(2));
      waterDepth = Number((sensorHeight - surfaceDistance).toFixed(2));
      severity = waterDepth > 0.5 ? 'critical' : 'high';
      title = `${severity === 'critical' ? 'Critical' : 'Moderate'} Waterlogging Underpass`;
      dimensions = `Submerged corridor ~${Math.floor(20 + Math.random() * 25)}m, max depth ${(waterDepth * 100).toFixed(0)}cm`;
      suggestedAction = 'Dispatch municipal de-watering pump unit and setup traffic diversion signs';
    } else if (chosenType === 'pothole') {
      severity = Math.random() > 0.4 ? 'critical' : 'high';
      title = `Severe Impact Road Pothole`;
      dimensions = `Diameter ${(0.9 + Math.random() * 0.6).toFixed(1)}m, depth ~${Math.floor(12 + Math.random() * 8)}cm`;
      suggestedAction = 'Schedule emergency cold-patch asphalt repair crew';
    } else if (chosenType === 'road_crack') {
      severity = 'medium';
      title = `Structural Longitudinal Seam Crack`;
      dimensions = `Width ~${Math.floor(15 + Math.random() * 15)}mm, span ~${(4 + Math.random() * 5).toFixed(1)}m`;
      suggestedAction = 'Inject hot-pour bituminous sealant to prevent rain seepage';
    } else if (chosenType === 'debris') {
      severity = 'medium';
      title = `Roadway Construction Debris`;
      dimensions = `Obstruction spanning ~${Math.floor(3 + Math.random() * 5)}m`;
      suggestedAction = 'Sanitation rapid sweeper truck deployed';
    } else {
      severity = 'high';
      title = `Asphalt Surface Failure / Rutting`;
      dimensions = `Corrugated section ~${Math.floor(25 + Math.random() * 30)}m`;
      suggestedAction = 'Schedule road milling & asphalt resurfacing';
    }

    const newHazard: HazardRecord = {
      id: hazardId,
      type: chosenType,
      title,
      severity,
      confidenceScore: Number((91 + Math.random() * 6).toFixed(1)),
      timestamp: timeStr,
      detectedAtMs: Date.now(),
      busId: randomBus.id,
      location: {
        lat: Number((randomBus.lat + (Math.random() - 0.5) * 0.003).toFixed(4)),
        lon: Number((randomBus.lon + (Math.random() - 0.5) * 0.003).toFixed(4)),
        roadName: `${randomBus.routeName.split('→')[0].trim()} Corridor`,
        zone: 'Metropolitan Smart Transit Ward',
      },
      sensorHeight,
      surfaceDistance,
      waterDepth,
      dimensions,
      status: 'new',
      suggestedAction,
      bbox: { x: 25, y: 54, w: 50, h: 32 }
    };

    setHazards((prev) => [newHazard, ...prev]);

    const newAlert: AlertItem = {
      id: `ALT-${Math.floor(2050 + Math.random() * 100)}`,
      hazardId: newHazard.id,
      type: chosenType,
      severity,
      title: `${severity.toUpperCase()} ALERT: ${title}`,
      depthMeters: waterDepth,
      locationName: newHazard.location.roadName,
      busId: randomBus.id,
      timestamp: `${timeStr} (Just now)`,
      status: 'new',
      department: chosenType === 'waterlogging' ? 'Stormwater Drainage' : 'PWD Roads',
    };

    setAlerts((prev) => [newAlert, ...prev]);

    setMetricDeltas((prev) => ({
      ...prev,
      hazardsAdded: prev.hazardsAdded + 1,
      waterloggingAdded: chosenType === 'waterlogging' ? prev.waterloggingAdded + 1 : prev.waterloggingAdded,
      criticalAdded: severity === 'critical' ? prev.criticalAdded + 1 : prev.criticalAdded,
    }));
  }, [buses]);

  // Update Hazard Status (NEW -> ACKNOWLEDGED -> IN PROGRESS -> RESOLVED)
  const updateHazardStatus = useCallback((hazardId: string, newStatus: HazardStatus) => {
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
          return {
            ...h,
            status: newStatus,
            acknowledgedBy: newStatus !== 'new' ? (h.acknowledgedBy || 'Control Room Officer') : undefined,
            acknowledgedAt: newStatus !== 'new' ? (h.acknowledgedAt || new Date().toLocaleTimeString('en-IN')) : undefined,
            resolvedAt: newStatus === 'resolved' ? new Date().toLocaleTimeString('en-IN') : undefined,
            responseTime: newStatus === 'resolved' ? '4.2 min' : (newStatus === 'in_progress' ? '3.1 min' : h.responseTime),
          };
        }
        return h;
      })
    );

    // Sync corresponding alert
    const alertStatusMap: Record<HazardStatus, AlertItem['status']> = {
      new: 'new',
      detected: 'new',
      acknowledged: 'acknowledged',
      in_progress: 'in_progress',
      resolved: 'resolved'
    };

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.hazardId === hazardId) {
          return { ...a, status: alertStatusMap[newStatus] || 'new' };
        }
        return a;
      })
    );

    if (newStatus === 'resolved') {
      setMetricDeltas((prev) => ({
        ...prev,
        resolvedIncidents: prev.resolvedIncidents + 1,
        criticalAdded: Math.max(0, prev.criticalAdded - 1),
      }));
    }
  }, []);

  // Dispatch incident team
  const dispatchIncident = useCallback((hazardId: string, payload: DispatchPayload) => {
    updateHazardStatus(hazardId, 'in_progress');
    setHazards(prev => prev.map(h => {
      if (h.id === hazardId) {
        return {
          ...h,
          suggestedAction: `${payload.department}: ${payload.teamName} dispatched (${payload.equipment}). ETA: ${payload.etaMinutes}m. Notes: ${payload.notes}`,
          acknowledgedBy: `${payload.teamName} (${payload.department})`,
          responseTime: `${payload.etaMinutes}m ETA`,
        };
      }
      return h;
    }));
    soundManager.playSuccess();
  }, [updateHazardStatus]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'acknowledged' } : a))
    );
    const target = alerts.find((a) => a.id === alertId);
    if (target) {
      updateHazardStatus(target.hazardId, 'acknowledged');
    }
  }, [alerts, updateHazardStatus]);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
    );
    const target = alerts.find((a) => a.id === alertId);
    if (target) {
      updateHazardStatus(target.hazardId, 'resolved');
    }
  }, [alerts, updateHazardStatus]);

  const acknowledgeHazard = useCallback((hazardId: string) => {
    updateHazardStatus(hazardId, 'acknowledged');
  }, [updateHazardStatus]);

  const resolveHazard = useCallback((hazardId: string) => {
    updateHazardStatus(hazardId, 'resolved');
  }, [updateHazardStatus]);

  const toggleSimulation = useCallback(() => {
    setIsSimulationRunning((prev) => !prev);
  }, []);

  const viewHazardOnMap = useCallback((hazardId: string) => {
    setSelectedHazardId(hazardId);
    setActiveTab('gis-map');
  }, []);

  const replayIncident = useCallback((hazardId: string) => {
    setSelectedHazardId(hazardId);
    setActiveTab('incident-replay');
    soundManager.playClick();
  }, []);

  // Explicit SIH Top KPI Metrics with dynamic updates:
  // ACTIVE BUSES: 24
  // HAZARDS DETECTED: 147
  // WATERLOGGING INCIDENTS: 32
  // CRITICAL ALERTS: 8
  // ROADS MONITORED: 186 km
  // AI DETECTION ACCURACY: 94.6%
  const metrics = useMemo(() => {
    return {
      activeBuses: 24,
      hazardsDetected: 147 + metricDeltas.hazardsAdded,
      waterloggingIncidents: 32 + metricDeltas.waterloggingAdded,
      criticalAlerts: Math.max(0, 8 + metricDeltas.criticalAdded),
      roadsMonitoredKm: Math.round(metricDeltas.kmSurveyed),
      aiAccuracyPercent: 94.6,
      avgResponseTimeMin: 12.4,
      fleetHealthPercent: 98.4,
      resolvedCount: metricDeltas.resolvedIncidents,
    };
  }, [metricDeltas]);

  return (
    <SentinelContext.Provider
      value={{
        buses,
        hazards,
        alerts,
        waterReading,
        activeTab,
        setActiveTab,
        selectedBusId,
        setSelectedBusId,
        selectedHazardId,
        setSelectedHazardId,
        simulateSensorReading,
        simulateNewHazardDetection,
        acknowledgeAlert,
        resolveAlert,
        updateHazardStatus,
        acknowledgeHazard,
        resolveHazard,
        dispatchIncident,
        isSimulationRunning,
        toggleSimulation,
        simulationSpeed,
        setSimulationSpeed,
        soundEnabled,
        toggleSound,
        viewHazardOnMap,
        replayIncident,
        demoState,
        startLiveDemo,
        resetDemo,
        jumpToDemoStage,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isPresentationMode,
        setIsPresentationMode,
        metrics,
      }}
    >
      {children}
    </SentinelContext.Provider>
  );
};

export function useSentinel() {
  const context = useContext(SentinelContext);
  if (!context) {
    throw new Error('useSentinel must be used within a SentinelProvider');
  }
  return context;
}
