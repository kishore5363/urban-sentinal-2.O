import React, { useState } from 'react';
import { 
  BusFront, 
  Wifi, 
  Camera, 
  Waves, 
  Gauge, 
  Compass, 
  MapPin, 
  Cpu, 
  Radio, 
  Layers, 
  Navigation,
  ShieldCheck,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { CITY_ROUTES } from '../data/mockData';

export const LiveBusMonitoring: React.FC = () => {
  const { 
    buses, 
    selectedBusId, 
    setSelectedBusId, 
    setActiveTab, 
    isSimulationRunning 
  } = useSentinel();

  const [mapMode, setMapMode] = useState<'streets' | 'dark' | 'satellite'>('dark');
  const [showRoutes, setShowRoutes] = useState(true);

  const activeBus = buses.find((b) => b.id === selectedBusId) || buses[0];
  const activeRoute = CITY_ROUTES.find((r) => r.number === activeBus.routeNumber) || CITY_ROUTES[0];

  // Map coordinate bounds for projection into SVG coordinates (Coimbatore Metropolitan Grid)
  // Lat: ~10.9800 to ~11.0950, Lon: ~76.9200 to ~77.0400
  const minLat = 10.9800;
  const maxLat = 11.0950;
  const minLon = 76.9200;
  const maxLon = 77.0400;

  const projectToSvg = (lat: number, lon: number, width = 800, height = 550) => {
    const x = ((lon - minLon) / (maxLon - minLon)) * (width - 80) + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * (height - 80) + 40;
    return { x, y };
  };

  return (
    <div id="live-bus-monitoring-section" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BusFront className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                Mobile Sensing Bus Fleet Telemetry
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {buses.length} SENSING UNITS ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous continuous road surface inspection via regular municipal transit
            </p>
          </div>
        </div>

        {/* Map View Controls */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-routes-btn"
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
              showRoutes ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showRoutes ? 'Hide Routes' : 'Show Routes'}
          </button>
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            {(['dark', 'streets'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setMapMode(mode)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                  mapMode === mode ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Map (Left 2/3) + Selected Bus Telemetry Inspector (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Visualizer */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl h-[460px] sm:h-[520px] flex items-center justify-center">
            {/* Map Canvas Background / Grid */}
            <svg 
              className="w-full h-full select-none"
              viewBox="0 0 800 550"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />
                </pattern>
                <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#082f49" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
                </radialGradient>
              </defs>

              <rect width="800" height="550" fill="url(#map-glow)" />
              <rect width="800" height="550" fill="url(#grid-pattern)" />

              {/* Decorative Urban Waterways (River & Lake) */}
              <path
                d="M 120 40 Q 280 180 340 280 T 680 510"
                fill="none"
                stroke="#0369a1"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.25"
              />
              <path
                d="M 120 40 Q 280 180 340 280 T 680 510"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4,4"
                opacity="0.5"
              />
              <ellipse cx="580" cy="210" rx="45" ry="30" fill="#0369a1" opacity="0.2" />

              {/* City Zones / Arterial Major Grid Roads */}
              <g stroke="#334155" strokeWidth="1.8" opacity="0.65">
                <line x1="60" y1="140" x2="740" y2="140" strokeDasharray="8,6" />
                <line x1="60" y1="260" x2="740" y2="260" />
                <line x1="60" y1="380" x2="740" y2="380" strokeDasharray="8,6" />
                <line x1="180" y1="40" x2="180" y2="510" />
                <line x1="380" y1="40" x2="380" y2="510" />
                <line x1="580" y1="40" x2="580" y2="510" strokeDasharray="8,6" />
                {/* Outer Ring Road Diagonal Bypass */}
                <path d="M 100 460 Q 400 390 700 120" fill="none" stroke="#475569" strokeWidth="3" opacity="0.7" />
              </g>

              {/* Major Landmarks Labels */}
              <g fill="#64748b" fontSize="10" fontFamily="monospace" fontWeight="bold">
                <text x="70" y="70">NORTH SECTOR / BYPASS</text>
                <text x="390" y="70">CENTRAL TERMINUS</text>
                <text x="610" y="90">AIRPORT EXPRESS</text>
                <text x="70" y="500">WEST INDUSTRIAL</text>
                <text x="430" y="500">OUTER RING CORRIDOR</text>
                <text x="615" y="470">TECH SEZ CORRIDOR</text>
                <text x="555" y="215" fill="#38bdf8" opacity="0.8">ULSOOR LAKE</text>
              </g>

              {/* Transit Routes Paths */}
              {showRoutes && CITY_ROUTES.map((route) => {
                const pathD = route.waypoints
                  .map((pt, i) => {
                    const { x, y } = projectToSvg(pt[0], pt[1]);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ');

                const isSelectedBusRoute = activeBus.routeNumber === route.number;

                return (
                  <g key={route.id}>
                    {/* Route line glow */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={route.color}
                      strokeWidth={isSelectedBusRoute ? '4.5' : '2'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={isSelectedBusRoute ? 0.9 : 0.35}
                    />
                    {/* Waypoint nodes */}
                    {route.waypoints.map((pt, i) => {
                      const { x, y } = projectToSvg(pt[0], pt[1]);
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r={isSelectedBusRoute ? 3.5 : 2}
                          fill={route.color}
                          opacity={isSelectedBusRoute ? 0.9 : 0.4}
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* Moving Buses */}
              {buses.map((bus) => {
                const { x, y } = projectToSvg(bus.lat, bus.lon);
                const isSelected = bus.id === selectedBusId;

                return (
                  <g 
                    key={bus.id} 
                    id={`bus-marker-${bus.id}`}
                    className="cursor-pointer transition-transform duration-300"
                    onClick={() => setSelectedBusId(bus.id)}
                  >
                    {/* Sensor beam radar sweep effect around bus */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="28"
                        fill="none"
                        stroke={bus.color}
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                        className="animate-spin origin-center"
                        opacity="0.6"
                      />
                    )}

                    {/* Outer pulse */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? '16' : '10'}
                      fill={bus.color}
                      opacity={isSelected ? '0.25' : '0.15'}
                      className={isSimulationRunning ? 'animate-ping origin-center' : ''}
                    />

                    {/* Bus Marker Body */}
                    <rect
                      x={x - 12}
                      y={y - 12}
                      width="24"
                      height="24"
                      rx="6"
                      fill="#0f172a"
                      stroke={isSelected ? '#38bdf8' : bus.color}
                      strokeWidth={isSelected ? '2.5' : '1.8'}
                      className="shadow-lg"
                    />

                    {/* Bus Icon */}
                    <g transform={`translate(${x - 8}, ${y - 8}) scale(0.65)`}>
                      <path
                        d="M 4 2 L 20 2 C 22 2 23 4 23 6 L 23 18 C 23 20 22 21 20 21 L 19 21 L 19 23 C 19 23.5 18.5 24 18 24 L 16 24 C 15.5 24 15 23.5 15 23 L 15 21 L 9 21 L 9 23 C 9 23.5 8.5 24 8 24 L 6 24 C 5.5 24 5 23.5 5 23 L 5 21 L 4 21 C 2 21 1 20 1 18 L 1 6 C 1 4 2 2 4 2 Z"
                        fill={bus.color}
                      />
                      <rect x="4" y="5" width="16" height="6" rx="1" fill="#0f172a" />
                      <circle cx="6" cy="16" r="2" fill="#e2e8f0" />
                      <circle cx="18" cy="16" r="2" fill="#e2e8f0" />
                    </g>

                    {/* Bus Label Badge */}
                    <g transform={`translate(${x}, ${y - 20})`}>
                      <rect
                        x="-30"
                        y="-12"
                        width="60"
                        height="14"
                        rx="4"
                        fill="#020617"
                        stroke={isSelected ? '#38bdf8' : '#334155'}
                        strokeWidth="1"
                        opacity="0.9"
                      />
                      <text
                        x="0"
                        y="-2"
                        textAnchor="middle"
                        fill={isSelected ? '#38bdf8' : '#f1f5f9'}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {bus.id} ({bus.currentSpeed}k)
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Live Map Legend & Status HUD */}
            <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400 font-bold">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>REAL-TIME GPS TELEMETRY</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Click any bus marker to inspect sensor payloads
              </p>
            </div>

            <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Sim Speed: 1.0x</span>
              </div>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] font-mono text-slate-400">
                Coord Bounds: 12.83°N - 13.05°N
              </span>
            </div>
          </div>

          {/* Quick Bus Selector Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {buses.map((bus) => {
              const isSelected = bus.id === selectedBusId;
              return (
                <button
                  key={bus.id}
                  id={`bus-pill-select-${bus.id}`}
                  onClick={() => setSelectedBusId(bus.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-950'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bus.color }} />
                  <span>{bus.id}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {bus.currentSpeed} km/h
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Bus Full Telemetry Card */}
        <div className="space-y-4">
          <div 
            id="bus-telemetry-card"
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-white font-mono">
                    {activeBus.id}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                    {activeBus.routeNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate max-w-[220px]">
                  {activeBus.routeName}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Radio className="w-3 h-3 animate-pulse" />
                  ONLINE
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Ping: {activeBus.lastPing}
                </p>
              </div>
            </div>

            {/* Real-time Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {/* GPS Coordinates */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>GPS LOCATION</span>
                </div>
                <p className="font-mono text-xs font-bold text-white">
                  {activeBus.lat.toFixed(4)}° N
                </p>
                <p className="font-mono text-xs font-bold text-white">
                  {activeBus.lon.toFixed(4)}° E
                </p>
              </div>

              {/* Speedometer */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                  <Gauge className="w-3 h-3 text-amber-400" />
                  <span>CURRENT SPEED</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-white font-mono">
                    {activeBus.currentSpeed}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">km/h</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Heading: {activeBus.headingDeg}°
                </p>
              </div>

              {/* Sensor Status (LiDAR / ToF) */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                  <Waves className="w-3 h-3 text-cyan-400" />
                  <span>SENSOR STATUS</span>
                </div>
                <p className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LiDAR/ToF Nominal
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Mount: Front Bumper (1.25m)
                </p>
              </div>

              {/* AI Camera Status */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                  <Camera className="w-3 h-3 text-blue-400" />
                  <span>AI CAMERA STATUS</span>
                </div>
                <p className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active (30 FPS)
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Resolution: 1080p HDR
                </p>
              </div>
            </div>

            {/* Connectivity Status Panel */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CONNECTIVITY STATUS</span>
                </span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {activeBus.connectivityStatus}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                <div>
                  Signal: <strong className="text-white">{activeBus.signalStrengthDbm} dBm</strong>
                </div>
                <div>
                  Latency: <strong className="text-emerald-400">{activeBus.latencyMs} ms</strong>
                </div>
                <div>
                  Protocol: <strong className="text-slate-200">MQTT/TLS</strong>
                </div>
              </div>
            </div>

            {/* Edge Computing Device Specs */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                  <Cpu className="w-3.5 h-3.5" /> Edge Device
                </span>
                <span className="text-slate-400">{activeBus.edgeHardware}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                YOLOv8 Edge model running FP16 quantized inference locally on vehicle bus. Zero cloud bandwidth used for nominal frames; only verified hazard payloads transmitted.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex gap-2">
              <button
                id="view-bus-camera-feed-btn"
                onClick={() => setActiveTab('ai-detection')}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>View Camera HUD</span>
              </button>
              <button
                id="view-bus-water-sensor-btn"
                onClick={() => setActiveTab('water-depth')}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Waves className="w-3.5 h-3.5" />
                <span>LiDAR Depth</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
