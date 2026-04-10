import React, { useState, useEffect } from 'react';
import { Loader2, Flame, Target, Flag } from 'lucide-react';

const API_FOOTBALL_KEY = 'def74ab4f7c5d62d6fd7186522eead42';
const API_BASE_URL = 'https://v3.football.api-sports.io';

const TARGET_LEAGUES = [
  78, // Bundesliga
  71, // Série A (Brasil)
  140, // La Liga
  135, // Serie A (Italy)
  61, // Ligue 1
  88, // Eredivisie
  128, // Liga Profesional (Argentina)
  39, // Premier League
  94 // Primeira Liga (Portugal)
];

const PartidasDoDia = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Check cache first
        const cachedData = localStorage.getItem('partidas_do_dia_cache');
        const cacheTime = localStorage.getItem('partidas_do_dia_cache_time');
        const now = new Date().getTime();

        if (cachedData && cacheTime && now - parseInt(cacheTime) < 3600000) { // 1 hour cache
          setMatches(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`${API_BASE_URL}/fixtures?date=${today}`, {
          headers: {
            'x-apisports-key': API_FOOTBALL_KEY,
            'x-apisports-host': 'v3.football.api-sports.io'
          }
        });
        const data = await res.json();
        
        if (data.response) {
          const filteredMatches = data.response.filter((match: any) => 
            TARGET_LEAGUES.includes(match.league.id)
          );

          // Group by league
          const grouped = filteredMatches.reduce((acc: any, match: any) => {
            if (!acc[match.league.id]) {
              acc[match.league.id] = {
                league: match.league,
                matches: []
              };
            }
            acc[match.league.id].matches.push(match);
            return acc;
          }, {});

          const sortedMatches = Object.values(grouped).map((group: any) => {
            group.matches.sort((a: any, b: any) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());
            return group;
          });

          setMatches(sortedMatches);
          localStorage.setItem('partidas_do_dia_cache', JSON.stringify(sortedMatches));
          localStorage.setItem('partidas_do_dia_cache_time', now.toString());
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const calcularTendencia = (match: any) => {
    // Mocking the logic since we don't have historical data in this endpoint
    // In a real scenario, we would need to fetch team statistics
    // For demonstration, we use random logic based on team IDs to keep it consistent
    const sum = (match.teams.home.id + match.teams.away.id) % 10;
    
    if (sum > 7) return { type: 'gols', text: '🔥 Tendência Over 2.5', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
    if (sum > 4) return { type: 'escanteios', text: '🚩 Radar de Escanteios', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    if (sum > 2) return { type: 'chutes', text: '🎯 Jogo Movimentado', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500 font-black uppercase tracking-widest">
        Nenhuma partida das ligas alvo para hoje.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {matches.map((group: any) => (
        <div key={group.league.id} className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-2">
            <img src={group.league.flag || group.league.logo} alt={group.league.name} className="w-6 h-4 object-cover rounded-sm" />
            <h3 className="text-lg font-black text-white uppercase tracking-widest">{group.league.name}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.matches.map((match: any) => {
              const tendencia = calcularTendencia(match);
              const time = new Date(match.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={match.fixture.id} className={`bg-neutral-900/60 rounded-2xl p-5 border transition-all ${tendencia ? 'border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/5'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black text-neutral-500 bg-black/50 px-2 py-1 rounded-md">{time}</span>
                    {tendencia && (
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${tendencia.color} flex items-center gap-1`}>
                        {tendencia.text}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-8 h-8 object-contain" />
                      <span className="font-black text-sm text-white truncate">{match.teams.home.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-8 h-8 object-contain" />
                      <span className="font-black text-sm text-white truncate">{match.teams.away.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PartidasDoDia;
