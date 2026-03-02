import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const db = new Database("scouts.db");

  // Initialize database with team and competition support
  db.exec(`
    CREATE TABLE IF NOT EXISTS scouts (
      team_id TEXT,
      competition_id TEXT,
      data TEXT,
      PRIMARY KEY (team_id, competition_id)
    )
  `);

  // Seed data helper
  const seedData = (teamId: string, compId: string, data: any) => {
    const stmt = db.prepare("INSERT OR REPLACE INTO scouts (team_id, competition_id, data) VALUES (?, ?, ?)");
    stmt.run(teamId, compId, JSON.stringify(data));
  };

  // Flamengo Data
  const flamengoData = {
    "CARIOCA": {
      "campeonato": "🏆 Campeonato Carioca 2026",
      "medias": { "gols": "2.3", "finalizacoes": "16.1", "chutesGol": "6.2", "grandesChances": "4.0", "posse": "58%", "escanteios": "7.1", "faltas": "10.5" },
      "ataque": {
        "finalizacoesTotais": [ { "nome": "Pedro", "pais": "🇧🇷", "valor": "4.1" }, { "nome": "Samuel Lino", "pais": "🇧🇷", "valor": "3.2" }, { "nome": "Bruno Henrique", "pais": "🇧🇷", "valor": "2.8" } ],
        "chutesNoGol": [ { "nome": "Pedro", "pais": "🇧🇷", "valor": "2.1" }, { "nome": "Samuel Lino", "pais": "🇧🇷", "valor": "1.5" }, { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "1.0" } ],
        "finalizacoesFora": [ { "nome": "Carrascal", "pais": "🇨🇴", "valor": "1.5" }, { "nome": "De La Cruz", "pais": "🇺🇾", "valor": "1.2" }, { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "0.8" } ],
        "golsFora": [ { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "3" }, { "nome": "Everton Araújo", "pais": "🇧🇷", "valor": "1" }, { "nome": "De La Cruz", "pais": "🇺🇾", "valor": "1" } ],
        "escanteiosCruzamentos": [ { "nome": "Varela", "pais": "🇺🇾", "valor": "2.5" }, { "nome": "Ayrton Lucas", "pais": "🇧🇷", "valor": "1.8" }, { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "1.4" } ],
        "rating": [ { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "8.40" }, { "nome": "Léo Ortiz", "pais": "🇧🇷", "valor": "7.90" }, { "nome": "Pedro", "pais": "🇧🇷", "valor": "7.65" } ]
      },
      "defesa": {
        "desarmes": [ { "nome": "Erick Pulgar", "pais": "🇨🇱", "valor": "3.5" }, { "nome": "Varela", "pais": "🇺🇾", "valor": "2.8" }, { "nome": "Léo Pereira", "pais": "🇧🇷", "valor": "2.0" } ],
        "interceptacoes": [ { "nome": "Léo Ortiz", "pais": "🇧🇷", "valor": "2.2" }, { "nome": "Everton Araújo", "pais": "🇧🇷", "valor": "1.9" }, { "nome": "Ayrton Lucas", "pais": "🇧🇷", "valor": "1.5" } ],
        "cortes": [ { "nome": "Léo Ortiz", "pais": "🇧🇷", "valor": "5.1" }, { "nome": "Léo Pereira", "pais": "🇧🇷", "valor": "4.5" }, { "nome": "Erick Pulgar", "pais": "🇨🇱", "valor": "3.1" } ]
      }
    },
    "BRASILEIRAO": {
      "campeonato": "🇧🇷 Campeonato Brasileiro 2026",
      "medias": { "gols": "1.8", "finalizacoes": "13.5", "chutesGol": "5.1", "grandesChances": "2.5", "posse": "55%", "escanteios": "5.8", "faltas": "13.2" },
      "ataque": {
        "finalizacoesTotais": [ { "nome": "Samuel Lino", "pais": "🇧🇷", "valor": "3.1" }, { "nome": "Pedro", "pais": "🇧🇷", "valor": "2.9" }, { "nome": "Carrascal", "pais": "🇨🇴", "valor": "2.1" } ],
        "chutesNoGol": [ { "nome": "Pedro", "pais": "🇧🇷", "valor": "1.4" }, { "nome": "Samuel Lino", "pais": "🇧🇷", "valor": "1.2" }, { "nome": "Bruno Henrique", "pais": "🇧🇷", "valor": "0.9" } ],
        "finalizacoesFora": [ { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "1.3" }, { "nome": "Carrascal", "pais": "🇨🇴", "valor": "1.1" }, { "nome": "De La Cruz", "pais": "🇺🇾", "valor": "1.0" } ],
        "golsFora": [ { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "1" }, { "nome": "De La Cruz", "pais": "🇺🇾", "valor": "1" }, { "nome": "Gerson", "pais": "🇧🇷", "valor": "1" } ],
        "escanteiosCruzamentos": [ { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "2.0" }, { "nome": "Ayrton Lucas", "pais": "🇧🇷", "valor": "1.4" }, { "nome": "Varela", "pais": "🇺🇾", "valor": "1.1" } ],
        "rating": [ { "nome": "Léo Ortiz", "pais": "🇧🇷", "valor": "7.50" }, { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "7.45" }, { "nome": "Pedro", "pais": "🇧🇷", "valor": "7.30" } ]
      },
      "defesa": {
        "desarmes": [ { "nome": "Everton Araújo", "pais": "🇧🇷", "valor": "2.9" }, { "nome": "Erick Pulgar", "pais": "🇨🇱", "valor": "2.4" }, { "nome": "Ayrton Lucas", "pais": "🇧🇷", "valor": "1.8" } ],
        "interceptacoes": [ { "nome": "Léo Pereira", "pais": "🇧🇷", "valor": "1.7" }, { "nome": "Léo Ortiz", "pais": "🇧🇷", "valor": "1.6" }, { "nome": "Varela", "pais": "🇺🇾", "valor": "1.3" } ],
        "cortes": [ { "nome": "Léo Ortiz", "pais": "🇧🇷", "valor": "4.8" }, { "nome": "Fabrício Bruno", "pais": "🇧🇷", "valor": "4.2" }, { "nome": "Léo Pereira", "pais": "🇧🇷", "valor": "3.9" } ]
      }
    },
    "LIBERTADORES": {
      "campeonato": "🌎 Copa Libertadores 2026",
      "medias": { "gols": "2.5", "finalizacoes": "15.0", "chutesGol": "6.5", "grandesChances": "3.8", "posse": "60%", "escanteios": "6.5", "faltas": "11.0" },
      "ataque": {
        "finalizacoesTotais": [ { "nome": "Pedro", "pais": "🇧🇷", "valor": "3.8" }, { "nome": "Bruno Henrique", "pais": "🇧🇷", "valor": "3.0" }, { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "2.5" } ],
        "chutesNoGol": [ { "nome": "Pedro", "pais": "🇧🇷", "valor": "2.0" }, { "nome": "Bruno Henrique", "pais": "🇧🇷", "valor": "1.4" }, { "nome": "Samuel Lino", "pais": "🇧🇷", "valor": "1.2" } ],
        "finalizacoesFora": [ { "nome": "De La Cruz", "pais": "🇺🇾", "valor": "1.6" }, { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "1.4" }, { "nome": "Carrascal", "pais": "🇨🇴", "valor": "1.0" } ],
        "golsFora": [ { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "2" }, { "nome": "De La Cruz", "pais": "🇺🇾", "valor": "1" }, { "nome": "Erick Pulgar", "pais": "🇨🇱", "valor": "1" } ],
        "escanteiosCruzamentos": [ { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "2.8" }, { "nome": "De La Cruz", "pais": "🇺🇾", "valor": "1.5" }, { "nome": "Ayrton Lucas", "pais": "🇧🇷", "valor": "1.3" } ],
        "rating": [ { "nome": "Arrascaeta", "pais": "🇺🇾", "valor": "8.50" }, { "nome": "Pedro", "pais": "🇧🇷", "valor": "8.10" }, { "nome": "De La Cruz", "pais": "🇺🇾", "valor": "7.80" } ]
      },
      "defesa": {
        "desarmes": [ { "nome": "Erick Pulgar", "pais": "🇨🇱", "valor": "3.2" }, { "nome": "Varela", "pais": "🇺🇾", "valor": "2.5" }, { "nome": "Everton Araújo", "pais": "🇧🇷", "valor": "2.1" } ],
        "interceptacoes": [ { "nome": "Léo Ortiz", "pais": "🇧🇷", "valor": "2.0" }, { "nome": "Erick Pulgar", "pais": "🇨🇱", "valor": "1.8" }, { "nome": "Léo Pereira", "pais": "🇧🇷", "valor": "1.4" } ],
        "cortes": [ { "nome": "Léo Ortiz", "pais": "🇧🇷", "valor": "5.5" }, { "nome": "Léo Pereira", "pais": "🇧🇷", "valor": "4.1" }, { "nome": "Fabrício Bruno", "pais": "🇧🇷", "valor": "3.5" } ]
      }
    }
  };

  seedData("FLAMENGO", "CARIOCA", flamengoData.CARIOCA);
  seedData("FLAMENGO", "BRASILEIRAO", flamengoData.BRASILEIRAO);
  seedData("FLAMENGO", "LIBERTADORES", flamengoData.LIBERTADORES);

  // Seed other teams with at least one competition
  seedData("PALMEIRAS", "BRASILEIRAO", {
    campeonato: "🇧🇷 Campeonato Brasileiro 2026",
    medias: { gols: "1.8", finalizacoes: "13.2", chutesGol: "5.1", grandesChances: "2.8", posse: "55%", escanteios: "5.9", faltas: "14.2" },
    ataque: {
      finalizacoesTotais: [ { nome: "Estêvão", pais: "🇧🇷", valor: "3.2" }, { nome: "Flaco López", pais: "🇦🇷", valor: "2.9" }, { nome: "Raphael Veiga", pais: "🇧🇷", valor: "2.5" } ],
      chutesNoGol: [ { nome: "Flaco López", pais: "🇦🇷", valor: "1.4" }, { nome: "Estêvão", pais: "🇧🇷", valor: "1.3" }, { nome: "Raphael Veiga", pais: "🇧🇷", valor: "1.0" } ],
      finalizacoesFora: [ { nome: "Raphael Veiga", pais: "🇧🇷", valor: "1.6" }, { nome: "Estêvão", pais: "🇧🇷", valor: "1.2" }, { nome: "Richard Ríos", pais: "🇨🇴", valor: "1.1" } ],
      golsFora: [ { nome: "Raphael Veiga", pais: "🇧🇷", valor: "3" }, { nome: "Richard Ríos", pais: "🇨🇴", valor: "1" }, { nome: "Estêvão", pais: "🇧🇷", valor: "1" } ],
      escanteiosCruzamentos: [ { nome: "Raphael Veiga", pais: "🇧🇷", valor: "2.8" }, { nome: "Estêvão", pais: "🇧🇷", valor: "1.4" }, { nome: "Piquerez", pais: "🇺🇾", valor: "1.2" } ],
      rating: [ { nome: "Estêvão", pais: "🇧🇷", valor: "8.10" }, { nome: "Raphael Veiga", pais: "🇧🇷", valor: "7.90" }, { nome: "Aníbal Moreno", pais: "🇦🇷", valor: "7.75" } ]
    },
    defesa: {
      desarmes: [ { nome: "Aníbal Moreno", pais: "🇦🇷", valor: "3.5" }, { nome: "Marcos Rocha", pais: "🇧🇷", valor: "2.4" }, { nome: "Murilo", pais: "🇧🇷", valor: "2.0" } ],
      interceptacoes: [ { nome: "Gustavo Gómez", pais: "🇵🇾", valor: "2.1" }, { nome: "Murilo", pais: "🇧🇷", valor: "1.7" }, { nome: "Aníbal Moreno", pais: "🇦🇷", valor: "1.4" } ],
      cortes: [ { nome: "Gustavo Gómez", pais: "🇵🇾", valor: "5.2" }, { nome: "Murilo", pais: "🇧🇷", valor: "4.8" }, { nome: "Vitor Reis", pais: "🇧🇷", valor: "3.5" } ]
    }
  });

  // API Routes
  app.get("/api/competitions/:teamId", (req, res) => {
    const { teamId } = req.params;
    const stmt = db.prepare("SELECT competition_id, data FROM scouts WHERE team_id = ?");
    const rows = stmt.all(teamId) as { competition_id: string, data: string }[];
    
    const competitions = rows.map(row => ({
      id: row.competition_id,
      name: JSON.parse(row.data).campeonato
    }));
    
    res.json(competitions);
  });

  app.get("/api/scouts/:teamId/:compId", (req, res) => {
    const { teamId, compId } = req.params;
    const stmt = db.prepare("SELECT data FROM scouts WHERE team_id = ? AND competition_id = ?");
    const row = stmt.get(teamId, compId) as { data: string } | undefined;

    if (row) {
      res.json(JSON.parse(row.data));
    } else {
      res.status(404).json({ error: "Data not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
