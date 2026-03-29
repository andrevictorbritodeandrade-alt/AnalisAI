import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { 
  Trophy, 
  TrendingUp, 
  RefreshCw, 
  Download, 
  Target, 
  Activity, 
  Users, 
  ShieldCheck,
  LayoutGrid,
  ChevronDown,
  CircleDollarSign,
  Zap,
  BarChart3,
  PieChart,
  Settings2,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import Alavancagem from './components/Alavancagem';

const CLUB_CRESTS: Record<string, string> = {
  FLAMENGO: "https://a.espncdn.com/i/teamlogos/soccer/500/819.png",
  PALMEIRAS: "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg",
  BOTAFOGO: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Botafogo_de_Futebol_e_Regatas_logo.svg",
  REAL_MADRID: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  MAN_CITY: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  BAYERN: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  PSG: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
};

// Componente visual do Logo 3D
const Logo3D = () => (
  <div className="relative group cursor-pointer select-none">
    <div className="flex items-center gap-4">
      <div className="relative w-14 h-14 flex items-center justify-center transform-gpu transition-all group-hover:scale-110 group-hover:rotate-3 duration-500">
        {/* Camadas de sombra para efeito 3D profundo */}
        <div className="absolute inset-0 bg-red-600 rounded-2xl rotate-6 opacity-20 blur-md"></div>
        <div className="absolute inset-0 bg-red-500 rounded-2xl -rotate-3 opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-red-600 to-red-800 rounded-2xl shadow-[0_15px_30px_rgba(220,38,38,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center border border-red-400/30">
          <TrendingUp className="text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.6)]" size={32} strokeWidth={3} />
        </div>
        {/* Brilho animado */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      </div>
      <div className="flex flex-col leading-none">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center">
          <span className="text-white drop-shadow-[0_2px_0_#991b1b,0_4px_0_#7f1d1d,0_8px_12px_rgba(0,0,0,0.6)]">ANALIS</span>
          <span className="text-red-500 drop-shadow-[0_2px_0_#7f1d1d,0_4px_0_#450a0a,0_8px_12px_rgba(0,0,0,0.6)]">AI</span>
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11px] font-black text-red-500/90 uppercase tracking-[0.35em]">Premium Intelligence</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Componente visual do "Selo de Aposta Recomendada"
const SeloAposta = ({ texto }: { texto: string }) => (
  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider animate-pulse shadow-[0_4px_15px_rgba(16,185,129,0.4)] border border-emerald-400/30">
    <Zap size={12} className="fill-white" /> {texto}
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
        {dados.map((jog, index) => {
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

export default function App() {
  const painelRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [equipeAtual, setEquipeAtual] = useState('FLAMENGO');
  const [competicaoAtual, setCompeticaoAtual] = useState('');
  const [competicoesDisponiveis, setCompeticoesDisponiveis] = useState<{id: string, name: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'scout' | 'betmanager'>('scout');
  const [dados, setDados] = useState<any>(null);

  // Busca as competições disponíveis para a equipe
  const buscarCompeticoes = async (teamId: string) => {
    setLoading(true);
    try {
      const resposta = await fetch(`/api/competitions/${teamId}`);
      if (!resposta.ok) throw new Error("Erro ao buscar competições");
      const comps = await resposta.json();
      setCompeticoesDisponiveis(comps);
      if (comps.length > 0) {
        setCompeticaoAtual(comps[0].id);
        await buscarDadosScout(teamId, comps[0].id);
      } else {
        setDados(null);
      }
    } catch (error) {
      console.error(error);
      setCompeticoesDisponiveis([]);
      setDados(null);
    } finally {
      setLoading(false);
    }
  };

  // Busca os dados de scout para a equipe e competição selecionadas
  const buscarDadosScout = async (teamId: string, compId: string) => {
    setLoading(true);
    try {
      const resposta = await fetch(`/api/scouts/${teamId}/${compId}`);
      if (!resposta.ok) throw new Error("Erro ao buscar dados de scout");
      const novosDados = await resposta.json();
      setDados(novosDados);
    } catch (error) {
      console.error(error);
      setDados(null);
    } finally {
      setLoading(false);
    }
  };

  // Efeito inicial
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    buscarCompeticoes('FLAMENGO');
    return () => {
      document.body.style.overflowX = '';
    };
  }, []);

  const handleTeamChange = (teamId: string) => {
    setEquipeAtual(teamId);
    buscarCompeticoes(teamId);
  };

  const handleCompChange = (compId: string) => {
    setCompeticaoAtual(compId);
    buscarDadosScout(equipeAtual, compId);
  };

  const exportarImagem = async () => {
    if (!painelRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(painelRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `analisai-${equipeAtual.toLowerCase()}-${new Date().getTime()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } catch (err) {
      console.error("Erro ao exportar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 font-sans text-white flex flex-col items-center selection:bg-red-500/30">
      
      {/* HEADER E NAVEGAÇÃO PRINCIPAL */}
      <div className="w-full max-w-6xl mb-10 flex flex-col md:flex-row justify-between items-center bg-neutral-900/40 p-8 rounded-[3rem] border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        
        <Logo3D />
        
        <div className="flex bg-black/60 rounded-[2rem] p-2 border border-white/5 shadow-inner mt-8 md:mt-0">
          <button 
            onClick={() => setActiveTab('scout')}
            className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.25em] transition-all duration-500 ${activeTab === 'scout' ? 'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-[0_8px_25px_rgba(220,38,38,0.5)] scale-105' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
          >
            <BarChart3 size={18} />
            Scout
          </button>
          <button 
            onClick={() => setActiveTab('betmanager')}
            className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.25em] transition-all duration-500 ${activeTab === 'betmanager' ? 'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-[0_8px_25px_rgba(220,38,38,0.5)] scale-105' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
          >
            <CircleDollarSign size={18} />
            Bet Manager
          </button>
        </div>
      </div>

      {activeTab === 'scout' ? (
        <>
          {/* CONTROLES DE EQUIPE E COMPETIÇÃO */}
          <div className="w-full max-w-6xl mb-12 flex flex-wrap justify-center items-center gap-6 bg-neutral-900/20 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
              <div className="relative group min-w-[260px]">
                <label className="absolute -top-3 left-6 bg-[#050505] px-3 text-[10px] font-black text-red-500 uppercase tracking-[0.3em] z-10">Equipe Selecionada</label>
                <select 
                  className="appearance-none bg-black/40 border border-white/10 text-white font-black text-base rounded-2xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 block px-6 py-5 pr-14 outline-none transition-all hover:border-red-500/40 cursor-pointer w-full shadow-inner"
                  onChange={(e) => handleTeamChange(e.target.value)}
                  value={equipeAtual}
              >
                <optgroup label="Brasil" className="bg-neutral-900">
                  <option value="FLAMENGO">Flamengo</option>
                  <option value="PALMEIRAS">Palmeiras</option>
                  <option value="BOTAFOGO">Botafogo</option>
                </optgroup>
                <optgroup label="Europa" className="bg-neutral-900">
                  <option value="REAL_MADRID">Real Madrid</option>
                  <option value="MAN_CITY">Manchester City</option>
                  <option value="BAYERN">Bayern de Munique</option>
                  <option value="PSG">PSG</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-red-500/60 group-hover:text-red-500 transition-colors">
                <ChevronDown size={22} />
              </div>
            </div>

            {competicoesDisponiveis.length > 0 && (
              <div className="relative group min-w-[260px]">
                <label className="absolute -top-3 left-6 bg-[#050505] px-3 text-[10px] font-black text-red-500 uppercase tracking-[0.3em] z-10">Competição Ativa</label>
                <select 
                  className="appearance-none bg-black/40 border border-white/10 text-white font-black text-base rounded-2xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 block px-6 py-5 pr-14 outline-none transition-all hover:border-red-500/40 cursor-pointer w-full shadow-inner"
                  onChange={(e) => handleCompChange(e.target.value)}
                  value={competicaoAtual}
                >
                  {competicoesDisponiveis.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-red-500/60 group-hover:text-red-500 transition-colors">
                  <ChevronDown size={22} />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-6">
            <button 
              onClick={() => buscarDadosScout(equipeAtual, competicaoAtual)}
              disabled={loading || !competicaoAtual}
              className={`font-black uppercase text-[12px] tracking-[0.25em] py-5 px-10 rounded-2xl transition-all flex items-center gap-4 shadow-2xl active:scale-95 ${loading ? 'bg-red-900/20 text-red-500/50 cursor-not-allowed border border-red-900/30' : 'bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-red-900/40'}`}
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <RefreshCw size={20} />
              )}
              {loading ? 'Sincronizando...' : 'Atualizar Inteligência'}
            </button>
            
            <button 
              onClick={exportarImagem}
              disabled={loading || !dados}
              className="bg-neutral-800/50 hover:bg-neutral-800 border border-white/5 text-white font-black uppercase text-[12px] tracking-[0.25em] py-5 px-10 rounded-2xl transition-all flex items-center gap-4 disabled:opacity-30 active:scale-95 shadow-xl"
            >
              <Download size={20} className="text-red-500" />
              Exportar Scout
            </button>
          </div>
        </div>

      {/* PAINEL DE ESTATÍSTICAS (O "CANVAS" A SER EXPORTADO) */}
      {dados ? (
        <div 
          id="scout-panel"
          ref={painelRef}
          className="w-full max-w-6xl bg-[#0a0a0a] p-10 md:p-16 rounded-[4rem] shadow-[0_60px_120px_rgba(0,0,0,0.9)] border border-white/5 relative overflow-hidden"
        >
          {/* Efeitos de Fundo Premium */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-600/15 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          {/* CABEÇALHO DO CARD */}
          <div className="text-center mb-16 border-b border-white/5 pb-14 relative z-10">
            <div className="flex flex-col items-center justify-center gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
                {CLUB_CRESTS[equipeAtual] && (
                  <img 
                    src={CLUB_CRESTS[equipeAtual]} 
                    alt={`${equipeAtual} crest`} 
                    className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] relative z-10 transform transition-all group-hover:scale-110 group-hover:rotate-6 duration-700"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] uppercase italic">
                  {equipeAtual}
                </h2>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-red-600"></div>
                  <p className="text-red-500 font-black text-base tracking-[0.5em] uppercase">{dados.campeonato}</p>
                  <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-red-600"></div>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 1: MÉDIAS GERAIS */}
          <div className="mb-16 relative z-10">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-500/40 shadow-lg">
                <LayoutGrid className="text-red-500" size={28} />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic">
                Performance <span className="text-red-500">Analítica</span>
              </h3>
              <div className="flex-grow h-[1px] bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Tabela Ataque */}
              <div className="bg-neutral-900/40 rounded-[3rem] p-10 border border-white/5 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-15 transition-all duration-700 transform group-hover:scale-125">
                  <Target size={120} />
                </div>
                <h4 className="text-red-400 font-black text-sm uppercase tracking-[0.25em] mb-10 flex items-center gap-4 border-b border-white/5 pb-6">
                  <Target size={22} className="text-red-500" /> Ofensividade & Precisão
                </h4>
                <div className="space-y-7">
                  <div className="flex justify-between items-center group/row">
                    <span className="text-neutral-400 font-black text-base uppercase tracking-tight group-hover/row:text-neutral-200 transition-colors">Gols marcados</span>
                    <span className="font-black text-3xl text-white bg-red-600/10 px-6 py-2 rounded-2xl border border-red-500/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">{dados.medias.gols}</span>
                  </div>
                  <div className="flex justify-between items-center group/row">
                    <span className="text-neutral-400 font-black text-base uppercase tracking-tight group-hover/row:text-neutral-200 transition-colors">Finalizações totais</span>
                    <span className="font-black text-2xl text-white">{dados.medias.finalizacoes}</span>
                  </div>
                  <div className="flex justify-between items-center group/row">
                    <span className="text-neutral-400 font-black text-base uppercase tracking-tight group-hover/row:text-neutral-200 transition-colors">Chutes no Alvo</span>
                    <div className="flex items-center gap-4">
                      {parseFloat(dados.medias.chutesGol) > 5.0 && <SeloAposta texto="Elite Tier" />}
                      <span className="font-black text-2xl text-white">{dados.medias.chutesGol}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center group/row">
                    <span className="text-neutral-400 font-black text-base uppercase tracking-tight group-hover/row:text-neutral-200 transition-colors">Big Chances</span>
                    <span className="font-black text-2xl text-white">{dados.medias.grandesChances}</span>
                  </div>
                </div>
              </div>

              {/* Tabela Controle */}
              <div className="bg-neutral-900/40 rounded-[3rem] p-10 border border-white/5 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-15 transition-all duration-700 transform group-hover:scale-125">
                  <Activity size={120} />
                </div>
                <h4 className="text-red-400 font-black text-sm uppercase tracking-[0.25em] mb-10 flex items-center gap-4 border-b border-white/5 pb-6">
                  <Activity size={22} className="text-red-500" /> Domínio & Posicionamento
                </h4>
                <div className="space-y-7">
                  <div className="flex justify-between items-center group/row">
                    <span className="text-neutral-400 font-black text-base uppercase tracking-tight group-hover/row:text-neutral-200 transition-colors">Posse de bola</span>
                    <span className="font-black text-3xl text-red-500 italic drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">{dados.medias.posse}</span>
                  </div>
                  <div className="flex justify-between items-center group/row">
                    <span className="text-neutral-400 font-black text-base uppercase tracking-tight group-hover/row:text-neutral-200 transition-colors">Escanteios</span>
                    <div className="flex items-center gap-4">
                      {parseFloat(dados.medias.escanteios) >= 6.0 && <SeloAposta texto="Over 5.5" />}
                      <span className="font-black text-2xl text-white">{dados.medias.escanteios}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center group/row">
                    <span className="text-neutral-400 font-black text-base uppercase tracking-tight group-hover/row:text-neutral-200 transition-colors">Faltas sofridas</span>
                    <span className="font-black text-2xl text-white">{dados.medias.faltas}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: TOP JOGADORES - ATAQUE */}
          <div className="mb-16 relative z-10">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-500/40 shadow-lg">
                <Users className="text-red-500" size={28} />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic">
                Elite <span className="text-red-500">Ofensiva</span>
              </h3>
              <div className="flex-grow h-[1px] bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <RankingBox titulo="👟 Finalizações" dados={dados.ataque.finalizacoesTotais} />
              <RankingBox titulo="🎯 Chutes no Gol" dados={dados.ataque.chutesNoGol} />
              <RankingBox titulo="🚀 Fora da Área" dados={dados.ataque.finalizacoesFora} />
              <RankingBox titulo="☄️ Gols Longos" dados={dados.ataque.golsFora} />
              <RankingBox titulo="🚩 Cruzamentos" dados={dados.ataque.escanteiosCruzamentos} />
              <RankingBox titulo="⭐ Rating Premium" dados={dados.ataque.rating} destaque />
            </div>
          </div>

          {/* SEÇÃO 3: TOP JOGADORES - DEFESA */}
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center border border-white/10 shadow-lg">
                <ShieldCheck className="text-neutral-400" size={28} />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic">
                Muralha <span className="text-neutral-500">Defensiva</span>
              </h3>
              <div className="flex-grow h-[1px] bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <RankingBox titulo="🛑 Desarmes" dados={dados.defesa.desarmes} cor="neutral" />
              <RankingBox titulo="✂️ Interceptações" dados={dados.defesa.interceptacoes} cor="neutral" />
              <RankingBox titulo="🛡️ Rebatidas" dados={dados.defesa.cortes} cor="neutral" />
            </div>
          </div>

          {/* Rodapé da Imagem */}
          <div className="mt-20 pt-12 border-t border-white/5 text-center relative z-10 flex flex-col items-center gap-6">
             <div className="flex items-center gap-10">
                <div className="flex items-center gap-3">
                  <PieChart size={18} className="text-red-500" />
                  <span className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em]">Data Analytics</span>
                </div>
                <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
                <div className="flex items-center gap-3">
                  <Settings2 size={18} className="text-red-500" />
                  <span className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em]">AI Powered Engine</span>
                </div>
             </div>
             <p className="text-neutral-600 text-[10px] uppercase tracking-[0.5em] font-black flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse"></span>
               AnalisAI Intelligence System • v2.5 • {new Date().getFullYear()}
             </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-6xl bg-neutral-900/20 p-40 rounded-[4rem] border border-dashed border-white/10 text-center backdrop-blur-sm flex flex-col items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-neutral-800/50 flex items-center justify-center border border-white/5 animate-pulse">
            <Search size={48} className="text-neutral-600" />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-neutral-400 font-black uppercase text-sm tracking-[0.4em]">Aguardando Seleção de Dados</p>
            <p className="text-neutral-600 text-base max-w-md">Selecione uma equipe e competição no menu superior para processar o relatório de inteligência avançada.</p>
          </div>
        </div>
      )}
      </>
      ) : (
        /* SEÇÃO: ALAVANCAGEM */
        <div className="w-full max-w-6xl bg-[#050505] rounded-[4rem] border border-white/5 shadow-[0_60px_120px_rgba(0,0,0,1)] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none"></div>
          <Alavancagem />
        </div>
      )}

      {/* Footer do App */}
      <footer className="w-full max-w-6xl mt-16 mb-12 flex flex-col md:flex-row justify-between items-center gap-8 px-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-500/20 shadow-lg">
            <ShieldCheck size={20} className="text-red-500" />
          </div>
          <p className="text-[11px] font-black text-neutral-600 uppercase tracking-[0.25em]">Plataforma de Inteligência Auditada</p>
        </div>
        
        <div className="flex items-center gap-10">
          <a href="#" className="text-[11px] font-black text-neutral-500 hover:text-red-500 transition-colors uppercase tracking-[0.25em] flex items-center gap-2">
            Suporte <ExternalLink size={14} />
          </a>
          <a href="#" className="text-[11px] font-black text-neutral-500 hover:text-red-500 transition-colors uppercase tracking-[0.25em] flex items-center gap-2">
            Termos <ExternalLink size={14} />
          </a>
          <div className="px-6 py-2 rounded-full bg-neutral-900 border border-white/5 text-[10px] font-black text-red-500 uppercase tracking-[0.3em] shadow-inner">
            Enterprise v2.5
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #050505; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        select { background-image: none !important; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }
      `}} />
    </div>
  );
}
