import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, RotateCcw, Trophy, 
  Target, Banknote, AlertCircle, Scissors, 
  ArrowRightCircle, Star, Shield, 
  Gamepad2, ClipboardList, ChevronDown, CheckCircle2,
  XCircle, CheckCircle, Loader2, Plus, Trash2, ChevronUp,
  User, History, PlusCircle, Clock, Calendar as CalendarIcon, Coins, ArrowBigRightDash, 
  ArrowRight, Upload, Image as ImageIcon, Zap, BarChart3, PieChart, Settings2, Search
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";

// --- Assets Visuais de Casas de Aposta ---
const BetanoIcon = () => (
  <div className="flex items-center gap-2 bg-[#FF7324]/10 px-3 py-1 rounded-xl border border-[#FF7324]/30 shadow-[0_4px_10px_rgba(255,115,36,0.15)]">
    <div className="w-4 h-4 bg-gradient-to-br from-[#FF7324] to-[#e65a00] rounded-lg flex items-center justify-center shadow-md">
      <span className="text-[9px] text-white font-black">B</span>
    </div>
    <span className="text-[10px] font-black text-[#FF7324] tracking-tighter uppercase italic">Betano</span>
  </div>
);

const EstrelaIcon = () => (
  <div className="flex items-center gap-2 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/30 shadow-[0_4px_10px_rgba(251,191,36,0.15)]">
    <Star size={12} className="fill-amber-500 text-amber-600 drop-shadow-sm" />
    <span className="text-[10px] font-black text-amber-600 tracking-tighter uppercase italic">Estrela</span>
  </div>
);

const SportingbetIcon = () => (
  <div className="flex items-center gap-2 bg-[#003272]/10 px-3 py-1 rounded-xl border border-[#003272]/30 shadow-[0_4px_10px_rgba(0,50,114,0.15)]">
    <div className="w-4 h-4 bg-gradient-to-br from-[#003272] to-[#001f4d] rounded-lg flex items-center justify-center shadow-md">
      <span className="text-[9px] text-white font-black">S</span>
    </div>
    <span className="text-[10px] font-black text-[#003272] tracking-tighter uppercase italic">Sporting</span>
  </div>
);

