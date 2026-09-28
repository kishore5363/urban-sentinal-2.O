/**
 * URBAN SENTINEL - AI-Powered Mobile Urban Intelligence Platform
 * Smart India Hackathon Prototype
 */

import React, { useState } from 'react';
import { SentinelProvider, useSentinel } from './context/SentinelContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { LiveBusMonitoring } from './components/LiveBusMonitoring';
import { AiRoadHazardDetection } from './components/AiRoadHazardDetection';
import { WaterDepthMeasurement } from './components/WaterDepthMeasurement';
import { EdgeAiProcessing } from './components/EdgeAiProcessing';
import { GisMap } from './components/GisMap';
import { AlertCenter } from './components/AlertCenter';
import { AnalyticsView } from './components/AnalyticsView';
import { TechnicalApproach } from './components/TechnicalApproach';
import { IncidentManagementView } from './components/IncidentManagementView';
import { IncidentReplayView } from './components/IncidentReplayView';
import { HeatmapView } from './components/HeatmapView';
import { SensorHealthView } from './components/SensorHealthView';
import { DetectionHistoryView } from './components/DetectionHistoryView';
import { ArchitectureView } from './components/ArchitectureView';
import { ProblemSolutionView } from './components/ProblemSolutionView';
import { DataFlowView } from './components/DataFlowView';
import { SimulatedDatabaseView } from './components/SimulatedDatabaseView';
import { PresentationMode } from './components/PresentationMode';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ReportModal } from './components/ReportModal';
import { SmartSearchModal } from './components/SmartSearchModal';
import { Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    activeTab, 
    isPresentationMode,
    isAiAssistantOpen,
    isReportModalOpen,
    isSearchModalOpen
  } = useSentinel();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'live-fleet':
      case 'live-monitoring':
        return <LiveBusMonitoring />;
      case 'incidents':
        return <IncidentManagementView />;
      case 'incident-replay':
        return <IncidentReplayView />;
      case 'alerts':
        return <AlertCenter />;
      case 'ai-hazard':
      case 'ai-detection':
        return <AiRoadHazardDetection />;
      case 'waterlogging':
      case 'water-depth':
        return <WaterDepthMeasurement />;
      case 'sensor-health':
        return <SensorHealthView />;
      case 'detection-history':
        return <DetectionHistoryView />;
      case 'edge-ai':
        return <EdgeAiProcessing />;
      case 'gis-map':
        return <GisMap />;
      case 'heatmap':
        return <HeatmapView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'architecture':
      case 'technical-approach':
        return <ArchitectureView />;
      case 'problem-solution':
        return <ProblemSolutionView />;
      case 'data-flow':
        return <DataFlowView />;
      case 'simulated-db':
        return <SimulatedDatabaseView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div id="urban-sentinel-app" className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with quick stats & simulation trigger */}
        <Header onToggleSidebar={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Prototype Demonstration Disclaimer Banner */}
        {showDemoBanner && (
          <div className="bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-950 border-b border-cyan-500/20 px-4 py-1.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-300">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                <strong>Smart India Hackathon Demonstration Prototype:</strong> Realistically simulating AI camera detections, ToF water-depth telemetry, and bus GPS movement.
              </span>
            </div>
            <button
              onClick={() => setShowDemoBanner(false)}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Main Views Area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
          {renderActiveTab()}
        </main>
      </div>

      {/* Global Modals & Overlays */}
      {isPresentationMode && <PresentationMode />}
      {isAiAssistantOpen && <AiAssistantModal />}
      {isReportModalOpen && <ReportModal />}
      {isSearchModalOpen && <SmartSearchModal />}
    </div>
  );
};

export default function App() {
  return (
    <SentinelProvider>
      <MainLayout />
    </SentinelProvider>
  );
}
