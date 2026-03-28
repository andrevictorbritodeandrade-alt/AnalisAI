import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, RotateCcw, Trophy, 
  Target, Banknote, AlertCircle, Scissors, 
  ArrowRightCircle, Star, Shield, 
  Gamepad2, ClipboardList, ChevronDown, CheckCircle2,
  XCircle, CheckCircle, Loader2, Plus, Trash2, ChevronUp,
  User, History, PlusCircle, Clock, Calendar as CalendarIcon, Coins, ArrowBigRightDash, 
  ArrowRight, Upload, Image as ImageIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";

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

const MONTHS = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
const DAYS_OF_WEEK = ["DOMINGO", "SEGUNDA-FEIRA", "TERÇA-FEIRA", "QUARTA-FEIRA", "QUINTA-FEIRA", "SEXTA-FEIRA", "SÁBADO"];

const Alavancagem = () => {
  const [curMonth, setCurMonth] = useState(new Date().getMonth());
  const [history, setHistory] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [expandedBet, setExpandedBet] = useState<number[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTargetDay, setUploadTargetDay] = useState<number | null>(null);
  const [houseName, setHouseName] = useState('Betano');

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
        day: i + 1, status: 'pending', withdrawal: 0, protectCapital: false, bets: (i + 1 === 26) ? [
          { match: "BRASIL X FRANÇA", house: 'Betano', odd: 1.57, stake: 3.13, status: 'won' },
          { match: "MÚLTIPLA 3 JOGOS", house: 'EstrelaBet', odd: 3.04, stake: 0.50, status: 'won' },
          { match: "COMBO 8 FAVORITOS", house: 'Sportingbet', odd: 9.33, stake: 1.07, status: 'lost' }
        ] : []
      }));
      const initialData = { [`${curMonth}_2026`]: { days: initialDays, settings: { stake: 4.70, odd: 1.40 } } };
      setHistory(initialData);
      localStorage.setItem('betManagerHistory', JSON.stringify(initialData));
    }
    setLoading(false);
  }, [curMonth]);

  const monthKey = `${curMonth}_2026`;
  const mData = history[monthKey] || { 
    days: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, status: 'pending', withdrawal: 0, protectCapital: false, bets: [] })),
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

      let currentStake = hasBets ? d.bets.reduce((acc: number, b: any) => acc + (b.stake || 0), 0) : (foundStart ? nextStake : 0);
      
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
        suggestedBets: lastHouseWins.length > 0 ? lastHouseWins : [
           { house: 'Betano', amount: nextStake * 0.7, odd: 1.57 },
           { house: 'EstrelaBet', amount: nextStake * 0.3, odd: 3.04 }
        ],
        suggestedStake: nextStake
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, dayIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadTargetDay(dayIndex);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
              parts: [
                {
                  text: `Analise este print de uma casa de apostas. A casa de apostas informada pelo usuário é '${houseName}'. Extraia as seguintes informações: o nome da casa de apostas (use '${houseName}' se não estiver claro), o nome da partida ou mercado apostado, o valor apostado (stake), a odd total, e o status da aposta (won, lost, ou pending). Retorne estritamente no formato JSON solicitado.`,
                },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                  },
                },
              ],
            },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  house: { type: Type.STRING, description: "Nome da casa de apostas" },
                  match: { type: Type.STRING, description: "Nome da partida ou mercado" },
                  stake: { type: Type.NUMBER, description: "Valor apostado" },
                  odd: { type: Type.NUMBER, description: "Odd total" },
                  status: { type: Type.STRING, description: "Status: 'won', 'lost', ou 'pending'" },
                },
                required: ["house", "match", "stake", "odd", "status"],
              },
            },
          });

          const result = JSON.parse(response.text || "{}");
          
          const b = [...mData.days[dayIndex].bets];
          b.push({
            match: result.match || "APOSTA EXTRAÍDA",
            house: result.house || "Betano",
            odd: result.odd || 1.0,
            stake: result.stake || 0,
            status: result.status || "pending"
          });
          updDay(dayIndex, { bets: b });
        } catch (err) {
          console.error("Erro na IA:", err);
          alert("Não foi possível extrair os dados da imagem.");
        } finally {
          setIsUploading(false);
          setUploadTargetDay(null);
          e.target.value = '';
        }
      };
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      setIsUploading(false);
      setUploadTargetDay(null);
      e.target.value = '';
    }
  };

  const chartData = useMemo(() => {
    let cumulative = 0;
    const data = [];
    let lastDayWithData = todayDate;
    
    // Find the last day with actual bets if it's beyond today (e.g. testing)
    for (let i = 30; i >= 0; i--) {
      if (calcDays[i].bets && calcDays[i].bets.length > 0) {
        lastDayWithData = Math.max(lastDayWithData, calcDays[i].day);
        break;
      }
    }

    for (let i = 0; i < calcDays.length; i++) {
      const d = calcDays[i];
      // Only show up to the last day with data or today (if current month)
      if (curMonth === todayMonth && d.day > lastDayWithData) {
        break;
      }
      
      cumulative += d.profit;
      data.push({
        day: d.day,
        profit: d.profit,
        cumulative: cumulative,
        status: d.status
      });
    }
    return data;
  }, [calcDays, curMonth, todayMonth, todayDate]);

  const gradientOffset = useMemo(() => {
    const dataMax = Math.max(...chartData.map(i => i.cumulative));
    const dataMin = Math.min(...chartData.map(i => i.cumulative));
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    return dataMax / (dataMax - dataMin);
  }, [chartData]);

  if (loading) return <div className="h-96 bg-neutral-950 flex items-center justify-center rounded-b-2xl"><Loader2 className="animate-spin text-red-500" size={40} /></div>;

  return (
    <div className="alavancagem-container bg-neutral-950 text-white font-sans selection:bg-red-500 pb-10 rounded-b-2xl">
      
      {/* HEADER (Baseado na sua imagem) */}
      <header className="px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-red-900/30 rounded-2xl flex items-center justify-center border-2 border-red-500/20 shadow-[0_8px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
              <div className="flex flex-col items-center">
                 <TrendingUp size={24} className="text-red-500 -mb-1" strokeWidth={3} />
                 <div className="flex gap-1">
                    <div className="w-4 h-4 bg-red-600 rounded-sm flex items-center justify-center"><div className="w-1 h-1 bg-white rounded-full"></div></div>
                    <div className="w-4 h-4 bg-red-600 rounded-sm"></div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col">
              <h1 className="text-2xl font-black italic tracking-tighter text-white/70 flex items-baseline leading-none">
                 BET<span className="text-white font-black">MANAGER</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                 <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">
                    {todayDayName}, {todayDate} DE {todayMonthName}
                 </p>
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-5">
           <div className="bg-black/60 rounded-[2rem] p-1 border border-white/10 shadow-xl">
              <div className="bg-neutral-900 rounded-[1.8rem] px-8 py-3 shadow-inner flex flex-col items-center">
                 <span className="text-[8px] text-neutral-400 font-black uppercase tracking-[0.2em] mb-1">PROJEÇÃO FINAL</span>
                 <span className="text-2xl font-black text-white leading-none tracking-tighter">{fCurrency(stats.proj)}</span>
              </div>
           </div>
           <div className="w-14 h-14 rounded-full border-4 border-neutral-800 shadow-xl bg-gradient-to-b from-neutral-800 to-neutral-900 flex items-center justify-center">
              <User size={28} className="text-neutral-500" />
           </div>
        </div>
      </header>

      {/* Meses */}
      <nav className="px-6 mb-10 overflow-x-auto no-scrollbar">
        <div className="flex bg-black/40 p-2 rounded-[2.5rem] border border-white/5 shadow-sm gap-2">
           {MONTHS.map((m, i) => (
             <button key={m} onClick={() => setCurMonth(i)} className={`px-10 py-3 rounded-[2rem] text-[10px] font-black uppercase transition-all whitespace-nowrap ${curMonth === i ? 'bg-red-600 text-white shadow-md border-b-2 border-red-800' : 'text-neutral-500 hover:text-white'}`}>
                {m}
             </button>
           ))}
        </div>
      </nav>

      <main className="px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-neutral-900/50 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl shadow-black/50">
             <h3 className="text-[11px] font-black uppercase text-neutral-400 mb-8 flex items-center gap-3 border-b-2 border-white/5 pb-4 tracking-widest">
               <History size={18} className="text-red-500" /> SETUP ATUAL
             </h3>
             <div className="space-y-8">
                <div className="bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner">
                   <label className="text-[10px] text-neutral-400 font-black uppercase block mb-2 text-center tracking-widest">BANCA BASE</label>
                   <input type="number" value={mData.settings.stake} onChange={(e) => { const h = {...history}; h[monthKey] = {...mData, settings: {...mData.settings, stake: Number(e.target.value)}}; setHistory(h); localStorage.setItem('betManagerHistory', JSON.stringify(h)); }} className="w-full bg-transparent text-white font-black text-3xl text-center focus:outline-none" />
                </div>
                <div className="bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner">
                   <label className="text-[10px] text-neutral-400 font-black uppercase block mb-2 text-center tracking-widest">ODD PADRÃO</label>
                   <input type="number" step="0.1" value={mData.settings.odd} onChange={(e) => { const h = {...history}; h[monthKey] = {...mData, settings: {...mData.settings, odd: Number(e.target.value)}}; setHistory(h); localStorage.setItem('betManagerHistory', JSON.stringify(h)); }} className="w-full bg-transparent text-white font-black text-3xl text-center focus:outline-none" />
                </div>
             </div>
          </div>
          <button onClick={() => dayRefs.current[todayDate]?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="w-full py-6 bg-neutral-900 border border-white/10 rounded-[2.5rem] text-[12px] font-black uppercase tracking-widest text-neutral-400 hover:text-red-500 hover:border-red-500/50 transition-all flex items-center justify-center gap-4 shadow-2xl">
            <Clock size={20} className="text-red-500" /> IR PARA HOJE
          </button>

          {/* Gráfico de Saúde Financeira */}
          <div className="bg-neutral-900/50 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl shadow-black/50">
             <h3 className="text-[11px] font-black uppercase text-neutral-400 mb-6 flex items-center gap-3 border-b-2 border-white/5 pb-4 tracking-widest">
               <TrendingUp size={18} className="text-emerald-500" /> SAÚDE FINANCEIRA
             </h3>
             <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                       <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.8}/>
                       <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.8}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                   <XAxis dataKey="day" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#171717', border: '1px solid #ffffff10', borderRadius: '1rem', fontSize: '12px', fontWeight: 'bold' }}
                     itemStyle={{ color: '#fff' }}
                     formatter={(value: number) => [fCurrency(value), 'Saldo Acumulado']}
                     labelFormatter={(label) => `Dia ${label}`}
                   />
                   <Area type="monotone" dataKey="cumulative" stroke="url(#splitColor)" strokeWidth={3} fillOpacity={0.2} fill="url(#splitColor)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </aside>

        {/* Grid Principal */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
           {calcDays.map((d, i) => {
              const isToday = d.day === todayDate && curMonth === todayMonth;
              const totalSuggestedReturn = d.suggestedBets.reduce((acc: number, b: any) => acc + (b.amount * b.odd), 0);

              return (
                <div key={i} ref={el => dayRefs.current[d.day] = el} className={`rounded-[3.5rem] border-4 transition-all flex flex-col overflow-hidden relative shadow-2xl ${d.status === 'won' ? 'bg-emerald-950/20 border-emerald-900/50' : d.status === 'lost' ? 'bg-red-950/20 border-red-900/50' : isToday ? 'bg-neutral-900 border-red-600 ring-8 ring-red-600/10 scale-[1.03] z-10 shadow-red-900/20' : 'bg-neutral-900/50 border-white/5'}`}>
                  
                  <div className={`p-8 flex justify-between items-center border-b-2 ${isToday ? 'bg-red-900/20 border-red-900/50' : 'border-white/5'}`}>
                     <span className={`text-[12px] font-black px-6 py-2 rounded-full shadow-md ${d.status === 'won' ? 'bg-emerald-600 text-white' : d.status === 'lost' ? 'bg-red-600 text-white' : isToday ? 'bg-red-600 text-white' : 'bg-black/50 text-neutral-400'}`}>
                       {isToday ? 'HOJE' : `DIA ${d.day < 10 ? '0' : ''}${d.day}`}
                     </span>
                     <div className="flex gap-3">
                        <button onClick={() => updDay(i, { protectCapital: !d.protectCapital })} className={`p-3 rounded-full transition-all ${d.protectCapital ? 'bg-red-900/40 text-red-500 shadow-inner border border-red-500/30' : 'bg-black/40 text-neutral-500 border border-white/5'}`}>
                          <Shield size={22} />
                        </button>
                        <button onClick={() => updDay(i, { status: 'pending' })} className="p-3 rounded-full bg-black/40 text-neutral-500 hover:text-white border border-white/5 transition-all">
                          <RotateCcw size={22} />
                        </button>
                     </div>
                  </div>

                  <div className="p-10 flex-1 space-y-8">
                     {d.bets && d.bets.length > 0 ? (
                        <div className="space-y-5">
                           <div className="flex flex-col gap-3 mb-4">
                              <div className="flex items-center justify-between text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                 <span>REGISTOS DE ENTRADA</span>
                                 <button onClick={() => { const b=d.bets||[]; updDay(i, {bets: [...b, {match:'NOVA ENTRADA', house:'Betano', odd:1.40, stake:0, status:'pending'}]}); }} className="text-red-500 hover:text-red-400 flex items-center gap-1 font-black"><PlusCircle size={16} /> ADD MANUAL</button>
                              </div>
                              <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                                 <input 
                                   type="text" 
                                   value={houseName} 
                                   onChange={(e) => setHouseName(e.target.value)} 
                                   placeholder="Nome da Casa (ex: Betano)" 
                                   className="bg-transparent text-white text-xs font-bold px-3 py-1 outline-none w-full"
                                 />
                                 <label className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-colors whitespace-nowrap ${isUploading && uploadTargetDay === i ? 'bg-neutral-800 text-neutral-500' : 'bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30'}`}>
                                   {isUploading && uploadTargetDay === i ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                   PRINT IA
                                   <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, i)} disabled={isUploading} />
                                 </label>
                              </div>
                           </div>
                           <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                              {d.bets.map((bet: any, bIdx: number) => {
                                 const isExpanded = expandedBet && expandedBet[0] === i && expandedBet[1] === bIdx;
                                 const betReturn = (bet.stake || 0) * (bet.odd || 0);
                                 return (
                                   <div key={bIdx} className={`rounded-[2.5rem] border-2 transition-all shadow-sm ${bet.status === 'won' ? 'bg-neutral-900 border-emerald-900/50' : bet.status === 'lost' ? 'bg-neutral-900 border-red-900/50' : 'bg-black/40 border-white/5'}`}>
                                      <div className="p-6 cursor-pointer" onClick={() => setExpandedBet(isExpanded ? null : [i, bIdx])}>
                                         <div className="flex justify-between items-start mb-5">
                                            {bet.house === 'Betano' ? <BetanoIcon /> : bet.house === 'EstrelaBet' ? <EstrelaIcon /> : <SportingbetIcon />}
                                            <div className="flex flex-col items-end gap-1.5">
                                               <div className="flex flex-col items-end leading-none border-b border-white/5 pb-2 w-full">
                                                  <span className="text-[8px] text-neutral-500 font-black uppercase">Entrada</span>
                                                  <span className="text-[12px] font-black text-white leading-none">{fCurrency(bet.stake)}</span>
                                               </div>
                                               <div className="flex flex-col items-end leading-none pt-1">
                                                  <span className="text-[8px] text-neutral-500 font-black uppercase">Retorno</span>
                                                  <span className="text-[13px] font-black text-emerald-500 font-mono italic">@ {bet.odd} → {fCurrency(betReturn)}</span>
                                               </div>
                                            </div>
                                         </div>
                                         <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                            <p className="text-[12px] font-black text-white truncate uppercase italic tracking-tighter">{bet.match}</p>
                                            <ChevronDown size={18} className={`text-neutral-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                         </div>
                                      </div>
                                      {isExpanded && (
                                         <div className="px-6 pb-8 space-y-5 animate-in fade-in slide-in-from-top-2 border-t border-white/5 bg-neutral-900 rounded-b-[2.5rem]">
                                            <div className="grid grid-cols-2 gap-4 mt-5">
                                               <button onClick={() => updBetStatus(i, bIdx, 'won')} className={`py-4 rounded-3xl text-[10px] font-black uppercase transition-all shadow-md ${bet.status === 'won' ? 'bg-emerald-600 text-white shadow-emerald-900/50' : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-white'}`}>GANHOU ✅</button>
                                               <button onClick={() => updBetStatus(i, bIdx, 'lost')} className={`py-4 rounded-3xl text-[10px] font-black uppercase transition-all shadow-md ${bet.status === 'lost' ? 'bg-red-600 text-white shadow-red-900/50' : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-white'}`}>PERDEU ❌</button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                               <div className="bg-black/40 border border-white/5 p-4 rounded-3xl shadow-inner text-left">
                                                  <label className="text-[8px] text-neutral-500 font-black block mb-1">CASA DE APOSTA</label>
                                                  <input type="text" value={bet.house || ''} onChange={(e) => { const b=[...d.bets]; b[bIdx].house=e.target.value; updDay(i, {bets: b}); }} className="w-full bg-transparent text-white font-black text-sm focus:outline-none" />
                                               </div>
                                               <div className="bg-black/40 border border-white/5 p-4 rounded-3xl shadow-inner text-left">
                                                  <label className="text-[8px] text-neutral-500 font-black block mb-1">MERCADO/JOGO</label>
                                                  <input type="text" value={bet.match || ''} onChange={(e) => { const b=[...d.bets]; b[bIdx].match=e.target.value; updDay(i, {bets: b}); }} className="w-full bg-transparent text-white font-black text-sm focus:outline-none" />
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
                                            <button onClick={() => { const b=d.bets.filter((_: any, idx: number)=>idx!==bIdx); updDay(i, {bets:b}); }} className="w-full py-3 bg-red-950/30 text-red-500 hover:bg-red-900/50 text-[10px] font-black uppercase rounded-2xl border border-red-900/50 transition-colors">EXCLUIR BILHETE</button>
                                         </div>
                                      )}
                                   </div>
                                 );
                              })}
                           </div>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center py-6 bg-red-950/20 border-4 border-dashed border-red-900/30 rounded-[3rem] shadow-inner relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><ArrowBigRightDash size={80} /></div>
                           <ArrowBigRightDash size={48} className="mb-4 text-red-500 animate-pulse" strokeWidth={3} />
                           <h4 className="text-[12px] font-black uppercase text-red-400 tracking-widest mb-4 border-b border-red-900/50 pb-2">PLANO DE ALAVANCAGEM</h4>
                           
                           <div className="w-full px-8 space-y-3">
                              {d.suggestedBets.map((sb: any, sIdx: number) => (
                                 <div key={sIdx} className="bg-neutral-900 rounded-3xl p-4 shadow-lg border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                       {sb.house === 'Betano' ? <BetanoIcon /> : <EstrelaIcon />}
                                       <span className="text-[11px] font-black text-emerald-500 font-mono italic">@ {sb.odd}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                       <div className="flex flex-col">
                                          <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-tighter">Entrada</span>
                                          <span className="text-[14px] font-black text-white leading-none">{fCurrency(sb.amount)}</span>
                                       </div>
                                       <div className="flex flex-col items-end">
                                          <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-tighter">Retorno</span>
                                          <span className="text-[14px] font-black text-yellow-400 leading-none">{fCurrency(sb.amount * sb.odd)}</span>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                              
                              <div className="pt-4 border-t-2 border-dashed border-red-900/30 mt-2">
                                 <div className="flex justify-between items-center text-neutral-300">
                                    <span className="text-[10px] font-black uppercase tracking-widest">TOTAL ALAVANCAGEM</span>
                                    <span className="text-lg font-black text-white">{fCurrency(d.suggestedStake)}</span>
                                 </div>
                                 <div className="flex justify-between items-center mt-1 text-emerald-500">
                                    <span className="text-[9px] font-bold uppercase">META DE RETORNO</span>
                                    <span className="text-xl font-black">{fCurrency(totalSuggestedReturn)}</span>
                                 </div>
                              </div>
                           </div>
                           <p className="mt-6 text-[8px] font-bold text-red-500 uppercase italic px-10 text-center leading-tight">Mande o print das entradas para validar o plano composto.</p>
                           
                           <div className="w-full px-8 mt-6">
                              <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                                 <input 
                                   type="text" 
                                   value={houseName} 
                                   onChange={(e) => setHouseName(e.target.value)} 
                                   placeholder="Nome da Casa (ex: Betano)" 
                                   className="bg-transparent text-white text-xs font-bold px-3 py-1 outline-none w-full"
                                 />
                                 <label className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-colors whitespace-nowrap ${isUploading && uploadTargetDay === i ? 'bg-neutral-800 text-neutral-500' : 'bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30'}`}>
                                   {isUploading && uploadTargetDay === i ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                   PRINT IA
                                   <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, i)} disabled={isUploading} />
                                 </label>
                              </div>
                              <button onClick={() => { const b=d.bets||[]; updDay(i, {bets: [...b, {match:'NOVA ENTRADA', house:'Betano', odd:1.40, stake:0, status:'pending'}]}); }} className="w-full mt-3 py-3 bg-red-900/20 text-red-500 hover:bg-red-900/40 text-[10px] font-black uppercase rounded-2xl border border-red-900/50 transition-colors flex items-center justify-center gap-2"><PlusCircle size={16} /> ADD MANUAL</button>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Footer Card */}
                  <div className={`p-10 border-t-4 space-y-8 ${isToday ? 'bg-red-900/10 border-red-900/30' : 'bg-black/20 border-white/5'}`}>
                     <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end border-b-2 border-white/5 pb-6">
                           <div className="flex flex-col">
                              <p className="text-[10px] text-neutral-500 font-black uppercase mb-1 tracking-widest">ENTRADA DO DIA</p>
                              <p className="text-2xl font-black text-white leading-none tracking-tighter">{fCurrency(d.stake)}</p>
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
                           <span className="flex items-center gap-2 text-[11px] font-black uppercase text-red-500 tracking-[0.2em]"><Scissors size={18} /> SANGRIA MANUAL</span>
                           {d.withdrawal > 0 && <span className="text-[14px] font-black text-red-400 italic">-{fCurrency(d.withdrawal)}</span>}
                        </div>
                        <div className="bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner p-6 focus-within:ring-4 ring-red-900/30 transition-all">
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
    </div>
  );
};

export default Alavancagem;
