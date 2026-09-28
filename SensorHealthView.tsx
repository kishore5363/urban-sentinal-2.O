import React from 'react';
import { 
  Cpu, 
  Camera, 
  Wifi, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Battery, 
  Thermometer, 
  Clock, 
  ShieldCheck,
  Radio,
  RefreshCw,
  Waves
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const SensorHealthView: React.FC = () => {
  const { buses, setSelectedBusId, setActiveTab } = useSentinel();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white font-mono tracking-tight">
              MOBILE SENSOR FLEET HEALTH & TELEMETRY DIAGNOSTICS
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              SIMULATED DATA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time diagnostics of AI cameras, LiDAR/ToF sensors, GPS units, and edge processors
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>5/5 UNITS ONLINE</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            <span>5G SA TELEMETRY</span>
          </div>
        </div>
      </div>

      {/* Grid of Buses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {buses.map((bus) => {
          return (
            <div 
              key={bus.id} 
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl space-y-4 transition-all"
            >
              {/* Bus Card Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white font-mono">{bus.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ONLINE
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">{bus.routeName}</div>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-cyan-400 font-bold">{bus.currentSpeed} km/h</div>
                  <div className="text-[10px] text-slate-500">{bus.lastPing}</div>
                </div>
              </div>

              {/* 5 Hardware Module Statuses */}
              <div className="space-y-2 font-mono text-xs">
                {/* AI Camera */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-300">AI Camera</span>
                  </div>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    HEALTHY (30 FPS)
                  </span>
                </div>

                {/* LiDAR / ToF Sensor */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Waves className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-300">LiDAR / ToF</span>
                  </div>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    CALIBRATED (1.25m Datum)
                  </span>
                </div>

                {/* RTK GPS */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-300">GNSS GPS</span>
                  </div>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    LOCKED (&lt;0.5m err)
                  </span>
                </div>

                {/* Edge Processor */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-300">Edge Device</span>
                  </div>
                  <span className="text-indigo-300 font-bold">
                    Jetson Orin (40 TOPS)
                  </span>
                </div>

                {/* 5G Network */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-slate-300">Connectivity</span>
                  </div>
                  <span className="text-blue-300 font-bold">
                    5G SA ({bus.signalStrengthDbm} dBm &bull; {bus.latencyMs}ms)
                  </span>
                </div>
              </div>

              {/* Hardware Health Metrics (Battery, Temp, Calibration) */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-center">
                  <span className="text-slate-500 block text-[9px] uppercase">Power Bus</span>
                  <div className="text-white font-bold mt-0.5 flex items-center justify-center gap-1">
                    <Battery className="w-3 h-3 text-emerald-400" />
                    {bus.batteryLevel || 98}%
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-center">
                  <span className="text-slate-500 block text-[9px] uppercase">Temp</span>
                  <div className="text-white font-bold mt-0.5 flex items-center justify-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-400" />
                    {bus.tempCelsius || 42}&deg;C
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-center">
                  <span className="text-slate-500 block text-[9px] uppercase">Calibrated</span>
                  <div className="text-cyan-300 font-bold mt-0.5 truncate text-[10px]">
                    {bus.lastCalibration || '2026-09-18'}
                  </div>
                </div>
              </div>

              {/* Quick Action Button */}
              <button
                onClick={() => {
                  setSelectedBusId(bus.id);
                  setActiveTab('live-fleet');
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Track Telemetry on Live Fleet Map</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
