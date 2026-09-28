import React from 'react';
import { 
  Radio, 
  Play, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Waves, 
  Wifi, 
  Cpu, 
  MapPin, 
  Clock, 
  Layers, 
  Activity, 
  ChevronRight,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const PresentationMode: React.FC = () => {
  const { 
    isPresentationMode, 
    setIsPresentationMode, 
    demoState, 
    startLiveDemo, 
    resetDemo,
    waterReading,
    setActiveTab
  } = useSentinel();

  if (!isPresentationMode) return null;

  const { isRunning, isCompleted, secondsElapsed, currentStage, stageMessage, stageDetail, bus102Metrics } = demoState;

  const stages = [
    'SENSE', 'DETECT', 'MEASURE', 'LOCATE', 'TRANSMIT', 'ANALYZE', 'ALERT', 'RESPOND'
  ];

  return (
    <div id="presentation-mode-overlay" className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-6 overflow-y-auto font-sans">
      {/* Top Presentation Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Radio className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-wider text-white uppercase font-mono">
                URBAN SENTINEL
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold border border-cyan-400/30">
                SIH PRESENTATION MODE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold border border-amber-400/30">
                SIMULATION MODE
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400 tracking-wide mt-0.5">
              AI-POWERED MOBILE URBAN INTELLIGENCE PLATFORM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
            SCENARIO: MONSOON WATERLOGGING INCIDENT
          </div>
          <button
            id="exit-presentation-mode-btn"
            onClick={() => setIsPresentationMode(false)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Main Center Display: LIVE BUS BUS-102 */}
      <div className="flex-1 py-8 flex flex-col justify-center max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono text-cyan-400 font-bold tracking-wider">
                PRIMARY MOBILE SENSING UNIT
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              LIVE BUS: BUS-102
            </h2>
            <p className="text-sm text-slate-400">
              Route: Gandhipuram Central Terminal ↔ Ukkadam Interchange Corridor
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isRunning ? (
              <button
                id="presentation-start-demo-btn"
                onClick={startLiveDemo}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-950/80 border border-cyan-400/40 flex items-center gap-3 transition-all transform hover:scale-105"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{isCompleted ? 'REPLAY LIVE DEMO' : 'START LIVE DEMO (30s)'}</span>
              </button>
            ) : (
              <div className="px-6 py-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-500 text-cyan-300 font-mono font-bold text-sm flex items-center gap-3">
                <Activity className="w-5 h-5 animate-spin text-cyan-400" />
                <span>SIMULATING: {secondsElapsed}s / 30s</span>
              </div>
            )}

            <button
              id="presentation-reset-demo-btn"
              onClick={resetDemo}
              className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESET</span>
            </button>
          </div>
        </div>

        {/* 8 Core Metric Cards specified in prompt */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* 1. AI DETECTION: ACTIVE */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">AI DETECTION</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              ACTIVE
            </div>
            <span className="text-[11px] text-slate-400 mt-2 font-mono">YOLOv8 Edge Vision</span>
          </div>

          {/* 2. WATERLOGGING: DETECTED */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            bus102Metrics.detectedObject || isCompleted
              ? 'bg-rose-950/30 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <span className="text-xs font-mono uppercase tracking-wider">WATERLOGGING</span>
            <div className="text-2xl font-black font-mono mt-2 text-rose-400">
              {bus102Metrics.detectedObject ? 'DETECTED' : (isRunning ? 'SCANNING...' : 'MONITORED')}
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-2">Hazard Classification</span>
          </div>

          {/* 3. CONFIDENCE: 94% */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">CONFIDENCE</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-2">
              {bus102Metrics.confidence ? `${bus102Metrics.confidence}%` : (isCompleted ? '94%' : '94%')}
            </div>
            <span className="text-[11px] text-slate-400 mt-2 font-mono">Model Certainty Score</span>
          </div>

          {/* 4. WATER DEPTH: 0.65 m */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            bus102Metrics.waterDepth > 0 || isCompleted
              ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200'
              : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">WATER DEPTH</span>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {bus102Metrics.waterDepth > 0 ? `${bus102Metrics.waterDepth.toFixed(2)} m` : '0.65 m'}
            </div>
            <span className="text-[11px] font-mono text-cyan-300 mt-2">1.25m - 0.60m = 0.65m</span>
          </div>

          {/* 5. GPS: LOCKED */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">GPS STATUS</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              LOCKED
            </div>
            <span className="text-[11px] text-slate-400 mt-2 font-mono">11.0168° N, 76.9558° E</span>
          </div>

          {/* 6. NETWORK: 5G */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">NETWORK</span>
            <div className="text-2xl font-black text-blue-400 font-mono mt-2 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-400" />
              5G
            </div>
            <span className="text-[11px] text-slate-400 mt-2 font-mono">Latency: 12ms | -64 dBm</span>
          </div>

          {/* 7. EDGE AI: ACTIVE */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">EDGE AI</span>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-2 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              ACTIVE
            </div>
            <span className="text-[11px] text-slate-400 mt-2 font-mono">Jetson Orin Nano (40 TOPS)</span>
          </div>

          {/* 8. ALERT: SENT */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            bus102Metrics.alertGenerated || isCompleted
              ? 'bg-rose-950/40 border-rose-500 text-rose-200 animate-pulse'
              : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">MUNICIPAL ALERT</span>
            <div className="text-2xl font-black text-rose-400 font-mono mt-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              {bus102Metrics.alertGenerated || isCompleted ? 'SENT' : (isRunning ? 'PENDING' : 'READY')}
            </div>
            <span className="text-[11px] font-mono text-rose-300 mt-2">INC-2048 to Stormwater PWD</span>
          </div>
        </div>

        {/* Live Scenario Narrative Banner */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white">{stageMessage}</span>
              <p className="text-xs text-slate-400 mt-0.5">{stageDetail}</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            Pipeline Step: {currentStage}
          </span>
        </div>
      </div>

      {/* Bottom Pipeline Progress Bar */}
      <div className="pt-6 border-t border-slate-800 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {stages.map((stageName, idx) => {
            const isCurrent = currentStage === stageName && isRunning;
            const isPast = isCompleted || stages.indexOf(currentStage) >= idx;
            return (
              <React.Fragment key={stageName}>
                <div className={`flex-1 min-w-[100px] text-center p-2.5 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'bg-cyan-500 text-white font-extrabold border-cyan-300 shadow-lg shadow-cyan-500/30' 
                    : isPast 
                    ? 'bg-slate-900 text-emerald-400 border-emerald-500/30' 
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}>
                  <span className="text-xs font-mono tracking-wider font-bold">
                    {stageName}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isPast ? 'text-emerald-400' : 'text-slate-700'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
