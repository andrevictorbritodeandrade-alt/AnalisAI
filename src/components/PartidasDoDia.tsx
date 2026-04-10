import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Star, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  LayoutDashboard, 
  Target, 
  BarChart3, 
  ShieldCheck, 
  Info,
  Clock,
  Zap,
  TrendingUp,
  History,
  FastForward,
  CalendarDays,
  Timer
} from 'lucide-react';

// --- CONFIGURAÇÕES DO PROFESSOR ANDRÉ ---
const BASE_URL = "/api/football"; // Using the proxy

const LEAGUE_MAP = [
  { id: 140, name: "La Liga", country: "Espanha", flag: "🇪🇸" },
  { id: 141, name: "La Liga 2", country: "Espanha", flag: "🇪🇸" },
  { id: 71, name: "Brasileirão - Série A", country: "Brasil", flag: "🇧🇷" },
  { id: 72, name: "Brasileiro - Série B", country: "Brasil", flag: "🇧🇷" },
  { id: 39, name: "Premier League", country: "Inglaterra", flag: "🏴" },
  { id: 40, name: "Championship", country: "Inglaterra", flag: "🏴" },
  { id: 78, name: "Bundesliga", country: "Alemanha", flag: "🇩🇪" },
  { id: 135, name: "Serie A", country: "Itália", flag: "🇮🇹" },
  { id: 128, name: "Primeira División", country: "Argentina", flag: "🇦🇷" },
  { id: 307, name: "Saudi Pro League", country: "Arábia Saudita", flag: "🇸🇦" }
];

