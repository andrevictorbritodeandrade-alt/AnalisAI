import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  LayoutGrid,
  Calendar,
  Key,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Scouts from './components/Scouts';
import BetManager from './components/BetManager';
import PartidasDoDia from './components/PartidasDoDia';
import { theme } from './theme';

const TacticalField = ({ size = 24, className = "" }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="5" width="90" height="90" rx="4" strokeOpacity="0.8" />
      <line x1="5" y1="50" x2="95" y2="50" strokeOpacity="0.8" />
      <circle cx="50" cy="50" r="12" strokeOpacity="0.8" />
      <rect x="30" y="5" width="40" height="15" strokeOpacity="0.8" />
      <rect x="30" y="80" width="40" height="15" strokeOpacity="0.8" />
      {/* Tactical lines */}
      <path d="M20 30 L35 45" strokeOpacity="0.4" strokeDasharray="4 2" />
      <path d="M80 30 L65 45" strokeOpacity="0.4" strokeDasharray="4 2" />
      <circle cx="20" cy="30" r="2" fill="currentColor" fillOpacity="0.4" />
      <circle cx="80" cy="30" r="2" fill="currentColor" fillOpacity="0.4" />
      <path d="M50 60 L50 75" strokeOpacity="0.6" strokeWidth="3" />
      <path d="M45 70 L50 75 L55 70" strokeOpacity="0.6" strokeWidth="3" />
    </svg>
  </div>
);

