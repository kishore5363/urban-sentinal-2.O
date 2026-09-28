import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Waves, 
  Calendar, 
  Building2,
  Share2
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const ReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, hazards, metrics, selectedHazardId } = useSentinel();
  const [reportType, setReportType] = useState<'incident' | 'daily' | 'weekly'>('incident');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isReportModalOpen) return null;

  const targetHazard = hazards.find(h => h.id === selectedHazardId) || hazards[0];

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div id="report-generation-modal" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Municipal Intelligence Report Generator
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Urban Sentinel Smart City Infrastructure Documentation &bull; SIH Prototype
              </p>
            </div>
          </div>
          <button
            id="close-report-modal-btn"
            onClick={() => setIsReportModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-2 px-6 pt-4 bg-slate-950/40 border-b border-slate-800 text-xs font-mono">
          <button
            onClick={() => setReportType('incident')}
            className={`pb-3 px-3 border-b-2 font-bold transition-colors ${
              reportType === 'incident' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            INCIDENT REPORT ({targetHazard.id})
          </button>
          <button
            onClick={() => setReportType('daily')}
            className={`pb-3 px-3 border-b-2 font-bold transition-colors ${
              reportType === 'daily' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            DAILY CITY REPORT
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`pb-3 px-3 border-b-2 font-bold transition-colors ${
              reportType === 'weekly' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            WEEKLY HAZARD REPORT
          </button>
        </div>

        {/* Report Content Body (Printable styling) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200">
          {reportType === 'incident' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-5 font-mono text-xs">
              {/* Document Stamp */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest">
                    MUNICIPAL CORPORATION DISPATCH DOCUMENT
                  </span>
                  <h4 className="text-base font-black text-white mt-1">
                    INCIDENT REPORT #{targetHazard.id}
                  </h4>
                  <p className="text-slate-400 text-[11px] font-sans mt-0.5">
                    Automated generation via Urban Sentinel Public Bus Mobile Sensing Payload
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 uppercase text-[10px]">
                    SEVERITY: {targetHazard.severity.toUpperCase()}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Generated: {new Date().toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Hazard Type</span>
                  <div className="text-sm font-bold text-white mt-0.5 capitalize">
                    {targetHazard.type.replace('_', ' ')}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Location & GPS</span>
                  <div className="text-xs font-bold text-cyan-300 mt-0.5">
                    {targetHazard.location.lat.toFixed(4)}° N, {targetHazard.location.lon.toFixed(4)}° E
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">{targetHazard.location.roadName}</div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Detecting Bus & Timestamp</span>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {targetHazard.busId} ({targetHazard.timestamp})
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">AI Confidence Score</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {targetHazard.confidenceScore}% (YOLOv8 Edge Vision)
                  </div>
                </div>

                {targetHazard.waterDepth !== undefined && (
                  <div className="p-3 bg-cyan-950/50 rounded-xl border border-cyan-800/80 sm:col-span-2">
                    <span className="text-[10px] text-cyan-400 uppercase">LiDAR/ToF Water Depth Telemetry</span>
                    <div className="text-base font-bold text-white mt-0.5">
                      Water Depth = {targetHazard.waterDepth.toFixed(2)} m ({targetHazard.waterDepth * 100} cm)
                    </div>
                    <div className="text-[11px] text-cyan-200 mt-1">
                      Sensor Height: {targetHazard.sensorHeight || 1.25}m &minus; Surface Distance: {targetHazard.surfaceDistance || 0.60}m = {targetHazard.waterDepth.toFixed(2)}m
                    </div>
                  </div>
                )}
              </div>

              {/* Response Timeline */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-2">Response Timeline</span>
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <strong>00:00</strong> &ndash; AI Camera & LiDAR detection confirmed by {targetHazard.busId}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <strong>00:03</strong> &ndash; Ingested into Cloud GIS with georeferenced coordinates
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <strong>02:40</strong> &ndash; Automated alert dispatched to Stormwater & Traffic departments
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <strong>Current Status:</strong> {targetHazard.status.toUpperCase()} (Response SLA: {targetHazard.responseTime || '3.5 min'})
                  </div>
                </div>
              </div>
            </div>
          )}

          {reportType === 'daily' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-base font-bold text-white">DAILY METROPOLITAN ROAD AUDIT</h4>
                <p className="text-slate-400 text-[11px] font-sans">Coimbatore Urban Transportation Corridor</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">TOTAL SENSING BUSES</div>
                  <div className="text-lg font-bold text-white mt-0.5">{metrics.activeBuses} Units</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">KM SURVEYED</div>
                  <div className="text-lg font-bold text-cyan-400 mt-0.5">{metrics.roadsMonitoredKm} km</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">HAZARDS LOGGED</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">{metrics.hazardsDetected}</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">RESOLVED TODAY</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{metrics.resolvedCount}</div>
                </div>
              </div>
            </div>
          )}

          {reportType === 'weekly' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-base font-bold text-white">WEEKLY INFRASTRUCTURE DECAY ANALYSIS</h4>
                <p className="text-slate-400 text-[11px] font-sans">7-Day Aggregated Pothole & Flood Trends</p>
              </div>
              <div className="space-y-2 font-sans text-xs text-slate-300">
                <p>&bull; <strong>Waterlogging Corridors:</strong> 32 total incidents logged, primarily concentrated in Gandhipuram-Ukkadam and Hope College railway underpasses.</p>
                <p>&bull; <strong>Pothole Density:</strong> North Corridor (Ganapathy Flyover) accounts for 44% of severe rim-fracture potholes.</p>
                <p>&bull; <strong>Fleet Coverage:</strong> 99.2% of scheduled arterial routes covered twice daily by mobile sensing payloads.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            {downloadSuccess && (
              <span className="text-emerald-400 flex items-center gap-1 font-bold animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> Report Exported as CSV / PDF
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-report-btn"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              id="export-csv-report-btn"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-950 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV / Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
