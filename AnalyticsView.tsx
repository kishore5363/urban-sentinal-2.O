import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Waves, 
  Disc, 
  Activity, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const AnalyticsView: React.FC = () => {
  const { hazards, metrics } = useSentinel();

  // 1. Hazards detected by type
  const typeCounts = {
    waterlogging: hazards.filter(h => h.type === 'waterlogging').length,
    pothole: hazards.filter(h => h.type === 'pothole').length,
    road_crack: hazards.filter(h => h.type === 'road_crack').length,
    damaged_road: hazards.filter(h => h.type === 'damaged_road').length,
  };
  const totalHazards = hazards.length || 1;

  // 2. Waterlogging incidents depth distribution
  const waterloggingDepths = [
    { label: '< 10 cm (Shallow Wetness)', count: 4, color: '#38bdf8', pct: 25 },
    { label: '10 - 25 cm (Caution Puddle)', count: 6, color: '#0ea5e9', pct: 37 },
    { label: '25 - 50 cm (Moderate Flood)', count: 4, color: '#0284c7', pct: 25 },
    { label: '> 50 cm (Critical Underpass Stall)', count: 2, color: '#f43f5e', pct: 13 },
  ];

  // 3. Detection frequency across 24h day (simulated hourly peaks during morning rush, afternoon monsoon shower, evening peak)
  const hourlyFrequency = [
    { hour: '06:00', detections: 2 },
    { hour: '08:00', detections: 6 },
    { hour: '10:00', detections: 9 },
    { hour: '12:00', detections: 5 },
    { hour: '14:00', detections: 14 }, // Monsoon rain peak
    { hour: '16:00', detections: 11 },
    { hour: '18:00', detections: 8 },
    { hour: '20:00', detections: 4 },
  ];
  const maxDetections = Math.max(...hourlyFrequency.map(d => d.detections));

  // 4. Resolved vs Unresolved incidents
  const resolvedCount = hazards.filter(h => h.status === 'resolved').length;
  const unresolvedCount = hazards.length - resolvedCount;
  const resolutionRatePct = Math.round((resolvedCount / totalHazards) * 100);

  return (
    <div id="analytics-section" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                Municipal Urban Road Intelligence Analytics
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                DAILY SYNTHESIS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Corridor deterioration trends, flood risk mapping, and municipal maintenance SLA tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Audit Period: Current Monsoon Shift</span>
        </div>
      </div>

      {/* 4 Required Analytics Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CHART 1: Hazards Detected by Type */}
        <div 
          id="analytics-chart-types"
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Hazards Detected by Type
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              Total: {totalHazards}
            </span>
          </div>

          {/* Bar Visualizer */}
          <div className="space-y-3 pt-1">
            {/* Waterlogging */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Waterlogging</span>
                </span>
                <span className="text-cyan-400 font-bold">
                  {typeCounts.waterlogging} ({Math.round((typeCounts.waterlogging / totalHazards) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(typeCounts.waterlogging / totalHazards) * 100}%` }} 
                />
              </div>
            </div>

            {/* Potholes */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5 text-amber-400" />
                  <span>Potholes</span>
                </span>
                <span className="text-amber-400 font-bold">
                  {typeCounts.pothole} ({Math.round((typeCounts.pothole / totalHazards) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(typeCounts.pothole / totalHazards) * 100}%` }} 
                />
              </div>
            </div>

            {/* Road Cracks */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>Road Cracks</span>
                </span>
                <span className="text-purple-400 font-bold">
                  {typeCounts.road_crack} ({Math.round((typeCounts.road_crack / totalHazards) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(typeCounts.road_crack / totalHazards) * 100}%` }} 
                />
              </div>
            </div>

            {/* Damaged Road */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Damaged Asphalt / Corrugation</span>
                </span>
                <span className="text-rose-400 font-bold">
                  {typeCounts.damaged_road} ({Math.round((typeCounts.damaged_road / totalHazards) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-rose-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(typeCounts.damaged_road / totalHazards) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: Waterlogging Incidents Depth Distribution */}
        <div 
          id="analytics-chart-waterlogging"
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Waterlogging Incidents by Depth
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              LiDAR/ToF Metric
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {waterloggingDepths.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-bold" style={{ color: item.color }}>
                    {item.count} sites ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
            <strong>Municipal Water Threshold:</strong> Depths &gt;30 cm trigger automated stormwater pump alerts to the civic drainage command center.
          </div>
        </div>

        {/* CHART 3: Detection Frequency by Hour of Day */}
        <div 
          id="analytics-chart-frequency"
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Detection Frequency (24h Timeline)
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              Peak: 14:00 (Rain Shower)
            </span>
          </div>

          {/* SVG Column Chart */}
          <div className="h-44 pt-2 flex items-end justify-between gap-2 select-none">
            {hourlyFrequency.map((pt, i) => {
              const heightPct = Math.round((pt.detections / maxDetections) * 100);
              const isPeak = pt.detections === maxDetections;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-300 font-bold transition-colors">
                    {pt.detections}
                  </span>
                  <div className="w-full bg-slate-950 rounded-t-lg h-full max-h-28 flex items-end overflow-hidden">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isPeak 
                          ? 'bg-gradient-to-t from-cyan-600 to-rose-500 shadow-md shadow-rose-950' 
                          : 'bg-gradient-to-t from-slate-700 to-cyan-500 group-hover:from-cyan-600 group-hover:to-cyan-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {pt.hour}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 font-mono text-center">
            Higher detection rates align with bus frequency schedules & weather events
          </p>
        </div>

        {/* CHART 4: Resolved vs Unresolved Incidents */}
        <div 
          id="analytics-chart-resolution"
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Resolved vs Unresolved Incidents
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Resolution: {resolutionRatePct}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                Resolved Incidents
              </span>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                {resolvedCount}
              </div>
              <p className="text-[10px] text-slate-400">
                Repaired by PWD / Drained by Stormwater
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                Unresolved / In-Progress
              </span>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">
                {unresolvedCount}
              </div>
              <p className="text-[10px] text-slate-400">
                Assigned to Quick Response Vehicles
              </p>
            </div>
          </div>

          {/* Progress split bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-3 transition-all duration-500" 
                style={{ width: `${resolutionRatePct}%` }} 
              />
              <div 
                className="bg-amber-500 h-3 transition-all duration-500" 
                style={{ width: `${100 - resolutionRatePct}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
              <span className="text-emerald-400">Resolved ({resolvedCount})</span>
              <span className="text-amber-400">Action Pending ({unresolvedCount})</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 font-mono flex items-center justify-between">
            <span>Average Resolution Turnaround:</span>
            <strong className="text-emerald-400 font-bold">{metrics.avgResponseTimeMin} mins</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
