import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, ChevronRight, Terminal, Cpu, Radio, Globe, Scan } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const AdvancedCyberAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 2px, transparent 2.5px)', 
             backgroundSize: '40px 40px',
             transform: 'perspective(1000px) rotateX(10deg)'
           }}>
      </div>
      
      {/* Decorative Gradient Blob */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>

      {/* MAIN ANIMATION CONTAINER */}
      <div className="relative w-[600px] h-[600px] flex items-center justify-center">
        
        {/* Radar Scanner Sweep */}
        <div className="absolute inset-0 rounded-full animate-scan-radar z-0 opacity-50"></div>

        {/* Central Core Glow */}
        <div className="absolute w-24 h-24 bg-blue-500 rounded-full blur-[60px] animate-pulse z-0"></div>

        {/* Center Emblem */}
        <div className="relative z-20 w-40 h-40 bg-slate-950/90 backdrop-blur-xl border border-blue-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.2)]">
           <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
           <ShieldCheck size={56} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-float" />
        </div>

        {/* Ring 1: Inner Dashed */}
        <div className="absolute w-[280px] h-[280px] border border-blue-500/20 border-dashed rounded-full animate-slow-spin"></div>
        
        {/* Ring 2: Middle Tech Ring */}
        <div className="absolute w-[380px] h-[380px] rounded-full border border-slate-700/30 animate-reverse-spin flex items-center justify-center">
             <div className="absolute top-0 w-16 h-1 bg-blue-500/50 blur-[2px]"></div>
             <div className="absolute bottom-0 w-16 h-1 bg-blue-500/50 blur-[2px]"></div>
        </div>

        {/* Ring 3: Outer Orbital (Atomic Style) */}
        <div className="absolute w-[500px] h-[500px] border border-slate-800 rounded-full animate-[spin_40s_linear_infinite]">
            <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white]"></div>
        </div>

        {/* Tilted Rings for 3D Effect */}
        <div className="absolute w-[550px] h-[550px] border border-emerald-500/10 rounded-full animate-[spin_12s_linear_infinite]" style={{ transform: 'rotateX(60deg) rotateY(10deg)' }}></div>
        <div className="absolute w-[450px] h-[450px] border border-purple-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" style={{ transform: 'rotateX(-60deg) rotateY(10deg)' }}></div>

         {/* Floating Status Widgets */}
         <div className="absolute top-20 right-10 bg-slate-900/80 border border-blue-500/20 p-2 rounded backdrop-blur-md animate-float" style={{ animationDelay: '1s' }}>
             <div className="text-[10px] text-blue-400 font-mono flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                NETWORK_SECURE
             </div>
         </div>

      </div>

      {/* Global Bottom Stats */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between text-slate-600 font-mono text-[10px] tracking-[0.2em] uppercase z-10">
            <div className="flex items-center gap-3">
                <Globe size={12} className="text-slate-500" />
                <span>Node Map: v4.9.1</span>
            </div>
            <div className="flex items-center gap-4">
                <span>Latency: 12ms</span>
                <span>Encryption: AES-GCM</span>
            </div>
      </div>
    </div>
  );
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [terminalText, setTerminalText] = useState<string[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate boot sequence
    const sequence = [
      "Initializing handshake protocol...",
      "Validating bio-metric hash...",
      "Decrypting user-space environment...",
      "Uplink established. Welcome, Admin."
    ];

    let delay = 0;
    sequence.forEach((line, index) => {
      delay += 800;
      setTimeout(() => {
        setTerminalText(prev => [...prev, `> ${line}`]);
        if (index === sequence.length - 1) {
          setTimeout(onLogin, 800);
        }
      }, delay);
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
      
      {/* LEFT SIDE: Visual & Animation (Takes up remaining space) */}
      <div className="hidden lg:flex flex-1 relative bg-slate-950 items-center justify-center overflow-hidden">
        <AdvancedCyberAnimation />
      </div>

      {/* RIGHT SIDE: Dedicated Login Panel */}
      <div className="w-full lg:w-[500px] h-screen bg-slate-900/40 backdrop-blur-xl border-l border-white/5 flex flex-col relative z-20 shadow-[-20px_0_60px_rgba(0,0,0,0.6)]">
        
        {/* Subtle Gradient Mesh for Right Panel */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-12">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
                </div>
                <h1 className="text-5xl font-display font-bold text-white mb-3 tracking-wide">BluTor</h1>
                <p className="text-slate-400 text-sm font-light">Secure Intercept Dashboard Access</p>
            </div>

            {!isLoading ? (
                <form onSubmit={handleLogin} className="space-y-6">
                
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Operator ID</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                            <Terminal size={18} />
                        </div>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 text-sm rounded transition-all focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block p-3.5 pl-11 font-mono placeholder-slate-600 focus:bg-slate-900"
                            placeholder="SYS_ADMIN"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Security Token</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                            <Lock size={18} />
                        </div>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 text-sm rounded transition-all focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 block p-3.5 pl-11 font-mono placeholder-slate-600 focus:bg-slate-900"
                            placeholder="••••••••••••••"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition-colors group">
                         <div className="w-3.5 h-3.5 rounded border border-slate-700 bg-slate-900 group-hover:border-blue-500 transition-colors"></div>
                         <span>Remember Session</span>
                      </label>
                      <button type="button" className="hover:text-blue-400 transition-colors">Forgot Credentials?</button>
                </div>

                <button 
                    type="submit"
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-display font-semibold tracking-wide py-4 px-4 rounded shadow-lg shadow-blue-900/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 group"
                >
                    <span>INITIATE CONNECTION</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                </form>
            ) : (
                <div className="h-[360px] flex flex-col relative">
                   <div className="flex-1 bg-slate-950 rounded border border-slate-800 p-5 font-mono text-[11px] overflow-hidden relative shadow-inner">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                        <div className="space-y-3 relative z-10">
                            {terminalText.map((text, i) => (
                                <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-slate-600">_{new Date().getSeconds()}.{Math.floor(Math.random()*999)}</span>
                                    <span className="text-emerald-400">{text}</span>
                                </div>
                            ))}
                            <div className="w-2 h-4 bg-emerald-500 animate-pulse inline-block align-middle ml-1"></div>
                        </div>
                   </div>
                   
                   <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
                            <span>Decrypting Keys</span>
                            <span>{Math.min(100, terminalText.length * 25)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_10px_#10b981]" style={{ width: `${Math.min(100, terminalText.length * 25)}%` }}></div>
                        </div>
                   </div>
                </div>
            )}
        </div>
        
        {/* Footer Info */}
        <div className="p-8 border-t border-slate-800/50">
            <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase tracking-wider font-mono">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>Server Status: Online</span>
                <span className="ml-auto text-slate-700">v1.1.0-stable</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
