🏆 Dicionário de Competições e Equipes (AnalisAI)
​Este documento mapeia os códigos internos (IDs) utilizados pelo motor autônomo do AnalisAI para rastrear as equipes monitoradas, bem como os códigos padronizados das suas respectivas competições.
​Essa padronização é essencial para refinar as buscas na inteligência artificial e garantir que os dados de scout venham do campeonato correto.
​🇧🇷 Equipes Brasileiras
Código Interno (ID) Equipe Real Competição Principal Código da Liga Competições Secundárias
FLAMENGO CR Flamengo Brasileirão Série A BRA-D1 BRA-CAR (Estadual), SA-LIB (Libertadores)
PALMEIRAS SE Palmeiras Brasileirão Série A BRA-D1 BRA-PAU (Estadual), SA-LIB (Libertadores)
BOTAFOGO Botafogo FR Brasileirão Série A BRA-D1 BRA-CAR (Estadual), SA-LIB (Libertadores)
🇪🇺 Equipes Europeias
Código Interno (ID) Equipe Real Competição Principal Código da Liga Competições Secundárias
MAN_CITY Manchester City Premier League (Inglaterra) ENG-D1 ENG-FAC (FA Cup), EU-UCL (Champions)
REAL_MADRID Real Madrid CF La Liga (Espanha) ESP-D1 ESP-CUP (Copa do Rei), EU-UCL (Champions)
BAYERN Bayern Munich Bundesliga (Alemanha) GER-D1 GER-DFB (DFB-Pokal), EU-UCL (Champions)
PSG Paris Saint-Germain Ligue 1 (França) FRA-D1 FRA-CDF (Copa da França), EU-UCL (Champions)
 Como utilizar estes códigos no Motor de IA
​Atualmente, o nosso Cron Job em Node.js pede à IA para buscar os dados gerais da temporada. Se no futuro você quiser isolar as estatísticas (por exemplo, ver os números do Haaland apenas na Champions League e não na Premier League), você pode passar esses códigos de competição no prompt do seu server.js.
​Exemplo de Prompt Dinâmico:
​"Você é um analista de dados esportivos. Gere as estatísticas da equipe de ID {MAN_CITY} estritamente referentes à competição de código {EU-UCL} na temporada atual."
​Documentação gerada automaticamente para o projeto AnalisAI. Mantenha este arquivo atualizado ao adicionar novas equipes ao array EQUIPES_MONITORADAS.
