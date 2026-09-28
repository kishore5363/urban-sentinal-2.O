import React from 'react';
import { 
  LayoutDashboard, 
  BusFront, 
  ScanEye, 
  Waves, 
  Map as MapIcon, 
  AlertTriangle, 
  BarChart3, 
  Workflow,
  Radio,
  Play,
  ShieldCheck,
  Zap,
  Layers,
  Cpu,
  Flame,
  Activity,
  History,
  FileCheck2,
  Database,
  ArrowRightLeft,
  Sparkles,
  Maximize2,
  Bot,
  Video
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { NavigationTab } from '../types';

interface NavGroup {
  title: string;
  items: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<{ isOpen: boolean; onCloseMobile?: () => void }> = ({ 
  isOpen,
  onCloseMobile 
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    alerts, 
    buses,
    metrics,
    startLiveDemo,
    setIsPresentationMode,
    setIsAiAssistantOpen
  } = useSentinel();

  const unreadAlerts = alerts.filter(a => a.status === 'new').length;

  const navGroups: NavGroup[] = [
    {
      title: 'COMMAND & FLEET',
      items: [
        { id: 'overview', label: 'Overview Command', icon: LayoutDashboard },
        { id: 'live-fleet', label: 'Live Bus Fleet Map', icon: BusFront, badge: `${buses.length} Active`, badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        { id: 'incidents', label: 'Incident Management', icon: FileCheck2, badge: 'SLA' },
        { id: 'incident-replay', label: 'Incident Replay', icon: Video, badge: 'Cinematic', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
        { id: 'alerts', label: 'Municipal Alert Center', icon: AlertTriangle, badge: unreadAlerts > 0 ? unreadAlerts : undefined, badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
      ]
    },
    {
      title: 'MOBILE SENSING PAYLOAD',
      items: [
        { id: 'ai-hazard', label: 'AI Hazard Detection', icon: ScanEye },
        { id: 'waterlogging', label: 'Waterlogging & LiDAR', icon: Waves, badge: '0.65m', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
        { id: 'sensor-health', label: 'Bus Sensor Health', icon: Activity },
        { id: 'detection-history', label: 'AI Detection Archive', icon: History },
      ]
    },
    {
      title: 'GIS & ANALYTICS',
      items: [
        { id: 'gis-map', label: 'GIS Smart City Map', icon: MapIcon },
        { id: 'heatmap', label: 'City Hazard Heatmap', icon: Flame, badge: 'Risk Index', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
        { id: 'analytics', label: 'Corridor Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'TECHNICAL ARCHITECTURE',
      items: [
        { id: 'architecture', label: '11-Stage Pipeline', icon: Workflow, badge: 'Orin' },
        { id: 'problem-solution', label: 'Problem vs Solution', icon: ArrowRightLeft },
        { id: 'data-flow', label: 'Live Data Flow', icon: Zap },
        { id: 'simulated-db', label: 'Simulated Database', icon: Database },
      ]
    }
  ];

  const handleNav = (tabId: NavigationTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const isCurrentActive = (id: NavigationTab) => {
    if (activeTab === id) return true;
    if (id === 'live-fleet' && activeTab === 'live-monitoring') return true;
    if (id === 'ai-hazard' && activeTab === 'ai-detection') return true;
    if (id === 'waterlogging' && activeTab === 'water-depth') return true;
    if (id === 'architecture' && activeTab === 'technical-approach') return true;
    return false;
  };

  return (
    <aside 
      id="sidebar-navigation" 
  className={`fixed lg:static inset-y-0 left-0 z-40 shrink-0 w-64 md:w-72 bg-slate-900/95 border-r border-slate-800 backdrop-blur-md flex flex-col transition-transform duration-200 lg:translate-x-0 ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`} 
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold shrink-0">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-sm sm:text-base text-white uppercase font-mono">
                URBAN SENTINEL
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 tracking-tight">
              AI Mobile Urban Intelligence
            </p>
          </div>
        </div>

        {/* Hackathon Badge */}
        <div className="mt-3 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-semibold text-cyan-300">Smart India Hackathon</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-400/30">
            SIMULATED
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = isCurrentActive(item.id);
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
        <button
          id="sidebar-start-demo-btn"
          onClick={() => {
            startLiveDemo();
            setActiveTab('overview');
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-950 flex items-center justify-center gap-2 transition-transform transform active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>START LIVE DEMO (30s)</span>
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              setIsPresentationMode(true);
              if (onCloseMobile) onCloseMobile();
            }}
            className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700 flex items-center justify-center gap-1.5"
          >
            <Maximize2 className="w-3 h-3 text-indigo-400" />
            <span>Present</span>
          </button>
          <button
            onClick={() => {
              setIsAiAssistantOpen(true);
              if (onCloseMobile) onCloseMobile();
            }}
            className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-mono border border-slate-700 flex items-center justify-center gap-1.5"
          >
            <Bot className="w-3 h-3 text-cyan-400" />
            <span>AI Assist</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
