import React, { useState } from 'react';
import { 
  Workflow, 
  BusFront, 
  Camera, 
  Cpu, 
  AlertTriangle, 
  Waves, 
  MapPin, 
  Wifi, 
  Database, 
  LayoutDashboard, 
  BellRing, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowDown, 
  Info,
  Layers,
  Sparkles,
  TrendingDown,
  Clock,
  DollarSign
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const TechnicalApproach: React.FC = () => {
  const { setActiveTab } = useSentinel();
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);

  // Exact pipeline as requested in the prompt:
  // PUBLIC BUS
  // ↓
  // AI CAMERA + LiDAR/ToF + GPS
  // ↓
  // EDGE AI PROCESSING
  // ↓
  // HAZARD DETECTION
  // ↓
  // WATER DEPTH MEASUREMENT
  // ↓
  // GPS LOCATION
  // ↓
  // 4G/5G TRANSMISSION
  // ↓
  // CLOUD DATABASE
  // ↓
  // GIS DASHBOARD
  // ↓
  // MUNICIPAL ALERT
  // ↓
  // FASTER RESPONSE

  const pipelineNodes = [
    {
      title: 'PUBLIC BUS',
      short: 'Transit Fleet Host',
      icon: BusFront,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Vehicle Carrier',
      details: 'City buses already traverse arterial routes 15 to 30 times daily. Leveraging them as mobile sensing units provides pervasive spatial and temporal coverage across the entire road network with zero dedicated fleet acquisition or fuel cost.',
      specs: ['Daily operating hours: 05:00 - 23:00', 'Corridor repetition: 15-30 passes/day', 'Power supply: 24V DC vehicle alternator converted to 12V 5A regulated DC', 'Mounting: IP67 weatherproof front bumper enclosure']
    },
    {
      title: 'AI CAMERA + LiDAR/ToF + GPS',
      short: 'Sensor Suite Hardware',
      icon: Camera,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Hardware Kit',
      details: 'The multispectral sensor array consists of a 1080p HDR optical camera (Sony IMX490), a high-frequency solid-state LiDAR / Time-of-Flight rangefinder (Benewake TFmini / TF-Luna), and an RTK-enabled multi-constellation GNSS receiver (GPS + NavIC).',
      specs: ['Camera: 1920x1080 @ 30 FPS, 120dB High Dynamic Range', 'LiDAR/ToF: 100 Hz infrared pulse, 0.1m - 8m range, ±1cm accuracy', 'GPS: Multi-band GNSS with PPS sync and RTK accuracy (±0.3m)', 'Operating temp: -20°C to +70°C']
    },
    {
      title: 'EDGE AI PROCESSING',
      short: 'Onboard Neural Inference',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-600',
      badge: 'Edge Compute',
      details: 'Neural inference and sensor fusion occur onboard the bus using an NVIDIA Jetson Orin Nano (40 TOPS) or Coral Edge TPU. The video frames are processed locally; zero raw video bandwidth is transmitted over the cellular network, preserving privacy and eliminating high data costs.',
      specs: ['Compute: NVIDIA Jetson Orin Nano (40 TOPS INT8)', 'Inference latency: 14 ms per frame using TensorRT FP16 quantization', 'Power consumption: ~12 Watts', 'Local buffer: 24-hour circular flash storage for audit playback']
    },
    {
      title: 'HAZARD DETECTION',
      short: 'Vision Recognition',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-600',
      badge: 'AI Vision',
      details: 'A custom-trained YOLOv8-UrbanEdge neural network identifies road pavement distress including potholes, washboard ripples, structural asphalt fractures, and water reflection boundaries. Bounding box coordinates and confidence scores are calculated in real time.',
      specs: ['Detected classes: Pothole, Waterlogging, Road Crack, Damaged Asphalt', 'Model confidence threshold: >85% for ticket generation', 'Dual-frame verification: Eliminates false positives from shadows or debris', 'Classification precision: 94.6% mAP@0.5']
    },
    {
      title: 'WATER DEPTH MEASUREMENT',
      short: 'LiDAR/ToF Computation',
      icon: Waves,
      color: 'from-cyan-500 to-teal-600',
      badge: 'Physics Engine',
      details: 'When the AI vision system detects standing water or puddle boundaries, the LiDAR/ToF sensor executes optical time-of-flight ranging. Water depth is calculated deterministically: Water Depth = Sensor Height (1.25m) - Surface Distance (m).',
      specs: ['Calculation formula: Water Depth = Sensor Height - Surface Distance', 'Measurement resolution: 1 millimeter', 'Sampling frequency: 100 pings per second with median filter', 'Severity classification: Safe (<10cm), Caution (10-30cm), Critical (>30cm)']
    },
    {
      title: 'GPS LOCATION',
      short: 'Geo-Spatial Tagging',
      icon: MapPin,
      color: 'from-emerald-500 to-green-600',
      badge: 'Spatial Index',
      details: 'Every detected hazard is stamped with exact sub-meter GPS coordinates, road corridor ID, chainage marker (kilometer post), bus ID, and vehicle transit direction. This ensures repair crews are routed directly to the hazard site without manual searching.',
      specs: ['GNSS Constellations: GPS, NavIC, GLONASS, Galileo', 'Coordinate system: WGS84 decimal degrees (5 decimal places)', 'Road GIS attribution: Automated reverse-geocoding to municipal street database', 'Clock synchronization: Microsecond PPS time-stamping']
    },
    {
      title: '4G/5G TRANSMISSION',
      short: 'Low-Latency Telemetry',
      icon: Wifi,
      color: 'from-blue-500 to-cyan-600',
      badge: 'Connectivity',
      details: 'Only lightweight, cryptographically hashed JSON hazard payloads (approx. 1.2 KB per incident) are transmitted over Quectel 5G Sub-6GHz / 4G LTE modems via MQTT over TLS (QoS 1). Edge-side deduplication prevents repeated alerts for known hazards.',
      specs: ['Protocol: MQTT v5.0 with TLS 1.3 encryption', 'Payload size: ~1.2 KB per hazard record', 'Uplink latency: 12 - 25 ms', 'Bandwidth efficiency: 99.8% reduction compared to streaming raw video']
    },
    {
      title: 'CLOUD DATABASE',
      short: 'Municipal Data Ingestion',
      icon: Database,
      color: 'from-indigo-600 to-blue-700',
      badge: 'Cloud Backend',
      details: 'The central municipal cloud ingests MQTT payloads into a high-throughput spatial database. It deduplicates multiple reports from different buses, tracks depth changes during rainstorms, and maintains lifecycle audit history.',
      specs: ['Database: Cloud Firestore / PostGIS spatial cluster', 'Ingestion throughput: 10,000 events/second capacity', 'Deduplication window: 15-meter spatial radius & 24-hour temporal clustering', 'Lifecycle states: Detected → Acknowledged → Crew Dispatched → Resolved']
    },
    {
      title: 'GIS DASHBOARD',
      short: 'Central Command Center',
      icon: LayoutDashboard,
      color: 'from-cyan-600 to-blue-700',
      badge: 'Visual Interface',
      details: 'Interactive web-based command dashboard providing municipal administrators, traffic police, and public works engineers with live heatmaps, vehicle trajectories, depth profiles, and real-time alert streams.',
      specs: ['Interactive layers: Waterlogging, Potholes, Cracks, Active Buses', 'Inspection modal: Depth, coordinates, timestamp, vehicle ID, photo thumbnail', 'Access roles: PWD Engineer, Stormwater Ops, Traffic Police, City Mayor', 'Presentation: Full HD projector & workstation responsive']
    },
    {
      title: 'MUNICIPAL ALERT',
      short: 'Automated Dispatch Trigger',
      icon: BellRing,
      color: 'from-rose-500 to-amber-600',
      badge: 'Automated Dispatch',
      details: 'Critical hazards (e.g. waterlogging >30cm or deep rim-fracture potholes) automatically generate urgent dispatch tickets directly into PWD Quick Response and Stormwater Drainage crew mobile devices without human delay.',
      specs: ['Dispatch targets: PWD Road Maintenance, Stormwater Pumps, Traffic Diversion', 'Notification channels: Dashboard audio ping, Webhook, SMS, Mobile App', 'SLA timer: Automated countdown clock for crew acknowledgment (15 min SLA)', 'Escalation policy: Auto-escalates to Ward Executive Engineer if unacknowledged']
    },
    {
      title: 'FASTER RESPONSE',
      short: 'Citizen Safety & Cost Reduction',
      icon: Zap,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Municipal Impact',
      details: 'Cuts road inspection and emergency drainage response time from 14 days (traditional manual survey or citizen complaints) down to under 15 minutes. Prevents vehicle stalling in submerged underpasses, reduces accidents, and preserves urban infrastructure.',
      specs: ['Inspection cycle reduction: From 14 days to continuous real-time', 'Average emergency dispatch: Under 15 minutes', 'Accident prevention: Up to 60% reduction in monsoon underpass vehicle stalls', 'Road maintenance cost saving: 40% reduction via early crack/pothole sealing']
    }
  ];

  const selectedNode = pipelineNodes[selectedNodeIndex];

  return (
    <div id="technical-approach-section" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Workflow className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                Technical Approach & Architecture Pipeline
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                SMART INDIA HACKATHON
              </span>
            </div>
            <p className="text-xs text-slate-400">
              End-to-end edge-to-municipal cloud architecture transforming public transit into mobile sensing units
            </p>
          </div>
        </div>

        <button
          id="test-pipeline-flow-btn"
          onClick={() => setActiveTab('edge-ai')}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-950 flex items-center gap-2"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Inspect Edge Pipeline</span>
        </button>
      </div>

      {/* Core Innovation & Problem Statement Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>The Urban Challenge</span>
          </div>
          <h3 className="text-base font-bold text-white">Manual Inspections Fail</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Road hazards such as deep potholes and waterlogging are difficult to monitor continuously. Traditional municipal audits take 10-14 days, and waterlogging traps vehicles in underpasses before warnings are dispatched.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
            <Sparkles className="w-4 h-4" />
            <span>The Core Solution</span>
          </div>
          <h3 className="text-base font-bold text-white">Public Buses as Mobile Sensors</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Equipping existing municipal bus fleets with AI cameras, LiDAR/ToF water-depth sensors, GPS, Edge AI compute, and 5G connectivity turns ordinary transit vehicles into autonomous, real-time road monitoring units.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
            <CheckCircle2 className="w-4 h-4" />
            <span>The Municipal Impact</span>
          </div>
          <h3 className="text-base font-bold text-white">Instant Response & Zero Fleet Cost</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Zero dedicated survey vehicles needed. Repeat visits 20+ times a day. Instant municipal alert dispatch within 15 minutes, preventing commuter accidents and saving up to 40% on road restoration budgets.
          </p>
        </div>
      </div>

      {/* THE PROMPT PIPELINE VISUALIZATION (Vertical & Horizontal Responsive Flow) */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
              SYSTEM ARCHITECTURE SPECIFICATION
            </span>
            <h3 className="text-lg font-extrabold text-white mt-0.5">
              11-Stage End-to-End Operational Pipeline
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any stage to inspect technical specs
          </span>
        </div>

        {/* Pipeline Nodes Flowchart Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {pipelineNodes.map((node, idx) => {
            const Icon = node.icon;
            const isSelected = idx === selectedNodeIndex;

            return (
              <div
                key={idx}
                id={`tech-node-${idx}`}
                onClick={() => setSelectedNodeIndex(idx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-950/80 scale-[1.02]'
                    : 'bg-slate-950 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                    <span>STAGE {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {node.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 my-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${node.color} text-white shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="font-extrabold text-xs text-white group-hover:text-cyan-300 transition-colors">
                      {node.title}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    {node.short}
                  </p>
                </div>

                {idx < pipelineNodes.length - 1 && (
                  <div className="pt-2 flex justify-center text-slate-600 font-mono text-xs">
                    <span>↓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Stage Deep-Dive Card */}
        <div className="p-5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${selectedNode.color} text-white shadow-lg`}>
                {React.createElement(selectedNode.icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  STAGE 0{selectedNodeIndex + 1} TECHNICAL SPECIFICATION
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {selectedNode.title} &mdash; {selectedNode.short}
                </h4>
              </div>
            </div>

            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {selectedNode.badge}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {selectedNode.details}
          </p>

          <div className="space-y-2">
            <div className="text-xs font-mono font-bold uppercase text-slate-400">
              Engineering Parameters & Protocols:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              {selectedNode.specs.map((spec, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Kit Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
            BILL OF MATERIALS (BOM)
          </span>
          <h3 className="text-base font-extrabold text-white mt-0.5">
            Low-Cost Mobile Sensing Kit per Bus Unit (~₹22,000 / $265 USD)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-mono font-bold block">01. OPTICAL SENSOR</span>
            <strong className="text-white block font-mono">Sony IMX490 HDR</strong>
            <p className="text-[11px] text-slate-400">120dB dynamic range, auto glare compensation, IP67 enclosure.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-mono font-bold block">02. RANGEFINDER</span>
            <strong className="text-white block font-mono">Benewake TFmini ToF</strong>
            <p className="text-[11px] text-slate-400">100Hz optical pulse LiDAR, 1mm depth resolution, waterproof beam lens.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-mono font-bold block">03. EDGE ACCELERATOR</span>
            <strong className="text-white block font-mono">Jetson Orin Nano / TPU</strong>
            <p className="text-[11px] text-slate-400">40 TOPS AI compute, TensorRT FP16 quantization, 12W power envelope.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-mono font-bold block">04. POSITIONING</span>
            <strong className="text-white block font-mono">u-blox ZED-F9P GNSS</strong>
            <p className="text-[11px] text-slate-400">RTK sub-meter precision, NavIC + GPS multi-constellation support.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-mono font-bold block">05. TELEMETRY UPLINK</span>
            <strong className="text-white block font-mono">Quectel 5G Sub-6GHz</strong>
            <p className="text-[11px] text-slate-400">MQTT over TLS, fallback to 4G LTE, zero raw video streaming.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
