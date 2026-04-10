import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChevronRight, ChevronLeft, Target, Shield, Users, Globe, Trophy, Activity, 
  ArrowRight, Loader2, AlertTriangle, RefreshCcw, RotateCcw, Key, Flame, Download, 
  User, Heart, Bell, Star, Zap, Dice5, Volume2, Search, CheckCircle2, 
  Calendar, Wallet, BarChart3, TrendingUp, History, PlusCircle, Clock, 
  ArrowBigRightDash, Scissors, XCircle, CheckCircle, LayoutGrid, Upload, MapPin, ChevronDown,
  ShieldCheck, PieChart, Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toJpeg } from 'html-to-image';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

import PartidasDoDia from './PartidasDoDia';

// --- CONFIGURAÇÕES DE API (CHAVE REAL) ---
const API_FOOTBALL_KEY = 'def74ab4f7c5d62d6fd7186522eead42';
const API_BASE_URL = 'https://v3.football.api-sports.io';
const FIFA_LOGO = "https://media.api-sports.io/football/leagues/1.png"; 

// --- BASE DE DADOS DE LIGAS (VARREDURA COMPLETA) ---
const DATABASE = {
  "SELEÇÕES": { leagueIds: [1], flag: FIFA_LOGO, isFifa: true },
  "BRASIL": { leagueIds: [71, 72, 73, 74], flag: "https://media.api-sports.io/flags/br.svg" }, // A, B, C, D (96+ equipes)
  "INGLATERRA": { leagueIds: [39, 40], flag: "https://media.api-sports.io/flags/gb.svg" },
  "ESPANHA": { leagueIds: [140, 141], flag: "https://media.api-sports.io/flags/es.svg" },
  "ITALIA": { leagueIds: [135, 136], flag: "https://media.api-sports.io/flags/it.svg" },
  "ALEMANHA": { leagueIds: [78, 79], flag: "https://media.api-sports.io/flags/de.svg" },
  "FRANÇA": { leagueIds: [61, 62], flag: "https://media.api-sports.io/flags/fr.svg" },
  "PORTUGAL": { leagueIds: [94, 95], flag: "https://media.api-sports.io/flags/pt.svg" },
  "ARGENTINA": { leagueIds: [128, 129], flag: "https://media.api-sports.io/flags/ar.svg" }
};

// Componente visual do "Selo de Aposta Recomendada"
const SeloAposta = ({ texto }: { texto: string }) => (
  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#0A0A0A] text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider animate-pulse shadow-[0_4px_15px_rgba(212,175,55,0.4)] border border-[#E2C275]/30">
    <Zap size={12} className="fill-[#0A0A0A]" /> {texto}
  </span>
);

