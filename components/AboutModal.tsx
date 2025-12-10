import React from 'react';


interface AboutModalProps {
  onClose: () => void;
}


const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-[#333] w-full max-w-2xl rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-black p-4 border-b border-[#333] flex justify-between items-center relative overflow-hidden">
          {/* Decorative stripe */}
          <div className="absolute top-0 left-0 w-1 h-full bg-tor-green"></div>
         
          <h2 className="text-white font-bold text-lg tracking-wider flex items-center gap-3 pl-2">
            <div className="w-2 h-2 bg-tor-green rounded-full shadow-[0_0_8px_#00ff00]"></div>
            SYSTEM FUNCTIONALITY & REFERENCE
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


        {/* Content */}
        <div className="p-6 overflow-y-auto text-gray-300 font-mono text-sm space-y-8 scrollbar-hide">
          <section>
            <h3 className="text-tor-blue font-bold uppercase mb-3 flex items-center gap-2 text-xs tracking-widest">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Operational Context
            </h3>
            <p className="leading-relaxed text-gray-400">
              BluToR is an advanced forensic visualization tool designed to analyze information flow across the Tor (The Onion Router) network.
              Functionality is deeply inspired by the <a href="https://github.com/unchartedsoftware/torflow" target="_blank" rel="noopener noreferrer" className="text-tor-green hover:underline decoration-1 underline-offset-4">Uncharted Software TorFlow</a> project,
              focusing on the visual representation of data in motion to identify patterns, latency correlation, and routing behaviors.
            </p>
          </section>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111] p-4 rounded border border-[#222] hover:border-[#333] transition-colors group">
              <h4 className="text-white font-bold mb-2 group-hover:text-tor-green transition-colors text-xs uppercase">Circuit Topology</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Visualizes the logical path of encrypted traffic through Guard, Middle, and Exit relays. It highlights the cryptographic separation of knowledge between nodes to verify circuit integrity.
              </p>
            </div>
            <div className="bg-[#111] p-4 rounded border border-[#222] hover:border-[#333] transition-colors group">
              <h4 className="text-white font-bold mb-2 group-hover:text-tor-green transition-colors text-xs uppercase">Geo-Spatial Intercept</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Maps IP addresses to physical data centers (AWS, DigitalOcean, etc.) to identify cross-jurisdictional routing patterns and potential correlation attacks based on geographic proximity.
              </p>
            </div>
            <div className="bg-[#111] p-4 rounded border border-[#222] hover:border-[#333] transition-colors group">
              <h4 className="text-white font-bold mb-2 group-hover:text-tor-green transition-colors text-xs uppercase">NetFlow Analysis</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Inspects packet metadata including timing, size (bytes), and protocol flags. This allows for the detection of side-channel attacks or traffic shaping attempts.
              </p>
            </div>
            <div className="bg-[#111] p-4 rounded border border-[#222] hover:border-[#333] transition-colors group">
              <h4 className="text-white font-bold mb-2 group-hover:text-tor-green transition-colors text-xs uppercase">Node Heuristics</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Assigns threat scores based on node reputation lists, uptime, and consensus data, similar to TorFlow's directory authority monitoring capabilities.
              </p>
            </div>
          </div>


          <section className="bg-tor-green/5 border border-tor-green/20 rounded p-4">
            <h3 className="text-tor-yellow font-bold uppercase mb-3 text-xs tracking-widest">Reference Implementation</h3>
            <p className="leading-relaxed mb-3 text-gray-400">
              This application adopts the "Information Flow" visualization philosophy pioneered by <strong>TorFlow</strong>:
            </p>
            <ul className="space-y-2 text-xs text-gray-500 font-bold">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-tor-green rounded-full"></span>
                Visualizing bandwidth consumption and latency across global nodes.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-tor-green rounded-full"></span>
                Tracking dynamic circuit creation, rotation, and destruction cycles.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-tor-green rounded-full"></span>
                Identifying network bottlenecks and potential surveillance choke points.
              </li>
            </ul>
          </section>
        </div>
       
        {/* Footer */}
        <div className="p-4 bg-black border-t border-[#333] text-center">
            <button
                onClick={onClose}
                className="bg-tor-green/10 text-tor-green border border-tor-green/50 px-8 py-2 rounded text-xs font-bold hover:bg-tor-green/20 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] transition-all"
            >
                ACKNOWLEDGE
            </button>
        </div>
      </div>
    </div>
  );
};


export default AboutModal;
