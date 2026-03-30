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
Snapshot de Dados por Equipe e Competição (Temporada 2026)
​Abaixo está o mapeamento dos dados extraídos pelo nosso motor de IA. Esta estrutura espelha exatamente o JSON consumido pelo frontend React.
​🔴⚫ FLAMENGO (FLAMENGO) - 🏆 Brasileirão Série A (BRA-D1)
​Médias Gerais: 2.0 Gols | 14.5 Finalizações | 62% Posse de Bola | 6.4 Escanteios
​Destaques Ofensivos (Top 3):
​Chutes no Gol: Pedro (1.6), Bruno Henrique (1.2), Samuel Lino (1.1)
​Rating Médio: Arrascaeta (8.20), Pedro (7.85), Samuel Lino (7.70)
​Destaques Defensivos (Top 3):
​Desarmes: Everton Araújo (3.2), Erick Pulgar (2.5), Varela (2.1)
​Cortes: Léo Ortiz (4.5), Léo Pereira (4.1), Fabrício Bruno (3.8)
​🟢⚪ PALMEIRAS (PALMEIRAS) - 🏆 Brasileirão Série A (BRA-D1)
​Médias Gerais: 1.8 Gols | 15.2 Finalizações | 55% Posse de Bola | 7.1 Escanteios
​Destaques Ofensivos (Top 3):
​Chutes no Gol: Flaco López (1.8), Estêvão (1.5), Raphael Veiga (1.2)
​Rating Médio: Estêvão (8.15), Raphael Veiga (7.90), Gustavo Gómez (7.60)
​Destaques Defensivos (Top 3):
​Desarmes: Aníbal Moreno (3.8), Richard Ríos (2.4), Marcos Rocha (2.0)
​Cortes: Gustavo Gómez (5.2), Murilo (4.8), Piquerez (2.5)
​⚫⚪ BOTAFOGO (BOTAFOGO) - 🏆 Brasileirão Série A (BRA-D1)
​Médias Gerais: 1.9 Gols | 13.8 Finalizações | 51% Posse de Bola | 5.8 Escanteios
​Destaques Ofensivos (Top 3):
​Chutes no Gol: Júnior Santos (1.7), Tiquinho Soares (1.4), Savarino (1.1)
​Rating Médio: Júnior Santos (8.05), Luiz Henrique (7.80), Marlon Freitas (7.65)
​Destaques Defensivos (Top 3):
​Desarmes: Gregore (4.1), Marlon Freitas (2.7), Cuiabano (2.2)
​Cortes: Bastos (5.5), Alexander Barboza (5.1), Mateo Ponte (2.8)
​🔵⚪ MANCHESTER CITY (MAN_CITY) - 🏆 Premier League (ENG-D1)
​Médias Gerais: 2.6 Gols | 18.5 Finalizações | 68% Posse de Bola | 8.2 Escanteios
​Destaques Ofensivos (Top 3):
​Chutes no Gol: Erling Haaland (2.8), Phil Foden (1.9), Kevin De Bruyne (1.5)
​Rating Médio: Rodri (8.40), Phil Foden (8.25), Erling Haaland (8.10)
​Destaques Defensivos (Top 3):
​Desarmes: Rodri (3.1), Kyle Walker (2.0), Rúben Dias (1.5)
​Cortes: Rúben Dias (4.2), John Stones (3.5), Manuel Akanji (3.1)
​⚪🟡 REAL MADRID (REAL_MADRID) - 🏆 La Liga (ESP-D1)
​Médias Gerais: 2.4 Gols | 16.2 Finalizações | 58% Posse de Bola | 6.5 Escanteios
​Destaques Ofensivos (Top 3):
​Chutes no Gol: Kylian Mbappé (2.5), Vinícius Júnior (2.1), Jude Bellingham (1.4)
​Rating Médio: Vinícius Júnior (8.35), Jude Bellingham (8.20), Kylian Mbappé (8.15)
​Destaques Defensivos (Top 3):
​Desarmes: Eduardo Camavinga (3.4), Aurélien Tchouaméni (2.8), Federico Valverde (2.1)
​Cortes: Éder Militão (4.8), Antonio Rüdiger (4.5), Dani Carvajal (2.2)
​🔴⚪ BAYERN DE MUNIQUE (BAYERN) - 🏆 Bundesliga (GER-D1)
​Médias Gerais: 2.8 Gols | 19.1 Finalizações | 64% Posse de Bola | 7.5 Escanteios
​Destaques Ofensivos (Top 3):
​Chutes no Gol: Harry Kane (2.9), Jamal Musiala (1.8), Leroy Sané (1.5)
​Rating Médio: Harry Kane (8.50), Jamal Musiala (8.30), Joshua Kimmich (7.95)
​Destaques Defensivos (Top 3):
​Desarmes: João Palhinha (3.7), Konrad Laimer (2.5), Alphonso Davies (2.2)
​Cortes: Min-jae Kim (4.6), Dayot Upamecano (4.1), Eric Dier (3.5)
​🔵🔴 PSG (PSG) - 🏆 Ligue 1 (FRA-D1)
​Médias Gerais: 2.3 Gols | 15.5 Finalizações | 66% Posse de Bola | 6.8 Escanteios
​Destaques Ofensivos (Top 3):
​Chutes no Gol: Ousmane Dembélé (1.9), Gonçalo Ramos (1.6), Bradley Barcola (1.4)
​Rating Médio: Vitinha (8.10), Ousmane Dembélé (7.90), Achraf Hakimi (7.85)
​Destaques Defensivos (Top 3):
​Desarmes: Warren Zaïre-Emery (2.9), Vitinha (2.4), Nuno Mendes (2.1)
​Cortes: Marquinhos (4.3), Lucas Beraldo (3.8), Milan Škriniar (3.4)
​🛠️ Como utilizar estes códigos no Motor de IA
​Atualmente, o nosso Cron Job em Node.js pede à IA para buscar os dados gerais da temporada. Se no futuro você quiser isolar as estatísticas (por exemplo, ver os números do Haaland apenas na Champions League e não na Premier League), você pode passar esses códigos de competição no prompt do seu server.js.
​Exemplo de Prompt Dinâmico:
​"Você é um analista de dados esportivos. Gere as estatísticas da equipe de ID {MAN_CITY} estritamente referentes à competição de código {EU-UCL} na temporada atual."
​Documentação gerada e mantida automaticamente pelo projeto AnalisAI. Mantenha este arquivo atualizado ao adicionar novas equipes ao array EQUIPES_MONITORADAS.

