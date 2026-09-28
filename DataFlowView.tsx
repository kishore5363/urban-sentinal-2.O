import React, { useState, useEffect } from 'react';
import { 
  BusFront, 
  Cpu, 
  Scan, 
  MapPin, 
  Wifi, 
  Cloud, 
  Database, 
  Map, 
  BellRing, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Layers,
  Radio
} from 'lucide-react';

const NODES = [
  { id: 'sensor', label: '1. Bus Sensor', icon: BusFront, detail: '1080p Optical + ToF LiDAR' },
  { id: 'edge', label: '2. Edge AI', icon: Cpu, detail: 'NVIDIA Jetson Orin Nano' },
  { id: 'detect', label: '3. Detection', icon: Scan, detail: 'YOLOv8 Class: Waterlogging (94%)' },
  { id: 'gps', label: '4. GPS Geocode', icon: MapPin, detail: '11.0168° N, 76.9558° E' },
  { id: 'network', label: '5. 5G Network', icon: Wifi, detail: 'Sub-6GHz SA Link (-64 dBm)' },
  { id: 'cloud', label: '6. Cloud Ingest', icon: Cloud, detail: 'Distributed MQTT Broker' },
  { id: 'db', label: '7. Geospatial DB', icon: Database, detail: 'PostGIS Incident Store' },
  { id: 'gis', label: '8. Smart GIS', icon: Map, detail: 'Interactive Command Map' },
  { id: 'authority', label: '9. Municipal Hub', icon: BellRing, detail: 'Stormwater & PWD Dispatch' },
];

export const DataFlowView: React.FC = () => {
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [isFlowing, setIsFlowing] = useState(true);
  const [speed, setSpeed] = useState<number>(1); // 1 = 1.5s, 2 = 0.8s

  useEffect(() => {
    if (!isFlowing) return;
    const intervalTime = Math.round(1500 / speed);
    const interval = setInterval(() => {
      setActiveNodeIndex((prev) => (prev + 1) % NODES.length);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isFlowing, speed]);

  const currentNode = NODES[activeNodeIndex];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white font-mono tracking-tight">
              REAL-TIME TELEMETRY DATA FLOW VISUALIZATION
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              LIVE SIMULATED PACKET STREAM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing the instantaneous transmission path of incident data packets from moving bus to municipal authority
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFlowing(!isFlowing)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 ${
              isFlowing 
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700' 
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isFlowing ? 'text-cyan-400 animate-pulse' : ''}`} />
            <span>{isFlowing ? 'STREAM ACTIVE' : 'PAUSED'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 text-[10px] px-2">Speed:</span>
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  speed === s ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Flow Chain Graphic */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
          <span>9-STAGE END-TO-END TELEMETRY PIPELINE</span>
          <span className="text-cyan-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Active Packet at: {currentNode.label}
          </span>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-2">
          {NODES.map((node, idx) => {
            const Icon = node.icon;
            const isActive = activeNodeIndex === idx;
            const isPast = activeNodeIndex > idx;
            return (
              <div
                key={node.id}
                onClick={() => setActiveNodeIndex(idx)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-cyan-950 border-cyan-400 shadow-xl shadow-cyan-950 scale-105 ring-2 ring-cyan-400/20'
                    : isPast
                    ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500">#{idx + 1}</span>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : isPast ? 'text-emerald-400' : 'text-slate-500'}`} />
                  </div>
                  <h4 className={`text-xs font-bold font-mono mt-2 truncate ${isActive ? 'text-white' : ''}`}>
                    {node.label.replace(/^\d+\.\s*/, '')}
                  </h4>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                  {node.detail}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Packet Payload Inspector */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                Active Flight Packet Telemetry
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                STAGE {activeNodeIndex + 1}: {currentNode.label}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">ENCRYPTED TLS 1.3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase">Packet ID</span>
              <div className="text-white font-bold mt-0.5">PKT-2026-INC-2048</div>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase">Current Subsystem</span>
              <div className="text-cyan-300 font-bold mt-0.5">{currentNode.label}</div>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase">Accumulated Latency</span>
              <div className="text-emerald-400 font-bold mt-0.5">{(activeNodeIndex * 8.4 + 12).toFixed(1)} ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
