import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  AlertTriangle, 
  PlusCircle, 
  Radio, 
  Clock, 
  Sparkles,
  Search,
  CheckCircle2,
  ChevronDown,
  Waves,
  Eye,
  Play,
  Bot,
  FileText,
  Maximize2,
  Bell,
  X
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { HazardType } from '../types';

export const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { 
    activeTab, 
    alerts, 
    metrics, 
    simulateNewHazardDetection,
    setActiveTab,
    viewHazardOnMap,
    startLiveDemo,
    setIsSearchModalOpen,
    setIsAiAssistantOpen,
    setIsReportModalOpen,
    setIsPresentationMode
  } = useSentinel();

  const [currentTime, setCurrentTime] = useState('');
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalAlert = alerts.find(a => a.severity === 'critical' && a.status === 'new');
  const unreadAlertsCount = alerts.filter(a => a.status === 'new').length;

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return { title: 'Municipal Overview Command', subtitle: 'Real-time transit sensing grid telemetry & citywide hazard index' };
      case 'live-fleet':
      case 'live-monitoring': return { title: 'Live Bus Fleet Monitoring', subtitle: 'Public transit units equipped with AI Edge & LiDAR sensors' };
      case 'incidents': return { title: 'Incident Management & SLA Dispatch', subtitle: 'Track road defect status: New → Acknowledged → In Progress → Resolved' };
      case 'alerts': return { title: 'Municipal Alert Center', subtitle: 'Automated municipal dispatch triggers & department notifications' };
      case 'ai-hazard':
      case 'ai-detection': return { title: 'AI Road Hazard Vision Inspection', subtitle: 'Edge camera stream with computer vision bounding boxes (30 FPS)' };
      case 'waterlogging':
      case 'water-depth': return { title: 'Waterlogging Intelligence & LiDAR/ToF', subtitle: 'Sensor height minus surface distance calculation engine (1.25m - 0.60m = 0.65m)' };
      case 'sensor-health': return { title: 'Mobile Sensor Fleet Diagnostics', subtitle: 'AI Camera, LiDAR, RTK GPS, Edge Computing & 5G SA connection health' };
      case 'detection-history': return { title: 'AI Detection Historical Archive', subtitle: 'Searchable audit trail of verified road hazards across Coimbatore' };
      case 'gis-map': return { title: 'GIS Smart City Map', subtitle: 'Spatial geocoding of potholes, waterlogging, and road cracks' };
      case 'heatmap': return { title: 'City Hazard Heatmap & Risk Index', subtitle: 'Spatial clustering of high-vulnerability corridors (0-100 Risk Score)' };
      case 'analytics': return { title: 'Municipal Infrastructure Analytics', subtitle: 'Historical road decay patterns, depth distribution & resolution SLA' };
      case 'architecture':
      case 'technical-approach': return { title: 'Technical Architecture & Pipeline', subtitle: '11-stage hardware-to-cloud mobile intelligence data pipeline' };
      case 'problem-solution': return { title: 'Problem vs. Solution Comparison', subtitle: 'Traditional manual road surveys vs. Urban Sentinel public bus fleet' };
      case 'data-flow': return { title: 'Real-Time Data Flow Visualization', subtitle: 'Live simulated telemetry stream from bus sensor to municipal authority' };
      case 'simulated-db': return { title: 'Simulated Geospatial Database', subtitle: 'Relational & geospatial table schemas for bus telemetry and incidents' };
      default: return { title: 'Urban Sentinel', subtitle: 'AI-Powered Mobile Urban Intelligence Platform' };
    }
  };

  const { title, subtitle } = getTabTitle();

  const triggerDetection = (type?: HazardType) => {
    simulateNewHazardDetection(type);
    setShowSimulateMenu(false);
  };

  return (
    <header id="app-header" className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Critical Alert Bar if active */}
      {criticalAlert && (
        <div id="critical-alert-banner" className="bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 border-b border-rose-700/60 px-4 py-2 text-xs flex items-center justify-between text-rose-100 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-bold tracking-wide uppercase font-mono text-rose-300">
              {criticalAlert.title}
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden md:inline text-rose-200">
              {criticalAlert.locationName}
            </span>
            {criticalAlert.depthMeters && (
              <span className="px-1.5 py-0.5 rounded bg-rose-600/40 text-rose-200 font-mono text-[11px] border border-rose-500/40">
                Depth: {criticalAlert.depthMeters.toFixed(2)}m
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              id="view-critical-alert-map-btn"
              onClick={() => viewHazardOnMap(criticalAlert.hazardId)}
              className="px-2.5 py-0.5 rounded-md bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-medium transition-colors"
            >
              View on Map
            </button>
            <button
              id="view-critical-alert-details-btn"
              onClick={() => setActiveTab('alerts')}
              className="px-2.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
            >
              Alerts Hub
            </button>
          </div>
        </div>
      )}

      {/* Main Top Header Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Sidebar Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight font-mono">
                {title}
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 font-mono text-[10px] border border-amber-800/40">
                SIMULATED DATA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions & Indicators */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search */}
          <button
            id="header-smart-search-btn"
            onClick={() => setIsSearchModalOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Search incidents, buses, locations (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline text-[11px]">Search</span>
          </button>

          {/* AI Assistant */}
          <button
            id="header-ai-assistant-btn"
            onClick={() => setIsAiAssistantOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-white text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Urban Sentinel AI Assistant"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline text-[11px]">AI Assistant</span>
          </button>

          {/* Presentation Mode */}
          <button
            id="header-presentation-mode-btn"
            onClick={() => setIsPresentationMode(true)}
            className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-950"
            title="Enter SIH Fullscreen Presentation Mode"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px]">Present</span>
          </button>

          {/* START LIVE DEMO */}
          <button
            id="header-start-demo-btn"
            onClick={startLiveDemo}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold font-mono shadow-md shadow-cyan-950 flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">START DEMO</span>
          </button>

          {/* Notification Center Dropdown Trigger */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 relative transition-colors"
              title="Municipal Notifications"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold font-mono flex items-center justify-center animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-2 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1">
                  <span className="text-xs font-bold font-mono text-white">MUNICIPAL DISPATCH LOG</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto font-mono text-xs">
                  {alerts.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        viewHazardOnMap(a.hazardId);
                        setShowNotifications(false);
                      }}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 cursor-pointer border border-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-rose-400 font-bold">{a.id}</span>
                        <span className="text-slate-500">{a.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-white font-medium truncate mt-0.5">{a.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Simulation Trigger Dropdown */}
          <div className="relative">
            <button
              id="header-simulate-menu-btn"
              onClick={() => setShowSimulateMenu(!showSimulateMenu)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition-colors"
              title="Inject Simulated Detection"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showSimulateMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 font-mono text-xs space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1 text-[10px] text-slate-500 uppercase font-bold">
                  Simulate Incident Trigger
                </div>
                <button
                  onClick={() => triggerDetection('waterlogging')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-cyan-300 flex items-center gap-2"
                >
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Waterlogging (LiDAR)</span>
                </button>
                <button
                  onClick={() => triggerDetection('pothole')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-amber-300 flex items-center gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Severe Pothole</span>
                </button>
                <button
                  onClick={() => triggerDetection('road_crack')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-purple-300 flex items-center gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Road Fatigue Crack</span>
                </button>
                <button
                  onClick={() => triggerDetection('damaged_road')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-rose-300 flex items-center gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Damaged Asphalt Rutting</span>
                </button>
                <button
                  onClick={() => triggerDetection('debris')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-yellow-300 flex items-center gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Road Debris</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
