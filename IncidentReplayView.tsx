import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  BusFront,
  Camera,
  ScanEye,
  Crosshair,
  Waves,
  Navigation,
  Cpu,
  Radio,
  Cloud,
  MapPin,
  BellRing,
  Truck,
  CheckCircle2,
  Volume2,
  VolumeX,
  Gauge,
  Activity,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Info
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { HazardRecord } from '../types';
import { soundManager } from '../utils/audio';

export interface ReplayStageConfig {
  id: string;
  name: string;
  shortCode: string;
  icon: React.ComponentType<{ className?: string }>;
  durationSeconds: number;
  category: 'EDGE SENSING' | 'EDGE COMPUTE' | 'CLOUD & GIS' | 'CIVIC RESPONSE';
  subtitle: string;
}

export const REPLAY_STAGES: ReplayStageConfig[] = [
  {
    id: 'BUS',
    name: 'Carrier Transit',
    shortCode: 'BUS',
    icon: BusFront,
    durationSeconds: 3,
    category: 'EDGE SENSING',
    subtitle: 'Mobile bus carrier active on designated municipal transit corridor'
  },
  {
    id: 'CAMERA_SCANS',
    name: 'Camera Scans',
    shortCode: 'CAMERA',
    icon: Camera,
    durationSeconds: 3,
    category: 'EDGE SENSING',
    subtitle: 'Sony IMX390 HDR optical sensor sweeping pavement surface with raster laser line'
  },
  {
    id: 'AI_DETECTION',
    name: 'AI Detection',
    shortCode: 'AI DETECT',
    icon: ScanEye,
    durationSeconds: 3,
    category: 'EDGE SENSING',
    subtitle: 'YOLOv8-Road neural model segmenting hazard bounding box from live video stream'
  },
  {
    id: 'CONFIDENCE',
    name: 'Confidence Score',
    shortCode: 'CONFIDENCE',
    icon: Crosshair,
    durationSeconds: 2.5,
    category: 'EDGE COMPUTE',
    subtitle: 'TensorRT neural inference calculates probability score and IoU intersection'
  },
  {
    id: 'LIDAR_MEASUREMENT',
    name: 'LiDAR Measurement',
    shortCode: 'LiDAR',
    icon: Activity,
    durationSeconds: 3,
    category: 'EDGE SENSING',
    subtitle: 'Solid-state Time-of-Flight pulsed infrared laser firing down to road surface'
  },
  {
    id: 'WATER_DEPTH',
    name: 'Depth Computation',
    shortCode: 'DEPTH',
    icon: Waves,
    durationSeconds: 3,
    category: 'EDGE COMPUTE',
    subtitle: 'Differential physics math: Sensor Height (1.25m) minus Surface Distance'
  },
  {
    id: 'GPS_LOCATION',
    name: 'GPS Location',
    shortCode: 'GPS',
    icon: Navigation,
    durationSeconds: 2.5,
    category: 'EDGE SENSING',
    subtitle: 'Dual-band RTK GNSS receiver locks sub-meter geocoordinates & road chainage'
  },
  {
    id: 'EDGE_PROCESSING',
    name: 'Edge Processing',
    shortCode: 'EDGE AI',
    icon: Cpu,
    durationSeconds: 2.5,
    category: 'EDGE COMPUTE',
    subtitle: 'NVIDIA Jetson Orin Nano aggregates telemetry, generates JSON & SHA-256 hash'
  },
  {
    id: '5G_TRANSMISSION',
    name: '5G Transmission',
    shortCode: '5G TX',
    icon: Radio,
    durationSeconds: 2.5,
    category: 'CLOUD & GIS',
    subtitle: 'Encrypted MQTT over TLS v1.3 transmitted via 5G Standalone C-V2X uplink'
  },
  {
    id: 'CLOUD',
    name: 'Cloud Ingestion',
    shortCode: 'CLOUD',
    icon: Cloud,
    durationSeconds: 2.5,
    category: 'CLOUD & GIS',
    subtitle: 'Smart City ICCC central platform performs spatial deduplication & PostGIS indexing'
  },
  {
    id: 'GIS_MARKER',
    name: 'GIS Marker',
    shortCode: 'GIS',
    icon: MapPin,
    durationSeconds: 3,
    category: 'CLOUD & GIS',
    subtitle: 'Dynamic geospatial pin plotted on municipal map with safety perimeter zone'
  },
  {
    id: 'MUNICIPAL_ALERT',
    name: 'Municipal Alert',
    shortCode: 'ALERT',
    icon: BellRing,
    durationSeconds: 3,
    category: 'CIVIC RESPONSE',
    subtitle: 'Automated P1 Priority ticket generated for civic department with SLA clock'
  },
  {
    id: 'RESPONSE',
    name: 'Field Response',
    shortCode: 'RESPONSE',
    icon: Truck,
    durationSeconds: 3,
    category: 'CIVIC RESPONSE',
    subtitle: 'Emergency de-watering unit / asphalt crew dispatched with real-time ETA'
  },
  {
    id: 'RESOLUTION',
    name: 'Resolution & Audit',
    shortCode: 'RESOLVED',
    icon: CheckCircle2,
    durationSeconds: 3,
    category: 'CIVIC RESPONSE',
    subtitle: 'Hazard rectified, post-inspection verified, and logged in civic audit registry'
  }
];

