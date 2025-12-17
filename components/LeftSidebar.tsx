// components/LeftSidebar.tsx
import React from 'react';
import type { SideTabOption } from './SideTab'; // not required, but helpful if you keep types

interface LeftSidebarProps {
  selectedTool?: 'drishti' | 'falcon' | null;
  onSelect?: (opt: 'drishti' | 'falcon' | null) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  selectedTool = null, 
  onSelect 
}) => {
  return (
    <aside 
      className="hidden md:flex flex-col bg-[#071023] text-[#cfe3ff] border-r border-tor-border" 
      style={{ 
        width: '260px', 
        minHeight: '100vh', 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        zIndex: 40 
      }}
    >
      <div className="px-4 py-5 border-b border-tor-border flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-tor-green"></div>
        <div className="text-sm font-bold">BluToR</div>
        <div className="text-xs text-gray-400 font-mono">v1.1.0</div>
      </div>

      <nav className="px-3 py-4 flex-1 overflow-y-auto">
        <div className="mb-3 text-xs text-gray-400 uppercase tracking-wider font-bold px-2">
          Tools
        </div>

        <button 
          onClick={() => onSelect?.('drishti')}
          className={`w-full text-left px-3 py-2 mb-2 rounded-md transition-colors flex flex-col ${
            selectedTool === 'drishti' 
              ? 'bg-gradient-to-r from-slate-800 to-slate-900 border border-blue-700 text-white hover:bg-slate-800/40 text-[#cfe3ff]' 
              : 'text-[#cfe3ff]'
          }`}
        >
          <div className="font-semibold text-sm">Drishti Vision</div>
          <div className="text-xs text-gray-400">Image analysis coming</div>
        </button>

        <button 
          onClick={() => onSelect?.('falcon')}
          className={`w-full text-left px-3 py-2 mb-2 rounded-md transition-colors flex flex-col ${
            selectedTool === 'falcon' 
              ? 'bg-gradient-to-r from-slate-800 to-slate-900 border border-blue-700 text-white hover:bg-slate-800/40 text-[#cfe3ff]' 
              : 'text-[#cfe3ff]'
          }`}
        >
          <div className="font-semibold text-sm">Falcon</div>
          <div className="text-xs text-gray-400">Text model coming</div>
        </button>
      </nav>

      <div className="mt-6 px-2">
        <div className="text-xs text-gray-500 uppercase mb-2">Quick Presets</div>
        <div className="flex flex-col gap-2">
          <button className="text-xs font-mono px-2 py-1 bg-transparent border border-gray-800 rounded text-gray-400 hover:text-white">
            DuckDuckGo
          </button>
          <button className="text-xs font-mono px-2 py-1 bg-transparent border border-gray-800 rounded text-gray-400 hover:text-white">
            Facebook
          </button>
          <button className="text-xs font-mono px-2 py-1 bg-transparent border border-gray-800 rounded text-gray-400 hover:text-white">
            ProtonMail
          </button>
        </div>
      </div>

      <nav>
        <div className="px-4 py-3 border-t border-tor-border text-xs text-gray-400 font-mono">
          <div>
            Selected: <span className="text-white font-semibold">{selectedTool ?? 'None'}</span>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default LeftSidebar;

