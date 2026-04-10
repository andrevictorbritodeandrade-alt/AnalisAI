import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, RotateCcw, Trophy, 
  Target, Banknote, AlertCircle, Scissors, 
  ArrowRightCircle, Star, Shield, 
  Gamepad2, ClipboardList, ChevronDown, CheckCircle2,
  XCircle, CheckCircle, Loader2, Plus, Trash2, ChevronUp,
  User, History, PlusCircle, Clock, Calendar as CalendarIcon, Coins, ArrowBigRightDash, 
  ArrowRight, Upload
} from 'lucide-react';
import { extractBetFromImage } from '../services/geminiService';

import { theme } from '../theme';

// --- Assets Visuais de Casas de Aposta ---
const BetanoIcon = () => (
  <div className="flex items-center gap-1.5 bg-[#FF7324]/10 px-2 py-0.5 rounded-lg border border-[#FF7324]/20 shadow-sm">
    <div className="w-3 h-3 bg-[#FF7324] rounded-full flex items-center justify-center">
      <span className="text-[8px] text-white font-black">B</span>
    </div>
    <span className="text-[8px] font-black text-[#FF7324] tracking-tighter uppercase">Betano</span>
  </div>
);

const EstrelaIcon = () => (
  <div className="flex items-center gap-1.5 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20 shadow-sm">
    <Star size={10} className="fill-amber-500 text-amber-600" />
    <span className="text-[8px] font-black text-amber-600 tracking-tighter uppercase">Estrela</span>
  </div>
);

const SportingbetIcon = () => (
  <div className="flex items-center gap-1.5 bg-[#003272]/10 px-2 py-0.5 rounded border border-[#003272]/20 shadow-sm">
    <div className="w-3 h-3 bg-[#003272] rounded-sm flex items-center justify-center">
      <span className="text-[8px] text-white font-black">S</span>
    </div>
    <span className="text-[8px] font-black text-[#003272] tracking-tighter uppercase">Sporting</span>
  </div>
);

const VupibetIcon = () => (
  <div className="flex items-center gap-1.5 bg-purple-600/10 px-2 py-0.5 rounded-lg border border-purple-600/20 shadow-sm">
    <div className="w-3 h-3 bg-purple-600 rounded-full flex items-center justify-center">
      <span className="text-[8px] text-white font-black">V</span>
    </div>
    <span className="text-[8px] font-black text-purple-600 tracking-tighter uppercase">Vupibet</span>
  </div>
);

