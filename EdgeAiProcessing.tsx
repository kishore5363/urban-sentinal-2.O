import React, { useState } from 'react';
import { 
  Workflow, 
  Camera, 
  ScanEye, 
  Waves, 
  MapPin, 
  Cpu, 
  FileText, 
  ArrowDown, 
  CheckCircle2, 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Sparkles,
  Code,
  ShieldCheck
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const EdgeAiProcessing: React.FC = () => {
  const { 
    buses, 
    hazards, 
    waterReading, 
    simulateNewHazardDetection,
    viewHazardOnMap
  } = useSentinel();

  const [activeStepIndex, setActiveStepIndex] = useState<number>(4); // default Edge Processing
  const [isProcessingStep, setIsProcessingStep] = useState<boolean>(false);

  const activeHazard = hazards[0] || {
    id: 'HAZ-2026-089',
    type: 'waterlogging',
    title: 'Severe Underpass Waterlogging',
    confidenceScore: 97.6,
    busId: 'BUS-102',
    location: { roadName: 'Outer Ring Rd - Bellandur Underpass', lat: 12.9210, lon: 77.6520, zone: 'East Zone' },
    waterDepth: 0.65,
    timestamp: '14:22:08 IST'
  };

  const pipelineSteps = [
    {
      id: 'step-1',
      title: 'Camera Input',
      sublabel: 'Sony IMX490 HDR Sensor',
      icon: Camera,
      latency: '8 ms',
      status: 'active',
      details: 'High Dynamic Range (120dB) front-facing optical camera capture at 1920x1080 @ 30 FPS. Auto-exposure compensates for direct sunlight, dusk glare, and severe rainfall.',
      payloadSample: {
        stream_source: 'V4L2_DEV_VIDEO0',
        resolution: '1920x1080',
        color_space: 'YUV422_TO_RGB888',
        frame_id: 1049281,
        exposure_time_us: 1250,
      }
    },
    {
      id: 'step-2',
      title: 'AI Detection',
      sublabel: 'YOLOv8-UrbanEdge FP16',
      icon: ScanEye,
      latency: '14 ms',
      status: 'active',
      details: 'Quantized TensorRT deep neural network detects potholes, waterlogging reflection boundaries, structural asphalt cracks, and surface failures with tight bounding box coordinates.',
      payloadSample: {
        model_engine: 'YOLOv8s-seg-tensorrt-fp16',
        classes_scanned: ['pothole', 'waterlogging', 'road_crack', 'damaged_road'],
        detected_class: activeHazard.type,
        confidence_score: `${activeHazard.confidenceScore}%`,
        inference_time_ms: 13.8,
        bbox_norm: [0.20, 0.52, 0.60, 0.36]
      }
    },
    {
      id: 'step-3',
      title: 'LiDAR/ToF Measurement',
      sublabel: 'Benewake 100Hz Infrared',
      icon: Waves,
      latency: '2 ms',
      status: 'active',
      details: 'Time-of-flight laser beam computes surface reflection distance. Evaluates water depth via the deterministic formula: Water Depth = Sensor Height (1.25m) - Surface Distance (0.60m) = 0.65m.',
      payloadSample: {
        sensor_type: 'Time-of-Flight_LiDAR',
        sensor_height_m: waterReading.sensorHeight,
        surface_distance_m: waterReading.surfaceDistance,
        calculated_water_depth_m: waterReading.waterDepth,
        signal_quality: '98.4%',
        sample_freq: '100Hz'
      }
    },
    {
      id: 'step-4',
      title: 'GPS Location',
      sublabel: 'RTK Sub-Meter Precision',
      icon: MapPin,
      latency: '1 ms',
      status: 'active',
      details: 'Synchronizes detection events with multi-constellation GNSS (GPS + NavIC + GLONASS) coordinates and road corridor chainage markers accurate to ±0.3 meters.',
      payloadSample: {
        latitude: activeHazard.location.lat,
        longitude: activeHazard.location.lon,
        altitude_m: 914.2,
        road_segment: activeHazard.location.roadName,
        speed_kmh: 38,
        heading_deg: 142
      }
    },
    {
      id: 'step-5',
      title: 'Edge Processing',
      sublabel: 'NVIDIA Jetson Orin Nano',
      icon: Cpu,
      latency: '3 ms',
      status: 'active',
      details: 'Onboard edge computer fuses optical bounding boxes, LiDAR depth metrics, and GPS metadata into a signed, cryptographically hashed hazard record payload. Zero redundant cloud uploads.',
      payloadSample: {
        edge_hardware: 'NVIDIA Jetson Orin Nano (40 TOPS INT8)',
        cpu_usage_pct: '24%',
        gpu_memory_used_mb: '1840 / 8192 MB',
        core_temp_celsius: 46.2,
        fusion_engine: 'UrbanSentinel-Fusion-v2.4'
      }
    },
    {
      id: 'step-6',
      title: 'Hazard Record',
      sublabel: 'Cloud Sync & Municipal Dispatch',
      icon: FileText,
      latency: '12 ms (5G Uplink)',
      status: 'completed',
      details: 'Structured compact JSON payload transmitted via MQTT over 5G SA network to Municipal Smart City Cloud for instant GIS map visualization and PWD road dispatch ticket creation.',
      payloadSample: {
        incident_id: activeHazard.id,
        hazard_type: activeHazard.type,
        severity: activeHazard.severity,
        confidence: activeHazard.confidenceScore,
        water_depth_m: activeHazard.waterDepth || null,
        bus_unit: activeHazard.busId,
        timestamp_ist: activeHazard.timestamp,
        telemetry_checksum: 'sha256:7f9a88c...'
      }
    }
  ];

  const currentStep = pipelineSteps[activeStepIndex];

  const triggerPipelineExecution = () => {
    setIsProcessingStep(true);
    let step = 0;
    const stepTimer = setInterval(() => {
      setActiveStepIndex(step);
      step++;
      if (step >= pipelineSteps.length) {
        clearInterval(stepTimer);
        setIsProcessingStep(false);
        simulateNewHazardDetection();
      }
    }, 450);
  };

  return (
    <div id="edge-ai-processing-section" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Workflow className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                Edge AI Processing Pipeline
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PROCESSING: NOMINAL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic real-time sensor fusion architecture onboard public transit buses
            </p>
          </div>
        </div>

        <button
          id="run-edge-pipeline-btn"
          onClick={triggerPipelineExecution}
          disabled={isProcessingStep}
          className={`px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold font-mono transition-all shadow-lg shadow-cyan-950 flex items-center gap-2 ${
            isProcessingStep ? 'opacity-70 cursor-wait' : ''
          }`}
        >
          <Sparkles className={`w-4 h-4 text-cyan-200 ${isProcessingStep ? 'animate-spin' : ''}`} />
          <span>{isProcessingStep ? 'Running Pipeline...' : 'Simulate Edge Fusion Cycle'}</span>
        </button>
      </div>

      {/* Technical Flow Pipeline Flowchart (as explicitly specified in Prompt) */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Onboard Edge Processing Flow
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            End-to-End Latency: <strong className="text-emerald-400 font-bold">28 ms</strong>
          </span>
        </div>

        {/* Desktop Pipeline Flow Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = idx === activeStepIndex;
            const isCurrentInAnimation = isProcessingStep && idx === activeStepIndex;

            return (
              <div
                key={step.id}
                id={`pipeline-step-card-${idx}`}
                onClick={() => setActiveStepIndex(idx)}
                className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/50 shadow-lg shadow-cyan-950'
                    : 'bg-slate-950 border-slate-800/90 hover:border-slate-700'
                } ${isCurrentInAnimation ? 'ring-2 ring-cyan-400 animate-pulse' : ''}`}
              >
                {/* Step Number */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                  <span>STEP 0{idx + 1}</span>
                  <span className="text-cyan-400 font-bold">{step.latency}</span>
                </div>

                <div className="space-y-1.5 my-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 group-hover:text-cyan-400'
                  } transition-colors`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                    {step.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {step.sublabel}
                  </div>
                </div>

                {/* Arrow indicator pointing to next step */}
                {idx < pipelineSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <span className="text-slate-600 font-mono text-xs">→</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Selected Step Technical Inspection (Left) + Live Edge Telemetry HUD (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Step Deep-Dive Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                  {React.createElement(currentStep.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                    STEP 0{activeStepIndex + 1} SPECIFICATION
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    {currentStep.title} &mdash; {currentStep.sublabel}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LATENCY: {currentStep.latency}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentStep.details}
            </p>

            {/* Code / Payload Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edge Memory Buffer / Telemetry Frame</span>
                </span>
                <span className="text-[10px] text-slate-500">JSON</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                <pre className="text-[11px] leading-relaxed text-cyan-300/90">
                  {JSON.stringify(currentStep.payloadSample, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Edge Computing Device Telemetry & Confidence Indicator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                ONBOARD EDGE HARDWARE
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">
                NVIDIA Jetson Orin Nano
              </h3>
              <p className="text-xs text-slate-400">
                40 TOPS Sparse INT8 &bull; 8GB LPDDR5 &bull; 15W Max TDP
              </p>
            </div>

            {/* Live Telemetry Health Stats */}
            <div className="space-y-2.5 text-xs font-mono">
              {/* Confidence Score Display as requested by Prompt */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>CONFIDENCE SCORE</span>
                  <span className="text-emerald-400 font-bold">{activeHazard.confidenceScore}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${activeHazard.confidenceScore}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Validation: Dual-Sensor Verified</span>
                  <span>Target: &gt;90%</span>
                </div>
              </div>

              {/* Processing Status Display as requested by Prompt */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">PROCESSING STATUS</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    NOMINAL / ZERO-DROP
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <div>
                    Inference FPS: <strong className="text-white">30.0 fps</strong>
                  </div>
                  <div>
                    Core Temp: <strong className="text-slate-200">46.2 °C</strong>
                  </div>
                  <div>
                    RAM Allocation: <strong className="text-slate-200">1.8 / 8.0 GB</strong>
                  </div>
                  <div>
                    Power Draw: <strong className="text-slate-200">11.8 W</strong>
                  </div>
                </div>
              </div>

              {/* 4G/5G Uplink Status */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>5G SA UPLINK QUEUE</span>
                  <span className="text-cyan-400">MQTT QoS 1</span>
                </div>
                <p className="text-[11px] text-slate-300 font-normal">
                  Only verified hazard records are queued for cloud sync. Normal road segments are logged locally in rolling 24-hr cache.
                </p>
              </div>
            </div>

            <button
              id="inspect-latest-hazard-map-btn"
              onClick={() => viewHazardOnMap(activeHazard.id)}
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Inspect Latest Record on GIS Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
