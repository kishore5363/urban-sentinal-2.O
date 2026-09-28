import React from 'react';
import { 
  BusFront, 
  AlertTriangle, 
  Waves, 
  Disc, 
  Clock, 
  Activity, 
  ArrowUpRight, 
  ShieldAlert, 
  Cpu, 
  Wifi, 
  CheckCircle2, 
  TrendingUp,
  MapPin,
  Eye,
  Sparkles,
  Zap,
  Layers,
  Bot,
  FileText,
  Maximize2,
  ChevronRight,
  Play,
  Video
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { HazardType, HazardRecord } from '../types';
import { LiveDemoPipeline } from './LiveDemoPipeline';

export const OverviewDashboard: React.FC = () => {
  const { 
    buses, 
    hazards, 
    alerts, 
    metrics, 
    waterReading,
    setActiveTab, 
    viewHazardOnMap,
    replayIncident,
    simulateNewHazardDetection,
    setSelectedBusId,
    setIsAiAssistantOpen,
    setIsReportModalOpen,
    setIsPresentationMode,
    startLiveDemo
  } = useSentinel();

  const getHazardTypeBadge = (type: HazardType) => {
    switch (type) {
      case 'waterlogging':
        return { label: 'Waterlogging', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: Waves };
      case 'pothole':
        return { label: 'Pothole', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Disc };
      case 'road_crack':
        return { label: 'Road Crack', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Activity };
      case 'damaged_road':
        return { label: 'Damaged Road', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: AlertTriangle };
      case 'debris':
        return { label: 'Debris', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: AlertTriangle };
    }
  };

  const getSeverityBadge = (severity: HazardRecord['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div id="overview-dashboard" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Platform Welcome & Core Proposition Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/70 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-medium border border-cyan-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                SMART INDIA HACKATHON
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-mono text-[10px] border border-amber-800/40">
                SIMULATED DATA
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Coimbatore Smart City Transit Grid
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              URBAN SENTINEL: AI-Powered Mobile Urban Intelligence Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Transforming public buses into mobile sensing units equipped with <strong>AI Vision Cameras</strong>, <strong>LiDAR/ToF Water Depth Sensors</strong>, <strong>GPS</strong>, <strong>Edge Computing (Jetson)</strong>, and <strong>5G</strong> to continuously detect potholes, road damage, and waterlogging across arterial corridors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="overview-incident-replay-btn"
              onClick={() => setActiveTab('incident-replay')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-950 flex items-center gap-1.5"
              title="Open Cinematic Incident Replay Engine"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Incident Replay</span>
            </button>
            <button
              id="overview-presentation-mode-btn"
              onClick={() => setIsPresentationMode(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950 flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Presentation Mode</span>
            </button>
            <button
              id="overview-ai-assistant-btn"
              onClick={() => setIsAiAssistantOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Assistant</span>
            </button>
            <button
              id="overview-report-btn"
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent 30-Second Live Demo Engine */}
      <LiveDemoPipeline />

      {/* 6 Top KPI Metrics (Strictly matching prompt specifications: 24 active buses, 147 hazards, 32 waterlogging, 8 critical alerts, 186 km roads, 94.6% accuracy) */}
      <div id="overview-metrics-grid" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Active Buses */}
        <div 
          id="metric-card-buses"
          onClick={() => setActiveTab('live-fleet')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">Active Buses</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <BusFront className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {metrics.activeBuses}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">Fleet Units</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            5 in active high-res telemetry
          </p>
        </div>

        {/* Metric 2: Hazards Detected */}
        <div 
          id="metric-card-hazards"
          onClick={() => setActiveTab('incidents')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">Hazards Detected</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {metrics.hazardsDetected}
            </span>
            <span className="text-[11px] text-amber-400 font-mono">Total Logged</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            Across 5 transit corridors
          </p>
        </div>

        {/* Metric 3: Waterlogging Incidents */}
        <div 
          id="metric-card-waterlogging"
          onClick={() => setActiveTab('waterlogging')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">Waterlogging</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
              {metrics.waterloggingIncidents}
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">Incidents</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Peak:</span>
            <strong className="text-rose-400 font-mono">{waterReading.waterDepth}m (Critical)</strong>
          </p>
        </div>

        {/* Metric 4: Critical Alerts */}
        <div 
          id="metric-card-alerts"
          onClick={() => setActiveTab('alerts')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">Critical Alerts</span>
            <div className={`p-2 rounded-lg ${metrics.criticalAlerts > 0 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${metrics.criticalAlerts > 0 ? 'text-rose-400' : 'text-white'}`}>
              {metrics.criticalAlerts}
            </span>
            <span className="text-[11px] text-rose-400 font-mono">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Requires PWD/Drainage dispatch
          </p>
        </div>

        {/* Metric 5: Roads Monitored (km) */}
        <div 
          id="metric-card-roads"
          onClick={() => setActiveTab('gis-map')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">Roads Monitored</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {metrics.roadsMonitoredKm}
            </span>
            <span className="text-[11px] text-blue-400 font-mono">km</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Continuous daily passes
          </p>
        </div>

        {/* Metric 6: AI Detection Accuracy */}
        <div 
          id="metric-card-accuracy"
          onClick={() => setActiveTab('ai-hazard')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">AI Accuracy</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {metrics.aiAccuracyPercent}%
            </span>
            <span className="text-[11px] text-emerald-300 font-mono">YOLOv8</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Jetson TensorRT INT8
          </p>
        </div>
      </div>

      {/* Main Split: Fleet Status & Waterlogging Telemetry on Left, Recent Incidents on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fleet & Waterlogging Snapshot */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Mobile Sensing Fleet Snapshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BusFront className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Mobile Bus Sensing Fleet (Coimbatore Testbed)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('live-fleet')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
              >
                <span>Full Map</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {buses.slice(0, 3).map((bus) => (
                <div
                  key={bus.id}
                  onClick={() => {
                    setSelectedBusId(bus.id);
                    setActiveTab('live-fleet');
                  }}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {bus.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      5G CONNECTED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium truncate">
                    {bus.routeName}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-300 border-t border-slate-850">
                    <span>Speed: <strong>{bus.currentSpeed} km/h</strong></span>
                    <span className="text-cyan-300 font-bold">{bus.lastDetection || 'Nominal'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waterlogging Depth Calculation Showcase (Mandatory User Equation: 1.25m - 0.60m = 0.65m) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  LiDAR/ToF Autonomous Water Depth Gauge
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                CRITICAL FLOOD RISK
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Sensor Datum</span>
                <div className="text-base font-bold text-white mt-1">1.25 m</div>
                <span className="text-[10px] text-slate-500">Chassis height</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Measured Surface</span>
                <div className="text-base font-bold text-cyan-400 mt-1">0.60 m</div>
                <span className="text-[10px] text-slate-500">LiDAR echo distance</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 sm:col-span-2">
                <span className="text-[10px] text-rose-300 uppercase font-bold">Calculated Water Depth</span>
                <div className="text-xl font-black text-rose-400 mt-1">0.65 m (65 cm)</div>
                <span className="text-[10px] text-slate-300 font-sans">
                  Formula: 1.25m &minus; 0.60m = 0.65m &bull; Exceeds bus safe wading depth
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Alerts & Incident Queue */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Critical Municipal Alerts
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('alerts')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
              >
                <span>All ({alerts.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    viewHazardOnMap(alert.hazardId);
                  }}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-400">
                      {alert.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {alert.timestamp}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {alert.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{alert.locationName}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        replayIncident(alert.hazardId);
                      }}
                      className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-600 text-cyan-300 hover:text-white font-mono text-[10px] border border-cyan-800/60 flex items-center gap-1 shrink-0 transition-colors"
                      title="Cinematic incident replay"
                    >
                      <Video className="w-2.5 h-2.5" />
                      <span>Replay</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