// --- Utilitários de Formatação ---
const fCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const nToWords = (n: number) => {
  if (n <= 0) return "Zero reais";
  const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const teens = ["dez", "onze", "doze", "treze", "quarenta", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
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
    res += n === 1 ? " real" : " reais";
  }
  if (decP > 0) { if (res !== "") res += " e "; res += fmt(decP); res += decP === 1 ? " centavo" : " centavos"; }
  return res.charAt(0).toUpperCase() + res.slice(1);
};

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
        day: i + 1, status: 'pending', withdrawal: 0, bonus: 0, protectCapital: false, bets: (i + 1 === 26) ? [
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
    days: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, status: 'pending', withdrawal: 0, bonus: 0, protectCapital: false, bets: [] })),
    settings: { stake: 4.70, odd: 1.40 }
  };

  const calcDays = useMemo(() => {
    let results = []; 
    let nextStake = 0; 
    let foundStart = false;
    let lastHouseWins: any[] = [];

    for (let i = 0; i < 31; i++) {
      const d = mData.days[i];
      const dayNum = i + 1;
      const isToday = dayNum === todayDate && curMonth === todayMonth;
      const hasBets = d.bets && d.bets.length > 0;
      const dailyBonus = d.bonus || 0;

      if (!foundStart && (hasBets || isToday || dailyBonus > 0)) {
          foundStart = true;
          // Se for o primeiro dia com dados, o saldo inicial é a banca configurada + bônus do dia
          nextStake = (hasBets ? d.bets.reduce((acc: number, b: any) => acc + (b.stake || 0), 0) : mData.settings.stake) + dailyBonus;
      } else if (foundStart) {
          // Se já começou, o saldo disponível hoje é o que sobrou de ontem + bônus de hoje
          nextStake += dailyBonus;
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

      const profit = (totalReturn - currentStake) + dailyBonus;
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

      if (hasBets && currentDayWins.length > 0) {
          lastHouseWins = currentDayWins;
      }

      if (d.status === 'lost') {
        nextStake = 0;
        lastHouseWins = [];
      } else if (foundStart) {
        if (d.protectCapital) nextStake = Math.max(0, (totalReturn - currentStake) - withdrawal);
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
                { text: `Analise este print de uma casa de apostas. A casa de apostas informada pelo usuário é '${houseName}'. Extraia as seguintes informações: o nome da casa de apostas (use '${houseName}' se não estiver claro), o nome da partida ou mercado apostado, o valor apostado (stake), a odd total, e o status da aposta (won, lost, ou pending). Retorne estritamente no formato JSON solicitado.` },
                { inlineData: { data: base64Data, mimeType: file.type } },
              ],
            },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  house: { type: Type.STRING },
                  match: { type: Type.STRING },
                  stake: { type: Type.NUMBER },
                  odd: { type: Type.NUMBER },
                  status: { type: Type.STRING },
                },
                required: ["house", "match", "stake", "odd", "status"],
              },
            },
          });
          const result = JSON.parse(response.text || "{}");
          const b = [...mData.days[dayIndex].bets];
          b.push({
            match: result.match || "APOSTA EXTRAÍDA",
            house: result.house || houseName,
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
    for (let i = 30; i >= 0; i--) {
      if (calcDays[i].bets && calcDays[i].bets.length > 0) {
        lastDayWithData = Math.max(lastDayWithData, calcDays[i].day);
        break;
      }
    }
    for (let i = 0; i < calcDays.length; i++) {
      const d = calcDays[i];
      if (curMonth === todayMonth && d.day > lastDayWithData) break;
      cumulative += d.profit;
      data.push({ day: d.day, profit: d.profit, cumulative: cumulative, status: d.status });
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

  if (loading) return <div className="h-96 bg-neutral-950 flex items-center justify-center rounded-b-[4rem]"><Loader2 className="animate-spin text-red-500" size={40} /></div>;

  return (
    <div className="alavancagem-container bg-[#0a0a0a] text-white font-sans selection:bg-red-500 pb-20 rounded-b-[4rem] relative overflow-hidden">
      
      {/* Efeito de Fundo */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent pointer-events-none"></div>

      {/* HEADER PREMIUM */}
      <header className="px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 border-b border-white/5">
        <div className="flex items-center gap-6">
           <div className="relative group">
              <div className="absolute inset-0 bg-red-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-800 to-neutral-950 rounded-[1.5rem] flex items-center justify-center border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.6)] relative z-10 transform-gpu transition-all group-hover:scale-105 group-hover:rotate-3">
                 <div className="flex flex-col items-center">
                    <TrendingUp size={32} className="text-red-500 -mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" strokeWidth={3} />
                    <div className="flex gap-1.5 mt-1">
                       <div className="w-5 h-5 bg-red-600 rounded-md flex items-center justify-center shadow-sm"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>
                       <div className="w-5 h-5 bg-red-700 rounded-md shadow-sm"></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col">
              <h1 className="text-4xl font-black italic tracking-tighter text-white/40 flex items-baseline leading-none uppercase">
                 BET<span className="text-white font-black drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">MANAGER</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                 <p className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.4em] leading-none">
                    {todayDayName}, {todayDate} DE {todayMonthName}
                 </p>
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_#ef4444]"></div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="bg-black/60 rounded-[2.5rem] p-1.5 border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <div className="bg-neutral-900/80 rounded-[2.2rem] px-10 py-4 shadow-inner flex flex-col items-center border border-white/5">
                 <span className="text-[9px] text-red-500 font-black uppercase tracking-[0.3em] mb-1.5">PROJEÇÃO DE BANCA</span>
                 <span className="text-4xl font-black text-white leading-none tracking-tighter drop-shadow-sm">{fCurrency(stats.proj)}</span>
              </div>
           </div>
           <div className="w-16 h-16 rounded-3xl border-2 border-white/5 shadow-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 flex items-center justify-center group cursor-pointer hover:border-red-500/30 transition-all">
              <User size={32} className="text-neutral-500 group-hover:text-red-500 transition-colors" />
           </div>
        </div>
      </header>

      {/* NAVEGAÇÃO DE MESES */}
      <nav className="px-10 mt-10 mb-12 overflow-x-auto no-scrollbar relative z-10">
        <div className="flex bg-neutral-900/40 p-2.5 rounded-[3rem] border border-white/5 shadow-inner gap-3 backdrop-blur-sm">
           {MONTHS.map((m, i) => (
             <button 
               key={m} 
               onClick={() => setCurMonth(i)} 
               className={`px-12 py-4 rounded-[2.5rem] text-[11px] font-black uppercase transition-all duration-500 whitespace-nowrap tracking-widest ${curMonth === i ? 'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-[0_8px_20px_rgba(220,38,38,0.4)] scale-105' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
             >
                {m}
             </button>
           ))}
        </div>
      </nav>

      <main className="px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* SIDEBAR DE CONTROLE */}
        <aside className="lg:col-span-3 space-y-8">
          <div className="bg-neutral-900/40 rounded-[3.5rem] border border-white/5 p-10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] backdrop-blur-md group">
             <h3 className="text-[11px] font-black uppercase text-red-500 mb-10 flex items-center gap-4 border-b border-white/5 pb-6 tracking-[0.3em]">
               <History size={20} className="animate-spin-slow" /> CONFIGURAÇÃO
             </h3>
             <div className="space-y-10">
                <div className="bg-black/60 p-7 rounded-[2.5rem] border border-white/5 shadow-inner group-hover:border-red-500/20 transition-all">
                   <label className="text-[10px] text-neutral-500 font-black uppercase block mb-3 text-center tracking-[0.4em]">BANCA INICIAL</label>
                   <div className="flex items-center justify-center gap-2">
                      <span className="text-red-500 font-black text-xl">R$</span>
                      <input 
                        type="number" 
                        value={mData.settings.stake} 
                        onChange={(e) => { const h = {...history}; h[monthKey] = {...mData, settings: {...mData.settings, stake: Number(e.target.value)}}; setHistory(h); localStorage.setItem('betManagerHistory', JSON.stringify(h)); }} 
                        className="bg-transparent text-white font-black text-4xl text-center focus:outline-none w-full tracking-tighter" 
                      />
                   </div>
                </div>
                <div className="bg-black/60 p-7 rounded-[2.5rem] border border-white/5 shadow-inner group-hover:border-red-500/20 transition-all">
                   <label className="text-[10px] text-neutral-500 font-black uppercase block mb-3 text-center tracking-[0.4em]">ODD MÉDIA</label>
                   <div className="flex items-center justify-center gap-2">
                      <span className="text-emerald-500 font-black text-xl">@</span>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={mData.settings.odd} 
                        onChange={(e) => { const h = {...history}; h[monthKey] = {...mData, settings: {...mData.settings, odd: Number(e.target.value)}}; setHistory(h); localStorage.setItem('betManagerHistory', JSON.stringify(h)); }} 
                        className="bg-transparent text-white font-black text-4xl text-center focus:outline-none w-full tracking-tighter" 
                      />
                   </div>
                </div>
             </div>
          </div>

          <button 
            onClick={() => dayRefs.current[todayDate]?.scrollIntoView({ behavior: 'smooth', block: 'center' })} 
            className="w-full py-8 bg-neutral-900/60 border border-white/10 rounded-[3rem] text-[13px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-red-500 hover:border-red-500/50 hover:bg-neutral-900 transition-all flex items-center justify-center gap-5 shadow-2xl active:scale-95"
          >
            <Clock size={24} className="text-red-500" /> LOCALIZAR HOJE
          </button>

          {/* GRÁFICO DE DESEMPENHO */}
          <div className="bg-neutral-900/40 rounded-[3.5rem] border border-white/5 p-10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] backdrop-blur-md">
             <h3 className="text-[11px] font-black uppercase text-emerald-500 mb-8 flex items-center gap-4 border-b border-white/5 pb-6 tracking-[0.3em]">
               <TrendingUp size={20} /> FLUXO DE CAIXA
             </h3>
             <div className="h-56 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                       <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.8}/>
                       <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.8}/>
                     </linearGradient>
                     <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                       <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.2}/>
                       <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.2}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                   <XAxis dataKey="day" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '1.5rem', fontSize: '12px', fontWeight: '900', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
                     itemStyle={{ color: '#fff' }}
                     formatter={(value: number) => [fCurrency(value), 'Saldo']}
                     labelFormatter={(label) => `Dia ${label}`}
                   />
                   <Area type="monotone" dataKey="cumulative" stroke="url(#splitColor)" strokeWidth={4} fillOpacity={1} fill="url(#fillColor)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
             <div className="mt-6 flex justify-between items-center px-2">
                <div className="flex flex-col">
                   <span className="text-[8px] text-neutral-500 font-black uppercase">Status Atual</span>
                   <span className={`text-sm font-black uppercase italic ${chartData[chartData.length-1]?.cumulative >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {chartData[chartData.length-1]?.cumulative >= 0 ? 'Superávit' : 'Déficit'}
                   </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                   <BarChart3 size={18} className="text-neutral-600" />
                </div>
             </div>
          </div>
        </aside>

        {/* GRID DE DIAS (BILHETES) */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
           {calcDays.map((d, i) => {
              const isToday = d.day === todayDate && curMonth === todayMonth;
              const totalSuggestedReturn = d.suggestedBets.reduce((acc: number, b: any) => acc + (b.amount * b.odd), 0);

              return (
                <div 
                  key={i} 
                  ref={el => dayRefs.current[d.day] = el} 
                  className={`rounded-[4rem] border-4 transition-all duration-700 flex flex-col overflow-hidden relative shadow-[0_40px_80px_rgba(0,0,0,0.5)] group/card ${d.status === 'won' ? 'bg-emerald-950/10 border-emerald-900/30' : d.status === 'lost' ? 'bg-red-950/10 border-red-900/30' : isToday ? 'bg-neutral-900 border-red-600 ring-[12px] ring-red-600/10 scale-[1.05] z-20 shadow-[0_60px_120px_rgba(220,38,38,0.2)]' : 'bg-neutral-900/40 border-white/5 hover:border-white/10'}`}
                >
                  {/* Badge de Status Flutuante */}
                  <div className="absolute top-8 right-8 z-10">
                     {d.status === 'won' ? (
                        <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg animate-bounce"><CheckCircle size={24} /></div>
                     ) : d.status === 'lost' ? (
                        <div className="bg-red-500 text-white p-2 rounded-full shadow-lg animate-pulse"><XCircle size={24} /></div>
                     ) : isToday ? (
                        <div className="bg-red-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">Ativo</div>
                     ) : null}
                  </div>

                  <div className={`p-10 flex justify-between items-center border-b-2 ${isToday ? 'bg-red-900/20 border-red-900/40' : 'border-white/5'}`}>
                     <div className="flex flex-col">
                        <span className={`text-[14px] font-black tracking-[0.2em] ${isToday ? 'text-white' : 'text-neutral-500'}`}>
                           {isToday ? 'HOJE' : `DIA ${d.day < 10 ? '0' : ''}${d.day}`}
                        </span>
                        <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mt-1">Ciclo de Alavancagem</span>
                     </div>
                     <div className="flex gap-4">
                        <div className="flex flex-col items-center bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                           <span className="text-[8px] text-neutral-500 font-black uppercase mb-1">Bônus</span>
                           <div className="flex items-center gap-1">
                              <span className="text-[10px] text-emerald-500 font-black">R$</span>
                              <input 
                                type="number" 
                                value={d.bonus || ''} 
                                onChange={(e) => updDay(i, { bonus: Number(e.target.value) })} 
                                placeholder="0"
                                className="bg-transparent text-white font-black text-xs w-10 focus:outline-none text-center"
                              />
                           </div>
                        </div>
                        <button 
                           onClick={() => updDay(i, { protectCapital: !d.protectCapital })} 
                           className={`p-4 rounded-2xl transition-all duration-500 ${d.protectCapital ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/30' : 'bg-black/40 text-neutral-600 border border-white/5 hover:text-neutral-400'}`}
                           title="Proteger Capital"
                        >
                          <Shield size={24} />
                        </button>
                        <button 
                           onClick={() => updDay(i, { status: 'pending' })} 
                           className="p-4 rounded-2xl bg-black/40 text-neutral-600 hover:text-white border border-white/5 transition-all"
                           title="Resetar Dia"
                        >
                          <RotateCcw size={24} />
                        </button>
                     </div>
                  </div>

                  <div className="p-12 flex-1 space-y-10">
                     {d.bets && d.bets.length > 0 ? (
                        <div className="space-y-8">
                           <div className="flex flex-col gap-5">
                              <div className="flex items-center justify-between text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
                                 <span className="flex items-center gap-2"><ClipboardList size={14} /> Bilhetes Registrados</span>
                                 <button onClick={() => { const b=d.bets||[]; updDay(i, {bets: [...b, {match:'NOVA ENTRADA', house:'Betano', odd:1.40, stake:0, status:'pending'}]}); }} className="text-red-500 hover:text-red-400 flex items-center gap-2 font-black transition-colors"><PlusCircle size={18} /> ADD</button>
                              </div>
                              
                              {/* Upload IA Section */}
                              <div className="bg-black/60 p-4 rounded-[2rem] border border-white/5 shadow-inner group/upload">
                                 <div className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                                       <input 
                                          type="text" 
                                          value={houseName} 
                                          onChange={(e) => setHouseName(e.target.value)} 
                                          placeholder="Casa de Aposta..." 
                                          className="bg-neutral-900/50 text-white text-[11px] font-black px-12 py-3 rounded-xl border border-white/5 outline-none w-full focus:border-red-500/50 transition-all"
                                        />
                                    </div>
                                    <label className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black cursor-pointer transition-all duration-500 whitespace-nowrap shadow-lg ${isUploading && uploadTargetDay === i ? 'bg-neutral-800 text-neutral-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:scale-105 active:scale-95 shadow-emerald-900/20'}`}>
                                      {isUploading && uploadTargetDay === i ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="fill-white" />}
                                      TRANSCREVER IA
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, i)} disabled={isUploading} />
                                    </label>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-6 max-h-[500px] overflow-y-auto no-scrollbar pr-2 custom-scrollbar">
                              {d.bets.map((bet: any, bIdx: number) => {
                                 const isExpanded = expandedBet && expandedBet[0] === i && expandedBet[1] === bIdx;
                                 const betReturn = (bet.stake || 0) * (bet.odd || 0);
                                 return (
                                   <div key={bIdx} className={`rounded-[2.5rem] border-2 transition-all duration-500 shadow-xl group/bet ${bet.status === 'won' ? 'bg-neutral-900/80 border-emerald-900/40' : bet.status === 'lost' ? 'bg-neutral-900/80 border-red-900/40' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
                                      <div className="p-8 cursor-pointer" onClick={() => setExpandedBet(isExpanded ? null : [i, bIdx])}>
                                         <div className="flex justify-between items-start mb-6">
                                            <div className="transform transition-transform group-hover/bet:scale-110">
                                               {bet.house === 'Betano' ? <BetanoIcon /> : bet.house === 'EstrelaBet' ? <EstrelaIcon /> : <SportingbetIcon />}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                               <div className="flex flex-col items-end leading-none border-b border-white/5 pb-2 w-full">
                                                  <span className="text-[9px] text-neutral-500 font-black uppercase tracking-wider">Investimento</span>
                                                  <span className="text-[16px] font-black text-white leading-none font-mono">{fCurrency(bet.stake)}</span>
                                               </div>
                                               <div className="flex flex-col items-end leading-none pt-1">
                                                  <span className="text-[9px] text-neutral-500 font-black uppercase tracking-wider">Retorno Potencial</span>
                                                  <span className="text-[16px] font-black text-emerald-500 font-mono italic">@ {bet.odd} → {fCurrency(betReturn)}</span>
                                               </div>
                                            </div>
                                         </div>
                                         <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                            <p className="text-[14px] font-black text-white truncate uppercase italic tracking-tighter max-w-[180px]">{bet.match}</p>
                                            <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-red-500/20 text-red-500' : 'text-neutral-600'}`}>
                                               <ChevronDown size={20} />
                                            </div>
                                         </div>
                                      </div>
                                      {isExpanded && (
                                         <div className="px-8 pb-10 space-y-8 animate-in fade-in slide-in-from-top-4 border-t border-white/5 bg-neutral-900/90 rounded-b-[2.5rem] backdrop-blur-md">
                                            <div className="grid grid-cols-2 gap-6 mt-8">
                                               <button onClick={() => updBetStatus(i, bIdx, 'won')} className={`py-5 rounded-[1.5rem] text-[11px] font-black uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${bet.status === 'won' ? 'bg-emerald-600 text-white shadow-emerald-900/50' : 'bg-black/60 border border-white/10 text-neutral-500 hover:text-emerald-500 hover:border-emerald-500/30'}`}>
                                                  <CheckCircle2 size={20} /> GREEN
                                               </button>
                                               <button onClick={() => updBetStatus(i, bIdx, 'lost')} className={`py-5 rounded-[1.5rem] text-[11px] font-black uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${bet.status === 'lost' ? 'bg-red-600 text-white shadow-red-900/50' : 'bg-black/60 border border-white/10 text-neutral-500 hover:text-red-500 hover:border-red-500/30'}`}>
                                                  <XCircle size={20} /> RED
                                               </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6">
                                               <div className="bg-black/60 border border-white/5 p-6 rounded-[1.5rem] shadow-inner group/input">
                                                  <label className="text-[9px] text-neutral-500 font-black block mb-2 tracking-[0.2em] uppercase group-focus-within/input:text-red-500 transition-colors">Mercado / Partida</label>
                                                  <input type="text" value={bet.match || ''} onChange={(e) => { const b=[...d.bets]; b[bIdx].match=e.target.value; updDay(i, {bets: b}); }} className="w-full bg-transparent text-white font-black text-lg focus:outline-none italic tracking-tight" />
                                               </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                               <div className="bg-black/60 border border-white/5 p-6 rounded-[1.5rem] shadow-inner group/input">
                                                  <label className="text-[9px] text-neutral-500 font-black block mb-2 tracking-[0.2em] uppercase group-focus-within/input:text-red-500 transition-colors">Investimento (R$)</label>
                                                  <input type="number" value={bet.stake || ''} onChange={(e) => { const b=[...d.bets]; b[bIdx].stake=Number(e.target.value); updDay(i, {bets: b}); }} className="w-full bg-transparent text-white font-black text-2xl focus:outline-none font-mono" />
                                               </div>
                                               <div className="bg-black/60 border border-white/5 p-6 rounded-[1.5rem] shadow-inner group/input">
                                                  <label className="text-[9px] text-neutral-500 font-black block mb-2 tracking-[0.2em] uppercase group-focus-within/input:text-red-500 transition-colors">Odd Final</label>
                                                  <input type="number" step="0.01" value={bet.odd || ''} onChange={(e) => { const b=[...d.bets]; b[bIdx].odd=Number(e.target.value); updDay(i, {bets: b}); }} className="w-full bg-transparent text-emerald-500 font-black text-2xl focus:outline-none font-mono" />
                                               </div>
                                            </div>
                                            <button onClick={() => { const b=d.bets.filter((_: any, idx: number)=>idx!==bIdx); updDay(i, {bets:b}); }} className="w-full py-5 bg-red-950/20 text-red-500 hover:bg-red-900/40 text-[11px] font-black uppercase rounded-[1.5rem] border border-red-900/40 transition-all flex items-center justify-center gap-3">
                                               <Trash2 size={18} /> EXCLUIR REGISTRO
                                            </button>
                                         </div>
                                      )}
                                   </div>
                                 );
                              })}
                           </div>
                        </div>
                     ) : (
                        /* PLANO DE ALAVANCAGEM (Sugestão) */
                        <div className="flex flex-col items-center justify-center py-12 bg-neutral-900/40 border-4 border-dashed border-white/5 rounded-[4rem] shadow-inner relative overflow-hidden group/empty">
                           <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover/empty:scale-110 transition-transform duration-1000"><ArrowBigRightDash size={120} /></div>
                           <div className="w-24 h-24 rounded-full bg-red-600/10 flex items-center justify-center border border-red-500/20 mb-8 shadow-2xl">
                              <ArrowBigRightDash size={48} className="text-red-500 animate-pulse" strokeWidth={3} />
                           </div>
                           <h4 className="text-[14px] font-black uppercase text-red-500 tracking-[0.4em] mb-8 border-b-2 border-red-900/30 pb-3 italic">Plano Composto</h4>
                           
                           <div className="w-full px-10 space-y-5">
                              {d.suggestedBets.map((sb: any, sIdx: number) => (
                                 <div key={sIdx} className="bg-black/60 rounded-[2rem] p-6 shadow-2xl border border-white/5 hover:border-red-500/20 transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                       {sb.house === 'Betano' ? <BetanoIcon /> : <EstrelaIcon />}
                                       <span className="text-[13px] font-black text-emerald-500 font-mono italic bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">@ {sb.odd}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                       <div className="flex flex-col">
                                          <span className="text-[9px] text-neutral-500 font-black uppercase tracking-wider">Entrada</span>
                                          <span className="text-[18px] font-black text-white leading-none font-mono">{fCurrency(sb.amount)}</span>
                                       </div>
                                       <div className="flex flex-col items-end">
                                          <span className="text-[9px] text-neutral-500 font-black uppercase tracking-wider">Retorno</span>
                                          <span className="text-[18px] font-black text-amber-400 leading-none font-mono">{fCurrency(sb.amount * sb.odd)}</span>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                              
                              <div className="pt-8 border-t-2 border-dashed border-red-900/30 mt-4">
                                 <div className="flex justify-between items-center text-neutral-400">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">TOTAL INVESTIMENTO</span>
                                    <span className="text-2xl font-black text-white font-mono">{fCurrency(d.suggestedStake)}</span>
                                 </div>
                                 <div className="flex justify-between items-center mt-3 text-emerald-500">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">META DE RETORNO</span>
                                    <span className="text-3xl font-black font-mono drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{fCurrency(totalSuggestedReturn)}</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="w-full px-10 mt-10 space-y-4">
                              <div className="bg-black/60 p-4 rounded-[2rem] border border-white/5 shadow-inner">
                                 <div className="flex items-center gap-3">
                                    <input 
                                       type="text" 
                                       value={houseName} 
                                       onChange={(e) => setHouseName(e.target.value)} 
                                       placeholder="Casa de Aposta..." 
                                       className="bg-neutral-900/50 text-white text-[11px] font-black px-6 py-3 rounded-xl border border-white/5 outline-none w-full focus:border-red-500/50 transition-all"
                                     />
                                    <label className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black cursor-pointer transition-all duration-500 whitespace-nowrap shadow-lg ${isUploading && uploadTargetDay === i ? 'bg-neutral-800 text-neutral-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:scale-105 active:scale-95 shadow-emerald-900/20'}`}>
                                      {isUploading && uploadTargetDay === i ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="fill-white" />}
                                      IA UPLOAD
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, i)} disabled={isUploading} />
                                    </label>
                                 </div>
                              </div>
                              <button onClick={() => { const b=d.bets||[]; updDay(i, {bets: [...b, {match:'NOVA ENTRADA', house:'Betano', odd:1.40, stake:0, status:'pending'}]}); }} className="w-full py-5 bg-red-900/20 text-red-500 hover:bg-red-900/40 text-[11px] font-black uppercase rounded-[2rem] border border-red-900/40 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                                 <PlusCircle size={20} /> ADICIONAR MANUAL
                              </button>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* FOOTER DO CARD (RESULTADOS) */}
                  <div className={`p-12 border-t-4 space-y-10 ${isToday ? 'bg-red-900/10 border-red-900/30' : 'bg-black/30 border-white/5'}`}>
                     <div className="flex flex-col gap-8">
                        <div className="flex justify-between items-end border-b-2 border-white/5 pb-8">
                           <div className="flex flex-col">
                              <p className="text-[11px] text-neutral-500 font-black uppercase mb-2 tracking-[0.3em]">INVESTIDO</p>
                              <p className="text-4xl font-black text-white leading-none tracking-tighter font-mono">{fCurrency(d.stake)}</p>
                              <span className="text-[9px] text-neutral-600 italic font-black uppercase mt-3 tracking-tighter">{nToWords(d.stake)}</span>
                              {d.bonus > 0 && (
                                 <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md font-black uppercase tracking-tighter ml-2">+{fCurrency(d.bonus)} Bônus</span>
                              )}
                           </div>
                           <div className="text-right flex flex-col">
                              <p className="text-[11px] text-neutral-500 font-black uppercase mb-2 tracking-[0.3em]">RETORNO REAL</p>
                              <p className={`text-4xl font-black tracking-tighter leading-none font-mono ${d.status === 'won' ? 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-white'}`}>{fCurrency(d.ret)}</p>
                              <span className="text-[9px] text-neutral-600 italic font-black uppercase mt-3 tracking-tighter">{nToWords(d.ret)}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <button onClick={() => updDay(i, { status: 'won' })} className={`py-8 rounded-[3rem] text-[16px] font-black uppercase transition-all duration-500 shadow-2xl active:scale-95 flex items-center justify-center gap-4 ${d.status === 'won' ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-emerald-900/50' : 'bg-neutral-900 text-emerald-500 border-2 border-emerald-900/40 hover:bg-emerald-900/20'}`}>
                              <CheckCircle size={32} /> GREEN
                           </button>
                           <button onClick={() => updDay(i, { status: 'lost' })} className={`py-8 rounded-[3rem] text-[16px] font-black uppercase transition-all duration-500 shadow-2xl active:scale-95 flex items-center justify-center gap-4 ${d.status === 'lost' ? 'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-red-900/50' : 'bg-neutral-900 text-red-500 border-2 border-red-900/40 hover:bg-red-900/20'}`}>
                              <XCircle size={32} /> RED
                           </button>
                        </div>
                     </div>

                     <div className="pt-10 border-t-4 border-dotted border-white/5">
                        <div className="flex justify-between items-center mb-6 leading-none px-4">
                           <span className="flex items-center gap-3 text-[12px] font-black uppercase text-red-500 tracking-[0.3em]"><Scissors size={22} /> SANGRIA / SAQUE</span>
                           {d.withdrawal > 0 && <span className="text-[18px] font-black text-red-400 italic font-mono">-{fCurrency(d.withdrawal)}</span>}
                        </div>
                        <div className="bg-black/60 rounded-[3rem] border border-white/5 shadow-inner p-8 focus-within:ring-4 ring-red-900/30 transition-all group/saque">
                           <div className="flex items-center justify-center gap-3">
                              <span className="text-neutral-600 font-black text-2xl group-focus-within/saque:text-red-500 transition-colors">R$</span>
                              <input 
                                type="number" 
                                value={d.withdrawal || ''} 
                                onChange={(e) => updDay(i, { withdrawal: Number(e.target.value) })} 
                                placeholder="0,00" 
                                className="w-full bg-transparent text-center text-4xl font-black text-white focus:outline-none placeholder:text-neutral-800 tracking-tighter font-mono" 
                              />
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              );
           })}
        </div>
      </main>

      {/* Footer do Bet Manager */}
      <footer className="mt-20 px-10 text-center relative z-10 flex flex-col items-center gap-8">
         <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <PieChart size={20} className="text-red-500" />
              <span className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.4em]">Financial Analytics</span>
            </div>
            <div className="w-2 h-2 bg-white/10 rounded-full"></div>
            <div className="flex items-center gap-3">
              <Settings2 size={20} className="text-red-500" />
              <span className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.4em]">AI Transcription Engine</span>
            </div>
         </div>
         <p className="text-neutral-700 text-[10px] uppercase tracking-[0.6em] font-black flex items-center gap-4">
           <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse"></span>
           AnalisAI BetManager • Secure Intelligence • {new Date().getFullYear()}
         </p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .alavancagem-container .no-scrollbar::-webkit-scrollbar { display: none; }
        .alavancagem-container input[type=number]::-webkit-inner-spin-button { appearance: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
        .alavancagem-container main > div > div { animation: fadeIn 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
      `}} />
    </div>
  );
};

export default Alavancagem;
