import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  BusFront,
  Waves
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  dataDetails?: { label: string; value: string }[];
  timestamp: string;
}

export const AiAssistantModal: React.FC = () => {
  const { 
    isAiAssistantOpen, 
    setIsAiAssistantOpen, 
    hazards, 
    alerts, 
    metrics, 
    buses, 
    waterReading 
  } = useSentinel();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Hello! I am the Urban Sentinel AI Municipal Assistant. I can analyze the real-time simulated telemetry from all mobile bus sensing units across Coimbatore. How can I assist your command center operations today?',
      timestamp: 'Just now'
    }
  ]);

  if (!isAiAssistantOpen) return null;

  const quickPrompts = [
    'How many waterlogging incidents were detected today?',
    'Which bus detected the latest critical incident?',
    'What is the deepest waterlogging event?',
    'Which areas have the highest number of potholes?',
    'What is the average response time?'
  ];

  const handleSend = (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    const userMsg: Message = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const lower = q.toLowerCase();
    let replyText = '';
    let details: { label: string; value: string }[] | undefined;

    if (lower.includes('how many waterlogging') || lower.includes('waterlogging incidents')) {
      const waterCount = hazards.filter(h => h.type === 'waterlogging').length;
      replyText = `Today, a total of ${waterCount} waterlogging incidents are actively logged in the system (${metrics.waterloggingIncidents} citywide total). The most acute event is currently recorded at Gandhipuram - Ukkadam Underpass KM 4.2 with depth 0.65m.`;
      details = [
        { label: 'Active Waterlogging Incidents', value: `${waterCount}` },
        { label: 'Citywide Corridor Total', value: `${metrics.waterloggingIncidents}` },
        { label: 'Deepest Severity Threshold', value: '0.65 m (CRITICAL)' },
      ];
    } else if (lower.includes('latest critical') || lower.includes('which bus detected')) {
      const critAlert = alerts.find(a => a.severity === 'critical') || alerts[0];
      const matchingHazard = hazards.find(h => h.id === critAlert?.hazardId);
      const busId = matchingHazard?.busId || 'BUS-102';
      replyText = `The latest critical incident (${matchingHazard?.id || 'INC-2048'}) was detected by mobile unit ${busId} along the Gandhipuram - Ukkadam arterial corridor. The AI camera verified the hazard with 94% confidence, and the Time-of-Flight LiDAR registered a depth of 0.65m.`;
      details = [
        { label: 'Incident ID', value: matchingHazard?.id || 'INC-2048' },
        { label: 'Detected by Bus', value: busId },
        { label: 'AI Confidence', value: '94.0%' },
        { label: 'GPS Location', value: '11.0168° N, 76.9558° E' }
      ];
    } else if (lower.includes('deepest') || lower.includes('deepest waterlogging')) {
      const deepest = hazards.filter(h => h.type === 'waterlogging').sort((a, b) => (b.waterDepth || 0) - (a.waterDepth || 0))[0];
      const depth = deepest?.waterDepth || 0.65;
      replyText = `The deepest waterlogging event is ${deepest?.id || 'INC-2048'} at ${deepest?.location.roadName || 'Gandhipuram - Ukkadam Underpass KM 4.2'}, measuring ${depth} meters (65 cm). LiDAR telemetry indicates a surface distance of 0.60m from the 1.25m sensor datum.`;
      details = [
        { label: 'Location', value: deepest?.location.roadName || 'Ukkadam Corridor Underpass' },
        { label: 'Calculated Depth', value: `${depth} m (65 cm)` },
        { label: 'Formula', value: '1.25m - 0.60m = 0.65m' },
        { label: 'Severity Classification', value: 'CRITICAL (>0.50m)' }
      ];
    } else if (lower.includes('potholes') || lower.includes('highest number of potholes')) {
      const potholeCount = hazards.filter(h => h.type === 'pothole').length;
      replyText = `The North Corridor (Ganapathy Flyover & Sathy Road) monitored by BUS-104 currently exhibits the highest pothole concentration, with clusters averaging 14-16cm in depth with rim fracture patterns. Total potholes tracked: ${potholeCount}.`;
      details = [
        { label: 'High-Density Zone', value: 'Ganapathy Flyover / Sathy Road' },
        { label: 'Primary Sensing Bus', value: 'BUS-104 (Route 104)' },
        { label: 'Avg Pothole Depth', value: '~15 cm' },
        { label: 'Recommended Action', value: 'Cold-patch asphalt crew' }
      ];
    } else if (lower.includes('response time') || lower.includes('average response')) {
      replyText = `The current simulated average municipal response time is ${metrics.avgResponseTimeMin} minutes from automated AI detection to field crew dispatch. Acknowledged incidents have achieved a 92% resolution SLA within 2 hours.`;
      details = [
        { label: 'Average Dispatch Time', value: `${metrics.avgResponseTimeMin} min` },
        { label: 'Critical Incident SLA', value: '< 15 min' },
        { label: 'Resolved Today', value: `${metrics.resolvedCount} incidents` }
      ];
    } else {
      replyText = `Urban Sentinel has 5 active mobile sensing buses (BUS-101 through BUS-105) surveying 186 km of arterial roadways. Real-time edge inference on NVIDIA Jetson Orin Nano maintains 94.6% detection accuracy for potholes, road cracks, asphalt failures, and waterlogging.`;
      details = [
        { label: 'Active Fleet', value: '5 Mobile Sensing Units' },
        { label: 'Survey Coverage', value: `${metrics.roadsMonitoredKm} km` },
        { label: 'Edge Hardware', value: 'Jetson Orin Nano (40 TOPS)' }
      ];
    }

    const assistantMsg: Message = {
      sender: 'assistant',
      text: replyText,
      dataDetails: details,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputQuery('');
  };

  return (
    <div id="ai-assistant-modal" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Urban Sentinel AI Assistant
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  SIMULATED DATA GROUNDED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Queries municipal fleet sensors, water depth calculations, and road hazard telemetry
              </p>
            </div>
          </div>
          <button
            id="close-ai-assistant-btn"
            onClick={() => setIsAiAssistantOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none'
                }`}
              >
                <p>{m.text}</p>

                {m.dataDetails && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {m.dataDetails.map((item, dIdx) => (
                      <div key={dIdx} className="bg-slate-900/70 p-2 rounded-lg border border-slate-750">
                        <div className="text-[10px] text-slate-400 uppercase">{item.label}</div>
                        <div className="text-cyan-300 font-bold mt-0.5">{item.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          ))}
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono text-slate-500 shrink-0 uppercase">Suggested:</span>
          {quickPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 transition-colors whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputQuery);
          }}
          className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            id="ai-assistant-input"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about waterlogging, potholes, BUS-102, response times..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
          <button
            id="ai-assistant-send-btn"
            type="submit"
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
