import React from 'react';
import { LayoutGrid, TrendingUp, ChevronLeft } from 'lucide-react';
import Alavancagem from './Alavancagem';

const BetManager = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-[#050505] animate-in fade-in relative z-10">
       <header className="p-8 flex justify-between items-center border-b border-white/5 bg-black/40">
          <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 bg-neutral-900 px-6 py-3 rounded-2xl active:scale-90 transition-transform">
            <ChevronLeft size={16} /> VOLTAR
          </button>
          <h1 className="text-2xl font-black italic text-red-500 tracking-tighter leading-none uppercase">BETMANAGER</h1>
       </header>
       
       <main className="max-w-7xl mx-auto">
          <Alavancagem />
       </main>

       <footer className="flex flex-col items-center justify-center py-20 px-10 text-center">
          <TrendingUp size={64} className="text-red-500 mb-8 opacity-20" />
          <h2 className="text-xl font-black uppercase mb-4 italic tracking-widest text-neutral-600">MÓDULO DE GESTÃO DE BANCA COMPOSTA</h2>
          <button onClick={onBack} className="bg-red-600/20 text-red-500 border border-red-500/20 px-10 py-5 rounded-2xl font-black uppercase shadow-2xl mt-10 active:scale-95 transition-transform hover:bg-red-600/30">
            VOLTAR AO HUB
          </button>
       </footer>
    </div>
  );
};

export default BetManager;
