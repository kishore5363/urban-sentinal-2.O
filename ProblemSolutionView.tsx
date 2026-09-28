import React from 'react';
import { 
  XCircle, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Waves, 
  Cpu, 
  ShieldCheck,
  TrendingDown,
  Sparkles
} from 'lucide-react';

export const ProblemSolutionView: React.FC = () => {
  const comparisons = [
    {
      feature: 'Sensing Fleet & Cost',
      traditional: {
        title: 'Expensive Dedicated Survey Vans',
        desc: 'Requires purchasing specialized survey vans, hiring separate drivers, and burning separate fuel. Costs crores with low route coverage.',
        icon: XCircle,
        badge: 'HIGH CAPEX',
        color: 'text-rose-400'
      },
      sentinel: {
        title: 'Opportunistic Public Transit Buses',
        desc: 'Leverages existing city bus fleets traveling standard routes anyway. Zero additional drivers, zero added fuel consumption.',
        icon: CheckCircle2,
        badge: 'ZERO EXTRA FLEET COST',
        color: 'text-emerald-400'
      }
    },
    {
      feature: 'Detection Speed & Frequency',
      traditional: {
        title: 'Days or Weeks of Delay (Citizen Complaints)',
        desc: 'Municipalities only discover potholes or waterlogging after citizens file complaints or vehicles suffer severe axle damage.',
        icon: XCircle,
        badge: 'REACTIVE',
        color: 'text-rose-400'
      },
      sentinel: {
        title: 'Real-Time Edge AI Detection (30 FPS)',
        desc: 'YOLOv8 runs directly on NVIDIA Jetson edge computers onboard each bus, surveying every arterial road every 10–15 minutes.',
        icon: CheckCircle2,
        badge: 'PROACTIVE & CONTINUOUS',
        color: 'text-emerald-400'
      }
    },
    {
      feature: 'Waterlogging & Flood Risk',
      traditional: {
        title: 'Blind Guesses & Drowned Vehicles',
        desc: 'Ordinary cameras only see puddles without knowing depth. Cars and two-wheelers blindly enter submerged underpasses and stall.',
        icon: XCircle,
        badge: 'FATAL UNKNOWNS',
        color: 'text-rose-400'
      },
      sentinel: {
        title: 'LiDAR/ToF Precise Depth Calculation',
        desc: 'Measures exact surface distance to compute water depth (1.25m - 0.60m = 0.65m). Automatically triggers critical alerts if depth exceeds 0.50m.',
        icon: CheckCircle2,
        badge: 'SUB-CENTIMETER DEPTH',
        color: 'text-emerald-400'
      }
    },
    {
      feature: 'Municipal Dispatch SLA',
      traditional: {
        title: '3 to 14 Business Days',
        desc: 'Bureaucratic paper trails, lack of GPS coordinates, and manual inspection dispatches delay simple cold-patch fixes.',
        icon: XCircle,
        badge: 'SLOW CLOSURE',
        color: 'text-rose-400'
      },
      sentinel: {
        title: '< 15 Minutes SLA Automated Dispatch',
        desc: 'Georeferenced incident pins (11.0168° N, 76.9558° E) push directly to Stormwater and PWD field tablets with suggested actions.',
        icon: CheckCircle2,
        badge: '85% FASTER CLOSURE',
        color: 'text-emerald-400'
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-white font-mono tracking-tight">
            PARADIGM SHIFT: TRADITIONAL vs. URBAN SENTINEL
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            SIH VALUE PROPOSITION
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Why transforming public buses into autonomous mobile sensing nodes revolutionizes urban smart-city governance
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-4">
        {comparisons.map((c, idx) => {
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
                  {c.feature}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  BENCHMARK COMPARISON #{idx + 1}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Traditional Side */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-950/60 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-rose-400 uppercase font-bold flex items-center gap-1">
                        <c.traditional.icon className="w-3.5 h-3.5" />
                        TRADITIONAL APPROACH
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {c.traditional.badge}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 mt-2">
                      {c.traditional.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                      {c.traditional.desc}
                    </p>
                  </div>
                </div>

                {/* Urban Sentinel Side */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-emerald-500/40 flex flex-col justify-between space-y-3 shadow-lg shadow-cyan-950/20">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                        <c.sentinel.icon className="w-3.5 h-3.5" />
                        URBAN SENTINEL PLATFORM
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {c.sentinel.badge}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">
                      {c.sentinel.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                      {c.sentinel.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Municipal ROI & Impact Highlight Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          MUNICIPAL IMPACT SUMMARY & COST SAVINGS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">CAPEX Reduction</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">91%</div>
            <span className="text-[11px] text-slate-400 font-sans mt-1 block">
              Eliminates dedicated multi-crore survey vehicle purchases.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Hazard Detection Time</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">&lt; 15s</div>
            <span className="text-[11px] text-slate-400 font-sans mt-1 block">
              Direct edge inference and 5G low-latency telemetry transmission.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Road Rebuild Savings</span>
            <div className="text-2xl font-black text-white mt-1">&#8377;4.8 Cr/yr</div>
            <span className="text-[11px] text-slate-400 font-sans mt-1 block">
              Early crack sealing prevents catastrophic asphalt cratering during monsoons.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