const MarketFootball = ({ size = 24, className = "" }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    {/* Financial Arrows */}
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8" stroke="#10B981" />
      <path d="M17 7h4v4" stroke="#10B981" />
      <path d="M3 7l6 6 4-4 8 8" stroke="#EF4444" className="opacity-40" />
      <path d="M17 17h4v-4" stroke="#EF4444" className="opacity-40" />
    </svg>
    {/* Football */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-xl border-2 border-black">
      <svg width={size/2} height={size/2} viewBox="0 0 24 24" fill="black">
        <circle cx="12" cy="12" r="10" fill="white" />
        <path d="M12 2L15 5L12 8L9 5L12 2Z" />
        <path d="M12 22L15 19L12 16L9 19L12 22Z" />
        <path d="M2 12L5 15L8 12L5 9L2 12Z" />
        <path d="M22 12L19 15L16 12L19 9L22 12Z" />
      </svg>
    </div>
  </div>
);

const Menu = ({ onSelect }: { onSelect: (tab: 'analisai' | 'betManager' | 'partidas_do_dia') => void }) => (
  <div className="min-h-screen relative overflow-hidden font-sans text-white flex flex-col items-center justify-center p-6">
    {/* Background Image with Overlay - AI Generated Salvador Sepia Mix */}
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=2070&auto=format&fit=crop" 
        className="w-full h-full object-cover grayscale sepia brightness-[0.3] contrast-[1.2]"
        alt="Salvador Fonte Nova Tororó Sepia Football Mix"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95"></div>
      <div className="absolute inset-0 backdrop-blur-[2px]"></div>
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
    </div>

    <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
      
      <h2 className="text-4xl md:text-5xl font-black text-[#D4AF37] mt-24 mb-20 uppercase tracking-[0.4em] drop-shadow-[0_10px_20px_rgba(0,0,0,1)] text-center">
        MÓDULOS DE ELITE
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full px-8">
        <button 
          onClick={() => onSelect('analisai')} 
          className="group relative bg-[#0A0A0A]/80 border border-[#D4AF37]/40 rounded-[3rem] p-12 flex flex-col items-center active:scale-95 transition-all text-center hover:border-[#D4AF37] shadow-[0_40px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <TacticalField size={80} className="text-[#D4AF37]/50 mb-8 group-hover:scale-110 group-hover:text-[#D4AF37] transition-all duration-700" />
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">ANALISAI</h2>
          <p className="text-[10px] text-[#D4AF37]/70 uppercase mt-4 italic font-bold tracking-[0.4em]" style={{ fontFamily: '"Archivo Black", sans-serif' }}>Scouting Inteligente</p>
        </button>

        <button 
          onClick={() => onSelect('partidas_do_dia')} 
          className="group relative bg-[#0A0A0A]/80 border border-blue-500/40 rounded-[3rem] p-12 flex flex-col items-center active:scale-95 transition-all text-center hover:border-blue-500 shadow-[0_40px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Calendar size={80} className="text-blue-500/50 mb-8 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-700" />
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-blue-500">PARTIDAS</h2>
          <p className="text-[10px] text-blue-500/70 uppercase mt-4 italic font-bold tracking-[0.4em]" style={{ fontFamily: '"Archivo Black", sans-serif' }}>Jogos de Hoje</p>
        </button>

        <button 
          onClick={() => onSelect('betManager')} 
          className="group relative bg-[#0A0A0A]/80 border border-red-500/40 rounded-[3rem] p-12 flex flex-col items-center active:scale-95 transition-all text-center hover:border-red-500 shadow-[0_40px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <MarketFootball size={80} className="mb-8 group-hover:scale-110 transition-all duration-700" />
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-red-500">Bet Manager</h2>
          <p className="text-[10px] text-red-500/70 uppercase mt-4 italic font-bold tracking-[0.4em]" style={{ fontFamily: '"Archivo Black", sans-serif' }}>Gestão de Banca</p>
        </button>
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeApp, setActiveApp] = useState<'menu' | 'analisai' | 'betManager' | 'partidas_do_dia'>('menu');
  const [requestCount, setRequestCount] = useState(() => Number(localStorage.getItem('api_quota_final_v2') || 0));

  const currentFormattedDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
  }, []);

  useEffect(() => {
    // Sync request count from localStorage
    const interval = setInterval(() => {
      const count = Number(localStorage.getItem('api_quota_final_v2') || 0);
      setRequestCount(count);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020305] text-white font-sans selection:bg-[#D9A520] relative overflow-hidden">
      
      <style dangerouslySetInnerHTML={{ __html: `
        *::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        .bg-pattern { background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9a520' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
        .glass-gold { background: rgba(217, 165, 32, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(217, 165, 32, 0.1); }
        .gold-bg { background: linear-gradient(135deg, #D9A520 0%, #A67C00 100%); }
        .gold-text { color: #D9A520; }
      `}} />

      <div className="fixed inset-0 bg-pattern opacity-40 pointer-events-none" />

      {/* --- STATUS BAR --- */}
      <div className="fixed top-0 w-full bg-black/90 backdrop-blur-lg border-b border-white/5 py-2 px-6 flex justify-between items-center z-[100] text-[8px] font-black uppercase italic tracking-widest leading-none">
         <div className="flex items-center gap-4">
            <span className="gold-text flex items-center gap-1"><Key size={10}/> API: def74ab4...</span>
            <span className="text-gray-400">QUOTA: <span className="gold-text">{requestCount}/100</span></span>
         </div>
         <div className="text-gray-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
            <Calendar size={10} className="gold-text"/>
            {currentFormattedDate}
         </div>
         <div className="flex items-center gap-2 text-green-500">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_green]" /> SISTEMA ONLINE
         </div>
      </div>

      <AnimatePresence mode="wait">
        {activeApp === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Menu onSelect={(tab) => setActiveApp(tab)} />
          </motion.div>
        )}

        {activeApp === 'analisai' && (
          <motion.div
            key="analisai"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Scouts onBack={() => setActiveApp('menu')} />
          </motion.div>
        )}

        {activeApp === 'partidas_do_dia' && (
          <motion.div
            key="partidas_do_dia"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-[#050505] relative z-10 pt-10"
          >
            <PartidasDoDia onBack={() => setActiveApp('menu')} />
          </motion.div>
        )}

        {activeApp === 'betManager' && (
          <motion.div
            key="betManager"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <BetManager onBack={() => setActiveApp('menu')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
