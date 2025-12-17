// src/App.tsx
import React, { useState, useEffect } from 'react';
import NetworkGraph from './components/NetworkGraph';
import PacketChart from './components/PacketChart';
import AnalysisPanel from './components/AnalysisPanel';
import AboutModal from './components/AboutModal';
import LeftSidebar from './components/LeftSidebar';
import DrishtiPanel from './components/DrishtiPanel';

import type { TraceSession } from './types';
import { fetchSessions } from './services/apiService';
import { generateRandomTrace } from './services/mockData';

const PRESETS = [
  {
    name: 'DuckDuckGo',
    url: 'duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion',
  },
  {
    name: 'Facebook',
    url: 'facebookwkhpilnemxj7asaniu7vnjjbiltxjqhye3mhbshg7kx5tfyd.onion',
  },
  {
    name: 'ProtonMail',
    url: 'protonmailrmez3lotcc5y737ncbx4yjsc7t52jcnk352jcnk352jcn.onion',
  },
];

type ViewMode = 'topology' | 'map';
type ToolOption = 'drishti' | 'falcon' | null;

function App() {
  const [query, setQuery] = useState(PRESETS[0].url);

  const [currentTrace, setCurrentTrace] = useState<TraceSession | null>(null);
  const [replayStep, setReplayStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [isDbMatch, setIsDbMatch] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Drishti / Falcon selection
  const [selectedTool, setSelectedTool] = useState<ToolOption>(null);

  // Initial load
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    const localTrace = generateRandomTrace(query);

    const isLocalDb = localTrace.features.includes('DatabaseMatch');
    setIsDbMatch(isLocalDb);

    if (isLocalDb) {
      setCurrentTrace(localTrace);
      setReplayStep(0);
      setIsPlaying(true);
      return;
    }

    try {
      const results = await fetchSessions(1);
      if (results && results.length > 0) {
        const api = results[0];

        localTrace.id = `api-${api.sessionId}`;
        if (api.targetIp) {
          localTrace.targetQuery = api.targetIp;
        }

        if (localTrace.nodes.length > 0 && api.suspectIp) {
          localTrace.nodes[0].ip = api.suspectIp;
        }
        if (api.confidenceScore !== undefined && api.confidenceScore > 80) {
          localTrace.features.push('API-HighConfidence');
        }

        setCurrentTrace(localTrace);
        setReplayStep(0);
        setIsPlaying(true);
        return;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('API unavailable, err:', err);
    }

    setCurrentTrace(localTrace);
    setReplayStep(0);
    setIsPlaying(true);
  };

  // Playback Logic
  useEffect(() => {
    let interval: number;
    if (isPlaying && currentTrace) {
      interval = window.setInterval(() => {
        setReplayStep((prev) => {
          if (prev >= currentTrace.nodes.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isPlaying, currentTrace]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleToolSelect = (opt: ToolOption) => {
    setSelectedTool(opt);
    // eslint-disable-next-line no-console
    console.log('Tool selected:', opt);
  };

  const sessIdShort =
    currentTrace?.id && currentTrace.id.length > 12
      ? `${currentTrace.id.substring(0, 12)}…`
      : currentTrace?.id ?? 'N/A';

  return (
    <div className="min-h-screen bg-tor-black text-tor-text font-sans">
      {/* Fixed Left Sidebar */}
      <LeftSidebar selectedTool={selectedTool} onSelect={handleToolSelect} />

      {/* Main content shifted right by sidebar width (260px) and filling the rest */}
      <div
        style={{ marginLeft: 260 }}
        className="min-h-screen w-[calc(100vw-260px)] flex flex-col"
      >
        {/* Modal Overlay */}
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

        {/* HEADER */}
        <header className="border-b border-tor-border bg-black h-14 flex items-center justify-between px-6 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-tor-green" />
            <h1 className="font-bold text-lg tracking-tight">
              <span className="text-white">BluToR</span>
              <span className="text-tor-green text-xs ml-2 font-mono font-normal opacity-70">
                v1.1.0
              </span>
            </h1>
          </div>

          {/* Presets + Search */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 mr-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setQuery(preset.url)}
                  className="px-2 py-1 text-[10px] font-mono border border-gray-800 bg-gray-900 text-gray-400 hover:text-tor-green hover:border-tor-green rounded transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-xs font-mono">TARGET</span>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-tor-muted/30 border border-tor-border text-gray-300 text-sm font-mono py-1.5 pl-16 pr-4 w-[400px] focus:outline-none focus:border-gray-500 placeholder-gray-600 truncate"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-tor-muted hover:bg-gray-600 text-white text-xs font-bold px-4 py-2 border-l border-tor-border uppercase tracking-wide transition-colors"
            >
              Intercept
            </button>
          </div>

          {/* Right side buttons */}
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 text-white border border-tor-border bg-tor-panel px-3 py-1.5 text-xs font-bold rounded hover:bg-white hover:text-black transition-colors"
              onClick={() => setShowAbout(true)}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              SYSTEM INFO
            </button>

            <button className="flex items-center gap-2 text-blue-400 border border-blue-900/50 bg-blue-900/10 px-3 py-1.5 text-xs font-bold rounded hover:bg-blue-900/20 transition-colors">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              UPLOAD DB
            </button>

            <button
              className="flex items-center gap-2 text-gray-400 border border-tor-border bg-tor-panel px-3 py-1.5 text-xs font-bold rounded hover:text-white transition-colors"
              onClick={() => window.print()}
            >
              EXPORT REPORT
            </button>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 max-w-[1600px] mx-auto p-6 space-y-6">
          {selectedTool === 'drishti' ? (
            /* FULL-SCREEN DRISHTI MODE (TorFlow-style map across center) */
            <div className="w-full h-[calc(100vh-120px)]">
              <DrishtiPanel />
            </div>
          ) : (
            <>
              {/* SESSION INFO BAR */}
              <div className="grid grid-cols-12 gap-6 h-28">
                {/* Session Controller */}
                <div className="col-span-8 bg-tor-panel border border-tor-border rounded p-4 relative flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">
                        SESSION ID
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-blue-400 font-mono text-xl">
                          {sessIdShort}
                        </div>
                        {isDbMatch && (
                          <span className="text-[10px] text-tor-green border border-tor-green/50 px-1.5 py-0.5 rounded bg-tor-green/10">
                            VERIFIED DATABASE HIT
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">
                        ELAPSED TIME
                      </div>
                      <div className="text-white font-mono text-xl">
                        0ms{' '}
                        <span className="text-gray-600 text-sm">
                          /{' '}
                          {currentTrace
                            ? `${currentTrace.nodes.length * 800}ms`
                            : '0ms'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={togglePlay}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        isPlaying
                          ? 'border-tor-green text-tor-green bg-tor-green/10'
                          : 'border-gray-500 text-gray-500 hover:border-white hover:text-white'
                      }`}
                    >
                      {isPlaying ? (
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-3 h-3 pl-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-tor-border relative">
                      <div
                        className="h-full bg-tor-green transition-all duration-300 ease-linear shadow-[0_0_10px_#00ff00]"
                        style={{
                          width:
                            currentTrace && currentTrace.nodes.length > 0
                              ? `${
                                  (replayStep / currentTrace.nodes.length) * 100
                                }%`
                              : '0%',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Threat Score */}
                <div className="col-span-4 bg-tor-panel border border-tor-border rounded p-4 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2">
                    THREAT SCORE
                  </div>
                  <div
                    className={`text-6xl font-bold ${
                      currentTrace?.anomalies.length
                        ? 'text-tor-red drop-shadow-[0_0_15px_rgba(255,42,42,0.5)]'
                        : 'text-tor-green'
                    }`}
                  >
                    {currentTrace ? 24 + currentTrace.anomalies.length * 12 : 0}
                  </div>
                  <div className="text-gray-500 text-xs mt-2 font-mono">
                    Heuristic Analysis
                  </div>
                </div>
              </div>

              {/* TABS */}
              <div className="flex border-b border-tor-border">
                <button
                  onClick={() => setViewMode('topology')}
                  className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    viewMode === 'topology'
                      ? 'border-tor-green text-tor-green'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Circuit Logic
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    viewMode === 'map'
                      ? 'border-tor-green text-tor-green'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Geo-Location Map
                </button>

                <div className="ml-auto flex items-center gap-4 pr-4 text-[10px] font-mono text-gray-500 uppercase">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    Source
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tor-green" />
                    Guard Node
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tor-blue" />
                    Middle Relay
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tor-red" />
                    Exit Node
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tor-yellow" />
                    Destination
                  </div>
                </div>
              </div>

              {/* MAIN VISUALIZATION AREA */}
              <div className="grid grid-cols-12 gap-6 min-h-[520px] lg:min-h-[680px] h-[calc(100vh-260px)]">
                {/* Network Graph */}
                <div className="col-span-7 h-full">
                  <div className="bg-tor-panel border border-tor-border rounded-lg p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                        {viewMode === 'map'
                          ? 'Global Intercept Map'
                          : 'Circuit Topology'}
                      </div>
                      <div className="text-[10px] text-gray-600 font-mono">
                        Scroll to zoom · drag to pan
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 rounded-md bg-black/70 border border-gray-900 overflow-hidden">
                      {currentTrace ? (
                        <NetworkGraph
                          trace={currentTrace}
                          currentStep={replayStep}
                          viewMode={viewMode}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs font-mono">
                          Load or intercept a session to visualize the circuit.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Analysis Widgets right column */}
                <div className="col-span-5 h-full flex flex-col gap-4">
                  <div className="bg-tor-panel border border-tor-border rounded-lg p-4 h-58 min-h-[180px] flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                        Packet Length Analysis
                      </h3>
                      <span className="text-[10px] text-gray-600 font-mono">
                        Δ time (ms) · bytes
                      </span>
                    </div>
                    <div className="flex-1 min-h-0">
                      {currentTrace && <PacketChart trace={currentTrace} />}
                    </div>
                  </div>

                  <div className="bg-tor-panel border border-tor-border rounded-lg p-4 font-mono text-xs flex-1 min-h-[140px]">
                    <h3 className="text-gray-500 font-bold uppercase text-[10px] mb-3 border-b border-gray-800 pb-2">
                      Real-Time Packet Inspector
                    </h3>
                    {currentTrace &&
                      currentTrace.packets.length > 0 &&
                      currentTrace.packets[
                        Math.min(replayStep, currentTrace.packets.length - 1)
                      ] && (
                        <div className="grid grid-cols-2 gap-y-4">
                          <div>
                            <div className="text-gray-600 mb-1">Source IP</div>
                            <div className="text-blue-400">
                              {currentTrace.nodes[0]?.ip || 'Unknown'}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Dest IP</div>
                            <div
                              className="text-tor-red truncate"
                              title={currentTrace.targetQuery}
                            >
                              {currentTrace.targetQuery}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Size</div>
                            <div className="text-white">
                              {
                                currentTrace.packets[
                                  Math.min(
                                    replayStep,
                                    currentTrace.packets.length - 1
                                  )
                                ].sizeBytes
                              }{' '}
                              Bytes
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Flags</div>
                            <div className="text-tor-yellow">
                              {currentTrace.packets[
                                Math.min(
                                  replayStep,
                                  currentTrace.packets.length - 1
                                )
                              ].flags.join(' ') || 'CLR'}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* PACKET LOG TABLE */}
              <div className="bg-tor-panel border border-tor-border rounded overflow-hidden max-h-[260px] flex flex-col">
                <div className="flex justify-between items-center px-4 py-2 bg-black border-b border-tor-border">
                  <h3 className="text-gray-300 text-sm font-bold">
                    Packet Capture Log
                  </h3>
                  <span className="text-gray-600 text-xs font-mono">
                    {currentTrace?.packets.length ?? 0} Events captured
                  </span>
                </div>
                <div className="overflow-x-auto overflow-y-auto flex-1">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-black text-gray-500 border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-2 w-12">#</th>
                        <th className="px-4 py-2">Time Offset</th>
                        <th className="px-4 py-2">Source</th>
                        <th className="px-4 py-2">Destination</th>
                        <th className="px-4 py-2">Proto</th>
                        <th className="px-4 py-2">Len</th>
                        <th className="px-4 py-2">Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                      {currentTrace?.packets.map((packet, idx) => (
                        <tr
                          key={idx}
                          className={
                            replayStep === idx
                              ? 'bg-tor-green/10 text-tor-green'
                              : 'text-gray-400 hover:bg-gray-900'
                          }
                        >
                          <td className="px-4 py-2">{packet.hopId + 1}</td>
                          <td className="px-4 py-2">{(idx * 29).toFixed(3)}</td>
                          <td className="px-4 py-2 text-blue-400">
                            {currentTrace.nodes[0]?.ip || 'Unknown'}
                          </td>
                          <td className="px-4 py-2 text-tor-red truncate max-w-[200px]">
                            {currentTrace.targetQuery}
                          </td>
                          <td className="px-4 py-2">{packet.protocol}</td>
                          <td className="px-4 py-2 text-white">
                            {packet.sizeBytes}
                          </td>
                          <td className="px-4 py-2 uppercase">
                            {packet.flags.length > 0
                              ? packet.flags.join(' ')
                              : 'PAYLOAD (TLS)'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-center text-gray-600 text-[10px] pt-4 font-mono">
                BluToR Traffic Visualizer 2025. For authorized forensic analysis
                only.
                <br />
                Generated Data. Do not use for live operations.
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