// Componente Auxiliar para renderizar as listas de Top 3
function RankingBox({ titulo, dados, destaque = false, cor = "red", tipo = "none" }: { titulo: string, dados: any[], destaque?: boolean, cor?: "red" | "neutral", tipo?: "chute" | "none" }) {
  const bgClass = cor === "red" ? "bg-neutral-900/40" : "bg-black/40";
  const titleColor = destaque ? "text-amber-400" : (cor === "red" ? "text-red-400" : "text-neutral-400");

  const calcularLinhaSegura = (valorMedio: string, tipo: string) => {
    const numero = parseFloat(valorMedio);
    let linhaCalculada = numero * 0.66; 
    
    if (tipo === 'chute') {
      linhaCalculada = Math.floor(linhaCalculada) > 0 ? Math.floor(linhaCalculada) + 0.5 : 0.5;
      return `Over ${linhaCalculada}`;
    }
    return null;
  };

  return (
    <div className={`${bgClass} rounded-[2rem] p-6 border border-white/5 h-full transition-all hover:border-red-500/30 hover:bg-neutral-900/70 group shadow-2xl backdrop-blur-sm`}>
      <h5 className={`${titleColor} font-black mb-6 text-[12px] uppercase tracking-widest flex items-center gap-3 border-b border-white/5 pb-4`}>
        <div className={`w-2 h-2 rounded-full ${destaque ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
        {titulo}
      </h5>
      <ul className="space-y-4">
        {(dados || []).map((jog, index) => {
          const isHot = tipo === 'chute' && parseFloat(jog.valor) >= 1.5;
          const linhaSegura = isHot ? calcularLinhaSegura(jog.valor, 'chute') : null;

          return (
            <li key={index} className={`flex items-center justify-between text-sm group/item ${isHot ? 'bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10' : ''}`}>
              <div className="flex items-center gap-4 text-neutral-200">
                <div className="w-7 h-7 rounded-xl bg-neutral-800 flex items-center justify-center text-[11px] font-black text-neutral-500 border border-white/5 group-hover/item:bg-red-600/20 group-hover/item:text-red-500 transition-colors">
                  {index + 1}
                </div>
                <span className="text-lg leading-none opacity-80">{jog.pais}</span>
                <span className="truncate max-w-[160px] font-black group-hover/item:text-white transition-colors tracking-tight text-base">{jog.nome}</span>
              </div>
              <div className="flex items-center justify-end gap-4">
                {linhaSegura && <SeloAposta texto={linhaSegura} />}
                <span className={`font-mono font-black text-xl ${destaque ? 'text-amber-400' : 'text-white'} drop-shadow-sm`}>
                  {jog.valor}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const AnalystEagle = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="4"/>
    <path d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M30 45 C40 35, 60 35, 70 45 L50 75 Z" fill="currentColor"/>
  </svg>
);

const StatRow = ({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-3">
    <span className="text-xs font-bold text-neutral-400 uppercase">{label}</span>
    <span className={`text-sm font-black ${highlight ? 'text-[#D9A520]' : 'text-white'}`}>{value}</span>
  </div>
);

const Scouts = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState(() => localStorage.getItem('senior_profile_final') ? 'country' : 'login'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [requestCount, setRequestCount] = useState(() => Number(localStorage.getItem('api_quota_final_v2') || 0));
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(() => JSON.parse(localStorage.getItem('senior_profile_final') || 'null'));
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [intel, setIntel] = useState<any>({ standings: [], lastMatches: [], nextMatches: [], stats: null });
  const [dadosScout, setDadosScout] = useState<any>(null);
  const [playersList, setPlayersList] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const painelRef = useRef<HTMLDivElement>(null);

  const bipAudio = useRef(new Audio('https://www.soundjay.com/buttons/button-20.mp3'));
  const playBip = () => { bipAudio.current.currentTime = 0; bipAudio.current.play().catch(() => {}); };

  // --- API FETCH ENGINE BLINDADA ---
  const fetchAPI = async (endpoint: string, params: any = {}) => {
    if (requestCount >= 100) return null;
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    try {
      const res = await fetch(url, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY, 'x-apisports-host': 'v3.football.api-sports.io' }
      });
      const data = await res.json();
      const nextCount = requestCount + 1;
      setRequestCount(nextCount);
      localStorage.setItem('api_quota_final_v2', nextCount.toString());
      return data.response;
    } catch (e) { return null; }
  };

  const handleCountrySelection = async (name: string, data: any) => {
    playBip(); 
    setLoading(true);
    setSelectedCountry({ name, ...data });
    
    let allTeamsFound: any[] = [];
    try {
      const teamRequests = data.leagueIds.map((lId: number) => fetchAPI('teams', { league: lId, season: '2025' }));
      const results = await Promise.all(teamRequests);
      
      results.forEach(res => {
        if (res && res.length > 0) {
          res.forEach((item: any) => {
            if (!allTeamsFound.some(t => t.id === item.team.id)) {
              allTeamsFound.push(item.team);
            }
          });
        }
      });
      
      if (allTeamsFound.length === 0 && name === "BRASIL") {
        allTeamsFound = [{id: 118, name: "Bahia", logo: "https://media.api-sports.io/football/teams/118.png"}];
      }

      setTeamsList(allTeamsFound.sort((a, b) => a.name.localeCompare(b.name)));
      setStep('teams');
    } catch (e) {
      console.error("Erro na raspagem:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelection = async (team: any) => {
    playBip(); setLoading(true);
    setSelectedTeam(team);
    
    const [standRes, fixturesRes] = await Promise.all([
      fetchAPI('standings', { league: selectedCountry.leagueIds[0], season: '2025' }),
      fetchAPI('fixtures', { team: team.id, next: '5' })
    ]);

    setIntel({
      standings: standRes?.[0]?.league?.standings[0] || [],
      lastMatches: [],
      nextMatches: fixturesRes || [],
      stats: null
    });

    // Tenta buscar dados de scout detalhados se disponíveis
    try {
      const scoutRes = await fetch(`/api/scouts/${team.name.toUpperCase().replace(/\s/g, '_')}/GERAL`);
      if (scoutRes.ok) {
        const data = await scoutRes.json();
        setDadosScout(data);
      } else {
        setDadosScout(null);
      }
    } catch (e) {
      setDadosScout(null);
    }
    
    setStep('dashboard');
    setLoading(false);
  };

  const handleLoadPlayers = async () => {
    playBip(); setLoading(true);
    try {
      const res = await fetchAPI('players', { team: selectedTeam.id, season: '2024' });
      if (res && res.length > 0) {
        setPlayersList(res);
      } else {
        setPlayersList([]);
      }
    } catch (e) {
      console.error(e);
    }
    setStep('players');
    setLoading(false);
  };

  const exportarImagem = async () => {
    if (!painelRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toJpeg(painelRef.current, {
        backgroundColor: '#0a0a0a',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `analisai-${selectedTeam?.name.toLowerCase() || 'scout'}-${new Date().getTime()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao exportar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-12 relative z-10 animate-in fade-in">
      <header className="px-6 py-6 flex justify-between items-center border-b border-white/5 bg-black/40">
        <button onClick={onBack} className="p-3 glass-gold rounded-2xl active:scale-90 transition-transform flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D9A520]">
          <ChevronLeft size={16} /> VOLTAR
        </button>
        <div className="flex items-center gap-3">
          <AnalystEagle size={24} className="gold-text" />
          <h1 className="text-xl font-black italic uppercase gold-text tracking-tighter leading-none">ANALIS<span className="text-white">AI</span></h1>
        </div>
        {userProfile && <img src={`https://media.api-sports.io/football/teams/${userProfile.heartTeamId || 118}.png`} className="w-8 h-8 object-contain" alt="heart" />}
      </header>

      <main className="max-w-6xl mx-auto p-6">
         {loading && <div className="flex flex-col items-center justify-center py-32"><Loader2 className="animate-spin gold-text mb-4" size={48}/><p className="text-[10px] font-black uppercase gold-text animate-pulse">PROCESSANDO INTELIGÊNCIA EM TEMPO REAL...</p></div>}
         
         {!loading && step === 'login' && (
           <div className="animate-in fade-in duration-700 flex flex-col items-center py-10">
              <div className="mb-10 text-center">
                 <div className="w-24 h-24 gold-bg rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-2xl">
                    <User size={48} className="text-black" />
                 </div>
                 <h1 className="text-5xl font-black italic gold-text tracking-tighter leading-none uppercase italic">ANALISAI</h1>
              </div>

              <div className="glass-gold rounded-[3rem] p-10 w-full max-w-md border-t-4 border-[#D9A520]">
                <h2 className="text-2xl font-black italic text-center mb-8 uppercase text-white tracking-tight">PERFIL DO ANALISTA</h2>
                <form onSubmit={e => { 
                  e.preventDefault(); 
                  const formData = new FormData(e.currentTarget);
                  const heartTeam = formData.get('heartTeam') as string;
                  const profile = {
                    name: formData.get('name'),
                    age: formData.get('age'),
                    heartTeam: heartTeam,
                    heartTeamId: heartTeam?.toUpperCase().includes('BAHIA') ? '118' : '127'
                  };
                  setUserProfile(profile);
                  localStorage.setItem('senior_profile_final', JSON.stringify(profile));
                  setStep('country'); 
                }} className="space-y-4">
                   <input name="name" placeholder="NOME COMPLETO" required className="w-full bg-black/60 border border-[#D9A520]/40 rounded-xl p-4 text-xs font-bold focus:border-[#D9A520] outline-none uppercase text-white" />
                   <div className="flex gap-4">
                      <input name="age" type="number" placeholder="IDADE" required className="w-1/3 bg-black/60 border border-[#D9A520]/40 rounded-xl p-4 text-xs font-bold focus:border-[#D9A520] outline-none text-white" />
                      <input name="heartTeam" placeholder="TIME DO CORAÇÃO" required className="w-2/3 bg-black/60 border border-[#D9A520]/40 rounded-xl p-4 text-xs font-bold focus:border-[#D9A520] outline-none uppercase text-white" />
                   </div>
                   <button type="submit" className="w-full gold-bg py-5 rounded-xl font-black italic text-sm text-black uppercase active:scale-95 transition-all">ACEDER À INTELIGÊNCIA</button>
                </form>
              </div>
           </div>
         )}

         {!loading && step === 'country' && (
           <div className="space-y-8">
             <div className="flex justify-end">
               <button onClick={() => setStep('partidas_do_dia')} className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#D4AF37]/20 transition-colors flex items-center gap-2">
                 <Calendar size={16} /> Partidas do Dia
               </button>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in slide-in-from-bottom-10">
                {Object.entries(DATABASE).map(([name, data]) => (
                  <button key={name} onClick={() => handleCountrySelection(name, data)} className="glass-gold p-8 rounded-[2.5rem] flex flex-col items-center gap-4 active:scale-95 border-b-2 border-white/5 group hover:border-[#D9A520]/40 transition-all">
                     <div className="w-16 h-16 flex items-center justify-center p-1"><img src={data.flag} className="w-full h-full object-contain rounded-lg shadow-xl" alt={name} /></div>
                     <span className="text-[10px] font-black uppercase text-gray-400 group-hover:gold-text text-center tracking-widest">{name}</span>
                  </button>
                ))}
             </div>
           </div>
         )}

         {!loading && step === 'teams' && (
           <div className="space-y-6 animate-in slide-in-from-right-10 pb-20">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input placeholder={`PESQUISAR EM ${teamsList.length} EQUIPES ATIVAS...`} className="w-full bg-black/40 border border-[#D9A520]/20 rounded-2xl py-6 pl-14 pr-8 text-xs font-black outline-none focus:border-[#D9A520] transition-all uppercase text-white shadow-2xl" onChange={e => setSearchTerm(e.target.value.toUpperCase())} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {teamsList.filter(t => t.name.toUpperCase().includes(searchTerm)).map(t => (
                   <button key={t.id} onClick={() => handleTeamSelection(t)} className="glass-gold p-6 rounded-[2rem] flex items-center gap-4 active:scale-95 hover:border-[#D9A520]/40 transition-all group">
                      <img src={t.logo} className="w-10 h-10 object-contain drop-shadow-lg" alt="t" />
                      <span className="text-[10px] font-black uppercase italic truncate text-left flex-1 group-hover:gold-text leading-tight">{t.name}</span>
                      <ChevronRight size={14} className="text-gray-800" />
                   </button>
                 ))}
              </div>
           </div>
         )}

         {!loading && step === 'dashboard' && selectedTeam && (
           <div className="space-y-6 pb-40 animate-in fade-in duration-700">
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setStep('teams')} className="flex items-center gap-2 text-[10px] font-black uppercase gold-text hover:text-white transition-colors">
                  <ChevronLeft size={16} /> Voltar para Equipes
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={handleLoadPlayers} className="bg-neutral-800 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 active:scale-95 transition-all border border-white/10 hover:border-white/30">
                    <Users size={16} /> Comparar Jogadores
                  </button>
                  <button onClick={exportarImagem} className="bg-[#D9A520] text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 active:scale-95 transition-all">
                    <Download size={16} /> Exportar Scout
                  </button>
                </div>
              </div>

              {/* PAINEL DE ESTATÍSTICAS (O "CANVAS" A SER EXPORTADO) */}
              <div 
                ref={painelRef}
                className="w-full bg-[#0a0a0a] p-10 rounded-[4rem] shadow-[0_60px_120px_rgba(0,0,0,0.9)] border border-[#D9A520]/20 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#D9A520]/10 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="text-center mb-16 border-b border-[#D9A520]/10 pb-14 relative z-10">
                  <div className="flex flex-col items-center justify-center gap-8">
                    <img src={selectedTeam.logo} className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-2xl" alt="team" />
                    <h2 className="text-5xl md:text-7xl font-black italic gold-text uppercase leading-none tracking-tighter">{selectedTeam.name}</h2>
                  </div>
                </div>

                {dadosScout ? (
                  <div className="space-y-16 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="bg-neutral-900/40 rounded-[3rem] p-10 border border-[#D9A520]/10">
                        <h4 className="text-[#D9A520] font-black text-sm uppercase mb-10 flex items-center gap-4 border-b border-[#D9A520]/10 pb-6">
                          <Target size={22} /> Ofensividade
                        </h4>
                        <div className="space-y-7">
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400 font-black text-base uppercase">Gols</span>
                            <span className="font-black text-3xl gold-text">{dadosScout.medias.gols}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400 font-black text-base uppercase">Finalizações</span>
                            <span className="font-black text-2xl text-white">{dadosScout.medias.finalizacoes}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400 font-black text-base uppercase">Escanteios</span>
                            <span className="font-black text-2xl text-white">{dadosScout.medias.escanteios}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-neutral-900/40 rounded-[3rem] p-10 border border-[#D9A520]/10">
                        <h4 className="text-[#D9A520] font-black text-sm uppercase mb-10 flex items-center gap-4 border-b border-[#D9A520]/10 pb-6">
                          <Activity size={22} /> Controle
                        </h4>
                        <div className="space-y-7">
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400 font-black text-base uppercase">Posse</span>
                            <span className="font-black text-3xl gold-text">{dadosScout.medias.posse}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400 font-black text-base uppercase">Faltas</span>
                            <span className="font-black text-2xl text-white">{dadosScout.medias.faltas}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <RankingBox titulo="👟 Finalizações" dados={dadosScout.ataque.finalizacoesTotais} />
                      <RankingBox titulo="🎯 Chutes no Gol" dados={dadosScout.ataque.chutesNoGol} />
                      <RankingBox titulo="⭐ Rating" dados={dadosScout.ataque.rating} destaque />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 relative z-10">
                    <Dice5 size={64} className="mx-auto gold-text mb-6 opacity-20" />
                    <p className="text-neutral-500 font-black uppercase tracking-widest">Dados detalhados em processamento...</p>
                    <p className="text-[10px] text-neutral-600 uppercase mt-2">Aguardando sincronização da IA para {selectedTeam.name}</p>
                  </div>
                )}

                <div className="mt-20 pt-12 border-t border-[#D9A520]/10 text-center relative z-10">
                   <p className="text-neutral-600 text-[10px] uppercase tracking-[0.5em] font-black">
                     AnalisAI Intelligence System • {new Date().getFullYear()}
                   </p>
                </div>
              </div>
           </div>
         )}

         {!loading && step === 'players' && (
            <div className="space-y-6 animate-in slide-in-from-right-10 pb-20">
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setStep('dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase gold-text hover:text-white transition-colors">
                  <ChevronLeft size={16} /> Voltar ao Dashboard
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-neutral-400">{selectedPlayers.length} SELECIONADOS</span>
                  <button 
                    disabled={selectedPlayers.length < 2}
                    onClick={() => setStep('compare_players')} 
                    className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 transition-all ${selectedPlayers.length >= 2 ? 'bg-[#D9A520] text-black active:scale-95' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
                  >
                    <Scissors size={16} /> Comparar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playersList.map(p => {
                  const isSelected = selectedPlayers.some(sp => sp.player.id === p.player.id);
                  return (
                    <button 
                      key={p.player.id} 
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPlayers(selectedPlayers.filter(sp => sp.player.id !== p.player.id));
                        } else {
                          if (selectedPlayers.length < 3) {
                            setSelectedPlayers([...selectedPlayers, p]);
                          }
                        }
                      }} 
                      className={`p-6 rounded-[2rem] flex flex-col items-center gap-4 transition-all group border-2 ${isSelected ? 'bg-[#D9A520]/10 border-[#D9A520]' : 'glass-gold border-transparent hover:border-[#D9A520]/40'}`}
                    >
                      <img src={p.player.photo} className="w-16 h-16 object-cover rounded-full drop-shadow-lg bg-neutral-900" alt={p.player.name} />
                      <div className="text-center">
                        <span className={`text-xs font-black uppercase block ${isSelected ? 'gold-text' : 'text-white'}`}>{p.player.name}</span>
                        <span className="text-[10px] text-neutral-500 uppercase">{p.statistics[0]?.games?.position || 'N/A'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
         )}

         {!loading && step === 'partidas_do_dia' && (
            <div className="space-y-6 animate-in fade-in duration-700 pb-40">
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setStep('country')} className="flex items-center gap-2 text-[10px] font-black uppercase gold-text hover:text-white transition-colors">
                  <ChevronLeft size={16} /> Voltar aos Países
                </button>
                <h2 className="text-3xl font-black italic gold-text uppercase text-center">Partidas do Dia</h2>
                <div className="w-24"></div> {/* Spacer for centering */}
              </div>
              <PartidasDoDia />
            </div>
         )}

         {!loading && step === 'compare_players' && (
            <div className="space-y-6 animate-in fade-in duration-700 pb-40">
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setStep('players')} className="flex items-center gap-2 text-[10px] font-black uppercase gold-text hover:text-white transition-colors">
                  <ChevronLeft size={16} /> Voltar à Seleção
                </button>
              </div>

              <div className="bg-[#0a0a0a] p-10 rounded-[4rem] shadow-[0_60px_120px_rgba(0,0,0,0.9)] border border-[#D9A520]/20 relative overflow-hidden">
                <h2 className="text-3xl font-black italic gold-text uppercase text-center mb-12">Comparação de Atletas</h2>
                
                <div className="flex justify-center gap-8 overflow-x-auto pb-8">
                  {selectedPlayers.map(p => {
                    const stats = p.statistics[0] || {};
                    return (
                      <div key={p.player.id} className="min-w-[280px] flex-1 bg-neutral-900/40 rounded-[3rem] p-8 border border-white/5 flex flex-col items-center">
                        <img src={p.player.photo} className="w-24 h-24 object-cover rounded-full mb-4 border-4 border-[#D9A520]/20" alt={p.player.name} />
                        <h3 className="text-xl font-black uppercase text-white text-center mb-1">{p.player.name}</h3>
                        <span className="text-xs text-[#D9A520] font-bold uppercase mb-8">{stats.games?.position || 'N/A'}</span>

                        <div className="w-full space-y-4">
                          <StatRow label="Partidas" value={stats.games?.appearences || 0} />
                          <StatRow label="Minutos" value={stats.games?.minutes || 0} />
                          <StatRow label="Gols" value={stats.goals?.total || 0} />
                          <StatRow label="Assistências" value={stats.goals?.assists || 0} />
                          <StatRow label="Chutes" value={stats.shots?.total || 0} />
                          <StatRow label="Chutes no Gol" value={stats.shots?.on || 0} />
                          <StatRow label="Passes" value={stats.passes?.total || 0} />
                          <StatRow label="Precisão Passes" value={`${stats.passes?.accuracy || 0}%`} />
                          <StatRow label="Desarmes" value={stats.tackles?.total || 0} />
                          <StatRow label="Rating" value={stats.games?.rating ? parseFloat(stats.games.rating).toFixed(2) : 'N/A'} highlight />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
         )}
      </main>
    </div>
  );
};

export default Scouts;