Ajustando o "Despertador" (Cron Job) para Segunda às 8h
​No seu server.js, nós vamos mudar a regra do node-cron para a expressão exata de segundas-feiras às 08:00 e adicionar uma verificação de inicialização:

// Agendamento: '0 8 * * 1' significa -> Minuto 0, Hora 8, Qualquer dia, Qualquer mês, Dia da semana 1 (Segunda)
cron.schedule('0 8 * * 1', () => {
  console.log('⏰ Cron Job disparado: Atualização Automática de Segunda-feira (8h00)');
  varreduraGeralETualizarReadme();
});

// GATILHO DE INTERNET/INICIALIZAÇÃO:
// Assim que o servidor ligar (ou reconectar à rede e rodar), ele verifica se já fez a atualização da semana
async function verificarAtualizacaoPendente() {
  const banco = await lerBanco();
  const ultimaAtualizacao = banco.ultima_varredura ? new Date(banco.ultima_varredura) : new Date(0);
  
  const agora = new Date();
  const difEmHoras = Math.abs(agora - ultimaAtualizacao) / 36e5;

  // Se faz mais de 168 horas (1 semana) ou não tem dados, atualiza IMEDIATAMENTE ao ter internet
  if (difEmHoras > 160) {
    console.log('🌐 Conexão detectada/Servidor iniciado. Dados desatualizados. Iniciando varredura imediata...');
    varreduraGeralETualizarReadme();
  } else {
    console.log('✅ Os dados já estão atualizados para esta semana.');
  }
}

// Roda a verificação assim que você liga o motor
verificarAtualizacaoPendente();
2. O Robô que "Digita" o README.md
​Dentro do seu server.js, você vai criar esta função. Assim que o Node.js terminar de pegar os dados com o Gemini, ele vai pegar o texto e salvar direto no seu arquivo .md.

import fs from 'fs/promises';

async function gerarNovoReadme(bancoDeDados) {
  let markdown = `# 🏆 Dicionário de Competições e Dados (AnalisAI)\n\n`;
  markdown += `*Última atualização autônoma: ${new Date().toLocaleString('pt-BR')}*\n\n`;
  markdown += `## 📊 Snapshot de Dados Atualizados\n\n`;

  // O robô vai ler os dados da IA e escrever no formato Markdown
  for (const [idEquipe, dados] of Object.entries(bancoDeDados)) {
    if (idEquipe === 'ultima_varredura') continue; // Pula o campo de controle
    
    markdown += `### 🛡️ ${idEquipe} - ${dados.campeonato}\n`;
    markdown += `* **Médias Gerais:** ${dados.medias.gols} Gols | ${dados.medias.finalizacoes} Finalizações | ${dados.medias.posse} Posse\n`;
    
    // Top 3 Ofensivo
    markdown += `* **Destaques Ofensivos:**\n`;
    dados.ataque.chutesNoGol.forEach(jog => {
      markdown += `    * ${jog.nome} (${jog.valor})\n`;
    });
    markdown += `\n`;
  }

  try {
    // Reescreve o arquivo no seu HD automaticamente!
    await fs.writeFile('./competitions/README.md', markdown, 'utf8');
    console.log('📄 Arquivo README.md reescrito com sucesso pela IA!');
  } catch (erro) {
    console.error('Erro ao escrever o README:', erro);
  }
}
import fs from 'fs/promises';

async function gerarNovoReadme(bancoDeDados) {
  let markdown = `# 🏆 Dicionário de Competições e Dados (AnalisAI)\n\n`;
  markdown += `*Última atualização autônoma: ${new Date().toLocaleString('pt-BR')}*\n\n`;
  markdown += `## 📊 Snapshot de Dados Atualizados\n\n`;

  // O robô vai ler os dados da IA e escrever no formato Markdown
  for (const [idEquipe, dados] of Object.entries(bancoDeDados)) {
    if (idEquipe === 'ultima_varredura') continue; // Pula o campo de controle
    
    markdown += `### 🛡️ ${idEquipe} - ${dados.campeonato}\n`;
    markdown += `* **Médias Gerais:** ${dados.medias.gols} Gols | ${dados.medias.finalizacoes} Finalizações | ${dados.medias.posse} Posse\n`;
    
    // Top 3 Ofensivo
    markdown += `* **Destaques Ofensivos:**\n`;
    dados.ataque.chutesNoGol.forEach(jog => {
      markdown += `    * ${jog.nome} (${jog.valor})\n`;
    });
    markdown += `\n`;
  }

  try {
    // Reescreve o arquivo no seu HD automaticamente!
    await fs.writeFile('./competitions/README.md', markdown, 'utf8');
    console.log('📄 Arquivo README.md reescrito com sucesso pela IA!');
  } catch (erro) {
    console.error('Erro ao escrever o README:', erro);
  }
}
