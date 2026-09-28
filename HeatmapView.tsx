import React, { useState } from 'react';
import { 
  Flame, 
  Layers, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Filter, 
  Info,
  Waves,
  ArrowRight
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

interface HotspotZone {
  id: string;
  name: string;
  zone: string;
  riskScore: number;
  dominantHazard: 'Waterlogging' | 'Potholes' | 'Road Damage';
  incidentsCount: number;
  lat: number;
  lon: number;
  recommendedAction: string;
}

const HOTSPOTS: HotspotZone[] = [
  {
    id: 'hotspot-1',
    name: 'Gandhipuram - Ukkadam Underpass KM 4.2',
    zone: 'Central Transit Sector',
    riskScore: 92,
    dominantHazard: 'Waterlogging',
    incidentsCount: 8,
    lat: 11.0168,
    lon: 76.9558,
    recommendedAction: 'Automated de-watering sump pump & electronic high-water barrier deployment'
  },
  {
    id: 'hotspot-2',
    name: 'Ganapathy Flyover & Sathy Road Approach',
    zone: 'North Corridor',
    riskScore: 78,
    dominantHazard: 'Potholes',
    incidentsCount: 12,
    lat: 11.0350,
    lon: 76.9780,
    recommendedAction: 'Rapid cold-planing and bituminous resurfacing under night transit window'
  },
  {
    id: 'hotspot-3',
    name: 'Nava India Signal Transit Bay',
    zone: 'East Zone',
    riskScore: 68,
    dominantHazard: 'Road Damage',
    incidentsCount: 6,
    lat: 11.0080,
    lon: 76.9940,
    recommendedAction: 'Heavy vehicle rutting repair; sub-base reinforcement'
  },
  {
    id: 'hotspot-4',
    name: 'Hope College Railway Underpass',
    zone: 'East Zone',
    riskScore: 54,
    dominantHazard: 'Waterlogging',
    incidentsCount: 4,
    lat: 11.0220,
    lon: 76.9850,
    recommendedAction: 'Stormwater culvert de-silting and drain grate widening'
  },
  {
    id: 'hotspot-5',
    name: 'Peelamedu ESI Hospital Arterial',
    zone: 'East Zone',
    riskScore: 36,
    dominantHazard: 'Potholes',
    incidentsCount: 3,
    lat: 11.0040,
    lon: 77.0120,
    recommendedAction: 'Periodic preventive micro-surfacing'
  },
  {
    id: 'hotspot-6',
    name: 'RS Puram Brookefields Corridor',
    zone: 'West Zone',
    riskScore: 18,
    dominantHazard: 'Road Damage',
    incidentsCount: 1,
    lat: 11.0090,
    lon: 76.9420,
    recommendedAction: 'Routine visual inspection by mobile sensing fleet'
  }
];

export const HeatmapView: React.FC = () => {
  const { setActiveTab, setSelectedHazardId } = useSentinel();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotZone>(HOTSPOTS[0]);

  const getScoreColor = (score: number) => {
    if (score >= 76) return { text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40', label: 'CRITICAL RISK' };
    if (score >= 51) return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', label: 'HIGH RISK' };
    if (score >= 26) return { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', label: 'MODERATE RISK' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', label: 'LOW RISK' };
  };

  const filteredHotspots = HOTSPOTS.filter(h => {
    if (filterType === 'all') return true;
    return h.dominantHazard.toLowerCase() === filterType.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white font-mono tracking-tight">
              CITY HAZARD HEATMAP & RISK VULNERABILITY INDEX
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              SIMULATED DATA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated predictive risk modeling calculated from public bus multi-sensor passes
          </p>
        </div>

        {/* Risk Scale Legend */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="px-2 py-1 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800">0-25 LOW</span>
          <span className="px-2 py-1 rounded bg-yellow-950/70 text-yellow-300 border border-yellow-800">26-50 MODERATE</span>
          <span className="px-2 py-1 rounded bg-amber-950/70 text-amber-300 border border-amber-800">51-75 HIGH</span>
          <span className="px-2 py-1 rounded bg-rose-950/70 text-rose-400 border border-rose-800 animate-pulse">76-100 CRITICAL</span>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-400 font-mono">Filter Vulnerability Type:</span>
        {['all', 'waterlogging', 'potholes', 'road damage'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-colors ${
              filterType === t 
                ? 'bg-cyan-600 text-white font-bold' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Main Grid: Visual Heatmap Matrix (2/3) + Inspector (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Map / Matrix */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">
              Monitored Transit Corridor Heatmap Matrix
            </span>
            <span className="text-xs text-slate-500 font-mono">
              6 Macro Sectors Analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredHotspots.map((hotspot) => {
              const sc = getScoreColor(hotspot.riskScore);
              const isSelected = selectedHotspot.id === hotspot.id;
              return (
                <div
                  key={hotspot.id}
                  onClick={() => setSelectedHotspot(hotspot)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-950/50 scale-[1.01]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{hotspot.zone}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{hotspot.name}</h4>
                    </div>
                    <div className={`px-2.5 py-1 rounded-xl text-center border ${sc.bg} ${sc.border}`}>
                      <div className={`text-base font-black font-mono ${sc.text}`}>{hotspot.riskScore}</div>
                      <div className="text-[8px] font-mono text-slate-400 uppercase tracking-tighter">{sc.label}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      Primary: <strong className="text-cyan-300">{hotspot.dominantHazard}</strong>
                    </span>
                    <span className="text-slate-400">
                      Incidents: <strong className="text-white">{hotspot.incidentsCount}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Heatmap Visual Density Canvas representation */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden h-48 flex items-center justify-center">
            {/* Grid styling */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Glowing Hotspot Blobs */}
            <div className="absolute top-1/3 left-1/4 w-28 h-28 bg-rose-500/30 rounded-full blur-2xl animate-pulse" />
            <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-amber-500/25 rounded-full blur-xl" />
            <div className="absolute bottom-1/4 left-2/3 w-20 h-20 bg-cyan-500/20 rounded-full blur-lg" />

            <div className="relative z-10 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-mono font-bold">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>DYNAMIC DENSITY GRADIENT ACTIVE</span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-md">
                Spatial interpolation across 24 scheduled bus lines dynamically generates continuous density fields for urban municipal road audit.
              </p>
            </div>
          </div>
        </div>

        {/* Hotspot Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase">HOTSPOT DOSSIER</span>
            <h3 className="text-base font-bold text-white mt-1">{selectedHotspot.name}</h3>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{selectedHotspot.zone}</div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Risk Index Score:</span>
              <span className={`text-lg font-black ${getScoreColor(selectedHotspot.riskScore).text}`}>
                {selectedHotspot.riskScore} / 100
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Dominant Hazard:</span>
              <span className="text-cyan-300 font-bold">{selectedHotspot.dominantHazard}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">GPS Coordinates:</span>
              <span className="text-slate-200">{selectedHotspot.lat}° N, {selectedHotspot.lon}° E</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Active Incidents:</span>
              <span className="text-white font-bold">{selectedHotspot.incidentsCount} Logged</span>
            </div>
          </div>

          {/* Recommended Municipal Action */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/80 space-y-1.5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Prescribed Municipal Intervention
            </span>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {selectedHotspot.recommendedAction}
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedHazardId('INC-2048');
              setActiveTab('gis-map');
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 transition-all flex items-center justify-center gap-2"
          >
            <span>View Sector on GIS Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
