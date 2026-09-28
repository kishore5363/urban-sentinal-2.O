import React from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Radio, 
  Zap, 
  Activity, 
  Waves, 
  Scan, 
  Cpu, 
  Send, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  FastForward
} from 'lucide-react';
import { useSentinel, PipelineStage } from '../context/SentinelContext';

const STAGES: { id: PipelineStage; label: string; desc: string }[] = [
  { id: 'SENSE', label: '1. SENSE', desc: 'LiDAR + Camera' },
  { id: 'DETECT', label: '2. DETECT', desc: 'YOLOv8 Edge' },
  { id: 'MEASURE', label: '3. MEASURE', desc: 'ToF Depth' },
  { id: 'LOCATE', label: '4. LOCATE', desc: 'RTK GPS' },
  { id: 'PROCESS', label: '5. PROCESS', desc: 'Jetson Orin' },
  { id: 'TRANSMIT', label: '6. TRANSMIT', desc: '5G SA Link' },
  { id: 'ANALYZE', label: '7. ANALYZE', desc: 'Cloud Ingest' },
  { id: 'ALERT', label: '8. ALERT', desc: 'Municipal Hub' },
  { id: 'RESPOND', label: '9. RESPOND', desc: 'Team Dispatched' },
];

export const LiveDemoPipeline: React.FC = () => {
  const { 
    demoState, 
    startLiveDemo, 
    resetDemo, 
    jumpToDemoStage,
    simulationSpeed, 
    setSimulationSpeed, 
    soundEnabled, 
    toggleSound,
    setActiveTab 
  } = useSentinel();
  const { isRunning, isCompleted, secondsElapsed, currentStage, stageMessage, stageDetail, bus102Metrics } = demoState;

  const getStageIndex = (stage: PipelineStage) => STAGES.findIndex(s => s.id === stage);
  const activeIdx = getStageIndex(currentStage);

  return (
    <div id="live-demo-engine-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Background glow when running */}
      {isRunning && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-blue-950/20 to-purple-950/30 pointer-events-none animate-pulse" />
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold tracking-wider border border-cyan-500/30 uppercase">
              LIVE DEMO ENGINE (30s)
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              SIMULATED DATA
            </span>
            {isRunning && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <Clock className="w-3 h-3 animate-spin" />
                {secondsElapsed}s / 30s
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-300">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                DEMO COMPLETED
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
            BUS-102 Autonomous Waterlogging Detection & Municipal Dispatch
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Speed Multiplier Controls for Judges */}
          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs font-mono">
            <span className="text-[10px] text-slate-500 px-1.5 hidden md:inline">SPEED:</span>
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                id={`demo-speed-${spd}x-btn`}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                  simulationSpeed === spd
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Run demo at ${spd}x real-time speed`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            id="demo-sound-toggle-btn"
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-cyan-400'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Acoustic feedback enabled' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {!isRunning ? (
            <button
              id="start-live-demo-main-btn"
              onClick={startLiveDemo}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/60 border border-cyan-400/40 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isCompleted ? 'RE-RUN LIVE DEMO' : 'START LIVE DEMO (30s)'}</span>
            </button>
          ) : (
            <button
              id="running-live-demo-btn"
              disabled
              className="px-4 py-2 rounded-xl bg-cyan-950 text-cyan-300 text-xs font-mono font-bold border border-cyan-800/80 flex items-center gap-2"
            >
              <Activity className="w-4 h-4 animate-spin text-cyan-400" />
              <span>SIMULATING ({secondsElapsed}s)</span>
            </button>
          )}

          <button
            id="reset-demo-btn"
            onClick={resetDemo}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Reset demo parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* 9-Stage Animated Pipeline Flow with Direct Step Click */}
      <div className="py-4 relative z-10 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800">
        <div className="flex items-center min-w-[760px] justify-between gap-1">
          {STAGES.map((s, idx) => {
            const isCurrent = currentStage === s.id && isRunning;
            const isPast = (activeIdx > idx) || isCompleted;
            return (
              <React.Fragment key={s.id}>
                <button
                  id={`pipeline-step-${s.id.toLowerCase()}`}
                  onClick={() => jumpToDemoStage(s.id)}
                  title={`Jump directly to step ${s.label}`}
                  className={`flex-1 flex flex-col items-center text-center p-2 rounded-xl border transition-all cursor-pointer hover:border-cyan-400/60 ${
                    isCurrent
                      ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-900/40 scale-105'
                      : isPast
                      ? 'bg-slate-850/90 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-mono font-bold tracking-tight">
                    {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                    <span>{s.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans mt-0.5 whitespace-nowrap">
                    {s.desc}
                  </span>
                </button>
                {idx < STAGES.length - 1 && (
                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    isPast ? 'text-emerald-400' : isCurrent ? 'text-cyan-400 animate-pulse' : 'text-slate-700'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Pipeline Status Banner */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 flex items-center gap-2">
              <span>{stageMessage}</span>
              {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {stageDetail}
            </p>
          </div>
        </div>

        {isCompleted && (
          <button
            id="view-incident-alert-btn"
            onClick={() => setActiveTab('alerts')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-md shadow-rose-950 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>View Generated Alert (INC-2048)</span>
          </button>
        )}
      </div>

      {/* Telemetry Snapshot Grid (Active Sensor Readings During Demo) */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs relative z-10">
        {/* BUS & Movement */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Bus Velocity</span>
          <div className="text-sm font-extrabold text-white font-mono mt-0.5">
            {bus102Metrics.speed} km/h
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">
            {bus102Metrics.isMoving ? 'MOVING ON CORRIDOR' : 'STATIONARY'}
          </span>
        </div>

        {/* GPS */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Simulated GPS</span>
          <div className="text-[11px] font-bold text-white font-mono mt-0.5 truncate">
            {bus102Metrics.lat.toFixed(4)}, {bus102Metrics.lon.toFixed(4)}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">GNSS RTK LOCKED</span>
        </div>

        {/* Camera / Object */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">AI Camera</span>
          <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">
            {bus102Metrics.detectedObject || (bus102Metrics.cameraScanning ? 'SCANNING...' : 'STANDBY')}
          </div>
          <span className="text-[10px] font-mono text-cyan-300">
            {bus102Metrics.confidence ? `Conf: ${bus102Metrics.confidence}%` : 'YOLOv8 FP16'}
          </span>
        </div>

        {/* Sensor Height */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Sensor Height</span>
          <div className="text-sm font-extrabold text-white font-mono mt-0.5">
            1.25 m
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Calibrated Datum</span>
        </div>

        {/* Surface Distance */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Surface Distance</span>
          <div className="text-sm font-extrabold text-white font-mono mt-0.5">
            {bus102Metrics.surfaceDistance.toFixed(2)} m
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">ToF LiDAR Echo</span>
        </div>

        {/* Water Depth calculation */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          bus102Metrics.waterDepth >= 0.50 
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Water Depth</span>
          <div className="text-sm font-extrabold text-cyan-300 font-mono mt-0.5">
            {bus102Metrics.waterDepth.toFixed(2)} m
          </div>
          <span className="text-[10px] font-mono text-rose-400 font-bold">
            {bus102Metrics.waterDepth >= 0.50 ? 'CRITICAL (>0.50m)' : '1.25 - 0.60 = 0.65m'}
          </span>
        </div>

        {/* 5G & Edge AI */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Edge AI / 5G</span>
          <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
            {bus102Metrics.edgeAiActive ? 'ACTIVE (Jetson)' : 'STANDBY'}
          </div>
          <span className="text-[10px] font-mono text-slate-300">
            5G: {bus102Metrics.connectivity}
          </span>
        </div>
      </div>
    </div>
  );
};
