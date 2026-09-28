import React, { useState } from 'react';
import { 
  Camera, 
  ScanEye, 
  Waves, 
  Disc, 
  Activity, 
  AlertTriangle, 
  Cpu, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Sliders,
  Crosshair,
  Layers,
  Radio,
  Share2
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { CAMERA_SCENARIOS, CameraScenario } from '../data/mockData';
import { HazardType } from '../types';

export const AiRoadHazardDetection: React.FC = () => {
  const { 
    buses, 
    selectedBusId, 
    setSelectedBusId, 
    viewHazardOnMap,
    simulateNewHazardDetection
  } = useSentinel();

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showSegmentation, setShowSegmentation] = useState<boolean>(true);
  const [isCapturing, setIsCapturing] = useState<boolean>(true);

  const scenario: CameraScenario = CAMERA_SCENARIOS[selectedScenarioIndex];
  const bus = buses.find(b => b.id === scenario.busId) || buses[0];

  const handleScenarioChange = (idx: number) => {
    setSelectedScenarioIndex(idx);
  };

  const getHazardBadge = (type: string) => {
    switch (type) {
      case 'waterlogging':
        return { label: 'WATERLOGGING DETECTED', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', boxColor: '#06b6d4' };
      case 'pothole':
        return { label: 'POTHOLE DETECTED', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', boxColor: '#f59e0b' };
      case 'road_crack':
        return { label: 'STRUCTURAL ROAD CRACK', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', boxColor: '#a855f7' };
      case 'damaged_road':
        return { label: 'DAMAGED ROAD / ASPHALT CORRUGATION', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', boxColor: '#f43f5e' };
      default:
        return { label: 'CLEAR ROAD SURFACE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', boxColor: '#10b981' };
    }
  };

  const badge = getHazardBadge(scenario.type);

  return (
    <div id="ai-road-hazard-detection-section" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <ScanEye className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                Simulated AI Road Hazard Camera Feed
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                EDGE COMPUTER VISION
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High dynamic range optical detection + edge neural inference running onboard bus
            </p>
          </div>
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-bbox-btn"
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
              showBoundingBoxes ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showBoundingBoxes ? 'HUD: BBox ON' : 'HUD: BBox OFF'}
          </button>
          <button
            id="toggle-seg-btn"
            onClick={() => setShowSegmentation(!showSegmentation)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
              showSegmentation ? 'bg-indigo-950 text-indigo-300 border-indigo-700' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showSegmentation ? 'Mask: ON' : 'Mask: OFF'}
          </button>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-xs font-mono uppercase text-slate-400 font-bold shrink-0 mr-1">
          Select Scenario:
        </span>
        {CAMERA_SCENARIOS.map((scn, idx) => {
          const isSelected = idx === selectedScenarioIndex;
          return (
            <button
              key={scn.id}
              id={`scenario-tab-${scn.id}`}
              onClick={() => handleScenarioChange(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 shadow-md shadow-cyan-950'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {scn.type === 'waterlogging' && <Waves className="w-3.5 h-3.5 text-cyan-400" />}
              {scn.type === 'pothole' && <Disc className="w-3.5 h-3.5 text-amber-400" />}
              {scn.type === 'road_crack' && <Activity className="w-3.5 h-3.5 text-purple-400" />}
              {scn.type === 'damaged_road' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
              {scn.type === 'clear' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="font-semibold">{scn.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Camera Video Canvas (Left 2/3) + Detection Telemetry Details (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Realistic Simulated Road Camera Panel */}
        <div className="lg:col-span-2 space-y-3">
          <div 
            id="camera-stream-canvas-container"
            className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl h-[400px] sm:h-[480px] select-none"
          >
            {/* Realistic Road / Environment SVG Visualization */}
            <svg 
              className="w-full h-full"
              viewBox="0 0 720 480"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Sky & Environment Gradients */}
                <linearGradient id="sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={scenario.weather === 'heavy_rain' ? '#0f172a' : scenario.weather === 'dusk' ? '#1e1b4b' : '#0284c7'} stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
                </linearGradient>

                {/* Asphalt Road Gradient with Perspective */}
                <linearGradient id="asphalt-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="50%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>

                {/* Waterlogging reflection filter */}
                <radialGradient id="puddle-water" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#0369a1" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#082f49" stopOpacity="0.3" />
                </radialGradient>

                {/* Pothole Crater Gradient */}
                <radialGradient id="pothole-crater" cx="45%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="#020617" />
                  <stop offset="65%" stopColor="#1e293b" />
                  <stop offset="90%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>
              </defs>

              {/* Sky / Distant Horizon */}
              <rect width="720" height="180" fill="url(#sky-grad)" />

              {/* Distant City Skyline Silhouette */}
              <path
                d="M 0 180 L 40 160 L 60 160 L 80 145 L 110 145 L 120 170 L 160 170 L 180 130 L 210 130 L 220 180 L 280 180 L 300 150 L 340 150 L 360 180 L 420 165 L 450 165 L 480 180 L 530 140 L 560 140 L 590 180 L 640 155 L 680 155 L 720 180 Z"
                fill="#090d16"
                opacity="0.9"
              />

              {/* Road Ground Plane with vanishing point perspective */}
              <polygon points="260,180 460,180 720,480 0,480" fill="url(#asphalt-grad)" />

              {/* Road Kerbs / Side Barriers */}
              <polygon points="240,180 260,180 0,480 -30,480" fill="#334155" opacity="0.6" />
              <polygon points="460,180 480,180 750,480 720,480" fill="#334155" opacity="0.6" />

              {/* Road Lane Markings with perspective */}
              <g stroke="#f8fafc" strokeWidth="6" strokeDasharray="30,40" opacity="0.75">
                {/* Center Lane Line */}
                <line x1="360" y1="180" x2="360" y2="480" />
              </g>
              {/* Solid White Outer Shoulder Lines */}
              <line x1="280" y1="180" x2="60" y2="480" stroke="#f8fafc" strokeWidth="4" opacity="0.8" />
              <line x1="440" y1="180" x2="660" y2="480" stroke="#f8fafc" strokeWidth="4" opacity="0.8" />

              {/* SCENARIO 1: Waterlogging Visual Representation */}
              {scenario.type === 'waterlogging' && (
                <g>
                  {/* Water flood pool on road */}
                  <ellipse
                    cx="370"
                    cy="340"
                    rx="180"
                    ry="75"
                    fill="url(#puddle-water)"
                  />
                  {/* Water Ripple Waves */}
                  <path
                    d="M 230 330 Q 370 315 510 330 M 260 350 Q 370 335 480 350 M 290 370 Q 370 355 450 370"
                    fill="none"
                    stroke="#7dd3fc"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  {/* Water splash reflections */}
                  <circle cx="340" cy="335" r="8" fill="#e0f2fe" opacity="0.6" />
                  <circle cx="410" cy="355" r="5" fill="#e0f2fe" opacity="0.5" />
                </g>
              )}

              {/* SCENARIO 2: Pothole Visual Representation */}
              {scenario.type === 'pothole' && (
                <g>
                  {/* Outer rim asphalt damage */}
                  <ellipse cx="375" cy="345" rx="85" ry="50" fill="#0b0f19" stroke="#64748b" strokeWidth="3" />
                  {/* Inner crater depth */}
                  <ellipse cx="370" cy="348" rx="65" ry="38" fill="url(#pothole-crater)" />
                  {/* Exposed rough ballast gravel rocks */}
                  <circle cx="340" cy="345" r="6" fill="#94a3b8" />
                  <circle cx="385" cy="350" r="8" fill="#64748b" />
                  <circle cx="360" cy="360" r="5" fill="#94a3b8" />
                  <circle cx="405" cy="342" r="7" fill="#475569" />
                  {/* Jagged radial fractures */}
                  <path
                    d="M 290 345 L 315 342 M 435 348 L 465 352 M 370 295 L 372 310 M 365 385 L 368 405"
                    stroke="#475569"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* SCENARIO 3: Road Crack Visual Representation */}
              {scenario.type === 'road_crack' && (
                <g>
                  {/* Meandering fracture line across lane */}
                  <path
                    d="M 330 250 L 345 280 L 335 310 L 370 340 L 355 375 L 390 410 L 380 450"
                    fill="none"
                    stroke="#090d16"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 330 250 L 345 280 L 335 310 L 370 340 L 355 375 L 390 410 L 380 450"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                  {/* Secondary branching crack spurs */}
                  <path
                    d="M 345 280 L 375 290 M 370 340 L 395 330 M 355 375 L 325 390"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                </g>
              )}

              {/* SCENARIO 4: Damaged Asphalt Corrugation */}
              {scenario.type === 'damaged_road' && (
                <g>
                  {/* Horizontal washboard ripples */}
                  {[-40, -20, 0, 20, 40, 60, 80].map((offset, i) => (
                    <path
                      key={i}
                      d={`M ${240 - i * 8} ${320 + offset} Q 360 ${310 + offset} ${480 + i * 8} ${320 + offset}`}
                      fill="none"
                      stroke="#fb7185"
                      strokeWidth="3.5"
                      opacity={0.7 - i * 0.05}
                    />
                  ))}
                  {/* Surface stripping patches */}
                  <ellipse cx="310" cy="330" rx="35" ry="15" fill="#020617" opacity="0.8" />
                  <ellipse cx="430" cy="370" rx="45" ry="20" fill="#020617" opacity="0.8" />
                </g>
              )}

              {/* Rain Streaks if heavy rain */}
              {scenario.weather === 'heavy_rain' && (
                <g stroke="#38bdf8" strokeWidth="1" opacity="0.35">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <line
                      key={i}
                      x1={(i * 32) % 720}
                      y1={(i * 18) % 300}
                      x2={((i * 32) % 720) - 10}
                      y2={((i * 18) % 300) + 25}
                    />
                  ))}
                </g>
              )}

              {/* Computer Vision Segmentation Mask Overlay */}
              {showSegmentation && scenario.type !== 'clear' && (
                <g opacity="0.25">
                  <rect
                    x={`${scenario.bbox.x}%`}
                    y={`${scenario.bbox.y}%`}
                    width={`${scenario.bbox.w}%`}
                    height={`${scenario.bbox.h}%`}
                    fill={badge.boxColor}
                    rx="8"
                  />
                </g>
              )}

              {/* Computer Vision Bounding Box Overlay */}
              {showBoundingBoxes && (
                <g>
                  <rect
                    x={`${scenario.bbox.x}%`}
                    y={`${scenario.bbox.y}%`}
                    width={`${scenario.bbox.w}%`}
                    height={`${scenario.bbox.h}%`}
                    fill="none"
                    stroke={badge.boxColor}
                    strokeWidth="2.5"
                    strokeDasharray={scenario.type === 'clear' ? '6,4' : 'none'}
                    rx="4"
                  />
                  {/* Corner Accent Brackets */}
                  <path
                    d={`M ${scenario.bbox.x * 7.2} ${scenario.bbox.y * 4.8 + 15} L ${scenario.bbox.x * 7.2} ${scenario.bbox.y * 4.8} L ${scenario.bbox.x * 7.2 + 15} ${scenario.bbox.y * 4.8}`}
                    fill="none"
                    stroke={badge.boxColor}
                    strokeWidth="4"
                  />
                  <path
                    d={`M ${(scenario.bbox.x + scenario.bbox.w) * 7.2 - 15} ${scenario.bbox.y * 4.8} L ${(scenario.bbox.x + scenario.bbox.w) * 7.2} ${scenario.bbox.y * 4.8} L ${(scenario.bbox.x + scenario.bbox.w) * 7.2} ${scenario.bbox.y * 4.8 + 15}`}
                    fill="none"
                    stroke={badge.boxColor}
                    strokeWidth="4"
                  />
                </g>
              )}
            </svg>

            {/* AI HUD Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              {/* Top HUD Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-red-400 font-bold">REC</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-200">{bus.id} FRONT_CAM_01</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-cyan-400">{scenario.metrics.resolution}</span>
                </div>

                <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-3">
                  <span>FPS: <strong className="text-emerald-400">{scenario.metrics.fps}</strong></span>
                  <span>Latency: <strong className="text-cyan-400">{scenario.metrics.latencyMs} ms</strong></span>
                  <span className="text-slate-400 hidden sm:inline">{scenario.metrics.model}</span>
                </div>
              </div>

              {/* Center Crosshair / Aim Reticle */}
              <div className="self-center flex flex-col items-center opacity-60">
                <Crosshair className="w-8 h-8 text-cyan-400/80" />
                <span className="text-[9px] font-mono text-cyan-400 tracking-widest mt-1">
                  OPTICAL SENSING HORIZON
                </span>
              </div>

              {/* Bottom HUD: Live Detection Classification Tag */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 max-w-md space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      CONFIDENCE: {scenario.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {scenario.description}
                  </p>
                  {scenario.depthMeters && (
                    <div className="flex items-center gap-2 pt-1 text-xs font-mono text-cyan-300">
                      <Waves className="w-3.5 h-3.5 text-cyan-400" />
                      <span>LiDAR Water Depth: <strong>{scenario.depthMeters} m ({scenario.depthMeters * 100} cm)</strong></span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-right text-xs font-mono">
                  <div className="text-slate-400 text-[10px]">ROAD SEGMENT</div>
                  <div className="text-white font-bold truncate max-w-[200px]">{scenario.roadName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick HUD controls underneath canvas */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <span>Weather: <strong className="text-slate-200 capitalize">{scenario.weather.replace('_', ' ')}</strong></span>
              <span>•</span>
              <span>Model: <strong className="text-cyan-400">YOLOv8-UrbanEdge</strong></span>
              <span>•</span>
              <span>Inference Engine: <strong className="text-emerald-400">TensorRT FP16</strong></span>
            </div>
            <button
              id="retrigger-camera-inference-btn"
              onClick={() => simulateNewHazardDetection(scenario.type !== 'clear' ? scenario.type : undefined)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trigger Edge Detection Event</span>
            </button>
          </div>
        </div>

        {/* Right 1/3: Required Hazard Output Card according to Prompt */}
        <div className="space-y-4">
          <div 
            id="hazard-detection-output-card"
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                TELEMETRY OUTPUT PAYLOAD
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">
                Detected Hazard Record
              </h3>
              <p className="text-xs text-slate-400">
                Generated at Edge on public transit unit
              </p>
            </div>

            {/* Prompt Specification Fields */}
            <div className="space-y-3 text-xs">
              {/* 1. Hazard Type */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Hazard Type
                </span>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${badge.color}`}>
                    {scenario.type === 'waterlogging' && <Waves className="w-4 h-4" />}
                    {scenario.type === 'pothole' && <Disc className="w-4 h-4" />}
                    {scenario.type === 'road_crack' && <Activity className="w-4 h-4" />}
                    {scenario.type === 'damaged_road' && <AlertTriangle className="w-4 h-4" />}
                    {scenario.type === 'clear' && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-bold text-white font-mono uppercase">
                    {scenario.type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* 2. Confidence Score */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Confidence Score
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {scenario.confidence}%
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Threshold: &gt;85%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-1.5 rounded-full" 
                    style={{ width: `${scenario.confidence}%` }} 
                  />
                </div>
              </div>

              {/* 3. Timestamp */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Detection Timestamp
                </span>
                <div className="flex items-center gap-2 text-white font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{new Date().toLocaleTimeString('en-IN')} IST (Synchronized via GPS PPS)</span>
                </div>
              </div>

              {/* 4. Bus ID */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Sensing Bus ID
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-cyan-300 font-mono">
                    {scenario.busId}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {bus.routeNumber}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">
                  {bus.routeName}
                </p>
              </div>

              {/* 5. GPS Location */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  GPS Location
                </span>
                <div className="flex items-center gap-1.5 text-white font-mono font-bold mb-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{bus.lat.toFixed(5)}° N, {bus.lon.toFixed(5)}° E</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {scenario.roadName}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                id="view-scenario-on-map-btn"
                onClick={() => viewHazardOnMap('HAZ-2026-089')}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-950"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Locate on GIS City Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
