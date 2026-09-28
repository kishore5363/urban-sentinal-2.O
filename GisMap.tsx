import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, 
  Waves, 
  Disc, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  Clock, 
  BusFront, 
  ShieldAlert, 
  X, 
  ExternalLink, 
  ChevronRight, 
  Sparkles, 
  Video,
  Play,
  Pause,
  FastForward,
  Search,
  Compass,
  Eye,
  Radio,
  Cpu,
  Wifi,
  Navigation,
  SlidersHorizontal,
  Copy,
  Check,
  Flame
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { HazardRecord, HazardType, BusTelemetry } from '../types';
import { CITY_ROUTES } from '../data/mockData';
import { soundManager } from '../utils/audio';

interface ClusteredIncidentGroup {
  id: string;
  x: number;
  y: number;
  hazards: HazardRecord[];
  hasCritical: boolean;
  hasWaterlogging: boolean;
  dominantType: HazardType;
}

export const GisMap: React.FC = () => {
  const { 
    hazards, 
    buses, 
    selectedHazardId, 
    setSelectedHazardId,
    selectedBusId,
    setSelectedBusId,
    acknowledgeHazard,
    resolveHazard,
    dispatchIncident,
    replayIncident,
    isSimulationRunning,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    simulateNewHazardDetection,
    setActiveTab
  } = useSentinel();

  // Filters & display layers
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCorridor, setFilterCorridor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Map viewport & projection state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layer toggles
  const [showActiveBuses, setShowActiveBuses] = useState<boolean>(true);
  const [showSensorBeams, setShowSensorBeams] = useState<boolean>(true);
  const [enableClustering, setEnableClustering] = useState<boolean>(true);
  const [showTransitRoutes, setShowTransitRoutes] = useState<boolean>(true);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [showFloodZones, setShowFloodZones] = useState<boolean>(true);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(false);

  // Active inspected elements
  const [inspectedBusId, setInspectedBusId] = useState<string | null>(null);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  // Radar sweep animation tick
  const [radarAngle, setRadarAngle] = useState<number>(0);
  useEffect(() => {
    let animFrame: number;
    const updateRadar = () => {
      setRadarAngle((prev) => (prev + 1.8) % 360);
      animFrame = requestAnimationFrame(updateRadar);
    };
    animFrame = requestAnimationFrame(updateRadar);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Map coordinate bounds for projection into SVG coordinates (Coimbatore Urban Transit Grid)
  // Lat: ~10.9800 to ~11.0950, Lon: ~76.9200 to ~77.0400
  const minLat = 10.9800;
  const maxLat = 11.0950;
  const minLon = 76.9200;
  const maxLon = 77.0400;

  const projectToSvg = (lat: number, lon: number, width = 840, height = 580) => {
    const x = ((lon - minLon) / (maxLon - minLon)) * (width - 80) + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * (height - 80) + 40;
    return { x, y };
  };

  // Selected Hazard & Bus objects
  const selectedHazard = hazards.find(h => h.id === selectedHazardId) || null;
  const inspectedBus = buses.find(b => b.id === inspectedBusId) || null;

  // Filter hazards based on user selection
  const filteredHazards = useMemo(() => {
    return hazards.filter(h => {
      // Type filter
      if (filterType !== 'all') {
        if (filterType === 'waterlogging' && h.type !== 'waterlogging') return false;
        if (filterType === 'pothole' && h.type !== 'pothole') return false;
        if (filterType === 'road_crack' && h.type !== 'road_crack') return false;
        if (filterType === 'damaged_road' && h.type !== 'damaged_road') return false;
      }
      // Severity filter
      if (filterSeverity !== 'all' && h.severity !== filterSeverity) return false;
      // Status filter
      if (filterStatus !== 'all' && h.status !== filterStatus) return false;
      // Corridor / Zone filter
      if (filterCorridor !== 'all') {
        const roadLower = h.location.roadName.toLowerCase();
        if (filterCorridor === 'avinashi' && !roadLower.includes('avinashi')) return false;
        if (filterCorridor === 'trichy' && !roadLower.includes('trichy')) return false;
        if (filterCorridor === 'crosscut' && !roadLower.includes('cross cut') && !roadLower.includes('collectorate')) return false;
        if (filterCorridor === 'sathy' && !roadLower.includes('sathy') && !roadLower.includes('saravanampatti')) return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = h.id.toLowerCase().includes(q);
        const matchTitle = h.title.toLowerCase().includes(q);
        const matchRoad = h.location.roadName.toLowerCase().includes(q);
        const matchBus = h.busId.toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchRoad && !matchBus) return false;
      }
      return true;
    });
  }, [hazards, filterType, filterSeverity, filterStatus, filterCorridor, searchQuery]);

  // Spatial clustering calculation
  // When clustering is active and zoom is moderate (zoom <= 1.35), group nearby points
  const { clusters, unclusteredHazards } = useMemo(() => {
    if (!enableClustering || zoomLevel > 1.35) {
      return { clusters: [] as ClusteredIncidentGroup[], unclusteredHazards: filteredHazards };
    }

    const clusterDistanceThreshold = 45 / zoomLevel; // SVG units threshold
    const visited = new Set<string>();
    const groups: ClusteredIncidentGroup[] = [];
    const singles: HazardRecord[] = [];

    filteredHazards.forEach((hazard) => {
      if (visited.has(hazard.id)) return;

      const pos = projectToSvg(hazard.location.lat, hazard.location.lon);
      const groupMembers: HazardRecord[] = [hazard];
      visited.add(hazard.id);

      filteredHazards.forEach((other) => {
        if (visited.has(other.id)) return;
        const otherPos = projectToSvg(other.location.lat, other.location.lon);
        const dist = Math.hypot(pos.x - otherPos.x, pos.y - otherPos.y);

        if (dist <= clusterDistanceThreshold) {
          groupMembers.push(other);
          visited.add(other.id);
        }
      });

      if (groupMembers.length > 1) {
        // Compute centroid
        let sumX = 0;
        let sumY = 0;
        let hasCrit = false;
        let hasWater = false;
        const typeCounts: Record<string, number> = {};

        groupMembers.forEach((m) => {
          const pt = projectToSvg(m.location.lat, m.location.lon);
          sumX += pt.x;
          sumY += pt.y;
          if (m.severity === 'critical') hasCrit = true;
          if (m.type === 'waterlogging') hasWater = true;
          typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
        });

        // Determine dominant type
        let dominantType: HazardType = groupMembers[0].type;
        let maxCount = 0;
        Object.entries(typeCounts).forEach(([t, c]) => {
          if (c > maxCount) {
            maxCount = c;
            dominantType = t as HazardType;
          }
        });

        groups.push({
          id: `cluster-${hazard.id}`,
          x: sumX / groupMembers.length,
          y: sumY / groupMembers.length,
          hazards: groupMembers,
          hasCritical: hasCrit,
          hasWaterlogging: hasWater,
          dominantType
        });
      } else {
        singles.push(hazard);
      }
    });

    return { clusters: groups, unclusteredHazards: singles };
  }, [filteredHazards, enableClustering, zoomLevel]);

  // Click on a cluster to zoom in and expand
  const handleClusterClick = (cluster: ClusteredIncidentGroup) => {
    soundManager.playClick();
    setZoomLevel(1.6);
    // Center pan offset towards cluster
    setPanOffset({
      x: (420 - cluster.x) * 0.5,
      y: (290 - cluster.y) * 0.5
    });
    // If user clicked, auto-select first hazard in cluster for inspection
    if (cluster.hazards.length > 0) {
      setSelectedHazardId(cluster.hazards[0].id);
    }
  };

  // Drag-to-pan handlers on map SVG container
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if middle click or left click on background
    if (e.button === 0 && (e.target as HTMLElement).tagName === 'rect') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const copyCoordinates = (lat: number, lon: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    setCopiedCoords(true);
    soundManager.playClick();
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Marker style definitions
  const getHazardMarkerConfig = (hazard: HazardRecord) => {
    if (hazard.severity === 'critical') {
      return {
        color: '#f43f5e',
        glowColor: 'rgba(244, 63, 94, 0.4)',
        bgColor: 'bg-rose-500',
        textColor: 'text-rose-400',
        borderColor: 'border-rose-500',
        icon: AlertTriangle,
        label: 'CRITICAL'
      };
    }
    switch (hazard.type) {
      case 'waterlogging':
        return {
          color: '#06b6d4',
          glowColor: 'rgba(6, 182, 212, 0.4)',
          bgColor: 'bg-cyan-500',
          textColor: 'text-cyan-400',
          borderColor: 'border-cyan-500',
          icon: Waves,
          label: 'WATERLOGGING'
        };
      case 'pothole':
        return {
          color: '#f59e0b',
          glowColor: 'rgba(245, 158, 11, 0.4)',
          bgColor: 'bg-amber-500',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500',
          icon: Disc,
          label: 'POTHOLE'
        };
      case 'road_crack':
        return {
          color: '#a855f7',
          glowColor: 'rgba(168, 85, 247, 0.4)',
          bgColor: 'bg-purple-500',
          textColor: 'text-purple-400',
          borderColor: 'border-purple-500',
          icon: Activity,
          label: 'ROAD CRACK'
        };
      case 'damaged_road':
        return {
          color: '#f43f5e',
          glowColor: 'rgba(244, 63, 94, 0.4)',
          bgColor: 'bg-rose-500',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500',
          icon: AlertTriangle,
          label: 'DAMAGED ROAD'
        };
      case 'debris':
      default:
        return {
          color: '#eab308',
          glowColor: 'rgba(234, 179, 8, 0.4)',
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-400',
          borderColor: 'border-yellow-500',
          icon: AlertTriangle,
          label: 'DEBRIS'
        };
    }
  };

  return (
    <div id="gis-map-section" className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      {/* Top Header & Simulation Command Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/95 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                GIS Smart City Command Map
              </h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                {filteredHazards.length} ACTIVE INCIDENTS
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {buses.length} SENSING BUSES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live mobile telemetry: Waterlogging depth gauges, pothole craters, and transit tracking across Coimbatore
            </p>
          </div>
        </div>

        {/* Live Simulation Controls & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Simulation Movement Toggle */}
          <button
            id="gis-toggle-sim-btn"
            onClick={toggleSimulation}
            className={`px-3 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isSimulationRunning
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
                : 'bg-amber-950/80 text-amber-300 border-amber-700/80 hover:bg-amber-900'
            }`}
            title="Toggle live simulated bus movement"
          >
            {isSimulationRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-emerald-400" />
                <span>BUS MOTION: ACTIVE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-amber-400" />
                <span>BUS MOTION: PAUSED</span>
              </>
            )}
          </button>

          {/* Simulation Speed Multiplier */}
          <button
            id="gis-speed-sim-btn"
            onClick={() => {
              soundManager.playClick();
              setSimulationSpeed(simulationSpeed === 1 ? 2 : simulationSpeed === 2 ? 4 : 1);
            }}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
            title="Change bus simulation speed"
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>{simulationSpeed}x SPEED</span>
          </button>

          {/* Filter Drawer Toggle */}
          <button
            id="gis-filter-drawer-btn"
            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
            className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all ${
              showFiltersDrawer || filterType !== 'all' || filterSeverity !== 'all'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>FILTERS</span>
            {(filterType !== 'all' || filterSeverity !== 'all' || filterStatus !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          {/* Inject Hazard Button */}
          <button
            id="gis-inject-hazard-btn"
            onClick={() => {
              soundManager.playCriticalAlert();
              simulateNewHazardDetection();
            }}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950"
            title="Simulate immediate new road hazard detection"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIMULATE DETECT</span>
          </button>
        </div>
      </div>

      {/* Expandable Advanced Filter Bar */}
      {showFiltersDrawer && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Map Telemetry Filters & Layer Visibility</span>
            </div>
            <button
              onClick={() => {
                setFilterType('all');
                setFilterSeverity('all');
                setFilterStatus('all');
                setFilterCorridor('all');
                setSearchQuery('');
              }}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            {/* 1. Hazard Type Filter */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] uppercase font-bold block">
                Hazard Classification
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'waterlogging', label: 'Waterlogging' },
                  { id: 'pothole', label: 'Potholes' },
                  { id: 'road_crack', label: 'Road Cracks' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilterType(item.id)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors truncate ${
                      filterType === item.id
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Severity Filter */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] uppercase font-bold block">
                Severity Level
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all', label: 'All Levels' },
                  { id: 'critical', label: 'Critical Only' },
                  { id: 'high', label: 'High' },
                  { id: 'medium', label: 'Medium / Low' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilterSeverity(item.id)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors truncate ${
                      filterSeverity === item.id
                        ? item.id === 'critical' ? 'bg-rose-600 text-white font-bold' : 'bg-amber-600 text-white'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Arterial Corridor Filter */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] uppercase font-bold block">
                Arterial Corridor
              </label>
              <select
                value={filterCorridor}
                onChange={(e) => setFilterCorridor(e.target.value)}
                className="w-full py-2 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All City Corridors</option>
                <option value="avinashi">Avinashi Road Express Corridor</option>
                <option value="trichy">Trichy Road Arterial</option>
                <option value="crosscut">Collectorate / Cross Cut Railway</option>
                <option value="sathy">Sathy Road / Saravanampatti</option>
              </select>
            </div>

            {/* 4. Search Filter */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] uppercase font-bold block">
                Search Incident / Road / Bus
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Collectorate, INC-2048, BUS-102"
                  className="w-full py-1.5 pl-8 pr-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Layer Quick Toggles Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Layer Visibility:</span>
            <button
              onClick={() => setShowActiveBuses(!showActiveBuses)}
              className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showActiveBuses ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <BusFront className="w-3 h-3" />
              <span>Buses ({buses.length})</span>
            </button>
            <button
              onClick={() => setShowSensorBeams(!showSensorBeams)}
              className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showSensorBeams ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>LiDAR Radar Cones</span>
            </button>
            <button
              onClick={() => setEnableClustering(!enableClustering)}
              className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                enableClustering ? 'bg-purple-950 text-purple-300 border-purple-700' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <Disc className="w-3 h-3" />
              <span>Incident Clustering</span>
            </button>
            <button
              onClick={() => setShowTransitRoutes(!showTransitRoutes)}
              className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showTransitRoutes ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>Transit Routes</span>
            </button>
            <button
              onClick={() => setShowFloodZones(!showFloodZones)}
              className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showFloodZones ? 'bg-blue-950 text-blue-300 border-blue-700' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <Waves className="w-3 h-3" />
              <span>Flood Risk Zones</span>
            </button>
            <button
              onClick={() => setShowLandmarks(!showLandmarks)}
              className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showLandmarks ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>City Landmarks</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Map Canvas Container */}
      <div 
        id="gis-canvas-wrapper" 
        className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl h-[560px] sm:h-[640px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* SVG GIS Map Canvas */}
        <svg 
          className="w-full h-full select-none"
          viewBox="0 0 840 580"
          preserveAspectRatio="xMidYMid meet"
          style={{ 
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`, 
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)' 
          }}
        >
          <defs>
            {/* Grid background */}
            <pattern id="gis-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" opacity="0.6" />
            </pattern>
            {/* High-tech Smart City Radial Atmosphere */}
            <radialGradient id="gis-deep-ocean" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#082f49" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#031525" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </radialGradient>
            {/* Flood zone gradient */}
            <radialGradient id="flood-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="80%" stopColor="#0284c7" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </radialGradient>
            {/* Sensor beam gradient */}
            <linearGradient id="sensor-cone-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
            </linearGradient>
            {/* Cluster bubble gradients */}
            <radialGradient id="cluster-critical-grad">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#be123c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#881337" stopOpacity="0.9" />
            </radialGradient>
            <radialGradient id="cluster-water-grad">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
            </radialGradient>
            <radialGradient id="cluster-amber-grad">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#d97706" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
            </radialGradient>
          </defs>

          {/* Deep dark Smart City canvas base */}
          <rect width="840" height="580" fill="url(#gis-deep-ocean)" />
          <rect width="840" height="580" fill="url(#gis-grid-pattern)" />

          {/* Simulated Flood Hazard Risk Polygons / Low-lying Basins */}
          {showFloodZones && (
            <g id="gis-flood-zones" opacity="0.85">
              {/* Noyyal River Channel & Collectorate Low Basin */}
              <circle cx="340" cy="275" r="75" fill="url(#flood-gradient)" />
              <circle cx="600" cy="220" r="55" fill="url(#flood-gradient)" />
              <path
                d="M 80 50 Q 280 190 350 280 T 720 540"
                fill="none"
                stroke="#0284c7"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.22"
              />
              <path
                d="M 80 50 Q 280 190 350 280 T 720 540"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="12,8"
                opacity="0.4"
              />
              <text x="140" y="85" fill="#38bdf8" fontSize="8" fontFamily="monospace" opacity="0.6">
                ~ NOYYAL RIVER URBAN DRAINAGE BASIN ~
              </text>
            </g>
          )}

          {/* Arterial Road Grid Geometry */}
          <g stroke="#334155" strokeWidth="2.5" opacity="0.65" id="gis-road-mesh">
            <line x1="50" y1="150" x2="790" y2="150" strokeDasharray="10,6" />
            <line x1="50" y1="280" x2="790" y2="280" strokeWidth="3" />
            <line x1="50" y1="410" x2="790" y2="410" strokeDasharray="10,6" />
            <line x1="200" y1="30" x2="200" y2="550" />
            <line x1="420" y1="30" x2="420" y2="550" strokeWidth="3" />
            <line x1="640" y1="30" x2="640" y2="550" strokeDasharray="10,6" />
            
            {/* Avinashi Road Elevated Corridor Expressway Curve */}
            <path d="M 80 500 Q 420 430 760 120" fill="none" stroke="#475569" strokeWidth="4.5" opacity="0.8" />
            <path d="M 80 500 Q 420 430 760 120" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="6,6" opacity="0.9" />
          </g>

          {/* Bus Transit Route Paths with Direction Flow */}
          {showTransitRoutes && CITY_ROUTES.map((route) => {
            const pathD = route.waypoints
              .map((pt, i) => {
                const { x, y } = projectToSvg(pt[0], pt[1]);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ');

            return (
              <g key={route.id} id={`route-path-${route.id}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={route.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.35"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke={route.color}
                  strokeWidth="1.5"
                  strokeDasharray="8,8"
                  opacity="0.75"
                />
              </g>
            );
          })}

          {/* Key Urban Transit Hub Landmarks */}
          {showLandmarks && [
            { name: 'Gandhipuram Terminal', lat: 11.0185, lon: 76.9675 },
            { name: 'Collectorate Underpass (Low Basin)', lat: 11.0168, lon: 76.9558 },
            { name: 'Town Hall Junction', lat: 11.0105, lon: 76.9520 },
            { name: 'Ukkadam Bus Stand', lat: 10.9950, lon: 76.9515 },
            { name: 'Peelamedu Tech Corridor', lat: 11.0260, lon: 77.0050 },
            { name: 'RS Puram Commercial Hub', lat: 11.0090, lon: 76.9420 },
            { name: 'Singanallur Junction', lat: 10.9980, lon: 77.0280 },
            { name: 'Saravanampatti IT Park', lat: 11.0820, lon: 76.9980 }
          ].map((landmark, idx) => {
            const { x, y } = projectToSvg(landmark.lat, landmark.lon);
            return (
              <g key={idx} transform={`translate(${x}, ${y})`} className="opacity-75 pointer-events-none">
                <circle cx="0" cy="0" r="4" fill="#334155" />
                <circle cx="0" cy="0" r="2" fill="#94a3b8" />
                <rect x="7" y="-7" width={landmark.name.length * 5.2} height="13" rx="3" fill="#020617" opacity="0.8" />
                <text
                  x="9"
                  y="2.5"
                  fill="#94a3b8"
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {landmark.name}
                </text>
              </g>
            );
          })}

          {/* ======================================================== */}
          {/* 1. CLUSTERED INCIDENT MARKERS                            */}
          {/* ======================================================== */}
          {clusters.map((cluster) => {
            const isSelectedCluster = cluster.hazards.some(h => h.id === selectedHazardId);
            const gradId = cluster.hasCritical 
              ? 'url(#cluster-critical-grad)' 
              : cluster.hasWaterlogging 
                ? 'url(#cluster-water-grad)' 
                : 'url(#cluster-amber-grad)';

            const ringColor = cluster.hasCritical ? '#f43f5e' : cluster.hasWaterlogging ? '#06b6d4' : '#f59e0b';
            const radius = Math.min(32, Math.max(20, 16 + cluster.hazards.length * 3));

            return (
              <g
                key={cluster.id}
                id={`gis-cluster-${cluster.id}`}
                transform={`translate(${cluster.x}, ${cluster.y})`}
                className="cursor-pointer transition-transform hover:scale-110 duration-200"
                onClick={() => handleClusterClick(cluster)}
              >
                {/* Outer pulsing beacon ring */}
                <circle
                  r={radius + 8}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="2"
                  opacity="0.4"
                  className="animate-ping origin-center"
                />

                {/* Target crosshair if cluster contains currently selected hazard */}
                {isSelectedCluster && (
                  <circle
                    r={radius + 14}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    className="animate-spin origin-center"
                  />
                )}

                {/* Drop shadow */}
                <ellipse cx="0" cy={radius + 4} rx={radius * 0.8} ry="4" fill="#020617" opacity="0.7" />

                {/* Main cluster bubble */}
                <circle
                  r={radius}
                  fill={gradId}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                />

                {/* Cluster Count Text */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="900"
                >
                  {cluster.hazards.length}
                </text>

                {/* Cluster Label Pill Below */}
                <g transform={`translate(0, ${radius + 12})`}>
                  <rect
                    x="-32"
                    y="-8"
                    width="64"
                    height="13"
                    rx="3"
                    fill="#020617"
                    stroke={ringColor}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="1.5"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    CLUSTER ZOOM
                  </text>
                </g>
              </g>
            );
          })}

          {/* ======================================================== */}
          {/* 2. DISTINCT HAZARD MARKERS (Individual Unclustered)     */}
          {/* ======================================================== */}
          {unclusteredHazards.map((hazard) => {
            const { x, y } = projectToSvg(hazard.location.lat, hazard.location.lon);
            const isSelected = hazard.id === selectedHazardId;
            const config = getHazardMarkerConfig(hazard);
            const isWaterlogging = hazard.type === 'waterlogging';
            const isPothole = hazard.type === 'pothole';
            const isResolved = hazard.status === 'resolved';
            const isInProgress = hazard.status === 'in_progress';

            return (
              <g
                key={hazard.id}
                id={`gis-marker-${hazard.id}`}
                className="cursor-pointer transition-transform hover:scale-125 duration-150"
                onClick={() => {
                  soundManager.playClick();
                  setSelectedHazardId(hazard.id);
                }}
              >
                {/* 2A. Selection Indicator & Radar Halo */}
                {isSelected && (
                  <g transform={`translate(${x}, ${y})`}>
                    <circle
                      r="26"
                      fill="none"
                      stroke={config.color}
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                      className="animate-spin origin-center"
                      opacity="0.9"
                    />
                    <circle r="36" fill={config.glowColor} opacity="0.2" className="animate-ping" />
                  </g>
                )}

                {/* 2B. Critical Pulsing Halo */}
                {hazard.severity === 'critical' && !isResolved && (
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill={config.color}
                    opacity="0.35"
                    className="animate-ping origin-center"
                  />
                )}

                {/* 2C. Waterlogging Specialized Ripple Rings */}
                {isWaterlogging && !isResolved && (
                  <g transform={`translate(${x}, ${y})`}>
                    <circle r="12" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" className="animate-ping origin-center" />
                    <circle r="18" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                  </g>
                )}

                {/* 2D. Pothole Specialized Crater Contour Rings */}
                {isPothole && !isResolved && (
                  <g transform={`translate(${x}, ${y})`}>
                    <circle r="10" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.7" />
                    <circle r="15" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.4" />
                  </g>
                )}

                {/* Ground Shadow */}
                <ellipse cx={x} cy={y + 13} rx="6" ry="2.5" fill="#020617" opacity="0.8" />

                {/* 2E. Primary Marker Pin Head */}
                <g transform={`translate(${x}, ${y})`}>
                  {/* Pin Outline Drop */}
                  <path
                    d="M 0 -20 C -11 -20 -18 -13 -18 -2 C -18 9 0 18 0 18 C 0 18 18 9 18 -2 C 18 -13 11 -20 0 -20 Z"
                    fill={isResolved ? '#10b981' : config.color}
                    stroke="#020617"
                    strokeWidth="2"
                    filter="drop-shadow(0 3px 4px rgba(0,0,0,0.6))"
                  />

                  {/* Inner Dark Core */}
                  <circle cx="0" cy="-3" r="8" fill="#020617" />

                  {/* Icon Graphic inside pin */}
                  {isResolved ? (
                    // Green Checkmark
                    <path
                      d="M -4 -3 L -1 0 L 4 -5"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : isWaterlogging ? (
                    // Water Wave Graphic
                    <path
                      d="M -5 -3 Q -2.5 -6 0 -3 T 5 -3"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  ) : isPothole ? (
                    // Pothole Crater Concentric Target
                    <circle cx="0" cy="-3" r="4" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
                  ) : (
                    // Alert Triangle / Jagged Crack
                    <path
                      d="M -4 1 L 0 -7 L 4 1 Z"
                      fill="none"
                      stroke={config.color}
                      strokeWidth="1.5"
                    />
                  )}
                </g>

                {/* 2F. FLOATING DEPTH BADGE for Waterlogging & Potholes */}
                {isWaterlogging && hazard.waterDepth !== undefined && (
                  <g transform={`translate(${x}, ${y - 27})`}>
                    <rect
                      x="-26"
                      y="-10"
                      width="52"
                      height="14"
                      rx="4"
                      fill="#020617"
                      stroke="#06b6d4"
                      strokeWidth="1.2"
                      filter="drop-shadow(0 2px 3px rgba(0,0,0,0.8))"
                    />
                    <text
                      x="0"
                      y="0.5"
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="900"
                    >
                      🌊 {hazard.waterDepth.toFixed(2)}m
                    </text>
                  </g>
                )}

                {isPothole && (
                  <g transform={`translate(${x}, ${y - 27})`}>
                    <rect
                      x="-26"
                      y="-10"
                      width="52"
                      height="14"
                      rx="4"
                      fill="#020617"
                      stroke="#f59e0b"
                      strokeWidth="1.2"
                      filter="drop-shadow(0 2px 3px rgba(0,0,0,0.8))"
                    />
                    <text
                      x="0"
                      y="0.5"
                      textAnchor="middle"
                      fill="#fbbf24"
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="900"
                    >
                      ⚠️ 13cm
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ======================================================== */}
          {/* 3. ANIMATED SENSING BUS MARKERS & SIMULATED MOVEMENT      */}
          {/* ======================================================== */}
          {showActiveBuses && buses.map((bus) => {
            const { x, y } = projectToSvg(bus.lat, bus.lon);
            const heading = bus.headingDeg || 0;
            const isSelectedBus = bus.id === inspectedBusId || bus.id === selectedBusId;

            return (
              <g
                key={bus.id}
                id={`gis-bus-marker-${bus.id}`}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-transform hover:scale-125 duration-150"
                onClick={() => {
                  soundManager.playClick();
                  setInspectedBusId(bus.id);
                  setSelectedBusId(bus.id);
                }}
              >
                {/* 3A. Directional Forward Sensing Cone / LiDAR Field */}
                {showSensorBeams && (
                  <g transform={`rotate(${heading})`}>
                    {/* Translucent 60-degree forward sensor beam cone */}
                    <path
                      d="M 0 0 L -24 55 A 60 60 0 0 0 24 55 Z"
                      fill="url(#sensor-cone-grad)"
                      opacity={isSimulationRunning ? 0.8 : 0.4}
                    />
                    {/* Active Radar Sweep Line swinging across road */}
                    {isSimulationRunning && (
                      <line
                        x1="0"
                        y1="0"
                        x2={Math.sin((radarAngle * Math.PI) / 90) * 22}
                        y2={50}
                        stroke="#06b6d4"
                        strokeWidth="1.5"
                        opacity="0.9"
                      />
                    )}
                  </g>
                )}

                {/* 3B. Concentric Sonar / 5G Telemetry Pulse */}
                <circle
                  r="14"
                  fill="none"
                  stroke={bus.color}
                  strokeWidth="1.5"
                  opacity="0.4"
                  className="animate-ping origin-center"
                />

                {/* Selection indicator if this bus is inspected */}
                {isSelectedBus && (
                  <circle
                    r="22"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    className="animate-spin origin-center"
                  />
                )}

                {/* 3C. High-Detail Bus Body Silhouette Rotated in Heading */}
                <g transform={`rotate(${heading})`}>
                  {/* Bus Shadow */}
                  <rect x="-7" y="-14" width="14" height="28" rx="4" fill="#020617" opacity="0.6" />

                  {/* Bus Outer Chassis */}
                  <rect
                    x="-6"
                    y="-13"
                    width="12"
                    height="26"
                    rx="3.5"
                    fill={bus.color}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />

                  {/* Front Windshield (Facing forward +Y) */}
                  <rect x="-4.5" y="6" width="9" height="4" rx="1" fill="#020617" />

                  {/* Rear Window */}
                  <rect x="-4.5" y="-11" width="9" height="2.5" rx="1" fill="#020617" />

                  {/* Headlights */}
                  <circle cx="-4" cy="12.5" r="1.2" fill="#fef08a" />
                  <circle cx="4" cy="12.5" r="1.2" fill="#fef08a" />

                  {/* Roof LiDAR Dome Turret */}
                  <circle cx="0" cy="0" r="2.8" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
                  <circle cx="0" cy="0" r="1.2" fill="#38bdf8" className="animate-pulse" />
                </g>

                {/* 3D. Bus Label Badge Floating Above */}
                <g transform="translate(0, -18)">
                  <rect
                    x="-24"
                    y="-8"
                    width="48"
                    height="12"
                    rx="3"
                    fill="#020617"
                    stroke={bus.color}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="0.5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {bus.id} • {bus.currentSpeed}k
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Map Control Tools (Zoom, Reset, Navigation) */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl z-20">
          <button
            id="gis-zoom-in-btn"
            onClick={() => {
              soundManager.playClick();
              setZoomLevel((z) => Math.min(2.5, +(z + 0.25).toFixed(2)));
            }}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="gis-zoom-out-btn"
            onClick={() => {
              soundManager.playClick();
              setZoomLevel((z) => Math.max(0.75, +(z - 0.25).toFixed(2)));
            }}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="gis-zoom-reset-btn"
            onClick={() => {
              soundManager.playClick();
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Reset view to default center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-800 my-0.5" />
          <button
            id="gis-toggle-buses-tool-btn"
            onClick={() => setShowActiveBuses(!showActiveBuses)}
            className={`p-2 rounded-lg transition-colors ${
              showActiveBuses ? 'bg-cyan-950 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle buses visibility"
          >
            <BusFront className="w-4 h-4" />
          </button>
          <button
            id="gis-toggle-cluster-tool-btn"
            onClick={() => setEnableClustering(!enableClustering)}
            className={`p-2 rounded-lg transition-colors ${
              enableClustering ? 'bg-purple-950 text-purple-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle incident clustering"
          >
            <Disc className="w-4 h-4" />
          </button>
        </div>

        {/* Live Legend Box */}
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-2xl text-xs space-y-2.5 z-20 hidden md:block max-w-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-mono text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart City GIS Legend</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Zoom: {zoomLevel}x</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-500/20" />
              <span>Waterlogging (W)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-500/20" />
              <span>Potholes (P)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 ring-2 ring-purple-500/20" />
              <span>Road Cracks (C)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Critical Risk (!)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-[8px] font-bold text-white flex items-center justify-center">
                3
              </span>
              <span>Incident Cluster</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-3 rounded bg-cyan-400 border border-white" />
              <span>Sensing Bus</span>
            </div>
          </div>
          <p className="text-[10px] font-sans text-slate-400 pt-1 border-t border-slate-800">
            Click markers to inspect sensor telemetry, LiDAR water depths, or trigger 14-stage cinematic replays.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 4. BUS TELEMETRY INSPECTOR POPUP                         */}
        {/* ======================================================== */}
        {inspectedBus && !selectedHazard && (
          <div 
            id="gis-bus-inspector-modal"
            className="absolute bottom-4 right-4 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-cyan-800/80 shadow-2xl rounded-2xl p-5 z-30 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <BusFront className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white font-mono">{inspectedBus.id}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                      ● ONLINE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{inspectedBus.routeName}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedBusId(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Velocity</span>
                <span className="font-bold text-white text-sm">{inspectedBus.currentSpeed} km/h</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Heading</span>
                <span className="font-bold text-cyan-300 text-sm">{inspectedBus.headingDeg}°</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Optical Camera</span>
                <span className="font-bold text-emerald-400">4K HDR ACTIVE</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">LiDAR ToF Sensor</span>
                <span className="font-bold text-cyan-400">905nm SCANNING</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2">
                <span className="text-[10px] text-slate-500 block uppercase">Edge Compute / Uplink</span>
                <span className="text-slate-200 block truncate">NVIDIA Jetson Orin Nano • 5G SA (12ms)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('live-fleet');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Fleet Telemetry</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. ENHANCED INCIDENT POPUP                               */}
        {/* ======================================================== */}
        {selectedHazard && (
          <div 
            id="gis-hazard-inspector-modal"
            className="absolute bottom-4 right-4 max-w-sm sm:max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-2xl p-5 z-30 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    selectedHazard.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {selectedHazard.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {selectedHazard.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                    {selectedHazard.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {selectedHazard.title}
                </h3>
              </div>

              <button
                id="close-hazard-inspector-btn"
                onClick={() => setSelectedHazardId(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Close inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Specialized Telemetry Showcase for Waterlogging / Potholes */}
            {selectedHazard.type === 'waterlogging' && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Waves className="w-4 h-4 text-cyan-400" />
                    <span>LiDAR Differential Water Gauge</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px]">
                    {selectedHazard.waterDepth && selectedHazard.waterDepth > 0.5 ? 'CRITICAL WADING RISK' : 'MODERATE DEPTH'}
                  </span>
                </div>
                {/* Physical Equation: 1.25m - 0.60m = 0.65m */}
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between">
                  <span className="text-slate-400">
                    Formula: 1.25m &minus; {selectedHazard.surfaceDistance ? `${selectedHazard.surfaceDistance}m` : '0.60m'} =
                  </span>
                  <span className="text-base font-black text-cyan-300">
                    {selectedHazard.waterDepth ? `${selectedHazard.waterDepth.toFixed(2)}m (${Math.round(selectedHazard.waterDepth * 100)}cm)` : '0.65m'}
                  </span>
                </div>
              </div>
            )}

            {selectedHazard.type === 'pothole' && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Disc className="w-4 h-4 text-amber-400" />
                    <span>Crater Physical Geometry</span>
                  </span>
                  <span className="text-amber-400 font-bold">13 cm Depth</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  Dimensions: {selectedHazard.dimensions || '0.85m × 1.10m asphalt rim failure'}
                </div>
              </div>
            )}

            {/* Prompt Required Fields Grid:
                Hazard type, Depth/severity, GPS location, Detection time, Bus ID, Confidence
            */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              {/* Hazard Type */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Hazard Type</span>
                <span className="font-bold text-white uppercase">{selectedHazard.type.replace('_', ' ')}</span>
              </div>

              {/* Depth / Severity */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Depth / Severity</span>
                <span className="font-bold text-cyan-300">
                  {selectedHazard.waterDepth ? `${selectedHazard.waterDepth}m (${Math.round(selectedHazard.waterDepth * 100)}cm)` : selectedHazard.dimensions || selectedHazard.severity}
                </span>
              </div>

              {/* GPS Location with Copy Button */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 block uppercase">GPS RTK Coordinates</span>
                  <button
                    onClick={() => copyCoordinates(selectedHazard.location.lat, selectedHazard.location.lon)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedCoords ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCoords ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-1 text-white font-bold mt-0.5">
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>{selectedHazard.location.lat.toFixed(5)}° N, {selectedHazard.location.lon.toFixed(5)}° E</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                  {selectedHazard.location.roadName} ({selectedHazard.location.zone})
                </p>
              </div>

              {/* Detection Time */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Detection Time</span>
                <div className="flex items-center gap-1 text-slate-200">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{selectedHazard.timestamp}</span>
                </div>
              </div>

              {/* Bus ID */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Detected by Bus</span>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <BusFront className="w-3 h-3" />
                  <span>{selectedHazard.busId}</span>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">AI Model Confidence</span>
                  <span className="font-bold text-emerald-400 text-sm">{selectedHazard.confidenceScore}%</span>
                </div>
                <span className="text-[10px] text-slate-400">YOLOv8 Edge TensorRT</span>
              </div>
            </div>

            {/* Action Buttons: Acknowledge, Dispatch Team, Cinematic Replay, & Mark Resolved */}
            <div className="flex flex-col gap-2 pt-1">
              {/* Cinematic Replay Launcher */}
              <button
                id={`map-replay-hazard-${selectedHazard.id}`}
                onClick={() => replayIncident(selectedHazard.id)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/40"
                title="Watch cinematic detection and processing replay"
              >
                <Video className="w-4 h-4" />
                <span>CINEMATIC INCIDENT REPLAY (14 STAGES)</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedHazard.status === 'new' && (
                  <button
                    id={`ack-hazard-${selectedHazard.id}`}
                    onClick={() => {
                      soundManager.playClick();
                      acknowledgeHazard(selectedHazard.id);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}

                {selectedHazard.status !== 'in_progress' && selectedHazard.status !== 'resolved' && (
                  <button
                    id={`dispatch-hazard-${selectedHazard.id}`}
                    onClick={() => {
                      soundManager.playClick();
                      dispatchIncident(selectedHazard.id, {
                        department: selectedHazard.type === 'waterlogging' ? 'Stormwater Drainage' : 'PWD Highway Maintenance',
                        teamName: selectedHazard.type === 'waterlogging' ? 'Quick Dewatering Unit 3' : 'Asphalt Patch Crew B',
                        etaMinutes: 12,
                        equipment: selectedHazard.type === 'waterlogging' ? 'High-volume submersible pump & sandbags' : 'Jetpatcher & cold bitumen mix',
                        notes: `Immediate priority dispatch triggered from GIS Command Map for ${selectedHazard.id}`
                      });
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-900/30"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Dispatch Field Team</span>
                  </button>
                )}

                {selectedHazard.status !== 'resolved' ? (
                  <button
                    id={`resolve-hazard-${selectedHazard.id}`}
                    onClick={() => {
                      soundManager.playSuccess();
                      resolveHazard(selectedHazard.id);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                ) : (
                  <div className="w-full py-2 text-center text-xs font-mono text-emerald-400 bg-emerald-950/40 rounded-xl border border-emerald-800">
                    ✓ Incident Resolved & Logged in Municipal DB
                  </div>
                )}
              </div>

              {selectedHazard.status === 'in_progress' && (
                <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-[11px] font-mono text-cyan-300 flex items-center justify-between">
                  <span>STATUS: FIELD TEAM EN ROUTE (ETA ~12 MIN)</span>
                  <span className="animate-pulse">● LIVE DISPATCH</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