// --- Utilitários de Formatação ---
const fCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const nToWords = (n: number) => {
  if (n <= 0) return "Zero reais";
  const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const teens = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const hundreds = ["", "cem", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  const fmt = (num: number) => {
    let out = "";
    if (num === 100) return "cem";
    if (num > 100) { out += (num < 200 ? "cento" : hundreds[Math.floor(num / 100)]); num %= 100; if (num > 0) out += " e "; }
    if (num >= 20) { out += tens[Math.floor(num / 10)]; num %= 10; if (num > 0) out += " e " + units[num]; }
    else if (num >= 10) { out += teens[num - 10]; }
    else if (num > 0) { out += units[num]; }
    return out;
  };

  const intP = Math.floor(n);
  const decP = Math.round((n - intP) * 100);
  let res = "";
  if (intP > 0) {
    if (intP >= 1000) {
      const thou = Math.floor(intP / 1000); const rem = intP % 1000;
      res += (thou === 1 ? "" : fmt(thou)) + " mil";
      if (rem > 0) res += (rem < 100 ? " e " : " ") + fmt(rem);
    } else { res += fmt(intP); }
    res += integerPartWord(intP);
  }
  if (decP > 0) { if (res !== "") res += " e "; res += fmt(decP); res += decP === 1 ? " centavo" : " centavos"; }
  return res.charAt(0).toUpperCase() + res.slice(1);
};

const integerPartWord = (n: number) => n === 1 ? " real" : " reais";

const getOddRisk = (odd: number, isMultiple: boolean) => {
  if (isMultiple) return { label: 'Múltipla', color: 'text-white', bg: 'bg-white/10' };
  if (odd <= 1.30) return { label: 'Risco Baixo', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' };
  if (odd <= 1.40) return { label: 'Risco Leve', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' };
  if (odd <= 1.50) return { label: 'Risco Moderado', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' };
  if (odd <= 1.60) return { label: 'Risco Alto', color: 'text-[#F97316]', bg: 'bg-[#F97316]/10' };
  return { label: 'Alto Risco', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' };
};

const HOUSES = [
  'bet365',
  'betano',
  'betnacional',
  'estrelabet',
  'h2bet',
  'pixbet',
  'sportingbet',
  'superbet',
  'vaidebet',
  'vupibet'
];

const MONTHS = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
const DAYS_OF_WEEK = ["DOMINGO", "SEGUNDA-FEIRA", "TERÇA-FEIRA", "QUARTA-FEIRA", "QUINTA-FEIRA", "SEXTA-FEIRA", "SÁBADO"];

const Alavancagem = () => {
  const [curMonth, setCurMonth] = useState(new Date().getMonth());
  const [history, setHistory] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [expandedBet, setExpandedBet] = useState<number[] | null>(null);
  const [uploadingImage, setUploadingImage] = useState<{dayIdx: number, betIdx: number | 'day'} | null>(null);
  const [showHouseSelector, setShowHouseSelector] = useState<{dayIdx: number, betIdx: number | 'day'} | null>(null);
  const [selectedHouse, setSelectedHouse] = useState('betano');

  const dayRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const now = new Date();
  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayDayName = DAYS_OF_WEEK[now.getDay()];
  const todayMonthName = MONTHS[now.getMonth()];

  useEffect(() => {
    if (!loading && curMonth === todayMonth && dayRefs.current[todayDate]) {
      setTimeout(() => {
        dayRefs.current[todayDate]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1000); 
    }
  }, [loading, curMonth, todayDate, todayMonth]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('betManagerHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    } else {
      const initialDays = Array.from({ length: 31 }, (_, i) => ({
        day: i + 1, 
        status: 'pending', 
        withdrawal: 0, 
        protectCapital: false, 
        balances: HOUSES.reduce((acc, h) => ({...acc, [h]: 0}), {}), 
        bets: []
      }));
      const initialData = { [`${curMonth}_2026`]: { days: initialDays, settings: { stake: 0, odd: 1.40 } } };
      setHistory(initialData);
      localStorage.setItem('betManagerHistory', JSON.stringify(initialData));
    }
    setLoading(false);
  }, [curMonth]);

  const monthKey = `${curMonth}_2026`;
  const mData = history[monthKey] || { 
    days: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, status: 'pending', withdrawal: 0, protectCapital: false, balances: HOUSES.reduce((acc, h) => ({...acc, [h]: 0}), {}), bets: [] })),
    settings: { stake: 4.70, odd: 1.40 }
  };

  const calcDays = useMemo(() => {
    let results = []; 
    let nextStake = 0; 
    let foundStart = false;
    
    // Sugestões por casa
    let lastHouseWins: any[] = [];

    for (let i = 0; i < 31; i++) {
      const d = mData.days[i];
      const dayNum = i + 1;
      const isToday = dayNum === todayDate && curMonth === todayMonth;
      const hasBets = d.bets && d.bets.length > 0;

      if (!foundStart && (hasBets || isToday)) {
          foundStart = true;
          nextStake = hasBets ? d.bets.reduce((acc: number, b: any) => acc + (b.stake || 0), 0) : mData.settings.stake;
      }

      let currentStake = d.manualStake !== undefined ? d.manualStake : (hasBets ? d.bets.reduce((acc: number, b: any) => acc + (b.stake || 0), 0) : (foundStart ? nextStake : 0));
      
      let totalReturn = 0;
      let currentDayWins: any[] = [];

      if (hasBets) {
        totalReturn = d.bets.reduce((acc: number, b: any) => {
          if (b.status === 'won') {
            const ret = (b.stake || 0) * (b.odd || 1);
            currentDayWins.push({ house: b.house, amount: ret, odd: b.odd });
            return acc + ret;
          }
          return acc;
        }, 0);
      } else {
        totalReturn = currentStake * mData.settings.odd;
      }

      const profit = totalReturn - currentStake;
      const withdrawal = d.withdrawal || 0;

      results.push({ 
        ...d, 
        stake: currentStake, 
        ret: totalReturn, 
        profit,
        suggestedStake: nextStake,
        suggestedReturn: nextStake * mData.settings.odd
      });

      // Se o dia teve vitórias, o próximo plano de ação será baseado nelas
      if (hasBets && currentDayWins.length > 0) {
          lastHouseWins = currentDayWins;
      }

      if (d.status === 'lost') {
        nextStake = 0;
        lastHouseWins = [];
      } else if (foundStart) {
        if (d.protectCapital) nextStake = Math.max(0, profit - withdrawal);
        else nextStake = Math.max(0, totalReturn - withdrawal);
      }
    }
    return results;
  }, [mData, todayDate, todayMonth, curMonth]);

  const stats = useMemo(() => ({
    totalW: mData.days.reduce((a: number, d: any) => a + (d.withdrawal || 0), 0),
    proj: calcDays[30].ret
  }), [mData, calcDays]);

  const generateMonthlyReport = () => {
    const report: any = {};
    HOUSES.forEach(h => report[h] = { entradas: 0, reaposta: 0, perda: 0, ganho: 0 });
    let totalEntradas = 0;
    let totalReaposta = 0;
    let totalPerda = 0;
    let totalGanho = 0;

    mData.days.forEach((d: any) => {
      // 1. Entradas (Roulette/Earnings)
      HOUSES.forEach(h => {
        const val = d.balances?.[h] || 0;
        report[h].entradas += val;
        totalEntradas += val;
      });

      // 2. Bets
      d.bets?.forEach((b: any) => {
        const h = b.house.toLowerCase();
        if (!report[h]) return;

        // Reaposta
        report[h].reaposta += (b.stake || 0);
        totalReaposta += (b.stake || 0);

        // Perda
        if (b.status === 'lost') {
          report[h].perda += (b.stake || 0);
          totalPerda += (b.stake || 0);
        }

        // Ganho
        if (b.status === 'won') {
          report[h].ganho += (b.profit || 0);
          totalGanho += (b.profit || 0);
        }
      });
    });

    let reportStr = `Resumo Mensal - ${MONTHS[curMonth]}\n---------------------------\n`;
    
    HOUSES.forEach(h => {
      if (report[h].entradas > 0 || report[h].reaposta > 0 || report[h].perda > 0 || report[h].ganho > 0) {
        reportStr += `\n${h.toUpperCase()}:
  - Entradas (Roleta): ${fCurrency(report[h].entradas)}
  - Reaposta: ${fCurrency(report[h].reaposta)}
  - Ganhos: ${fCurrency(report[h].ganho)}
  - Perdas: ${fCurrency(report[h].perda)}`;
      }
    });

    reportStr += `\n\n---------------------------
APANHADO GERAL:
- Total Entradas (Roleta): ${fCurrency(totalEntradas)}
- Total Reaposta: ${fCurrency(totalReaposta)}
- Total Ganhos: ${fCurrency(totalGanho)}
- Total Perdas: ${fCurrency(totalPerda)}
- Saldo Final: ${fCurrency(totalGanho - totalPerda)}`;

    alert(reportStr);
  };

  const updDay = (idx: number, up: any) => {
    const h = { ...history }; const ds = [...mData.days];
    ds[idx] = { ...ds[idx], ...up };
    h[monthKey] = { ...mData, days: ds };
    setHistory(h); 
    localStorage.setItem('betManagerHistory', JSON.stringify(h));
  };

  const updBetStatus = (dIdx: number, bIdx: number, status: string) => {
    const b = [...mData.days[dIdx].bets];
    b[bIdx].status = status;
    updDay(dIdx, { bets: b });
  };

  const addApril9thBet = () => {
    const dIdx = 8; // April 9th is index 8 (0-indexed)
    const newBet = {
      house: 'EstrelaBet',
      ticketNumber: '4811515549',
      stake: 0.96,
      odd: 4.74,
      status: 'pending',
      isMultiple: true,
      match: 'Freiburg/Celta, Bologna/Aston, Porto/Nottingham',
      selections: 'Freiburg vs Celta: Escanteios > 6.5, Gols > 1.5; Bologna vs Aston: Escanteios > 6.5, Gols > 1.5; Porto vs Nottingham: Gols > 1.5, Escanteios > 6.5'
    };
    const b = [...(mData.days[dIdx].bets || []), newBet];
    updDay(dIdx, { bets: b });
    alert("Aposta do dia 09/04 adicionada com sucesso!");
  };

  const handleImageUpload = async (file: File, dIdx: number, bIdx: number | 'day', house: string) => {
    setUploadingImage({ dayIdx: dIdx, betIdx: bIdx });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const extractedData = await extractBetFromImage(base64String, file.type);
        
        if (extractedData) {
          if (bIdx === 'day') {
            // Extraindo valor para iniciar o dia
            updDay(dIdx, { manualStake: extractedData.stake || 0 });
          } else {
            const b = [...mData.days[dIdx].bets];
            b[bIdx] = {
              ...b[bIdx],
              house: house || extractedData.house || b[bIdx].house,
              ticketNumber: extractedData.ticketNumber || '',
              stake: extractedData.stake || b[bIdx].stake,
              returnAmount: extractedData.returnAmount || 0,
              odd: extractedData.odd || b[bIdx].odd,
              profit: extractedData.profit || 0,
              selections: extractedData.selections || '',
              match: extractedData.selections ? extractedData.selections.substring(0, 30) + '...' : b[bIdx].match
            };
            updDay(dIdx, { bets: b });
          }
        }
        setUploadingImage(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erro ao extrair dados da imagem. Tente novamente.");
      setUploadingImage(null);
    }
  };

  if (loading) return <div className="h-96 bg-neutral-950 flex items-center justify-center rounded-b-2xl"><Loader2 className="animate-spin text-[#D4AF37]" size={40} /></div>;

  return (
    <div className="alavancagem-container bg-[#050505] text-white font-sans selection:bg-[#D4AF37]/30 pb-10 rounded-b-2xl">
      
      {/* HEADER (Baseado na sua imagem) */}
      <header className="px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center border-2 border-[#D4AF37]/20 shadow-[0_8px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
              <div className="flex flex-col items-center">
                 <TrendingUp size={24} className="text-[#D4AF37]" strokeWidth={3} />
                 <div className="flex gap-1">
                    <div className="w-4 h-4 bg-[#D4AF37] rounded-sm flex items-center justify-center"><div className="w-1 h-1 bg-[#0A0A0A] rounded-full"></div></div>
                    <div className="w-4 h-4 bg-[#D4AF37] rounded-sm"></div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col">
              <h1 className="text-2xl font-black italic tracking-tighter text-[#D4AF37]/70 flex items-baseline leading-none" style={{ fontFamily: theme.fonts.display }}>
                 BET<span className="text-white font-black">MANAGER</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                 <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">
                    {todayDayName}, {todayDate} DE {todayMonthName}
                 </p>
                 <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_10px_#D4AF37]"></div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-5">
           <button onClick={generateMonthlyReport} className="bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-full border border-white/5 transition-all">
              Relatório Mensal
           </button>
           <div className="bg-black/60 rounded-[2rem] p-1 border border-[#D4AF37]/10 shadow-xl">
              <div className="bg-neutral-900 rounded-[1.8rem] px-8 py-3 shadow-inner flex flex-col items-center">
                 <span className="text-[8px] text-neutral-400 font-black uppercase tracking-[0.2em] mb-1">PROJEÇÃO FINAL</span>
                 <span className="text-2xl font-black text-[#D4AF37] leading-none tracking-tighter">{fCurrency(stats.proj)}</span>
              </div>
           </div>
           <div className="w-14 h-14 rounded-full border-4 border-neutral-800 shadow-xl bg-gradient-to-b from-neutral-800 to-neutral-900 flex items-center justify-center">
              <User size={28} className="text-neutral-500" />
           </div>
        </div>
        <button 
          onClick={addApril9thBet}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-4 rounded-xl text-xs uppercase tracking-widest"
        >
          Add Aposta 09/04
        </button>
      </header>

      {/* Meses */}
      <nav className="px-6 mb-10 overflow-x-auto no-scrollbar">
        <div className="flex bg-black/40 p-2 rounded-[2.5rem] border border-white/5 shadow-sm gap-2">
           {MONTHS.map((m, i) => (
             <button key={m} onClick={() => setCurMonth(i)} className={`px-10 py-3 rounded-[2rem] text-[10px] font-black uppercase transition-all whitespace-nowrap ${curMonth === i ? 'bg-[#D4AF37] text-[#0A0A0A] shadow-md border-b-2 border-[#B8860B]' : 'text-neutral-500 hover:text-white'}`}>
                {m}
             </button>
           ))}
        </div>
      </nav>

      <main className="px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-neutral-900/50 rounded-[2.5rem] border border-[#D4AF37]/10 p-8 shadow-2xl shadow-black/50">
             <h3 className="text-[11px] font-black uppercase text-neutral-400 mb-8 flex items-center gap-3 border-b-2 border-white/5 pb-4 tracking-widest">
               <History size={18} className="text-[#D4AF37]" /> SETUP ATUAL
             </h3>
             <div className="space-y-8">
                <div className="bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner">
                   <label className="text-[10px] text-neutral-400 font-black uppercase block mb-2 text-center tracking-widest">BANCA BASE</label>
                   <input type="number" value={mData.settings.stake} onChange={(e) => { const h = {...history}; h[monthKey] = {...mData, settings: {...mData.settings, stake: Number(e.target.value)}}; setHistory(h); localStorage.setItem('betManagerHistory', JSON.stringify(h)); }} className="w-full bg-transparent text-[#D4AF37] font-black text-3xl text-center focus:outline-none" />
                </div>
                <div className="bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner">
                   <label className="text-[10px] text-neutral-400 font-black uppercase block mb-2 text-center tracking-widest">ODD PADRÃO</label>
                   <input type="number" step="0.1" value={mData.settings.odd} onChange={(e) => { const h = {...history}; h[monthKey] = {...mData, settings: {...mData.settings, odd: Number(e.target.value)}}; setHistory(h); localStorage.setItem('betManagerHistory', JSON.stringify(h)); }} className="w-full bg-transparent text-[#D4AF37] font-black text-3xl text-center focus:outline-none" />
                </div>
             </div>
          </div>
          <button onClick={() => dayRefs.current[todayDate]?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="w-full py-6 bg-neutral-900 border border-white/10 rounded-[2.5rem] text-[12px] font-black uppercase tracking-widest text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all flex items-center justify-center gap-4 shadow-2xl">
            <Clock size={20} className="text-[#D4AF37]" /> IR PARA HOJE
          </button>
        </aside>

        {/* Grid Principal */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
           {calcDays.map((d, i) => {
              const isToday = d.day === todayDate && curMonth === todayMonth;
              const totalSuggestedReturn = d.suggestedBets.reduce((acc: number, b: any) => acc + (b.amount * b.odd), 0);

               return (
                <div key={i} ref={el => dayRefs.current[d.day] = el} className={`rounded-[3.5rem] border-4 transition-all flex flex-col overflow-hidden relative shadow-2xl ${d.status === 'won' ? 'bg-emerald-950/20 border-emerald-900/50' : d.status === 'lost' ? 'bg-red-950/20 border-red-900/50' : isToday ? 'bg-neutral-900 border-[#D4AF37] ring-8 ring-[#D4AF37]/10 scale-[1.03] z-10 shadow-[#D4AF37]/20' : 'bg-neutral-900/50 border-white/5'}`}>
                  
                  <div className={`p-8 flex justify-between items-center border-b-2 ${isToday ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'border-white/5'}`}>
                     <span className={`text-[12px] font-black px-6 py-2 rounded-full shadow-md ${d.status === 'won' ? 'bg-emerald-600 text-white' : d.status === 'lost' ? 'bg-red-600 text-white' : isToday ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'bg-black/50 text-neutral-400'}`}>
                       {isToday ? 'HOJE' : `DIA ${d.day < 10 ? '0' : ''}${d.day}`}
                     </span>
                     <div className="flex gap-3">
                        <button onClick={() => updDay(i, { protectCapital: !d.protectCapital })} className={`p-3 rounded-full transition-all ${d.protectCapital ? 'bg-[#D4AF37]/20 text-[#D4AF37] shadow-inner border border-[#D4AF37]/30' : 'bg-black/40 text-neutral-500 border border-white/5'}`}>
                           <Shield size={22} />
                        </button>
                        <button onClick={() => updDay(i, { status: 'pending' })} className="p-3 rounded-full bg-black/40 text-neutral-500 hover:text-white border border-white/5 transition-all">
                           <RotateCcw size={22} />
                        </button>
                     </div>
                  </div>

                  <div className="p-10 flex-1 space-y-8">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer" onClick={() => {
                           const el = document.getElementById(`balances-${i}`);
                           if (el) el.classList.toggle('hidden');
                        }}>
                           <span>SALDOS DIÁRIOS (CASAS)</span>
                           <ChevronDown size={16} />
                        </div>
                        <div id={`balances-${i}`} className="hidden space-y-2 bg-black/20 p-4 rounded-2xl border border-white/5">
                           {HOUSES.map(house => (
                              <div key={house} className="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-white/5">
                                 <span className="text-[10px] font-black text-neutral-400 uppercase">{house}</span>
                                 <input 
                                    type="number" 
                                    value={d.balances?.[house] || ''} 
                                    onChange={(e) => {
                                       const newBalances = { ...(d.balances || {}), [house]: Number(e.target.value) };
                                       updDay(i, { balances: newBalances });
                                    }}
                                    className="bg-transparent text-white font-mono text-sm text-right focus:outline-none w-24" 
                                    placeholder="0.00"
                                 />
                              </div>
                           ))}
                        </div>
                     </div>

                     {d.bets && d.bets.length > 0 ? (
                        <div className="space-y-5">
                           <div className="flex items-center justify-between text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em]">
                              <span>REGISTOS DE ENTRADA</span>
                              <button onClick={() => { const b=d.bets||[]; updDay(i, {bets: [...b, {match:'NOVA ENTRADA', house:'Betano', odd:1.40, stake:0, status:'pending'}]}); }} className="text-[#D4AF37] hover:text-[#E2C275] flex items-center gap-1 font-black"><PlusCircle size={16} /> ADD</button>
                           </div>
                           <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                              {d.bets.map((bet: any, bIdx: number) => {
                                 const isExpanded = expandedBet && expandedBet[0] === i && expandedBet[1] === bIdx;
                                 const betReturn = (bet.stake || 0) * (bet.odd || 0);
                                 const risk = getOddRisk(bet.odd || 0, bet.isMultiple);
                                 return (
                                    <div key={bIdx} className={`rounded-[2.5rem] border-2 transition-all shadow-sm ${bet.status === 'won' ? 'bg-neutral-900 border-emerald-900/50' : bet.status === 'lost' ? 'bg-neutral-900 border-red-900/50' : 'bg-black/40 border-white/5'}`}>
                                      <div className="p-6 space-y-4">
                                         {/* Header: House and Odd */}
                                         <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <div className="flex items-center gap-2">
                                               {bet.house === 'Betano' ? <BetanoIcon /> : bet.house === 'EstrelaBet' ? <EstrelaIcon /> : bet.house === 'Vupibet' ? <VupibetIcon /> : <SportingbetIcon />}
                                            </div>
                                            <span className="text-sm font-black text-emerald-500 font-mono">@ {bet.odd}</span>
                                         </div>
                                         
                                         {/* Values: Stake and Return */}
                                         <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col items-center text-center">
                                               <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest mb-1">Valor Apostado</span>
                                               <span className="text-lg font-black text-white leading-none">{fCurrency(bet.stake)}</span>
                                            </div>
                                            <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col items-center text-center">
                                               <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest mb-1">Retorno Potencial</span>
                                               <span className="text-lg font-black text-[#D4AF37] leading-none">{fCurrency(betReturn)}</span>
                                            </div>
                                         </div>

                                         {/* Selections */}
                                         <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                            <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest block mb-2 text-center">Seleções do Bilhete</span>
                                            <p className="text-xs font-bold text-neutral-300 whitespace-pre-wrap leading-relaxed text-center">
                                               {bet.selections || bet.match || 'Nenhuma seleção detalhada.'}
                                            </p>
                                         </div>

                                         {/* Actions (Expand for edit) */}
                                         <button onClick={() => setExpandedBet(isExpanded ? null : [i, bIdx])} className="w-full py-3 text-[10px] font-black uppercase text-neutral-500 hover:text-white flex items-center justify-center gap-2 transition-colors border-t border-white/5 mt-2">
                                            {isExpanded ? 'OCULTAR EDIÇÃO' : 'EDITAR APOSTA'} <ChevronDown size={14} className={isExpanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                         </button>
                                      </div>
                                      {isExpanded && (
                                         <div className="px-6 pb-8 space-y-5 animate-in fade-in slide-in-from-top-2 border-t border-white/5 bg-neutral-900 rounded-b-[2.5rem]">
                                            <div className="grid grid-cols-2 gap-4 mt-5">
                                               <button onClick={() => updBetStatus(i, bIdx, 'won')} className={`py-4 rounded-3xl text-[10px] font-black uppercase transition-all shadow-md ${bet.status === 'won' ? 'bg-emerald-600 text-white shadow-emerald-900/50' : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-white'}`}>GANHOU ✅</button>
                                               <button onClick={() => updBetStatus(i, bIdx, 'lost')} className={`py-4 rounded-3xl text-[10px] font-black uppercase transition-all shadow-md ${bet.status === 'lost' ? 'bg-red-600 text-white shadow-red-900/50' : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-white'}`}>PERDEU ❌</button>
                                            </div>

                                            <div className="bg-black/40 border border-white/5 p-4 rounded-3xl shadow-inner space-y-3">
                                               <div className="flex justify-between items-center">
                                                  <label className="text-[8px] text-neutral-500 font-black uppercase">TIPO DE APOSTA</label>
                                                  <div className="flex gap-2">
                                                     <button onClick={() => { const b=[...d.bets]; b[bIdx].isMultiple=false; updDay(i, {bets: b}); }} className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${!bet.isMultiple ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'bg-neutral-800 text-neutral-500'}`}>Simples</button>
                                                     <button onClick={() => { const b=[...d.bets]; b[bIdx].isMultiple=true; updDay(i, {bets: b}); }} className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${bet.isMultiple ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'bg-neutral-800 text-neutral-500'}`}>Múltipla</button>
                                                  </div>
                                               </div>
                                               <div className="flex justify-between items-center border-t border-white/5 pt-3">
                                                  <label className="text-[8px] text-neutral-500 font-black uppercase">CASA DE APOSTA</label>
                                                  <select value={bet.house?.toLowerCase() || 'betano'} onChange={(e) => { const b=[...d.bets]; b[bIdx].house=e.target.value; updDay(i, {bets: b}); }} className="bg-transparent text-white font-black text-sm focus:outline-none text-right">
                                                     {HOUSES.map(h => <option key={h} value={h} className="bg-neutral-900">{h.toUpperCase()}</option>)}
                                                  </select>
                                               </div>
                                               <div className="flex justify-between items-center border-t border-white/5 pt-3">
                                                  <label className="text-[8px] text-neutral-500 font-black uppercase">Nº BILHETE</label>
                                                  <input type="text" value={bet.ticketNumber || ''} onChange={(e) => { const b=[...d.bets]; b[bIdx].ticketNumber=e.target.value; updDay(i, {bets: b}); }} className="bg-transparent text-white font-mono text-sm text-right focus:outline-none w-1/2" placeholder="Ex: 123456789" />
                                               </div>
                                               <div className="flex flex-col border-t border-white/5 pt-3">
                                                  <label className="text-[8px] text-neutral-500 font-black uppercase mb-1">SELEÇÕES / MERCADOS</label>
                                                  <textarea value={bet.selections || ''} onChange={(e) => { const b=[...d.bets]; b[bIdx].selections=e.target.value; b[bIdx].match=e.target.value.substring(0, 30)+'...'; updDay(i, {bets: b}); }} className="bg-transparent text-white text-xs focus:outline-none w-full resize-none" rows={2} placeholder="Ex: Flamengo x Vasco + 9.5 cantos" />
                                               </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                               <div className="bg-black/40 border border-white/5 p-4 rounded-3xl shadow-inner text-right">
                                                  <label className="text-[8px] text-neutral-500 font-black block mb-1">STAKE</label>
                                                  <input type="number" value={bet.stake || ''} onChange={(e) => { const b=[...d.bets]; b[bIdx].stake=Number(e.target.value); updDay(i, {bets: b}); }} className="w-full bg-transparent text-white font-black text-base text-right focus:outline-none" />
                                               </div>
                                               <div className="bg-black/40 border border-white/5 p-4 rounded-3xl shadow-inner text-right">
                                                  <label className="text-[8px] text-neutral-500 font-black block mb-1">ODD</label>
                                                  <input type="number" step="0.01" value={bet.odd || ''} onChange={(e) => { const b=[...d.bets]; b[bIdx].odd=Number(e.target.value); updDay(i, {bets: b}); }} className="w-full bg-transparent text-emerald-500 font-black text-base text-right focus:outline-none" />
                                               </div>
                                            </div>
                                            
                                            <div className="flex gap-3">
                                               <button 
                                                  onClick={() => setShowHouseSelector({ dayIdx: i, betIdx: bIdx })}
                                                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-black uppercase rounded-2xl border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                               >
                                                  {uploadingImage?.dayIdx === i && uploadingImage?.betIdx === bIdx ? (
                                                     <><Loader2 size={14} className="animate-spin" /> LENDO...</>
                                                  ) : (
                                                     <><Upload size={14} /> LER PRINT</>
                                                  )}
                                               </button>
                                               <button onClick={() => { const b=d.bets.filter((_: any, idx: number)=>idx!==bIdx); updDay(i, {bets:b}); }} className="flex-1 py-3 bg-red-950/30 text-red-500 hover:bg-red-900/50 text-[10px] font-black uppercase rounded-2xl border border-red-900/50 transition-colors">EXCLUIR</button>
                                            </div>
                                         </div>
                                      )}
                                   </div>
                                 );
                              })}
                           </div>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center py-8 bg-[#D4AF37]/5 border-4 border-dashed border-[#D4AF37]/20 rounded-[3rem] shadow-inner relative overflow-hidden">
                           <ArrowBigRightDash size={48} className="mb-4 text-[#D4AF37] animate-pulse" strokeWidth={3} />
                           <h4 className="text-[14px] font-black uppercase text-[#D4AF37] tracking-widest mb-6 border-b border-[#D4AF37]/20 pb-2 font-mecanico">PLANO DE ALAVANCAGEM</h4>
                           
                           <div className="w-full px-8 space-y-4">
                              <div className="bg-neutral-900 rounded-3xl p-6 shadow-lg border border-white/5 flex flex-col items-center text-center">
                                 <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">Entrada Sugerida</span>
                                 <span className="text-3xl font-black text-white mb-4">{fCurrency(d.suggestedStake)}</span>
                                 
                                 <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">Meta de Retorno (@ {mData.settings.odd})</span>
                                 <span className="text-2xl font-black text-[#D4AF37]">{fCurrency(d.suggestedReturn)}</span>
                              </div>
                           </div>
                           <p className="mt-6 text-[10px] font-bold text-[#D4AF37] uppercase italic px-10 text-center leading-tight">Adicione suas apostas reais para atualizar o plano.</p>
                        </div>
                     )}
                  </div>

                  {/* Footer Card */}
                  <div className={`p-10 border-t-4 space-y-8 ${isToday ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-black/20 border-white/5'}`}>
                     <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end border-b-2 border-white/5 pb-6">
                           <div className="flex flex-col">
                              <p className="text-[10px] text-neutral-500 font-black uppercase mb-1 tracking-widest">ENTRADA DO DIA</p>
                              <div className="flex items-center gap-2">
                                 <input 
                                    type="number" 
                                    value={d.stake || ''} 
                                    onChange={(e) => updDay(i, { manualStake: Number(e.target.value) })}
                                    className="bg-transparent text-2xl font-black text-white leading-none tracking-tighter focus:outline-none w-32" 
                                    placeholder="0.00"
                                 />
                                 <button 
                                    onClick={() => setShowHouseSelector({ dayIdx: i, betIdx: 'day' })}
                                    className="p-2 bg-neutral-800 rounded-lg border border-white/5 hover:bg-neutral-700 transition-all"
                                    title="Extrair do Print"
                                 >
                                    <Upload size={14} className="text-[#D4AF37]" />
                                 </button>
                              </div>
                              <span className="text-[8px] text-neutral-500 italic font-bold uppercase mt-2">{nToWords(d.stake)}</span>
                           </div>
                           <div className="text-right flex flex-col">
                              <p className="text-[10px] text-neutral-500 font-black uppercase mb-1 tracking-widest">RETORNO GANHO</p>
                              <p className={`text-2xl font-black tracking-tighter leading-none ${d.status === 'won' ? 'text-emerald-500 drop-shadow-md' : 'text-white'}`}>{fCurrency(d.ret)}</p>
                              <span className="text-[8px] text-neutral-500 italic font-bold uppercase mt-2">{nToWords(d.ret)}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                           <button onClick={() => updDay(i, { status: 'won' })} className={`py-6 rounded-[2.5rem] text-[14px] font-black uppercase transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 ${d.status === 'won' ? 'bg-emerald-600 text-white shadow-emerald-900/50' : 'bg-neutral-900 text-emerald-500 border-2 border-emerald-900/50 hover:bg-emerald-900/20'}`}><CheckCircle size={28} /> GREEN</button>
                           <button onClick={() => updDay(i, { status: 'lost' })} className={`py-6 rounded-[2.5rem] text-[14px] font-black uppercase transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 ${d.status === 'lost' ? 'bg-red-600 text-white shadow-red-900/50' : 'bg-neutral-900 text-red-500 border-2 border-red-900/50 hover:bg-red-900/20'}`}><XCircle size={28} /> RED</button>
                        </div>
                     </div>

                     <div className="pt-8 border-t-4 border-dotted border-white/5">
                        <div className="flex justify-between items-center mb-4 leading-none px-2">
                           <span className="flex items-center gap-2 text-[11px] font-black uppercase text-[#D4AF37] tracking-[0.2em]"><Scissors size={18} /> SANGRIA MANUAL</span>
                           {d.withdrawal > 0 && <span className="text-[14px] font-black text-[#D4AF37] italic">-{fCurrency(d.withdrawal)}</span>}
                        </div>
                        <div className="bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner p-6 focus-within:ring-4 ring-[#D4AF37]/30 transition-all">
                           <input type="number" value={d.withdrawal || ''} onChange={(e) => updDay(i, { withdrawal: Number(e.target.value) })} placeholder="VALOR PARA SAQUE" className="w-full bg-transparent text-center text-2xl font-black text-white focus:outline-none placeholder:text-neutral-600" />
                        </div>
                     </div>
                  </div>
                </div>
              );
           })}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .alavancagem-container .no-scrollbar::-webkit-scrollbar { display: none; }
        .alavancagem-container input[type=number]::-webkit-inner-spin-button { appearance: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .alavancagem-container main > div > div { animation: fadeIn 0.9s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
      `}} />

      {/* MODAL SELETOR DE CASA PARA UPLOAD */}
      <AnimatePresence>
         {showHouseSelector && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-neutral-900 border border-white/10 p-8 rounded-[3rem] max-w-md w-full shadow-2xl"
               >
                  <h3 className="text-xl font-black uppercase tracking-widest text-center mb-6">Selecione a Casa</h3>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                     {HOUSES.map(h => (
                        <button 
                           key={h}
                           onClick={() => setSelectedHouse(h)}
                           className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border ${selectedHouse === h ? 'bg-[#D4AF37] border-[#B8860B] text-[#0A0A0A]' : 'bg-black/40 border-white/5 text-neutral-500'}`}
                        >
                           {h}
                        </button>
                     ))}
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setShowHouseSelector(null)} className="flex-1 py-4 bg-neutral-800 rounded-2xl text-[10px] font-black uppercase">Cancelar</button>
                     <label className="flex-1 py-4 bg-[#D4AF37] rounded-2xl text-[10px] font-black uppercase text-center cursor-pointer text-[#0A0A0A]">
                        Confirmar e Subir
                        <input 
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && showHouseSelector) {
                                 handleImageUpload(file, showHouseSelector.dayIdx, showHouseSelector.betIdx, selectedHouse);
                                 setShowHouseSelector(null);
                              }
                           }} 
                        />
                     </label>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default Alavancagem;
