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

  // Mock Data Generator
  const generateMockData = (teamName: string, championship: string) => ({
    "campeonato": championship,
    "medias": { 
      "gols": (Math.random() * 2 + 1).toFixed(1), 
      "finalizacoes": (Math.random() * 5 + 12).toFixed(1), 
      "chutesGol": (Math.random() * 3 + 4).toFixed(1), 
      "grandesChances": (Math.random() * 2 + 2).toFixed(1), 
      "posse": Math.floor(Math.random() * 20 + 45) + "%", 
      "escanteios": (Math.random() * 3 + 5).toFixed(1), 
      "faltas": (Math.random() * 5 + 10).toFixed(1) 
    },
    "ataque": {
      "finalizacoesTotais": [ { "nome": "Atacante 1", "pais": "⚽", "valor": "3.8" }, { "nome": "Atacante 2", "pais": "⚽", "valor": "3.1" }, { "nome": "Atacante 3", "pais": "⚽", "valor": "2.5" } ],
      "chutesNoGol": [ { "nome": "Atacante 1", "pais": "⚽", "valor": "1.9" }, { "nome": "Atacante 2", "pais": "⚽", "valor": "1.4" }, { "nome": "Atacante 3", "pais": "⚽", "valor": "1.1" } ],
      "finalizacoesFora": [ { "nome": "Meia 1", "pais": "⚽", "valor": "1.5" }, { "nome": "Meia 2", "pais": "⚽", "valor": "1.2" }, { "nome": "Meia 3", "pais": "⚽", "valor": "0.8" } ],
      "golsFora": [ { "nome": "Meia 1", "pais": "⚽", "valor": "2" }, { "nome": "Meia 2", "pais": "⚽", "valor": "1" }, { "nome": "Atacante 1", "pais": "⚽", "valor": "1" } ],
      "escanteiosCruzamentos": [ { "nome": "Lateral 1", "pais": "⚽", "valor": "2.5" }, { "nome": "Lateral 2", "pais": "⚽", "valor": "1.8" }, { "nome": "Meia 1", "pais": "⚽", "valor": "1.4" } ],
      "rating": [ { "nome": "Meia 1", "pais": "⚽", "valor": "8.20" }, { "nome": "Atacante 1", "pais": "⚽", "valor": "7.90" }, { "nome": "Zagueiro 1", "pais": "⚽", "valor": "7.65" } ]
    },
    "defesa": {
      "desarmes": [ { "nome": "Volante 1", "pais": "🛡️", "valor": "3.5" }, { "nome": "Lateral 1", "pais": "🛡️", "valor": "2.8" }, { "nome": "Zagueiro 1", "pais": "🛡️", "valor": "2.0" } ],
      "interceptacoes": [ { "nome": "Zagueiro 1", "pais": "🛡️", "valor": "2.2" }, { "nome": "Volante 1", "pais": "🛡️", "valor": "1.9" }, { "nome": "Lateral 2", "pais": "🛡️", "valor": "1.5" } ],
      "cortes": [ { "nome": "Zagueiro 1", "pais": "🛡️", "valor": "5.1" }, { "nome": "Zagueiro 2", "pais": "🛡️", "valor": "4.5" }, { "nome": "Volante 1", "pais": "🛡️", "valor": "3.1" } ]
    }
  });

  // Seed all teams
  const teams = [
    { id: "FLAMENGO", name: "Flamengo", comps: ["Carioca", "Brasileirão", "Libertadores"] },
    { id: "PALMEIRAS", name: "Palmeiras", comps: ["Paulista", "Brasileirão", "Libertadores"] },
    { id: "BOTAFOGO", name: "Botafogo", comps: ["Carioca", "Brasileirão", "Libertadores"] },
    { id: "REAL_MADRID", name: "Real Madrid", comps: ["La Liga", "Champions League"] },
    { id: "MAN_CITY", name: "Manchester City", comps: ["Premier League", "Champions League"] },
    { id: "BAYERN", name: "Bayern de Munique", comps: ["Bundesliga", "Champions League"] },
    { id: "PSG", name: "PSG", comps: ["Ligue 1", "Champions League"] }
  ];

  teams.forEach(team => {
    team.comps.forEach(comp => {
      seedData(team.id, comp.toUpperCase().replace(/\s/g, '_'), generateMockData(team.name, `🏆 ${comp} 2026`));
    });
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
