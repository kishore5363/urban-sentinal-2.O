import React, { useState } from 'react';
import { 
  Database, 
  Table, 
  Download, 
  Code2, 
  CheckCircle2, 
  Search, 
  Filter,
  Layers,
  Copy
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const SimulatedDatabaseView: React.FC = () => {
  const { buses, hazards, alerts } = useSentinel();
  const [activeTable, setActiveTable] = useState<'incidents' | 'buses' | 'sensors' | 'alerts'>('incidents');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white font-mono tracking-tight">
              SIMULATED GEOSPATIAL DATABASE SCHEMA &amp; TABLES
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              SIMULATED RELATIONAL &amp; SPATIAL DATA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulated cloud storage tables for bus telemetry, sensor payloads, incident records, and municipal response tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED JSON' : 'EXPORT JSON'}</span>
          </button>
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 overflow-x-auto text-xs font-mono">
        {[
          { id: 'incidents', label: `incidents (${hazards.length})` },
          { id: 'buses', label: `buses (${buses.length})` },
          { id: 'sensors', label: 'sensor_telemetry (ToF & Datum)' },
          { id: 'alerts', label: `alerts (${alerts.length})` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTable(t.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-colors font-bold whitespace-nowrap ${
              activeTable === t.id
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            TABLE: {t.label}
          </button>
        ))}
      </div>

      {/* Active Table Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            SCHEMA: <strong className="text-cyan-300">public.{activeTable}</strong> (PostGIS / Spatial Record)
          </span>
          <span className="text-slate-500">FORMAT: RELATIONAL TUPLES</span>
        </div>

        <div className="overflow-x-auto">
          {activeTable === 'incidents' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">id (PK)</th>
                  <th className="py-2.5 px-3">hazard_type</th>
                  <th className="py-2.5 px-3">severity</th>
                  <th className="py-2.5 px-3">bus_id (FK)</th>
                  <th className="py-2.5 px-3">confidence</th>
                  <th className="py-2.5 px-3">water_depth_m</th>
                  <th className="py-2.5 px-3">geom (POINT)</th>
                  <th className="py-2.5 px-3">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {hazards.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-850/50">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{h.id}</td>
                    <td className="py-2.5 px-3 text-white">{h.type}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        h.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {h.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{h.busId}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{h.confidenceScore}%</td>
                    <td className="py-2.5 px-3 text-cyan-300">{h.waterDepth !== undefined ? `${h.waterDepth}m` : 'NULL'}</td>
                    <td className="py-2.5 px-3 text-slate-400">{`POINT(${h.location.lon} ${h.location.lat})`}</td>
                    <td className="py-2.5 px-3 capitalize text-slate-300">{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'buses' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">bus_id (PK)</th>
                  <th className="py-2.5 px-3">route_name</th>
                  <th className="py-2.5 px-3">speed_kmh</th>
                  <th className="py-2.5 px-3">edge_hw</th>
                  <th className="py-2.5 px-3">cellular_link</th>
                  <th className="py-2.5 px-3">signal_dbm</th>
                  <th className="py-2.5 px-3">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {buses.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-850/50">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{b.id}</td>
                    <td className="py-2.5 px-3 text-white">{b.routeName}</td>
                    <td className="py-2.5 px-3 text-slate-300">{b.currentSpeed} km/h</td>
                    <td className="py-2.5 px-3 text-indigo-300">{b.edgeHardware}</td>
                    <td className="py-2.5 px-3 text-blue-400">{b.connectivityStatus}</td>
                    <td className="py-2.5 px-3 text-slate-400">{b.signalStrengthDbm} dBm</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">ONLINE</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'sensors' && (
            <div className="p-4 space-y-3 font-mono text-xs text-slate-300">
              <p className="text-cyan-300 font-bold">CALIBRATION &amp; DATUM REFERENCE METRICS:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px]">Sensor Height (h_datum)</span>
                  <div className="text-base font-bold text-white mt-0.5">1.25 meters</div>
                  <span className="text-[10px] text-slate-400">Fixed physical mounting datum on bus chassis</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px]">Pulsed ToF Calculation</span>
                  <div className="text-base font-bold text-cyan-300 mt-0.5">depth = 1.25m - d_surface</div>
                  <span className="text-[10px] text-slate-400">905nm infrared laser pulse roundtrip time</span>
                </div>
              </div>
            </div>
          )}

          {activeTable === 'alerts' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">alert_id (PK)</th>
                  <th className="py-2.5 px-3">incident_id (FK)</th>
                  <th className="py-2.5 px-3">severity</th>
                  <th className="py-2.5 px-3">department</th>
                  <th className="py-2.5 px-3">dispatched_to</th>
                  <th className="py-2.5 px-3">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {alerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-850/50">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{a.id}</td>
                    <td className="py-2.5 px-3 text-white">{a.hazardId}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        a.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{a.department || 'Stormwater Drainage'}</td>
                    <td className="py-2.5 px-3 text-slate-400">Rapid Response Unit 4</td>
                    <td className="py-2.5 px-3 capitalize text-slate-300">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
