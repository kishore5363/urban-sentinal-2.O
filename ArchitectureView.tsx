import React, { useState } from 'react';
import { 
  BusFront, 
  Camera, 
  Cpu, 
  Scan, 
  Waves, 
  MapPin, 
  Wifi, 
  Cloud, 
  Database, 
  Map, 
  BellRing, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Sparkles
} from 'lucide-react';

interface ArchStep {
  step: number;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  headline: string;
  details: string;
  specs: { label: string; value: string }[];
  codeSnippet?: string;
}

const ARCH_STEPS: ArchStep[] = [
  {
    step: 1,
    title: 'PUBLIC BUS',
    category: 'Mobile Sensing Unit',
    icon: BusFront,
    headline: 'Continuous Urban Fleet Integration',
    details: 'Existing public transit buses serve as opportunistic mobile monitoring platforms, eliminating expensive dedicated inspection vehicles and covering arterial routes multiple times daily.',
    specs: [
      { label: 'Host Platform', value: 'Standard Low-Floor Transit Bus' },
      { label: 'Power Supply', value: '24V DC Vehicle Alternator (Fused)' },
      { label: 'Survey Frequency', value: 'Every 8–15 minutes per corridor' }
    ]
  },
  {
    step: 2,
    title: 'SENSOR ARRAY',
    category: 'Multi-Modal Sensing',
    icon: Camera,
    headline: 'AI Camera + LiDAR/ToF + GNSS',
    details: 'Custom roof-mounted IP67 enclosure housing a high dynamic range (HDR) optical camera, a Time-of-Flight LiDAR pulsed rangefinder, and dual-band RTK GNSS.',
    specs: [
      { label: 'Optical Camera', value: '1080p HDR Global Shutter (30 FPS)' },
      { label: 'LiDAR/ToF Sensor', value: 'Class 1 905nm Pulsed Rangefinder' },
      { label: 'Mounting Datum', value: 'Calibrated at 1.25m above asphalt' }
    ]
  },
  {
    step: 3,
    title: 'EDGE COMPUTING',
    category: 'Hardware Acceleration',
    icon: Cpu,
    headline: 'NVIDIA Jetson Orin Nano Platform',
    details: 'Low-power 40 TOPS edge AI accelerator mounted securely inside the vehicle chassis, running optimized TensorRT INT8 models without cloud dependencies for inference.',
    specs: [
      { label: 'Processor', value: 'NVIDIA Jetson Orin Nano' },
      { label: 'AI Compute', value: 'Up to 40 TOPS INT8' },
      { label: 'Power Draw', value: '15 Watts max (Automotive Grade)' }
    ]
  },
  {
    step: 4,
    title: 'AI HAZARD DETECTION',
    category: 'Deep Learning Model',
    icon: Scan,
    headline: 'Real-Time YOLOv8 Edge Vision',
    details: 'Computer vision network trained on thousands of Indian roadway images detecting potholes, fatigue cracks, water pooling reflections, asphalt stripping, and construction debris in under 15ms.',
    specs: [
      { label: 'Architecture', value: 'Custom YOLOv8-UrbanEdge' },
      { label: 'Inference Latency', value: '13.8 ms per frame' },
      { label: 'Confidence Threshold', value: '85% trigger SLA' }
    ]
  },
  {
    step: 5,
    title: 'WATER DEPTH ENGINE',
    category: 'Physical Calibration',
    icon: Waves,
    headline: 'LiDAR Optical Echo Arithmetic',
    details: 'When the optical model flags water pooling, the LiDAR sensor verifies the water surface distance. The arithmetic formula: Water Depth = Sensor Height (1.25m) - Measured Surface Distance (0.60m) = 0.65m.',
    specs: [
      { label: 'Measurement Formula', value: 'Water Depth = 1.25m - 0.60m' },
      { label: 'Output Depth', value: '0.65 m (65 cm)' },
      { label: 'Critical Threshold', value: '> 0.50m (Exceeds car exhaust/axle)' }
    ]
  },
  {
    step: 6,
    title: 'GPS GEOCODING',
    category: 'Spatial Geolocation',
    icon: MapPin,
    headline: 'Sub-Meter RTK Georeferencing',
    details: 'Associates every confirmed road defect with precision latitude and longitude coordinates (e.g., 11.0168° N, 76.9558° E), corridor kilometer markers, and municipal ward identifiers.',
    specs: [
      { label: 'GNSS Constellation', value: 'GPS / GLONASS / NavIC' },
      { label: 'Positional Accuracy', value: '< 0.50 meters RMS' },
      { label: 'Timestamping', value: 'UTC Epoch Milliseconds' }
    ]
  },
  {
    step: 7,
    title: '4G / 5G CONNECTIVITY',
    category: 'Vehicle Telematics Link',
    icon: Wifi,
    headline: 'Low-Latency Cellular Uplink',
    details: 'Dual-SIM 5G Standalone modem transmits lightweight JSON incident packets and cropped bounding box thumbnails directly to the central cloud ingest endpoint in under 100ms.',
    specs: [
      { label: 'Cellular Band', value: '5G SA Sub-6GHz / LTE Cat-M1' },
      { label: 'Payload Size', value: '< 2.4 KB per JSON event' },
      { label: 'Store & Forward', value: 'Local SSD buffering during dead zones' }
    ]
  },
  {
    step: 8,
    title: 'CLOUD BACKEND',
    category: 'Distributed Processing',
    icon: Cloud,
    headline: 'High-Throughput Ingestion Pipeline',
    details: 'Stateless microservices validate incoming telemetry packets, de-duplicate multiple bus detections of the same defect, and update temporal escalation counters.',
    specs: [
      { label: 'Ingest Broker', value: 'Distributed MQTT / REST Webhook' },
      { label: 'Deduplication Window', value: '30-minute spatial clustering' },
      { label: 'Availability SLA', value: '99.95% cloud uptime' }
    ]
  },
  {
    step: 9,
    title: 'GEOSPATIAL DATABASE',
    category: 'Persistent Storage',
    icon: Database,
    headline: 'PostGIS / Spatio-Temporal Storage',
    details: 'Persistent spatial tables index road assets, municipal wards, incident histories, sensor health logs, and SLA response timestamps for compliance tracking.',
    specs: [
      { label: 'Data Model', value: 'Spatial GeoJSON & Temporal Log' },
      { label: 'Query Performance', value: '< 8ms indexed geospatial lookups' },
      { label: 'Historical Retention', value: '5-year road condition baseline' }
    ]
  },
  {
    step: 10,
    title: 'GIS PLATFORM',
    category: 'Interactive Map Layer',
    icon: Map,
    headline: 'Smart City Command Center Layer',
    details: 'Municipal operators monitor live bus fleet trajectories and interactive hazard pins with color-coded severity levels and instant access to camera frames and LiDAR depth gauges.',
    specs: [
      { label: 'Projection', value: 'Web Mercator / SVG GIS Vector' },
      { label: 'Update Frequency', value: 'Real-time WebSocket Push' },
      { label: 'Multi-Layer Filtering', value: 'Waterlogging / Potholes / Fleet' }
    ]
  },
  {
    step: 11,
    title: 'MUNICIPAL ALERT',
    category: 'Operational Action',
    icon: BellRing,
    headline: 'Rapid Field Dispatch & Resolution',
    details: 'Critical hazards automatically trigger SMS/WhatsApp and dashboard alerts to PWD Road Maintenance and Stormwater Drainage crews, cutting response times from days to minutes.',
    specs: [
      { label: 'Alert Dispatch SLA', value: '< 15 seconds from detection' },
      { label: 'Integrated Departments', value: 'Stormwater, PWD, Traffic Police' },
      { label: 'Outcome', value: 'Prevented vehicle damage & accidents' }
    ]
  }
];