export const IncidentReplayView: React.FC = () => {
  const {
    hazards,
    buses,
    selectedHazardId,
    setSelectedHazardId,
    viewHazardOnMap,
    soundEnabled,
    toggleSound
  } = useSentinel();

  // Active Incident Selection
  const activeIncident: HazardRecord =
    hazards.find((h) => h.id === selectedHazardId) || hazards[0];

  const busForIncident =
    buses.find((b) => b.id === activeIncident.busId) || buses[0];

  // Replay State
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [stageProgressPercent, setStageProgressPercent] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const stageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStage = REPLAY_STAGES[currentStageIndex];

  // Play Sound on Stage Change
  useEffect(() => {
    if (!soundEnabled) return;
    if (currentStage.id === 'BUS') soundManager.playClick();
    else if (currentStage.id === 'CAMERA_SCANS') soundManager.playRadarPing();
    else if (currentStage.id === 'AI_DETECTION') soundManager.playDetectionChime();
    else if (currentStage.id === 'CONFIDENCE') soundManager.playClick();
    else if (currentStage.id === 'LIDAR_MEASUREMENT') soundManager.playRadarPing();
    else if (currentStage.id === 'WATER_DEPTH') soundManager.playRadarPing();
    else if (currentStage.id === '5G_TRANSMISSION') soundManager.playClick();
    else if (currentStage.id === 'GIS_MARKER') soundManager.playClick();
    else if (currentStage.id === 'MUNICIPAL_ALERT') soundManager.playCriticalAlert();
    else if (currentStage.id === 'RESPONSE') soundManager.playClick();
    else if (currentStage.id === 'RESOLUTION') soundManager.playSuccess();
  }, [currentStageIndex, soundEnabled]);

  // Main playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    setStageProgressPercent(0);
    const durationMs = (currentStage.durationSeconds * 1000) / speedMultiplier;
    const updateFreqMs = 50;
    let elapsedMs = 0;

    progressTimerRef.current = setInterval(() => {
      elapsedMs += updateFreqMs;
      const pct = Math.min(100, Math.round((elapsedMs / durationMs) * 100));
      setStageProgressPercent(pct);
    }, updateFreqMs);

    stageTimerRef.current = setTimeout(() => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setStageProgressPercent(100);

      if (currentStageIndex < REPLAY_STAGES.length - 1) {
        setCurrentStageIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        setIsCompleted(true);
      }
    }, durationMs);

    return () => {
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, currentStageIndex, speedMultiplier]);

  // Controls: Play, Pause, Restart, Skip
  const handlePlayPause = useCallback(() => {
    soundManager.playClick();
    if (isCompleted) {
      setCurrentStageIndex(0);
      setIsCompleted(false);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [isCompleted]);

  const handleRestart = useCallback(() => {
    soundManager.playClick();
    if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setCurrentStageIndex(0);
    setStageProgressPercent(0);
    setIsCompleted(false);
    setIsPlaying(true);
  }, []);

  const handleSkipNext = useCallback(() => {
    soundManager.playClick();
    if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    if (currentStageIndex < REPLAY_STAGES.length - 1) {
      setCurrentStageIndex((prev) => prev + 1);
      setStageProgressPercent(0);
      setIsPlaying(true);
    } else {
      setIsCompleted(true);
      setIsPlaying(false);
    }
  }, [currentStageIndex]);

  const handleJumpToStage = useCallback((index: number) => {
    soundManager.playClick();
    if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setCurrentStageIndex(index);
    setStageProgressPercent(0);
    setIsCompleted(false);
    setIsPlaying(true);
  }, []);

  // Compute actual physical variables from the selected incident
  const isWaterlogging = activeIncident.type === 'waterlogging';
  const sensorHeightM = 1.25;
  const waterDepthM = activeIncident.waterDepth || (isWaterlogging ? 0.65 : 0.0);
  const surfaceDistanceM = isWaterlogging
    ? Math.max(0.15, +(sensorHeightM - waterDepthM).toFixed(2))
    : +(sensorHeightM + (activeIncident.type === 'pothole' ? 0.13 : 0.0)).toFixed(2);

  const confidencePct = activeIncident.confidenceScore || 94.6;
  const gpsLat = activeIncident.location.lat;
  const gpsLon = activeIncident.location.lon;
  const roadName = activeIncident.location.roadName;
  const incidentId = activeIncident.id;
  const busId = activeIncident.busId || 'BUS-102';

  // Responsive time-of-flight laser delay
  const tofPicoseconds = Math.round((2 * surfaceDistanceM * 1000) / 0.299792);

  return (
    <div id="incident-replay-view" className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar & Incident Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold tracking-wider border border-cyan-500/30 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              CINEMATIC INCIDENT REPLAY ENGINE
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
              SIMULATED TELEMETRY
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700">
              STAGE {currentStageIndex + 1} OF {REPLAY_STAGES.length}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
            <span>INCIDENT REPLAY:</span>
            <span className="text-cyan-400">{incidentId}</span>
            <span className="text-slate-400 text-sm font-sans font-normal hidden sm:inline">
              &bull; {activeIncident.title}
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Step-by-step verification of how Urban Sentinel senses, analyzes, georeferences, and alerts on road hazards.
          </p>
        </div>

        {/* Incident Switcher Dropdown */}
        <div className="relative z-10 flex items-center gap-3 self-start lg:self-center">
          <div className="flex flex-col">
            <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
              Select Incident to Replay:
            </label>
            <select
              id="replay-incident-selector"
              value={activeIncident.id}
              onChange={(e) => {
                setSelectedHazardId(e.target.value);
                soundManager.playClick();
                handleRestart();
              }}
              className="bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-cyan-500 focus:outline-none min-w-[240px]"
            >
              {hazards.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.id} - {h.title} ({h.severity.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            id="replay-sound-toggle-btn"
            onClick={toggleSound}
            className={`p-2.5 rounded-xl border text-xs transition-colors self-end ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-cyan-400'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Audio Feedback Enabled' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Cinematic Visualizer Stage (Left HUD + Right Telemetry Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Replay Theater (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Cinematic Viewport Screen */}
            <div className="relative h-80 sm:h-96 w-full bg-slate-950 flex flex-col justify-between p-4 overflow-hidden select-none border-b border-slate-800">
              {/* Scanline Grid Background */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(6,182,212,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.2) 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Viewport Top HUD Bar */}
              <div className="relative z-10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold text-[10px]">REC REPLAY</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    BUS: <strong className="text-cyan-300">{busId}</strong>
                  </span>
                  <span className="text-slate-500 hidden sm:inline">&bull;</span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    CAM: <strong className="text-slate-200">1080p HDR 60fps</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                    {currentStage.category}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {stageProgressPercent}%
                  </span>
                </div>
              </div>

              {/* Central Stage-Specific Animated Graphic */}
              <div className="relative z-10 flex-1 flex items-center justify-center my-2">
                {/* 1. BUS */}
                {currentStage.id === 'BUS' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="relative">
                      <div className="p-6 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 shadow-xl shadow-cyan-950/50">
                        <BusFront className="w-20 h-20 text-cyan-400 animate-pulse" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-bold font-mono">
                        SPEED: 28 KM/H
                      </div>
                    </div>
                    <div className="text-center font-mono space-y-1">
                      <p className="text-sm font-bold text-white uppercase tracking-wider">
                        {busId} Moving Along {roadName}
                      </p>
                      <p className="text-xs text-slate-400">
                        Chassis Vibration: 0.42g &bull; Route: {busForIncident.routeNumber} &bull; IMU: STABLE
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. CAMERA_SCANS */}
                {currentStage.id === 'CAMERA_SCANS' && (
                  <div className="w-full h-full relative flex items-center justify-center animate-in fade-in duration-300">
                    {/* Sweeping Laser Radar Line */}
                    <div className="absolute inset-x-8 top-10 bottom-10 border-2 border-cyan-500/40 rounded-xl bg-cyan-950/10 overflow-hidden flex flex-col justify-between p-3">
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-[0_0_12px_#22d3ee]" />
                      <div className="flex justify-between text-[10px] font-mono text-cyan-400/80">
                        <span>ASPHALT SURFACE SCANNED</span>
                        <span>FOV 120&deg; &bull; EXPOSURE 1/1200s</span>
                      </div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <Camera className="w-14 h-14 text-cyan-300 animate-pulse mb-2" />
                      <span className="text-xs font-mono font-bold text-white bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-500/30">
                        FORWARD OPTICAL SENSOR SCANNING PAVEMENT
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. AI_DETECTION */}
                {currentStage.id === 'AI_DETECTION' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 animate-in zoom-in-95 duration-200">
                    <div className="relative p-6 border-2 border-dashed border-rose-500 bg-rose-950/20 rounded-2xl shadow-xl shadow-rose-950/40 w-64 text-center">
                      <div className="absolute -top-3 left-3 bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        TARGET DETECTED: {activeIncident.type.toUpperCase()}
                      </div>
                      <ScanEye className="w-16 h-16 text-rose-400 mx-auto animate-pulse" />
                      <div className="mt-2 text-xs font-mono text-rose-300 font-bold">
                        BBox: [x:184, y:310, w:240, h:160]
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Area: 0.48 m&sup2; &bull; Reflected Surface Detected
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CONFIDENCE */}
                {currentStage.id === 'CONFIDENCE' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-300">
                    <div className="relative flex items-center justify-center">
                      <div className="w-36 h-36 rounded-full border-4 border-slate-800 border-t-cyan-400 border-r-cyan-400 flex flex-col items-center justify-center bg-slate-900/80 shadow-2xl">
                        <span className="text-3xl font-black text-cyan-300 font-mono">
                          {confidencePct.toFixed(1)}%
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                          CONFIDENCE
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-mono text-slate-300 text-center">
                      YOLOv8-Road TensorRT FP16 &bull; Inference Time: <strong>18.2 ms</strong>
                    </p>
                  </div>
                )}

                {/* 5. LIDAR_MEASUREMENT */}
                {currentStage.id === 'LIDAR_MEASUREMENT' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-200">
                    <div className="w-64 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-2 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">LiDAR Sensor Datum:</span>
                        <span className="text-cyan-300 font-bold">{sensorHeightM.toFixed(2)} m</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                        <div className="h-full bg-cyan-400 w-full animate-pulse" />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Surface Return:</span>
                        <span className="text-amber-400 font-bold">{surfaceDistanceM.toFixed(2)} m</span>
                      </div>
                      <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-800">
                        ToF Roundtrip Delay: <strong>{tofPicoseconds} ps</strong> &bull; 905nm Eye-Safe
                      </div>
                    </div>
                    <div className="text-xs text-cyan-400 font-mono font-bold animate-pulse">
                      &darr; INFRARED LASER PULSE ENGAGED &darr;
                    </div>
                  </div>
                )}

                {/* 6. WATER_DEPTH */}
                {currentStage.id === 'WATER_DEPTH' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-400 text-center max-w-sm space-y-2 shadow-2xl">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase block">
                        PHYSICS FORMULA APPLIED
                      </span>
                      <div className="p-2 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 border border-slate-800">
                        Depth = Sensor Height ({sensorHeightM.toFixed(2)}m) - Surface Dist ({surfaceDistanceM.toFixed(2)}m)
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Waves className="w-6 h-6 text-cyan-400 animate-bounce" />
                        <span className="text-2xl font-black text-cyan-300 font-mono">
                          {isWaterlogging ? `${waterDepthM.toFixed(2)} m (${Math.round(waterDepthM * 100)} cm)` : `${activeIncident.severity.toUpperCase()} DEPRESSION`}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-rose-400 font-bold block">
                        {waterDepthM > 0.50 ? 'CRITICAL FLOOD THRESHOLD EXCEEDED (>0.50m)' : 'HAZARD ELEVATION RECORDED'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 7. GPS_LOCATION */}
                {currentStage.id === 'GPS_LOCATION' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-300">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-center font-mono space-y-2 max-w-sm">
                      <div className="flex items-center justify-center gap-2 text-cyan-400">
                        <Navigation className="w-6 h-6 animate-spin" />
                        <span className="text-sm font-bold text-white">DUAL-BAND RTK GNSS LOCK</span>
                      </div>
                      <div className="text-lg font-black text-cyan-300 font-mono">
                        {gpsLat.toFixed(5)}&deg; N, {gpsLon.toFixed(5)}&deg; E
                      </div>
                      <div className="text-xs text-slate-300">
                        {roadName} &bull; Ward 42
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Horizontal Accuracy: &plusmn;0.42m &bull; 16 Satellites &bull; NavIC + GPS
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. EDGE_PROCESSING */}
                {currentStage.id === 'EDGE_PROCESSING' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-300">
                    <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/40 text-center font-mono space-y-2">
                      <Cpu className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
                      <div className="text-sm font-bold text-white uppercase">
                        NVIDIA Jetson Orin Nano
                      </div>
                      <div className="text-xs text-purple-300">
                        Telemetry Aggregation &amp; Hash Generation
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg text-[10px] text-slate-400 text-left font-mono">
                        SHA-256: 7f83b1657ff1fc53b92dc18148a1d65d...
                        <br />Latency: <strong>24.6 ms</strong> | CRC32: <strong>VALID</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. 5G_TRANSMISSION */}
                {currentStage.id === '5G_TRANSMISSION' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-300">
                    <div className="relative p-6 rounded-2xl bg-blue-950/40 border border-blue-400 text-center font-mono space-y-2">
                      <Radio className="w-14 h-14 text-blue-400 mx-auto animate-pulse" />
                      <div className="text-sm font-bold text-white">
                        5G STANDALONE UPLINK (Band n78)
                      </div>
                      <div className="text-xs text-blue-300">
                        Encrypted MQTT / TLS v1.3 Transmission
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Payload Size: 4.8 KB &bull; Latency: 16.2 ms &bull; Signal: -68 dBm
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. CLOUD */}
                {currentStage.id === 'CLOUD' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-300">
                    <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 text-center font-mono space-y-2">
                      <Cloud className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
                      <div className="text-sm font-bold text-white">
                        SMART CITY ICCC CENTRAL INGESTION
                      </div>
                      <div className="text-xs text-slate-300">
                        Spatial Deduplication &amp; PostGIS Indexing
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        &check; Duplicate Filter: Unique Event Verified &bull; Committed to DB
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. GIS_MARKER */}
                {currentStage.id === 'GIS_MARKER' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500 text-center font-mono space-y-2 shadow-xl shadow-rose-950/40">
                      <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
                        <MapPin className="w-10 h-10 text-rose-500 relative z-10" />
                      </div>
                      <div className="text-sm font-bold text-white">
                        GIS MARKER PLACED ON SMART CITY MAP
                      </div>
                      <div className="text-xs text-rose-300">
                        {roadName} &bull; Pin: {incidentId}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        50m Safety Buffer Zone Generated for Transit Fleet
                      </div>
                    </div>
                  </div>
                )}

                {/* 12. MUNICIPAL_ALERT */}
                {currentStage.id === 'MUNICIPAL_ALERT' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="p-5 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-center font-mono space-y-2 shadow-2xl">
                      <BellRing className="w-12 h-12 text-rose-400 mx-auto animate-bounce" />
                      <div className="text-sm font-black text-white uppercase tracking-wider">
                        CRITICAL MUNICIPAL WORK-ORDER GENERATED
                      </div>
                      <div className="text-xs text-rose-200">
                        Assigned To: <strong>{isWaterlogging ? 'Stormwater Drainage Dept' : 'PWD Roads & Bridges'}</strong>
                      </div>
                      <div className="text-[10px] text-amber-300 font-bold">
                        SLA TARGET: 30 MINUTES &bull; AUTOMATED CITIZEN APP ADVISORY POSTED
                      </div>
                    </div>
                  </div>
                )}

                {/* 13. RESPONSE */}
                {currentStage.id === 'RESPONSE' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-300">
                    <div className="p-5 rounded-2xl bg-cyan-950/70 border border-cyan-400 text-center font-mono space-y-2">
                      <Truck className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
                      <div className="text-sm font-bold text-white uppercase">
                        FIELD CREW MOBILIZED &amp; EN ROUTE
                      </div>
                      <div className="text-xs text-cyan-200">
                        Unit: {isWaterlogging ? 'Rapid Dewatering Unit 2' : 'Asphalt Jetpatcher Crew 4'}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold">
                        ETA: 12 MINUTES &bull; EQUIPMENT: HIGH-VOLUME SUBMERSIBLE PUMP
                      </div>
                    </div>
                  </div>
                )}

                {/* 14. RESOLUTION */}
                {currentStage.id === 'RESOLUTION' && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="p-5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-center font-mono space-y-2 shadow-2xl">
                      <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-pulse" />
                      <div className="text-sm font-black text-white uppercase tracking-wider">
                        HAZARD RESOLVED &amp; CORRIDOR CLEARED
                      </div>
                      <div className="text-xs text-emerald-200">
                        Follow-up Bus Sweep Verified Water Depth: <strong>0.00 m</strong>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Turnaround Time: 28 Min &bull; Closed in Municipal Audit Database
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Screen Info Caption */}
              <div className="relative z-10 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-bold text-white">{currentStage.name}:</span>
                  <span className="text-slate-300 text-[11px] truncate max-w-xs sm:max-w-md">
                    {currentStage.subtitle}
                  </span>
                </div>
                <span className="text-cyan-400 text-[11px] font-bold">
                  {currentStage.shortCode}
                </span>
              </div>
            </div>

            {/* Playback Control Deck: PLAY, PAUSE, RESTART, SKIP */}
            <div className="p-4 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {/* PLAY / PAUSE */}
                <button
                  id="replay-play-pause-btn"
                  onClick={handlePlayPause}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/40'
                  }`}
                  title={isPlaying ? 'Pause Replay' : 'Play Replay'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>{isCompleted ? 'REPLAY AGAIN' : 'PLAY'}</span>
                    </>
                  )}
                </button>

                {/* RESTART */}
                <button
                  id="replay-restart-btn"
                  onClick={handleRestart}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
                  title="Restart Replay from Stage 1 (BUS)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESTART</span>
                </button>

                {/* SKIP */}
                <button
                  id="replay-skip-btn"
                  onClick={handleSkipNext}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
                  title="Skip to next stage"
                >
                  <span>SKIP</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Speed Multiplier & Action Link */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs font-mono">
                  <span className="text-[10px] text-slate-500 px-1.5">SPEED:</span>
                  {[0.5, 1, 2, 3].map((spd) => (
                    <button
                      key={spd}
                      id={`replay-speed-${spd}x-btn`}
                      onClick={() => setSpeedMultiplier(spd)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                        speedMultiplier === spd
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <button
                  id="replay-view-on-map-btn"
                  onClick={() => viewHazardOnMap(activeIncident.id)}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 font-mono text-xs border border-cyan-800/40 flex items-center gap-1 transition-colors"
                  title="View this location on GIS Map"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">GIS Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Scrub Bar with 14 Stages */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                TIMELINE SCRUBBER (CLICK ANY STAGE TO JUMP)
              </span>
              <span className="text-cyan-400 font-bold">
                {currentStage.id} ({currentStageIndex + 1}/{REPLAY_STAGES.length})
              </span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 pt-1">
              {REPLAY_STAGES.map((stg, idx) => {
                const isCurrent = idx === currentStageIndex;
                const isPast = idx < currentStageIndex || isCompleted;
                const IconComp = stg.icon;

                return (
                  <button
                    key={stg.id}
                    id={`replay-scrub-stage-${stg.id.toLowerCase()}`}
                    onClick={() => handleJumpToStage(idx)}
                    title={`Stage ${idx + 1}: ${stg.name}`}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-900/40 scale-105 ring-1 ring-cyan-400'
                        : isPast
                        ? 'bg-slate-900 border-emerald-500/40 text-emerald-400 hover:border-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5 mb-1" />
                    <span className="text-[9px] font-mono font-bold truncate max-w-full">
                      {stg.shortCode}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 mt-0.5">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Actual Simulated Telemetry Stream (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Incident Real Telemetry Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    SIMULATED INCIDENT TELEMETRY
                  </h3>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Live parameters extracted from {activeIncident.id}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                activeIncident.severity === 'critical'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {activeIncident.severity}
              </span>
            </div>

            {/* Key Value Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="text-slate-500 text-[10px] uppercase block">Assigned Transit Carrier</span>
                <span className="text-white font-bold">{busId}</span>
                <span className="text-slate-400 text-[10px] block">Coimbatore Transit</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="text-slate-500 text-[10px] uppercase block">Hazard Classification</span>
                <span className="text-cyan-300 font-bold capitalize">{activeIncident.type.replace('_', ' ')}</span>
                <span className="text-slate-400 text-[10px] block">Confidence: {confidencePct}%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="text-slate-500 text-[10px] uppercase block">LiDAR Water/Crater Depth</span>
                <span className="text-rose-400 font-bold text-sm">
                  {isWaterlogging ? `${waterDepthM.toFixed(2)} m` : activeIncident.waterDepth ? `${activeIncident.waterDepth.toFixed(2)} m` : '0.13 m'}
                </span>
                <span className="text-slate-400 text-[10px] block">
                  Surface Dist: {surfaceDistanceM.toFixed(2)} m
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="text-slate-500 text-[10px] uppercase block">Geospatial RTK GPS Fix</span>
                <span className="text-emerald-400 font-bold">
                  {gpsLat.toFixed(4)}, {gpsLon.toFixed(4)}
                </span>
                <span className="text-slate-400 text-[10px] block truncate">{roadName}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5 col-span-2">
                <span className="text-slate-500 text-[10px] uppercase block">Civic Response Action</span>
                <span className="text-slate-200 font-sans text-xs">
                  {activeIncident.suggestedAction || 'Deploy stormwater suction vehicle & high-volume dewatering unit.'}
                </span>
              </div>
            </div>

            {/* Live Edge Packet JSON Payload Preview */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>EDGE PROTOCOL PAYLOAD (MQTT v1.3)</span>
                <span className="text-cyan-400 font-bold">ENCRYPTED</span>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300/90 overflow-x-auto leading-relaxed max-h-48 scrollbar-thin scrollbar-thumb-slate-800">
{JSON.stringify({
  event_id: activeIncident.id,
  carrier_id: busId,
  timestamp_utc: activeIncident.timestamp || new Date().toISOString(),
  hazard_type: activeIncident.type,
  neural_confidence: confidencePct / 100,
  lidar_telemetry: {
    sensor_height_m: sensorHeightM,
    surface_distance_m: surfaceDistanceM,
    computed_depth_m: waterDepthM,
    tof_picoseconds: tofPicoseconds,
  },
  gnss_fix: {
    lat: gpsLat,
    lon: gpsLon,
    hdop: 0.78,
    satellites: 16
  },
  edge_hardware: "NVIDIA Jetson Orin Nano (Ampere 40 TOPS)",
  network: "5G SA (C-V2X Band n78)"
}, null, 2)}
              </pre>
            </div>
          </div>

          {/* Judge Evaluation Sheet Quick Reference */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-white font-bold">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>SIH JUDGE EVALUATION CRITERIA ALIGNMENT</span>
            </div>
            <ul className="text-[11px] font-sans text-slate-400 space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-slate-200">Zero Added Fleet Cost:</strong> Leverages existing municipal public transit buses as continuous scanning nodes.
              </li>
              <li>
                <strong className="text-slate-200">Optical + LiDAR Fusion:</strong> Eliminates false positives from reflections or shadows through physics depth confirmation.
              </li>
              <li>
                <strong className="text-slate-200">Closed-Loop Civic Action:</strong> End-to-end trace from edge detection to municipal crew dispatch and post-audit verification.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
