import React, { useState, useRef } from 'react';
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
  ChevronDown
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

// Componente visual do "Selo de Aposta Recomendada"
const SeloAposta = ({ texto }: { texto: string }) => (
  <span className="inline-flex items-center gap-1 bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.6)]">
    🔥 {texto}
  </span>
);

// Componente Auxiliar para renderizar as listas de Top 3
function RankingBox({ titulo, dados, destaque = false, cor = "red", tipo = "none" }: { titulo: string, dados: any[], destaque?: boolean, cor?: "red" | "neutral", tipo?: "chute" | "none" }) {
  const bgClass = cor === "red" ? "bg-black/30" : "bg-neutral-950/50";
  const titleColor = destaque ? "text-yellow-400" : (cor === "red" ? "text-red-300" : "text-neutral-300");

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
    <div className={`${bgClass} rounded-lg p-3 border border-white/5 h-full transition-colors hover:border-white/10 relative overflow-hidden`}>
      <h5 className={`${titleColor} font-semibold mb-3 text-sm flex items-center gap-2`}>
        {titulo}
      </h5>
      <ul className="space-y-2">
        {dados.map((jog, index) => {
          const isHot = tipo === 'chute' && parseFloat(jog.valor) >= 1.5;
          const linhaSegura = isHot ? calcularLinhaSegura(jog.valor, 'chute') : null;

          return (
            <li key={index} className={`flex items-center justify-between text-sm group ${isHot ? 'bg-green-900/10 p-1 rounded border border-green-500/20' : ''}`}>
              <div className="flex items-center gap-2 text-neutral-200">
                <span className="text-base leading-none">{jog.pais}</span>
                <span className="truncate max-w-[120px] font-medium group-hover:text-white transition-colors">{jog.nome}</span>
              </div>
              <div className="flex-grow border-b border-dotted border-neutral-600 mx-2 opacity-30 relative top-[4px]"></div>
              <div className="flex items-center justify-end flex-shrink-0">
                {linhaSegura && <SeloAposta texto={linhaSegura} />}
                <span className={`font-mono font-bold ml-2 ${destaque ? 'text-yellow-400' : 'text-white'}`}>
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

  // Estado principal que guarda os dados iniciais.
  const [dados, setDados] = useState<any>(null);

  // Busca as competições disponíveis para a equipe
  const buscarCompeticoes = async (teamId: string) => {
    try {
      const resposta = await fetch(`/api/competitions/${teamId}`);
      if (!resposta.ok) throw new Error("Erro ao buscar competições");
      const comps = await resposta.json();
      setCompeticoesDisponiveis(comps);
      if (comps.length > 0) {
        setCompeticaoAtual(comps[0].id);
        buscarDadosScout(teamId, comps[0].id);
      } else {
        setDados(null);
      }
    } catch (error) {
      console.error(error);
      setCompeticoesDisponiveis([]);
      setDados(null);
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
    } finally {
      setLoading(false);
    }
  };

  // Efeito inicial
  React.useEffect(() => {
    // Prevent horizontal scroll
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

  const calcularLinhaSegura = (valorMedio: string, tipo: string) => {
    const numero = parseFloat(valorMedio);
    let linhaCalculada = numero * 0.66; 
    
    if (tipo === 'escanteio') {
      linhaCalculada = Math.floor(linhaCalculada) + 0.5;
      return `Over ${linhaCalculada}`;
    }
    return null;
  };

  // O MOTOR DE EXPORTAÇÃO: Gera a imagem estilo Sofascore
  const exportarImagem = async () => {
    if (!painelRef.current) return;
    
    try {
      setLoading(true);
      const canvas = await html2canvas(painelRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2, // Melhor qualidade
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `scout-${equipeAtual.toLowerCase()}-2026.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } catch (error) {
      console.error("Erro ao exportar imagem:", error);
      alert("Erro ao gerar imagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-8 font-sans text-white flex flex-col items-center">
      
      {/* HEADER E NAVEGAÇÃO PRINCIPAL */}
      <div className="w-full max-w-4xl mb-6 flex flex-col md:flex-row justify-between items-center bg-black/60 p-5 rounded-2xl border border-red-900/40 shadow-[0_0_15px_rgba(220,38,38,0.1)] backdrop-blur-sm">
        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-red-500 via-red-600 to-red-800 bg-clip-text text-transparent mb-4 md:mb-0 uppercase flex items-center gap-2">
          <TrendingUp className="text-red-600" size={28} />
          AnalisAI <span className="text-2xl ml-1">⚽🪙</span>
        </h1>
        
        <div className="flex bg-neutral-900 rounded-xl p-1 border border-white/5">
          <button 
            onClick={() => setActiveTab('scout')}
            className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'scout' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
          >
            Scout
          </button>
          <button 
            onClick={() => setActiveTab('betmanager')}
            className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'betmanager' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
          >
            Bet Manager
          </button>
        </div>
      </div>

      {activeTab === 'scout' ? (
        <>
          {/* CONTROLES DE EQUIPE E COMPETIÇÃO */}
          <div className="w-full max-w-4xl mb-8 flex gap-3 flex-wrap justify-center items-center bg-black/40 p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <select 
                  className="appearance-none bg-neutral-900 border border-neutral-700 text-white font-medium text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block px-4 py-2.5 pr-10 outline-none transition-all hover:border-neutral-500 cursor-pointer w-full"
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
                <ChevronDown size={16} />
              </div>
            </div>

            {competicoesDisponiveis.length > 0 && (
              <div className="relative">
                <select 
                  className="appearance-none bg-neutral-900 border border-neutral-700 text-white font-medium text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block px-4 py-2.5 pr-10 outline-none transition-colors hover:border-neutral-500 cursor-pointer w-full"
                  onChange={(e) => handleCompChange(e.target.value)}
                  value={competicaoAtual}
                >
                  {competicoesDisponiveis.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => buscarDadosScout(equipeAtual, competicaoAtual)}
            disabled={loading || !competicaoAtual}
            className={`font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 shadow-lg ${loading ? 'bg-red-900 text-red-300 cursor-not-allowed' : 'bg-red-700 hover:bg-red-600 hover:shadow-red-900/50 text-white'}`}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <RefreshCw size={18} />
            )}
            {loading ? 'Carregando...' : 'Atualizar Dados'}
          </button>
          
          <button 
            onClick={exportarImagem}
            disabled={loading}
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={18} />
            Exportar JPG
          </button>
        </div>

      {/* PAINEL DE ESTATÍSTICAS (O "CANVAS" A SER EXPORTADO) */}
      {dados ? (
        <div 
          id="scout-panel"
          ref={painelRef}
          className="w-full max-w-4xl bg-gradient-to-br from-red-950 via-neutral-900 to-black p-6 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-red-900/30 relative overflow-hidden"
        >
          {/* Efeito de brilho de fundo */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent pointer-events-none"></div>

          {/* CABEÇALHO DO CARD */}
          <div className="text-center mb-10 border-b border-red-900/40 pb-8 relative z-10">
            <div className="flex items-center justify-center gap-4 mb-2">
              {CLUB_CRESTS[equipeAtual] && (
                <img 
                  src={CLUB_CRESTS[equipeAtual]} 
                  alt={`${equipeAtual} crest`} 
                  className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                  referrerPolicy="no-referrer"
                />
              )}
              <h2 className="text-4xl md:text-5xl font-black tracking-widest text-white drop-shadow-lg uppercase">
                {equipeAtual}
              </h2>
            </div>
            <p className="text-red-400/90 font-medium text-lg tracking-wide uppercase">{dados.campeonato}</p>
          </div>

          {/* SEÇÃO 1: MÉDIAS GERAIS */}
          <div className="mb-10 relative z-10">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-3 bg-red-950/40 border border-red-900/30 p-3 rounded-xl uppercase tracking-wider text-red-100">
              <LayoutGrid className="text-red-500" size={20} />
              Médias da Equipe <span className="text-sm text-red-400/70 font-normal normal-case ml-auto">Por Jogo</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tabela Ataque */}
              <div className="bg-black/50 rounded-xl p-5 border border-white/5 shadow-inner">
                <h4 className="text-red-400 font-bold mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
                  <Target size={18} /> Ataque e Finalizações
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-neutral-400 font-medium">Gols marcados</span><span className="font-bold text-lg bg-red-950/50 px-3 py-1 rounded-md border border-red-900/30">{dados.medias.gols}</span></div>
                  <div className="flex justify-between items-center"><span className="text-neutral-400 font-medium">Finalizações totais</span><span className="font-bold text-lg">{dados.medias.finalizacoes}</span></div>
                  <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-medium">Chutes no gol (Alvo)</span>
                  <span className="font-bold text-lg flex items-center justify-end">
                    {parseFloat(dados.medias.chutesGol) > 5.0 && <SeloAposta texto={calcularLinhaSegura(dados.medias.chutesGol, 'escanteio') || ""} />}
                    <span className="ml-2">{dados.medias.chutesGol}</span>
                  </span>
                </div>
                  <div className="flex justify-between items-center"><span className="text-neutral-400 font-medium">Grandes chances criadas</span><span className="font-bold text-lg">{dados.medias.grandesChances}</span></div>
                </div>
              </div>

              {/* Tabela Controle */}
              <div className="bg-black/50 rounded-xl p-5 border border-white/5 shadow-inner">
                <h4 className="text-red-400 font-bold mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
                  <Activity size={18} /> Controle e Bolas Paradas
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-neutral-400 font-medium">Posse de bola</span><span className="font-bold text-lg text-red-200">{dados.medias.posse}</span></div>
                  <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-medium">Escanteios</span>
                  <span className="font-bold text-lg flex items-center justify-end">
                    {parseFloat(dados.medias.escanteios) >= 6.0 && <SeloAposta texto={calcularLinhaSegura(dados.medias.escanteios, 'escanteio') || ""} />}
                    <span className="ml-2">{dados.medias.escanteios}</span>
                  </span>
                </div>
                  <div className="flex justify-between items-center"><span className="text-neutral-400 font-medium">Faltas sofridas</span><span className="font-bold text-lg">{dados.medias.faltas}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: TOP JOGADORES - ATAQUE */}
          <div className="mb-10 relative z-10">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-3 bg-red-950/40 border border-red-900/30 p-3 rounded-xl uppercase tracking-wider text-red-100">
              <Users className="text-red-500" size={20} />
              Top Jogadores - Setor Ofensivo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <RankingBox titulo="👟 Finalizações Totais" dados={dados.ataque.finalizacoesTotais} />
              <RankingBox titulo="🎯 Chutes no Gol" dados={dados.ataque.chutesNoGol} />
              <RankingBox titulo="🚀 Finalizações de Fora da Área" dados={dados.ataque.finalizacoesFora} />
              <RankingBox titulo="☄️ Gols de Fora da Área (Total)" dados={dados.ataque.golsFora} />
              <RankingBox titulo="🚩 Escanteios e Cruzamentos Precisos" dados={dados.ataque.escanteiosCruzamentos} />
              <RankingBox titulo="⭐ Maior Nota Média (Rating)" dados={dados.ataque.rating} destaque />
            </div>
          </div>

          {/* SEÇÃO 3: TOP JOGADORES - DEFESA */}
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-3 bg-neutral-900/80 border border-neutral-700/50 p-3 rounded-xl uppercase tracking-wider text-neutral-200">
              <ShieldCheck className="text-neutral-400" size={20} />
              Top Jogadores - Setor Defensivo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <RankingBox titulo="🛑 Desarmes" dados={dados.defesa.desarmes} cor="neutral" />
              <RankingBox titulo="✂️ Interceptações" dados={dados.defesa.interceptacoes} cor="neutral" />
              <RankingBox titulo="🛡️ Cortes (Rebatidas)" dados={dados.defesa.cortes} cor="neutral" />
            </div>
          </div>

          {/* Rodapé da Imagem */}
          <div className="mt-8 pt-4 border-t border-red-900/30 text-center relative z-10 flex flex-col items-center">
             <p className="text-neutral-500 text-xs uppercase tracking-widest font-semibold flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               Sistema Autônomo Online • {new Date().getFullYear()}
             </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-neutral-900/50 p-20 rounded-3xl border border-white/5 text-center">
          <p className="text-neutral-500 font-medium">Selecione uma equipe e competição para visualizar os dados.</p>
        </div>
      )}
      </>
      ) : (
        /* SEÇÃO: ALAVANCAGEM */
        <div className="w-full max-w-4xl bg-neutral-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="relative">
            <Alavancagem />
          </div>
        </div>
      )}

    </div>
  );
}
