import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  Clock,
  Sparkles,
  Waves
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const DetectionHistoryView: React.FC = () => {
  const { hazards, setSelectedHazardId, setActiveTab } = useSentinel();
  const [busFilter, setBusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [minConfidence, setMinConfidence] = useState<number>(85);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = hazards.filter((h) => {
    if (busFilter !== 'all' && h.busId !== busFilter) return false;
    if (typeFilter !== 'all' && h.type !== typeFilter) return false;
    if (h.confidenceScore < minConfidence) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        h.id.toLowerCase().includes(q) ||
        h.title.toLowerCase().includes(q) ||
        h.location.roadName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white font-mono tracking-tight">
              HISTORICAL AI ROAD HAZARD INFERENCE ARCHIVE
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              SIMULATED AUDIT LOG
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Searchable historical catalog of all edge computer vision detections with confidence scores and GPS coordinates
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong className="text-cyan-400">{filtered.length}</strong> of {hazards.length} Detections
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search detection archive..."
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 w-full sm:w-60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Bus filter */}
          <select
            value={busFilter}
            onChange={(e) => setBusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="all">All Buses</option>
            <option value="BUS-101">BUS-101</option>
            <option value="BUS-102">BUS-102</option>
            <option value="BUS-103">BUS-103</option>
            <option value="BUS-104">BUS-104</option>
            <option value="BUS-105">BUS-105</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="all">All Hazard Classes</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="pothole">Potholes</option>
            <option value="road_crack">Road Cracks</option>
            <option value="damaged_road">Damaged Asphalt</option>
            <option value="debris">Debris</option>
          </select>

          {/* Min Confidence Slider */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px]">Min Conf:</span>
            <span className="text-cyan-400 font-bold">{minConfidence}%</span>
            <input
              type="range"
              min="80"
              max="95"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3.5">Detection ID</th>
                <th className="py-3 px-3.5">Hazard Class</th>
                <th className="py-3 px-3.5">Sensing Bus</th>
                <th className="py-3 px-3.5">Location &amp; Road</th>
                <th className="py-3 px-3.5">LiDAR / Depth</th>
                <th className="py-3 px-3.5">Confidence</th>
                <th className="py-3 px-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-3.5 font-mono text-slate-400 whitespace-nowrap">
                    {h.timestamp}
                  </td>
                  <td className="py-3 px-3.5 font-mono font-bold text-cyan-400">
                    {h.id}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-white capitalize">
                    {h.type.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-300">
                    {h.busId}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="text-slate-200 font-medium truncate max-w-xs">{h.location.roadName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{h.location.lat}, {h.location.lon}</div>
                  </td>
                  <td className="py-3 px-3.5 font-mono">
                    {h.waterDepth !== undefined ? (
                      <span className="text-rose-400 font-bold">{h.waterDepth}m (LiDAR)</span>
                    ) : (
                      <span className="text-slate-500">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-emerald-400 font-bold">
                    {h.confidenceScore}%
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedHazardId(h.id);
                        setActiveTab('gis-map');
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white font-mono text-[11px] transition-colors"
                    >
                      GIS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