const MOCK_REAL_DATA = [
  {
    fixture: { id: 9991, date: "2026-04-10T16:00:00+00:00", status: { short: "NS", elapsed: null } },
    league: { id: 140, name: "La Liga", country: "Espanha" },
    teams: { 
      home: { name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" }, 
      away: { name: "Girona", logo: "https://media.api-sports.io/football/teams/547.png" } 
    },
    prediction: { home: "65%", draw: "20%", away: "15%", xG_home: 2.45, xG_away: 1.12, advice: "Forte Favoritismo" }
  },
  {
    fixture: { id: 9992, date: "2026-04-10T18:30:00+00:00", status: { short: "NS", elapsed: null } },
    league: { id: 140, name: "La Liga", country: "Espanha" },
    teams: { 
      home: { name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" }, 
      away: { name: "Atletico Madrid", logo: "https://media.api-sports.io/football/teams/530.png" } 
    },
    prediction: { home: "45%", draw: "30%", away: "25%", xG_home: 1.85, xG_away: 1.42, advice: "Equilíbrio Técnico" }
  },
  {
    fixture: { id: 9993, date: "2026-04-10T20:00:00+00:00", status: { short: "71", elapsed: 71 } },
    league: { id: 71, name: "Série A", country: "Brasil" },
    teams: { 
      home: { name: "Flamengo", logo: "https://media.api-sports.io/football/teams/127.png" }, 
      away: { name: "Palmeiras", logo: "https://media.api-sports.io/football/teams/121.png" } 
    },
    goals: { home: 1, away: 0 },
    prediction: { home: "55%", draw: "25%", away: "20%", xG_home: 2.10, xG_away: 1.35, advice: "Vantagem Mandante" }
  }
];

const PartidasDoDia = ({ onBack }: { onBack?: () => void }) => {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("2026-04-10"); 
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [predictionData, setPredictionData] = useState<Record<number, any>>({});
  const [teamHistory, setTeamHistory] = useState<Record<number, any>>({});
  const [apiError, setApiError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setApiError(false);
    try {
      const response = await fetch(`${BASE_URL}/fixtures?date=${selectedDate}`);
      const data = await response.json();
      
      if (data.errors && Object.keys(data.errors).length > 0) throw new Error("API Limit");

      // Fallback se houver erro na API ou nenhum dado retornado
      if (!data.response || data.response.length === 0) {
        setFixtures(MOCK_REAL_DATA);
      } else {
        const leagueIds = LEAGUE_MAP.map(l => l.id);
        const filtered = data.response.filter((f: any) => leagueIds.includes(f.league.id));
        
        if (filtered.length === 0 && selectedDate === "2026-04-10") setFixtures(MOCK_REAL_DATA);
        else setFixtures(filtered.sort((a: any, b: any) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()));
      }
    } catch (err) {
      setApiError(true);
      if (selectedDate === "2026-04-10") setFixtures(MOCK_REAL_DATA);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const loadTeamJourney = async (teamId: number) => {
    if (teamHistory[teamId]) return;
    try {
      // Buscar últimos 3 resultados
      const resPast = await fetch(`${BASE_URL}/fixtures?team=${teamId}&last=3`);
      const dataPast = await resPast.json();

      // Buscar próximos 3 jogos
      const resNext = await fetch(`${BASE_URL}/fixtures?team=${teamId}&next=3`);
      const dataNext = await resNext.json();

      setTeamHistory(prev => ({
        ...prev,
        [teamId]: {
          past: dataPast.response || [],
          future: dataNext.response || []
        }
      }));
    } catch (e) {
      console.error("Erro ao carregar jornada da equipe", e);
    }
  };

  const loadMatchDetails = async (match: any) => {
    const fixtureId = match.fixture.id;
    if (predictionData[fixtureId]) return;

    const now = Date.now();
    const timeSinceLast = (now - lastRequestTime) / 1000;

    if (timeSinceLast < 60) {
      setCountdown(Math.ceil(60 - timeSinceLast));
      return; // Bloqueia a requisição se não deu 1 minuto
    }

    try {
      const response = await fetch(`${BASE_URL}/predictions?fixture=${fixtureId}`);
      const data = await response.json();
      if (data.response?.[0]) {
        const pred = data.response[0];
        setPredictionData(prev => ({
          ...prev,
          [fixtureId]: {
            percent: pred.predictions.percent,
            advice: pred.predictions.advice,
            homeXG: parseFloat(pred.teams.home.last_5.goals.for.average || "1.2"),
            awayXG: parseFloat(pred.teams.away.last_5.goals.for.average || "1.1")
          }
        }));
        setLastRequestTime(Date.now());
        setCountdown(0);
      }

      // Carregar Jornada das duas equipes (sempre carrega, pois não tem o mesmo limite rígido)
      await loadTeamJourney(match.teams.home.id);
      await loadTeamJourney(match.teams.away.id);
    } catch (e) {
      const mock = MOCK_REAL_DATA.find(m => m.fixture.id === fixtureId);
      if (mock) {
        setPredictionData(prev => ({
          ...prev,
          [fixtureId]: {
            percent: { home: mock.prediction.home, draw: mock.prediction.draw, away: mock.prediction.away },
            advice: mock.prediction.advice,
            homeXG: mock.prediction.xG_home,
            awayXG: mock.prediction.xG_away
          }
        }));
      }
    }
  };

  useEffect(() => { loadData(); }, [loadData]);

  const filteredFixtures = useMemo(() => {
    if (!searchTerm) return fixtures;
    return fixtures.filter(f => 
      f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.teams.away.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fixtures, searchTerm]);

  const grouped = useMemo(() => {
    return filteredFixtures.reduce((acc: any, curr: any) => {
      const key = curr.league.id;
      if (!acc[key]) acc[key] = { info: curr.league, matches: [] };
      acc[key].matches.push(curr);
      return acc;
    }, {});
  }, [filteredFixtures]);

  const XGComparisonBar = ({ homeXG, awayXG }: { homeXG: number, awayXG: number }) => {
    const total = homeXG + awayXG;
    const homeWidth = total > 0 ? (homeXG / total) * 100 : 50;
    const awayWidth = total > 0 ? (awayXG / total) * 100 : 50;

    return (
      <div className="w-full space-y-3 mt-6 pt-6 border-t border-white/10">
        <div className="flex justify-between items-end px-1">
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-tighter">xG Mandante</span>
            <span className="text-sm font-black text-emerald-400 leading-none">{homeXG.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expectativa de Gols</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-red-500/60 uppercase tracking-tighter">xG Visitante</span>
            <span className="text-sm font-black text-red-500 leading-none">{awayXG.toFixed(2)}</span>
          </div>
        </div>
        <div className="relative h-3 w-full bg-white/5 rounded-full flex overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <div 
            style={{ width: `${homeWidth}%` }} 
            className="bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out relative"
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
          </div>
          <div 
            style={{ width: `${awayWidth}%` }} 
            className="bg-gradient-to-l from-red-600 to-red-400 transition-all duration-1000 ease-out relative"
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
          </div>
          {/* Center Divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black/40 -translate-x-1/2 z-10" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-24">
      {/* Header Fixo */}
      <header className="bg-[#121212] sticky top-0 z-50 border-b border-white/5 shadow-2xl">
        <div className="p-4 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronDown className="rotate-90" size={20} />
                </button>
              )}
              <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-900/20">
                <LayoutDashboard size={20} />
              </div>
              <div className="text-left leading-none">
                <h1 className="text-lg font-black italic tracking-tighter uppercase">Analisai Pro</h1>
                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest italic">André Brito • Central de Rodadas</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <CalendarDays size={18} className="text-gray-500" />
               <input 
                 type="date" 
                 className="bg-[#1f1f1f] text-[10px] font-black uppercase p-2 rounded-lg border border-white/10 outline-none focus:border-emerald-500"
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
               />
            </div>
          </div>

          {/* Atalhos Rápidos de Datas */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[-1, 0, 1, 2, 3].map((offset) => {
              const d = new Date("2026-04-10T12:00:00Z");
              d.setDate(d.getDate() + offset);
              const dStr = d.toISOString().split('T')[0];
              const isActive = selectedDate === dStr;
              const labels = ["ONTEM", "HOJE", "AMANHÃ", "12/04", "13/04"];
              return (
                <button 
                  key={dStr}
                  onClick={() => setSelectedDate(dStr)}
                  className={`px-4 py-2 text-[9px] font-black uppercase transition-all rounded-xl border whitespace-nowrap ${isActive ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-[#1f1f1f] border-white/5 text-gray-500 hover:text-gray-300'}`}
                >
                  {labels[offset + 1] || d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </button>
              );
            })}
          </div>

          {/* Busca por Equipe */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text"
              placeholder="Buscar equipe ou liga específica..."
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {countdown > 0 && (
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer size={16} className="text-amber-500 animate-pulse" />
                <p className="text-[10px] text-amber-200 font-bold uppercase tracking-widest text-left">
                  Servidor em espera. Próxima análise liberada em:
                </p>
              </div>
              <span className="text-xl font-black text-amber-500">{countdown}s</span>
            </div>
          </div>
        )}
      </header>

      {/* Alerta de API */}
      {apiError && (
        <div className="max-w-2xl mx-auto m-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
          <Info size={20} className="text-amber-500" />
          <p className="text-xs text-amber-200 font-bold uppercase leading-tight">Limite de dados reais atingido (1 min). Exibindo projeções Analisai.</p>
        </div>
      )}

      {/* Lista de Partidas */}
      <main className="max-w-2xl mx-auto p-2">
        {loading ? (
          <div className="py-20 flex flex-col items-center opacity-40">
            <RefreshCw size={32} className="animate-spin text-emerald-500 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando...</p>
          </div>
        ) : (
          Object.values(grouped).map((league: any) => (
            <div key={league.info.id} className="mb-4">
              <div className="bg-[#181818] p-3 rounded-t-xl flex items-center gap-3 border-b border-white/5">
                <span className="text-sm">{LEAGUE_MAP.find(l => l.id === league.info.id)?.flag || "🏳️"}</span>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-tight">
                  {league.info.country} - {league.info.name}
                </span>
              </div>

              <div className="bg-[#1f1f1f] rounded-b-xl overflow-hidden divide-y divide-white/5 shadow-xl">
                {league.matches.map((match: any) => (
                  <div key={match.fixture.id}>
                    {/* Linha da Partida: fulano de tal versus ciclano */}
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer active:bg-white/5 transition-colors"
                      onClick={() => {
                        setExpandedId(expandedId === match.fixture.id ? null : match.fixture.id);
                        loadMatchDetails(match);
                      }}
                    >
                      <div className="flex items-center gap-3 w-full justify-between">
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-xs font-bold text-gray-200 text-right truncate max-w-[100px]">{match.teams.home.name}</span>
                          <img src={match.teams.home.logo} className="w-6 h-6 object-contain" alt="" />
                        </div>
                        
                        <div className="flex flex-col items-center min-w-[60px]">
                          <span className="text-[10px] font-black text-emerald-500 uppercase">VS</span>
                          <span className="text-[9px] font-bold text-gray-500">
                            {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-1 justify-start">
                          <img src={match.teams.away.logo} className="w-6 h-6 object-contain" alt="" />
                          <span className="text-xs font-bold text-gray-200 text-left truncate max-w-[100px]">{match.teams.away.name}</span>
                        </div>
                      </div>
                      <div className="ml-2">
                        {expandedId === match.fixture.id ? <ChevronUp size={16} className="text-emerald-500" /> : <ChevronDown size={16} className="text-gray-600" />}
                      </div>
                    </div>

                    {/* Novo Painel de Probabilidades Simétrico */}
                    {expandedId === match.fixture.id && (
                      <div className="bg-black/40 p-5 border-t border-white/5 animate-in slide-in-from-top-2 duration-300 space-y-8">
                        <div className="grid grid-cols-3 gap-2">
                          
                          {/* Coluna 1: Time da Casa */}
                          <div className="flex flex-col items-center text-center space-y-2 border-r border-white/5 pr-2">
                            <p className="text-[8px] font-black text-gray-500 uppercase">Mandante</p>
                            {!predictionData[match.fixture.id] ? (
                              <div className="w-full bg-white/5 rounded-lg p-2 h-12 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-gray-600 uppercase animate-pulse">Fila...</span>
                              </div>
                            ) : (
                              <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                                <p className="text-[10px] font-black text-emerald-400">VITÓRIA: {predictionData[match.fixture.id]?.percent.home || '...'}</p>
                                <p className="text-[10px] font-black text-red-400">DERROTA: {predictionData[match.fixture.id]?.percent.away || '...'}</p>
                              </div>
                            )}
                          </div>

                          {/* Coluna 2: Empate (Centro) */}
                          <div className="flex flex-col items-center justify-center text-center px-1">
                            <div className="bg-[#1a1a1a] border border-white/10 rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-lg">
                              <p className="text-[7px] font-black text-gray-500 uppercase">Empate</p>
                              <p className="text-xs font-black text-white">{predictionData[match.fixture.id]?.percent.draw || '...'}</p>
                            </div>
                            <div className="mt-3 flex flex-col items-center gap-1">
                               <Zap size={10} className="text-yellow-500 animate-pulse" />
                               <p className="text-[7px] font-black text-gray-400 uppercase max-w-[80px] leading-tight">
                                 {predictionData[match.fixture.id]?.advice || (countdown > 0 ? "Aguardando Fila..." : "Analisando...")}
                               </p>
                            </div>
                          </div>

                          {/* Coluna 3: Time Visitante */}
                          <div className="flex flex-col items-center text-center space-y-2 border-l border-white/5 pl-2">
                            <p className="text-[8px] font-black text-gray-500 uppercase">Visitante</p>
                            {!predictionData[match.fixture.id] ? (
                              <div className="w-full bg-white/5 rounded-lg p-2 h-12 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-gray-600 uppercase animate-pulse">Fila...</span>
                              </div>
                            ) : (
                              <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                                <p className="text-[10px] font-black text-emerald-400">VITÓRIA: {predictionData[match.fixture.id]?.percent.away || '...'}</p>
                                <p className="text-[10px] font-black text-red-400">DERROTA: {predictionData[match.fixture.id]?.percent.home || '...'}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Gráfico de Barras xG Comparativo */}
                        {predictionData[match.fixture.id] && (
                          <XGComparisonBar 
                            homeXG={predictionData[match.fixture.id].homeXG} 
                            awayXG={predictionData[match.fixture.id].awayXG} 
                          />
                        )}

                        {/* 2. A Jornada da Equipe: Passado e Futuro (Novo) */}
                        <div className="grid md:grid-cols-2 gap-6">
                           {/* Jornada Mandante */}
                           <div className="space-y-4">
                              <div className="flex items-center gap-2 px-1">
                                 <History size={14} className="text-emerald-500" />
                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Jornada: {match.teams.home.name}</span>
                              </div>
                              <div className="bg-[#121212] rounded-2xl p-4 border border-white/5 space-y-3">
                                 <p className="text-[8px] font-black text-emerald-500/50 uppercase italic">Resultados Recentes</p>
                                 {teamHistory[match.teams.home.id]?.past.length > 0 ? teamHistory[match.teams.home.id].past.map((f: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] font-bold text-gray-400 border-b border-white/5 pb-1">
                                       <span>{f.teams.home.name} {f.goals.home}-{f.goals.away} {f.teams.away.name}</span>
                                    </div>
                                 )) : <p className="text-[10px] text-gray-600">Carregando...</p>}
                                 <p className="text-[8px] font-black text-red-500/50 uppercase italic mt-4">Próximos Compromissos</p>
                                 {teamHistory[match.teams.home.id]?.future.length > 0 ? teamHistory[match.teams.home.id].future.map((f: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                                       <span>{f.teams.home.name} vs {f.teams.away.name}</span>
                                       <span className="text-[8px] opacity-50">{new Date(f.fixture.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                                    </div>
                                 )) : <p className="text-[10px] text-gray-600">Carregando...</p>}
                              </div>
                           </div>

                           {/* Jornada Visitante */}
                           <div className="space-y-4">
                              <div className="flex items-center gap-2 px-1">
                                 <FastForward size={14} className="text-red-500" />
                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Jornada: {match.teams.away.name}</span>
                              </div>
                              <div className="bg-[#121212] rounded-2xl p-4 border border-white/5 space-y-3">
                                 <p className="text-[8px] font-black text-emerald-500/50 uppercase italic">Resultados Recentes</p>
                                 {teamHistory[match.teams.away.id]?.past.length > 0 ? teamHistory[match.teams.away.id].past.map((f: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] font-bold text-gray-400 border-b border-white/5 pb-1">
                                       <span>{f.teams.home.name} {f.goals.home}-{f.goals.away} {f.teams.away.name}</span>
                                    </div>
                                 )) : <p className="text-[10px] text-gray-600">Carregando...</p>}
                                 <p className="text-[8px] font-black text-red-500/50 uppercase italic mt-4">Próximos Compromissos</p>
                                 {teamHistory[match.teams.away.id]?.future.length > 0 ? teamHistory[match.teams.away.id].future.map((f: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                                       <span>{f.teams.home.name} vs {f.teams.away.name}</span>
                                       <span className="text-[8px] opacity-50">{new Date(f.fixture.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                                    </div>
                                 )) : <p className="text-[10px] text-gray-600">Carregando...</p>}
                              </div>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Barra de Status (Substituiu a antiga barra de navegação) */}
      <div className="fixed bottom-4 left-4 right-4 bg-emerald-600 p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-400/30 z-[100]">
        <div className="flex items-center gap-3 px-2">
          <ShieldCheck size={18} className="text-white" />
          <div>
            <p className="text-[9px] font-black uppercase text-white/70 leading-none mb-1">Analisai Pro • Ativo</p>
            <p className="text-[10px] text-white font-black uppercase">Prof. André Brito</p>
          </div>
        </div>
        <button onClick={() => loadData()} className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-xl transition-all active:scale-95">
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};

export default PartidasDoDia;
