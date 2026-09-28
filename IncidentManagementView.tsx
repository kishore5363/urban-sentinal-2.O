import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  ShieldAlert, 
  FileText, 
  Filter, 
  Search, 
  UserCheck, 
  Truck, 
  Wrench, 
  Sparkles,
  ArrowRight,
  Waves,
  X,
  Send,
  Video
} from 'lucide-react';
import { useSentinel, DispatchPayload } from '../context/SentinelContext';
import { HazardRecord, HazardStatus, HazardType } from '../types';
import { soundManager } from '../utils/audio';

export const IncidentManagementView: React.FC = () => {
  const { 
    hazards, 
    updateHazardStatus, 
    dispatchIncident,
    viewHazardOnMap, 
    replayIncident,
    setSelectedHazardId, 
    setIsReportModalOpen,
    metrics
  } = useSentinel();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<HazardRecord>(hazards[0]);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  // Dispatch Form State
  const [dispatchForm, setDispatchForm] = useState<DispatchPayload>({
    department: 'Stormwater Drainage Department',
    teamName: 'Rapid Dewatering Unit 2',
    etaMinutes: 12,
    equipment: 'High-Volume Submersible Pump & Silt Vac',
    notes: 'Prioritize underpass clearing before peak commuter hours.'
  });

  const handleOpenDispatch = (hazard: HazardRecord) => {
    setSelectedIncident(hazard);
    soundManager.playClick();
    if (hazard.type === 'waterlogging') {
      setDispatchForm({
        department: 'Stormwater Drainage Department',
        teamName: 'Rapid Dewatering Unit 2',
        etaMinutes: 12,
        equipment: 'High-Volume Submersible Pump (1500 LPM) & Barricades',
        notes: `Drainage clearance at ${hazard.location.roadName}. Max water depth ${hazard.waterDepth || 0.65}m.`
      });
    } else if (hazard.type === 'pothole') {
      setDispatchForm({
        department: 'PWD Roads & Bridges Division',
        teamName: 'Jetpatcher Mobile Asphalt Crew 4',
        etaMinutes: 18,
        equipment: 'Automated Jetpatcher & Cold Bitumen Emulsion',
        notes: `Repair critical road depression at ${hazard.location.roadName}.`
      });
    } else {
      setDispatchForm({
        department: 'Municipal Highway Maintenance',
        teamName: 'Civil Inspection & Emergency Crew 1',
        etaMinutes: 20,
        equipment: 'Crack Sealant & Structural Concrete Kit',
        notes: `Inspection and immediate patching for ${hazard.title}.`
      });
    }
    setIsDispatchModalOpen(true);
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    dispatchIncident(selectedIncident.id, dispatchForm);
    setIsDispatchModalOpen(false);
  };

  const filteredHazards = hazards.filter((h) => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (typeFilter !== 'all' && h.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        h.id.toLowerCase().includes(q) ||
        h.title.toLowerCase().includes(q) ||
        h.location.roadName.toLowerCase().includes(q) ||
        h.busId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (sev: HazardRecord['severity']) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">LOW</span>;
    }
  };

  const getStatusBadge = (status: HazardStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">NEW</span>;
      case 'acknowledged':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">ACKNOWLEDGED</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">IN PROGRESS</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">RESOLVED</span>;
    }
  };

  const responseSteps = [
    { label: '1. AI Detection', icon: Sparkles, done: true, desc: `Detected by ${selectedIncident?.busId || 'BUS-102'}` },
    { label: '2. Alert Generated', icon: AlertTriangle, done: true, desc: `SLA Priority: ${selectedIncident?.severity.toUpperCase()}` },
    { label: '3. Authority Notified', icon: UserCheck, done: selectedIncident?.status !== 'new', desc: 'Control Room Officer' },
    { label: '4. Team Dispatched', icon: Truck, done: selectedIncident?.status === 'in_progress' || selectedIncident?.status === 'resolved', desc: 'Stormwater Unit / PWD Roads' },
    { label: '5. Work Started', icon: Wrench, done: selectedIncident?.status === 'in_progress' || selectedIncident?.status === 'resolved', desc: 'On-site mitigation' },
    { label: '6. Incident Resolved', icon: CheckCircle2, done: selectedIncident?.status === 'resolved', desc: selectedIncident?.resolvedAt || 'Pending work wrap-up' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white font-mono tracking-tight">
              MUNICIPAL INCIDENT MANAGEMENT & SLA DISPATCH
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              SIMULATED DATA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time hazard lifecycle from mobile bus detection to municipal field closure
          </p>
        </div>

        {/* Quick SLA Stats */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">TOTAL LOGGED</span>
            <span className="text-sm font-bold text-white">{hazards.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-rose-400 block">ACTION REQUIRED</span>
            <span className="text-sm font-bold text-rose-400">{hazards.filter(h => h.status === 'new').length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-emerald-400 block">RESOLVED TODAY</span>
            <span className="text-sm font-bold text-emerald-400">{metrics.resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident ID, road name, bus..."
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 w-full sm:w-64"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {['all', 'new', 'acknowledged', 'in_progress', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono capitalize transition-colors ${
                statusFilter === st 
                  ? 'bg-cyan-600 text-white font-bold' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="pothole">Potholes</option>
            <option value="road_crack">Road Cracks</option>
            <option value="damaged_road">Damaged Roads</option>
            <option value="debris">Debris</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Table on Left (2/3), Incident Inspector & Workflow on Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table View */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Incident</th>
                  <th className="py-3 px-3.5">Hazard & Severity</th>
                  <th className="py-3 px-3.5">Location & Bus</th>
                  <th className="py-3 px-3.5">Confidence</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredHazards.map((h) => (
                  <tr 
                    key={h.id}
                    onClick={() => setSelectedIncident(h)}
                    className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      selectedIncident?.id === h.id ? 'bg-cyan-950/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {h.id}
                      <div className="text-[10px] text-slate-500 font-normal">{h.timestamp}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-white capitalize">{h.type.replace('_', ' ')}</div>
                      <div className="mt-1">{getSeverityBadge(h.severity)}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="text-slate-300 font-medium truncate max-w-[180px]">{h.location.roadName}</div>
                      <div className="text-[10px] font-mono text-cyan-400 mt-0.5 flex items-center gap-1">
                        <span>{h.busId}</span>
                        {h.waterDepth && <span className="text-rose-400 font-bold">&bull; Depth: {h.waterDepth}m</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-emerald-400 font-bold">
                      {h.confidenceScore}%
                    </td>
                    <td className="py-3 px-3.5">
                      {getStatusBadge(h.status)}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {h.status !== 'in_progress' && h.status !== 'resolved' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDispatch(h);
                          }}
                          className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-600 text-cyan-300 hover:text-white text-[11px] font-mono border border-cyan-800 transition-colors mr-1.5"
                          title="Open rapid dispatch modal"
                        >
                          Dispatch
                        </button>
                      )}
                      <button
                        id={`table-replay-btn-${h.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          replayIncident(h.id);
                        }}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-cyan-600 text-cyan-300 hover:text-white text-[11px] font-mono border border-cyan-800/60 transition-colors mr-1.5 inline-flex items-center gap-1"
                        title="Cinematic incident replay"
                      >
                        <Video className="w-3 h-3" />
                        <span>Replay</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewHazardOnMap(h.id);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white text-[11px] font-mono transition-colors mr-1.5"
                      >
                        GIS Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incident Inspector & Response Tracking Flow */}
        <div className="space-y-6">
          {selectedIncident && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">SELECTED INCIDENT</span>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    {selectedIncident.id}
                    {getSeverityBadge(selectedIncident.severity)}
                  </h3>
                  <div className="text-xs text-slate-300 mt-0.5">{selectedIncident.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id={`inspector-replay-btn-${selectedIncident.id}`}
                    onClick={() => replayIncident(selectedIncident.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950/40 transition-all transform hover:scale-[1.02]"
                    title="Watch cinematic detection and processing replay"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>CINEMATIC REPLAY</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedHazardId(selectedIncident.id);
                      setIsReportModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
                    title="Generate Incident Report"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">
                  Update Municipal Workflow Status:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      updateHazardStatus(selectedIncident.id, 'acknowledged');
                    }}
                    className={`p-2 rounded-lg border transition-colors ${
                      selectedIncident.status === 'acknowledged'
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleOpenDispatch(selectedIncident)}
                    className={`p-2 rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                      selectedIncident.status === 'in_progress'
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-cyan-950 border-cyan-800 hover:bg-cyan-900 text-cyan-200'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Dispatch Team</span>
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playSuccess();
                      updateHazardStatus(selectedIncident.id, 'resolved');
                    }}
                    className={`p-2 rounded-lg border col-span-2 transition-colors flex items-center justify-center gap-1.5 ${
                      selectedIncident.status === 'resolved'
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 hover:bg-emerald-900/50 hover:text-emerald-200 text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Resolved &amp; Close</span>
                  </button>
                </div>
              </div>

              {/* Telemetry Summary */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS Coords:</span>
                  <span className="text-cyan-300">{selectedIncident.location.lat}, {selectedIncident.location.lon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sensing Bus:</span>
                  <span className="text-white">{selectedIncident.busId}</span>
                </div>
                {selectedIncident.waterDepth !== undefined && (
                  <div className="flex justify-between text-rose-300 font-bold">
                    <span>LiDAR Depth:</span>
                    <span>{selectedIncident.waterDepth} m ({selectedIncident.waterDepth * 100} cm)</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Confidence:</span>
                  <span className="text-emerald-400">{selectedIncident.confidenceScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Response SLA:</span>
                  <span className="text-cyan-400">{selectedIncident.responseTime || '3.5 min'}</span>
                </div>
              </div>

              {/* Section 10: Municipal Response Tracking Flow */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-3">
                  Municipal Response Tracking:
                </span>
                <div className="space-y-3">
                  {responseSteps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          step.done 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className={`text-xs font-bold font-mono ${step.done ? 'text-white' : 'text-slate-500'}`}>
                            {step.label}
                          </div>
                          <div className="text-[11px] text-slate-400 font-sans">{step.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Field Team Dispatch Modal */}
      {isDispatchModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    DISPATCH FIELD RESPONSE TEAM
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Incident {selectedIncident.id} &bull; {selectedIncident.location.roadName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleConfirmDispatch} className="p-5 space-y-4 text-xs font-sans">
              {/* Telemetry quick overview */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Hazard</span>
                  <span className="font-bold text-white capitalize">{selectedIncident.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Severity</span>
                  <span className={`font-bold ${selectedIncident.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {selectedIncident.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">GPS Fix</span>
                  <span className="text-cyan-300 font-mono">{selectedIncident.location.lat.toFixed(4)}, {selectedIncident.location.lon.toFixed(4)}</span>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold uppercase">
                  Responsible Municipal Department
                </label>
                <select
                  value={dispatchForm.department}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, department: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Stormwater Drainage Department">Stormwater Drainage Department (Flood & Waterlogging)</option>
                  <option value="PWD Roads & Bridges Division">PWD Roads & Bridges Division (Asphalt & Potholes)</option>
                  <option value="Municipal Highway Maintenance">Municipal Highway Maintenance (Cracks & Structural)</option>
                  <option value="Traffic Police Emergency Response">Traffic Police Emergency Response (Diversions & Hazard Cones)</option>
                </select>
              </div>

              {/* Team Name and ETA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold uppercase">
                    Assigned Unit / Crew
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.teamName}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, teamName: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold uppercase">
                    Target On-Site ETA (Minutes)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="120"
                    value={dispatchForm.etaMinutes}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, etaMinutes: parseInt(e.target.value) || 15 })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold uppercase">
                  Allocated Equipment & Materials
                </label>
                <input
                  type="text"
                  value={dispatchForm.equipment}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, equipment: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold uppercase">
                  Field Dispatch Instructions
                </label>
                <textarea
                  rows={2}
                  value={dispatchForm.notes}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-sans text-xs focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-dispatch-submit-btn"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-lg shadow-cyan-900/40 flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>CONFIRM & TRANSMIT DISPATCH</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
