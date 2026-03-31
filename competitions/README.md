# Competições AnalisAI

Aqui você pode cadastrar novas competições e dados de scout. O sistema lê os blocos JSON abaixo e os importa automaticamente para o dashboard.

## Novas Competições

```json
{
  "teamId": "FLAMENGO",
  "compId": "COPA_DO_BRASIL_2026",
  "scoutData": {
    "campeonato": "🏆 Copa do Brasil 2026",
    "estatisticas": {
      "vitorias": 4,
      "empates": 1,
      "derrotas": 0,
      "golsMarcados": 12,
      "golsSofridos": 3,
      "posseMedia": 58,
      "chutesPorJogo": 14.5,
      "aproveitamento": 86.7
    },
    "ultimosJogos": [
      {"resultado": "V", "adversario": "Grêmio", "placar": "2-0", "data": "2026-03-25"},
      {"resultado": "V", "adversario": "Bahia", "placar": "3-1", "data": "2026-03-20"},
      {"resultado": "E", "adversario": "Corinthians", "placar": "1-1", "data": "2026-03-15"}
    ],
    "artilheiros": [
      {"nome": "Pedro", "gols": 5},
      {"nome": "Arrascaeta", "gols": 3}
    ],
    "assistencias": [
      {"nome": "Gerson", "num": 4},
      {"nome": "Everton", "num": 2}
    ]
  }
}
```

```json
{
  "teamId": "PALMEIRAS",
  "compId": "MUNDIAL_CLUBES_2026",
  "scoutData": {
    "campeonato": "🌍 Mundial de Clubes 2026",
    "estatisticas": {
      "vitorias": 2,
      "empates": 0,
      "derrotas": 0,
      "golsMarcados": 5,
      "golsSofridos": 1,
      "posseMedia": 52,
      "chutesPorJogo": 11.2,
      "aproveitamento": 100
    },
    "ultimosJogos": [
      {"resultado": "V", "adversario": "Real Madrid", "placar": "2-1", "data": "2026-03-28"},
      {"resultado": "V", "adversario": "Al-Ahly", "placar": "3-0", "data": "2026-03-24"}
    ],
    "artilheiros": [
      {"nome": "Estêvão", "gols": 3},
      {"nome": "Flaco López", "gols": 2}
    ],
    "assistencias": [
      {"nome": "Veiga", "num": 3}
    ]
  }
}
```