export const ArchitectureView: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<ArchStep>(ARCH_STEPS[4]); // default to water depth

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-white font-mono tracking-tight">
            TECHNICAL ARCHITECTURE & END-TO-END PIPELINE
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            11 INTEGRATED MODULES
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Complete hardware-to-cloud pipeline from mobile public bus sensing units to municipal field dispatch
        </p>
      </div>

      {/* 11 Pipeline Blocks (Clickable) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <span className="text-xs font-mono text-slate-400 uppercase block mb-4">
          Click any architecture stage to inspect hardware specifications and telemetry flow:
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {ARCH_STEPS.map((step) => {
            const Icon = step.icon;
            const isSelected = selectedStep.step === step.step;
            return (
              <button
                key={step.step}
                onClick={() => setSelectedStep(step)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-950 scale-105'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>STAGE {step.step}</span>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  </div>
                  <div className={`text-xs font-bold font-mono mt-2 truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {step.title}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-sans mt-2 truncate">
                  {step.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Step Technical Deep Dive */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <selectedStep.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 font-bold">STAGE {selectedStep.step} OF 11</span>
                <span className="text-xs font-mono text-slate-500">&bull;</span>
                <span className="text-xs font-mono text-slate-400 uppercase">{selectedStep.category}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                {selectedStep.title}: {selectedStep.headline}
              </h3>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
            SIH ARCHITECTURE BENCHMARK
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-4xl">
          {selectedStep.details}
        </p>

        {/* Specifications Grid */}
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase block mb-3">
            Hardware &amp; Operational Benchmarks:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            {selectedStep.specs.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">{s.label}</span>
                <span className="text-sm font-bold text-white mt-1 block">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* JSON Telemetry Packet Payload Sample */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Edge Telemetry Packet Payload (JSON)</span>
            </span>
            <span className="text-[10px] text-emerald-400">STATUS: VALIDATED</span>
          </div>
          <pre className="text-xs font-mono text-cyan-300 bg-slate-900/80 p-3 rounded-lg overflow-x-auto">
{`{
  "event_id": "INC-2048",
  "bus_unit": "BUS-102",
  "hazard_type": "WATERLOGGING",
  "optical_confidence": 0.94,
  "gps": { "lat": 11.0168, "lon": 76.9558, "accuracy_m": 0.35 },
  "sensor_height_m": 1.25,
  "surface_distance_m": 0.60,
  "calculated_water_depth_m": 0.65,
  "severity": "CRITICAL",
  "edge_hardware": "NVIDIA Jetson Orin Nano (40 TOPS)",
  "network": "5G SA (-64 dBm, latency 12ms)",
  "timestamp_ist": "14:22:08"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};
