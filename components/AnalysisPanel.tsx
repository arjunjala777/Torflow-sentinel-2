import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { TraceSession } from '../types';

interface AnalysisPanelProps {
  trace: TraceSession;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ trace }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        setReport("Error: API Key not found in environment.");
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are a senior forensic network analyst. Analyze the following Tor network trace data for potential security anomalies, de-anonymization risks, or correlation attacks.
        
        Trace Data:
        - Target: ${trace.targetQuery}
        - Total Hops: ${trace.nodes.length}
        - Nodes: ${trace.nodes.map(n => `${n.type}(${n.country})`).join(' -> ')}
        - Packet Count: ${trace.packets.length}
        - Anomalies Detected by System: ${trace.anomalies.join(', ') || 'None'}
        - Packet Sample (First 5): ${JSON.stringify(trace.packets.slice(0, 5))}

        Provide a concise, technical forensic report in markdown. Include:
        1. **Threat Assessment**: High/Medium/Low
        2. **Route Analysis**: Suspicious geographic jumps or relay types.
        3. **Traffic Pattern**: Analysis of packet sizes and timing (if inferred).
        4. **Recommendations**: Countermeasures.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setReport(response.text);
    } catch (error) {
      console.error("Gemini Error:", error);
      setReport("Failed to generate forensic report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-tor-panel border border-tor-border rounded p-4 flex flex-col gap-4 relative overflow-hidden">
      <div className="flex justify-between items-start border-b border-tor-border pb-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-tor-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            AI Forensic Analysis
          </h3>
          <p className="text-[10px] text-gray-500 font-mono mt-1">Powered by Gemini 2.5 Flash</p>
        </div>
        
        <button
          onClick={generateReport}
          disabled={loading}
          className={`
            px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-all
            ${loading 
              ? 'bg-tor-muted text-gray-500 border-transparent cursor-not-allowed' 
              : 'bg-tor-green/10 text-tor-green border-tor-green hover:bg-tor-green/20'
            }
          `}
        >
          {loading ? 'Analyzing...' : 'Generate Report'}
        </button>
      </div>

      <div className="flex-1 min-h-[150px] max-h-[300px] overflow-y-auto scrollbar-hide font-mono text-xs text-gray-300">
        {!report && !loading && (
          <div className="flex items-center justify-center h-full text-gray-600">
            <p>Ready to analyze trace {trace.id.substring(0,8)}...</p>
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="w-6 h-6 border-2 border-tor-green border-t-transparent rounded-full animate-spin"></div>
            <p className="text-tor-green animate-pulse">Running heuristics...</p>
          </div>
        )}

        {report && (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-sm font-bold text-tor-red uppercase border-b border-gray-800 pb-1 mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xs font-bold text-white uppercase mt-3 mb-1" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xs font-bold text-gray-400 mt-2 mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="text-tor-green font-normal" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-400 pl-1" {...props} />,
                p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
              }}
            >
              {report}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
