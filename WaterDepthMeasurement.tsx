import React, { useState } from 'react';
import { 
  Waves, 
  Gauge, 
  Cpu, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowDown, 
  ArrowUp,
  Info,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const WaterDepthMeasurement: React.FC = () => {
  const { 
    waterReading, 
    simulateSensorReading,
    viewHazardOnMap,
    buses
  } = useSentinel();

  const [isPinging, setIsPinging] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('critical');

  const handleSimulate = (dist?: number, presetName?: string) => {
    setIsPinging(true);
    simulateSensorReading(dist);
    if (presetName) setActivePreset(presetName);
    setTimeout(() => setIsPinging(false), 400);
  };

  const { sensorHeight, surfaceDistance, waterDepth, timestamp, status, confidence, tofPulseDurationPs } = waterReading;

  // Preset buttons
  const presets = [
    { name: 'Critical Underpass Flood (0.65m)', dist: 0.60, id: 'critical', badge: 'Critical Hazard' },
    { name: 'Moderate Street Puddle (0.28m)', dist: 0.97, id: 'moderate', badge: 'Warning' },
    { name: 'Shallow Surface Wetness (0.08m)', dist: 1.17, id: 'shallow', badge: 'Caution' },
    { name: 'Dry Clean Asphalt (0.00m)', dist: 1.25, id: 'dry', badge: 'Nominal' },
  ];

  // Visual calculation:
  // Sensor height = 1.25m corresponds to total vertical container height (e.g. 260px)
  // Water depth percentage = (waterDepth / sensorHeight) * 100
  const waterDepthPercent = Math.min(100, Math.max(0, (waterDepth / sensorHeight) * 100));
  const airDistancePercent = 100 - waterDepthPercent;

  return (
    <div id="water-depth-measurement-section" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                Water Depth Measurement (LiDAR / ToF)
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ACTIVE SENSING ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Precise millimeter-wave optical Time-of-Flight telemetry calculating standing water depth
            </p>
          </div>
        </div>

        {/* Primary Required Simulation Button */}
        <button
          id="simulate-sensor-reading-btn"
          onClick={() => handleSimulate()}
          className={`px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold font-mono transition-all shadow-lg shadow-cyan-950/60 border border-cyan-400/40 flex items-center gap-2 ${
            isPinging ? 'scale-95 brightness-125' : ''
          }`}
        >
          <Sparkles className={`w-4 h-4 text-cyan-200 ${isPinging ? 'animate-spin' : ''}`} />
          <span>Simulate Sensor Reading</span>
        </button>
      </div>

      {/* The Core Formula Highlight Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/50 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              MATHEMATICAL FORMULA
            </span>
          </div>
          <div className="text-lg sm:text-xl font-mono font-extrabold text-white tracking-wide">
            Water Depth = Sensor Height − Surface Distance
          </div>
          <p className="text-xs text-slate-400">
            The bumper-mounted LiDAR measures optical echo return time to detect air-water interface distance.
          </p>
        </div>

        {/* Live Formula Values Expression */}
        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl font-mono text-xs space-y-1 shrink-0">
          <div className="text-slate-400 text-[10px]">CURRENT EVALUATION:</div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-slate-300">{sensorHeight.toFixed(2)} m</span>
            <span className="text-slate-500">−</span>
            <span className="text-amber-300">{surfaceDistance.toFixed(2)} m</span>
            <span className="text-slate-500">=</span>
            <span className="text-cyan-400 text-base">{waterDepth.toFixed(2)} m</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Equivalent to <strong>{(waterDepth * 100).toFixed(0)} cm</strong> depth
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Cross-Section (Left) + Detailed Telemetry Values (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive Cross-Section Sensor Beam Diagram */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                  LiDAR / ToF Beam Cross-Section Visualization
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                waterDepth > 0.35 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                  : waterDepth > 0.10 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {waterDepth > 0.35 ? 'CRITICAL FLOOD' : waterDepth > 0.10 ? 'MODERATE WATERLOGGING' : 'NOMINAL / SAFE'}
              </span>
            </div>

            {/* Dynamic Graphical Stage: Bus Mount, Laser Beam, Water Layer, Asphalt */}
            <div className="relative h-72 sm:h-80 bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex">
              {/* Left Column: Metric Ruler Scale */}
              <div className="w-14 sm:w-16 border-r border-slate-800 bg-slate-950/60 p-2 flex flex-col justify-between text-[10px] font-mono text-slate-400 select-none">
                <div className="flex items-center gap-1 text-cyan-400 font-bold">
                  <span>1.25m</span>
                  <div className="w-2 h-0.5 bg-cyan-400" />
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span>1.00m</span>
                  <div className="w-1.5 h-0.5 bg-slate-700" />
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span>0.75m</span>
                  <div className="w-1.5 h-0.5 bg-slate-700" />
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span>0.50m</span>
                  <div className="w-1.5 h-0.5 bg-slate-700" />
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span>0.25m</span>
                  <div className="w-1.5 h-0.5 bg-slate-700" />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span>0.00m</span>
                  <div className="w-2 h-0.5 bg-emerald-400" />
                </div>
              </div>

              {/* Center: Physical Diagram Stage */}
              <div className="flex-1 relative flex flex-col justify-between p-4 overflow-hidden">
                {/* Top: Bus Chassis Bumper & Sensor Mount */}
                <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-2 bg-slate-900/80 px-3 py-1.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-cyan-500 flex items-center justify-center text-slate-950 font-bold text-[9px] font-mono">
                      S
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-white">
                        FRONT BUMPER LiDAR SENSOR
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Fixed Mount Elevation: 1.25 meters above ground
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    Benewake 100Hz
                  </span>
                </div>

                {/* Laser Beam Projection downwards */}
                <div className="absolute left-1/2 -translate-x-1/2 top-14 bottom-14 w-1 flex flex-col items-center pointer-events-none z-10">
                  {/* Pulsing laser line */}
                  <div 
                    className="w-0.5 h-full bg-gradient-to-b from-cyan-400 via-cyan-300 to-amber-300 animate-pulse"
                    style={{
                      boxShadow: '0 0 10px #06b6d4, 0 0 20px #06b6d4'
                    }}
                  />
                  {/* Optical ping wave effect */}
                  {isPinging && (
                    <div className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-cyan-400 animate-ping opacity-80" />
                  )}
                </div>

                {/* Dimension Annotation in the middle: Surface Distance (Air Gap) */}
                <div 
                  className="absolute right-6 top-16 flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-mono z-20"
                  style={{ top: `${Math.max(20, airDistancePercent * 0.45)}%` }}
                >
                  <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400">Surface Distance:</span>
                  <strong className="text-amber-300">{surfaceDistance.toFixed(2)} m</strong>
                </div>

                {/* Dynamic Water Depth Layer */}
                <div 
                  className="absolute left-0 right-0 bottom-8 transition-all duration-500 overflow-hidden"
                  style={{ height: `${waterDepthPercent}%` }}
                >
                  {/* Water Surface Line with Waves */}
                  <div className="h-2 w-full bg-cyan-400/90 shadow-lg shadow-cyan-400/40 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
                  </div>

                  {/* Water Body Depth Column */}
                  <div className="h-full bg-gradient-to-b from-cyan-600/50 via-blue-700/60 to-slate-900/90 backdrop-blur-sm p-3 flex flex-col justify-center items-center">
                    <div className="bg-slate-950/90 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-center font-mono shadow-xl">
                      <span className="text-[10px] text-cyan-300 font-bold block uppercase tracking-wider">
                        CALCULATED WATER DEPTH
                      </span>
                      <span className="text-lg sm:text-xl font-extrabold text-white">
                        {waterDepth.toFixed(2)} m
                      </span>
                      <span className="text-[10px] text-slate-300 block">
                        ({(waterDepth * 100).toFixed(0)} cm standing water)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Baseline: Asphalt Road Base */}
                <div className="relative z-10 border-t-4 border-slate-700 bg-slate-900/95 py-1.5 px-3 rounded-b-lg flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>ROAD PAVEMENT BASELINE (0.00 m)</span>
                  </div>
                  <span>Asphalt Surface</span>
                </div>
              </div>
            </div>

            {/* Quick Scenario Preset Buttons */}
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Test Calibration Scenarios:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    id={`water-preset-${p.id}`}
                    onClick={() => handleSimulate(p.dist, p.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs font-mono ${
                      activePreset === p.id
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-md shadow-cyan-950'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-200 truncate">{p.badge}</div>
                    <div className="text-[11px] text-cyan-400 mt-0.5">
                      Dist: {p.dist.toFixed(2)}m
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Depth: {(1.25 - p.dist).toFixed(2)}m
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Required Telemetry Output Readings */}
        <div className="lg:col-span-5 space-y-4">
          <div 
            id="water-depth-sensor-card"
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                SENSOR TELEMETRY CARD
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">
                Water Depth Measurement
              </h3>
              <p className="text-xs text-slate-400">
                Onboard ToF Sensor ID: <strong className="text-slate-300 font-mono">TOF-LIDAR-BUS102</strong>
              </p>
            </div>

            {/* The 3 Core Required Outputs */}
            <div className="space-y-3">
              {/* Output 1: Sensor Height */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>SENSOR HEIGHT (Calibrated Baseline)</span>
                  <span className="text-cyan-400 text-[10px]">CONSTANT</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {sensorHeight.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">meters (m)</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Fixed physical mounting distance from sensor lens to dry road surface.
                </p>
              </div>

              {/* Output 2: Surface Distance */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>SURFACE DISTANCE (LiDAR ToF Reading)</span>
                  <span className="text-amber-400 text-[10px] animate-pulse">MEASURED</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-amber-300 font-mono">
                    {surfaceDistance.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">meters (m)</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Direct distance from sensor to water meniscus or road reflection point.
                </p>
              </div>

              {/* Output 3: Calculated Water Depth */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/60 to-slate-950 border border-cyan-500/40 space-y-1">
                <div className="flex items-center justify-between text-xs text-cyan-300 font-mono">
                  <span className="font-bold">CALCULATED WATER DEPTH</span>
                  <span className="text-xs font-bold text-white bg-cyan-600/50 px-2 py-0.5 rounded">
                    {waterDepth > 0.35 ? 'CRITICAL' : waterDepth > 0.10 ? 'MODERATE' : 'SAFE'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-cyan-300 font-mono">
                    {waterDepth.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-cyan-200 font-mono">meters (m)</span>
                </div>
                <div className="text-xs text-slate-300 font-mono pt-1">
                  Formula: {sensorHeight.toFixed(2)}m − {surfaceDistance.toFixed(2)}m = <strong className="text-cyan-400">{waterDepth.toFixed(2)}m</strong>
                </div>
              </div>
            </div>

            {/* Time of Flight Physics & Sensor Telemetry */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1 text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Opto-electronic Telemetry</span>
                </span>
                <span className="text-emerald-400">{confidence}% Confidence</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                <div>
                  ToF Pulse: <strong className="text-slate-200">{tofPulseDurationPs} ps</strong>
                </div>
                <div>
                  Sampling Rate: <strong className="text-slate-200">100 Hz</strong>
                </div>
                <div>
                  Speed of Light: <strong className="text-slate-200">2.998×10⁸ m/s</strong>
                </div>
                <div>
                  Timestamp: <strong className="text-slate-200">{timestamp}</strong>
                </div>
              </div>
            </div>

            {/* Threshold Advisory Alert */}
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              waterDepth > 0.35
                ? 'bg-rose-950/40 border-rose-600/50 text-rose-200'
                : waterDepth > 0.10
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">
                  {waterDepth > 0.35 
                    ? 'Hazard Threshold Exceeded (>0.30m)' 
                    : waterDepth > 0.10 
                    ? 'Caution: Moderate Standing Water' 
                    : 'Normal Safe Road Surface'}
                </strong>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {waterDepth > 0.35
                    ? 'Automated municipal alert dispatched to Stormwater Drainage & Traffic Police for immediate de-watering and lane closure.'
                    : waterDepth > 0.10
                    ? 'Drainage blockage advisory flagged for PWD road sub-division inspection.'
                    : 'Clear vehicle passability. Zero flood hazard detected on this corridor.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
