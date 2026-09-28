import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  BusFront, 
  AlertTriangle, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Waves
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const SmartSearchModal: React.FC = () => {
  const { 
    isSearchModalOpen, 
    setIsSearchModalOpen, 
    buses, 
    hazards, 
    setSelectedBusId, 
    setSelectedHazardId, 
    setActiveTab 
  } = useSentinel();

  const [query, setQuery] = useState('');

  if (!isSearchModalOpen) return null;

  const filteredBuses = useMemo(() => {
    if (!query.trim()) return buses.slice(0, 3);
    const q = query.toLowerCase();
    return buses.filter(b => 
      b.id.toLowerCase().includes(q) ||
      b.routeName.toLowerCase().includes(q) ||
      b.routeNumber.toLowerCase().includes(q)
    );
  }, [buses, query]);

  const filteredHazards = useMemo(() => {
    if (!query.trim()) return hazards.slice(0, 4);
    const q = query.toLowerCase();
    return hazards.filter(h =>
      h.id.toLowerCase().includes(q) ||
      h.type.toLowerCase().includes(q) ||
      h.title.toLowerCase().includes(q) ||
      h.severity.toLowerCase().includes(q) ||
      h.location.roadName.toLowerCase().includes(q) ||
      h.busId.toLowerCase().includes(q) ||
      h.location.lat.toString().includes(q) ||
      h.location.lon.toString().includes(q)
    );
  }, [hazards, query]);

  const handleSelectBus = (busId: string) => {
    setSelectedBusId(busId);
    setActiveTab('live-fleet');
    setIsSearchModalOpen(false);
  };

  const handleSelectHazard = (hazardId: string) => {
    setSelectedHazardId(hazardId);
    setActiveTab('gis-map');
    setIsSearchModalOpen(false);
  };

  return (
    <div id="smart-search-modal" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            id="smart-search-input"
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search BUS-102, INC-2048, Waterlogging, Potholes, 11.0168, Gandhipuram..."
            className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Quick Tags */}
          {!query && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-500 font-mono text-[11px] self-center">Try searching:</span>
              {['BUS-102', 'Waterlogging', 'INC-2048', 'Potholes', 'Critical', '11.0168'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-slate-700"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Hazards section */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 px-1">
              Hazards & Incidents ({filteredHazards.length})
            </div>
            {filteredHazards.length === 0 ? (
              <div className="text-xs text-slate-500 px-2">No matching hazards found</div>
            ) : (
              <div className="space-y-1.5">
                {filteredHazards.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => handleSelectHazard(h.id)}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${
                        h.severity === 'critical' 
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{h.id}</span>
                          <span className="text-xs font-semibold text-slate-200">{h.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{h.location.roadName}</span>
                          <span>&bull;</span>
                          <span className="font-mono text-cyan-400">{h.busId}</span>
                          {h.waterDepth && (
                            <span className="font-mono text-rose-400 font-bold">
                              &bull; Depth: {h.waterDepth}m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buses section */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 px-1">
              Mobile Sensing Buses ({filteredBuses.length})
            </div>
            {filteredBuses.length === 0 ? (
              <div className="text-xs text-slate-500 px-2">No matching buses found</div>
            ) : (
              <div className="space-y-1.5">
                {filteredBuses.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBus(b.id)}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <BusFront className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{b.id}</span>
                          <span className="text-xs font-medium text-slate-300">{b.routeName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Speed: {b.currentSpeed} km/h &bull; 5G SA: {b.signalStrengthDbm} dBm &bull; Edge AI: {b.edgeAi || 'Active'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
