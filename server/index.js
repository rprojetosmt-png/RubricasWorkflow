import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  seedConcursosIfEmpty,
  readConcursos,
  getConcursoById,
  createConcurso,
  updateConcurso,
  addPublicacaoConcurso,
} from "./concursos/concursosRepository.js";
import { validarConcurso } from "./concursos/concursosSchema.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "data.json");
const SEED_PATH = path.join(__dirname, "seed.json");

const toDateOnly = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const normalizeFromApi = (payload = {}) => ({
  id: payload.id,
  codigo: payload.codigo,
  titulo: payload.titulo,
  tipo: payload.tipo,
  solicitante: payload.solicitante,
  dataSolicitacao: toDateOnly(payload.dataSolicitacao) || toDateOnly(new Date()),
  statusGeral: payload.statusGeral,
  etapaAtual: payload.etapaAtual,
  descricao: payload.descricao,
  documentos: payload.documentos ?? undefined,
  historico: payload.historico ?? [],
  assinaturasEtapa: payload.assinaturasEtapa ?? {},
});

const sortByNewest = (a, b) => {
  const aTime = new Date(a.dataSolicitacao || 0).getTime();
  const bTime = new Date(b.dataSolicitacao || 0).getTime();
  return bTime - aTime;
};

const readJsonArray = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err && err.code === "ENOENT") return [];
    throw err;
  }
};

const writeJsonArray = async (filePath, items) => {
  const data = `${JSON.stringify(items, null, 2)}\n`;
  await fs.writeFile(filePath, data, "utf-8");
};

const seedIfEmpty = async () => {
  const current = await readJsonArray(DATA_PATH);
  if (current.length > 0) return;

  const seedItems = await readJsonArray(SEED_PATH);
  if (seedItems.length === 0) return;

  await writeJsonArray(DATA_PATH, seedItems.map(normalizeFromApi));
};

const readSolicitacoes = async () => {
  const items = await readJsonArray(DATA_PATH);
  return items.map(normalizeFromApi);
};

const writeSolicitacoes = async (items) => {
  await writeJsonArray(DATA_PATH, items.map(normalizeFromApi));
};

const nextCodigo = async () => {
  const now = new Date();
  const ano = now.getFullYear();
  const prefix = `RUB-${ano}-`;

  const rows = await readSolicitacoes();
  const seq = rows
    .map((s) => s.codigo)
    .filter((codigo) => typeof codigo === "string" && codigo.startsWith(prefix))
    .map((codigo) => Number(codigo.slice(prefix.length)))
    .filter((n) => Number.isFinite(n));

  const maxSeq = seq.length > 0 ? Math.max(...seq) : 0;
  const nextSeq = String(maxSeq + 1).padStart(3, "0");
  return `${prefix}${nextSeq}`;
};


const sortConcursos = (a, b) => {
  const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
  const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
  return bTime - aTime;
};

app.get("/api/concursos", async (_req, res, next) => {
  try {
    const rows = await readConcursos();
    rows.sort(sortConcursos);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get("/api/concursos/:id", async (req, res, next) => {
  try {
    const concurso = await getConcursoById(req.params.id);
    if (!concurso) {
      res.status(404).json({ message: "Concurso não encontrado" });
      return;
    }

    res.json(concurso);
  } catch (err) {
    next(err);
  }
});

app.post("/api/concursos", async (req, res, next) => {
  try {
    const payload = req.body || {};
    const validation = validarConcurso(payload);

    if (!validation.valid) {
      res.status(400).json({
        message: "Dados de concurso inválidos",
        errors: validation.errors,
      });
      return;
    }

    const created = await createConcurso({
      ...payload,
      id: payload.id || "con-" + Date.now(),
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put("/api/concursos/:id", async (req, res, next) => {
  try {
    const existing = await getConcursoById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: "Concurso não encontrado" });
      return;
    }

    const merged = {
      ...existing,
      ...req.body,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    const validation = validarConcurso(merged);
    if (!validation.valid) {
      res.status(400).json({
        message: "Dados de concurso inválidos",
        errors: validation.errors,
      });
      return;
    }

    const updated = await updateConcurso(req.params.id, merged);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/concursos/:id/cancelar", async (req, res, next) => {
  try {
    const existing = await getConcursoById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: "Concurso não encontrado" });
      return;
    }

    const motivo = req.body?.motivo ? String(req.body.motivo).trim() : "";
    const dataCancelamento = req.body?.dataCancelamento || toDateOnly(new Date());

    const updated = await updateConcurso(req.params.id, {
      ...existing,
      dataCancelamento,
      motivo,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.get("/api/concursos/:id/publicacoes", async (req, res, next) => {
  try {
    const concurso = await getConcursoById(req.params.id);
    if (!concurso) {
      res.status(404).json({ message: "Concurso não encontrado" });
      return;
    }

    res.json(concurso.publicacoes || []);
  } catch (err) {
    next(err);
  }
});

app.post("/api/concursos/:id/publicacoes", async (req, res, next) => {
  try {
    const concurso = await getConcursoById(req.params.id);
    if (!concurso) {
      res.status(404).json({ message: "Concurso não encontrado" });
      return;
    }

    const payload = req.body || {};
    if (!payload.tipo || !payload.titulo || !payload.dataPublicacao) {
      res.status(400).json({
        message: "Dados incompletos da publicação",
        errors: ["tipo, titulo e dataPublicacao são obrigatórios"],
      });
      return;
    }

    const updated = await addPublicacaoConcurso(req.params.id, payload);
    res.status(201).json(updated?.publicacoes || []);
  } catch (err) {
    next(err);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/solicitacoes/next-codigo", async (_req, res, next) => {
  try {
    const codigo = await nextCodigo();
    res.json({ codigo });
  } catch (err) {
    next(err);
  }
});

app.get("/api/solicitacoes", async (_req, res, next) => {
  try {
    const rows = await readSolicitacoes();
    rows.sort(sortByNewest);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get("/api/solicitacoes/:id", async (req, res, next) => {
  try {
    const rows = await readSolicitacoes();
    const row = rows.find((item) => item.id === req.params.id);

    if (!row) {
      res.status(404).json({ message: "Solicitação não encontrada" });
      return;
    }

    res.json(row);
  } catch (err) {
    next(err);
  }
});

app.post("/api/solicitacoes", async (req, res, next) => {
  try {
    const payload = req.body;

    if (!payload?.titulo || !payload?.tipo || !payload?.descricao) {
      res.status(400).json({ message: "Dados incompletos" });
      return;
    }

    const rows = await readSolicitacoes();
    const codigo = payload.codigo || (await nextCodigo());

    const created = normalizeFromApi({
      ...payload,
      id: payload.id || `sol-${Date.now()}`,
      codigo,
    });

    rows.push(created);
    await writeSolicitacoes(rows);

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put("/api/solicitacoes/:id", async (req, res, next) => {
  try {
    const payload = req.body;
    const rows = await readSolicitacoes();
    const index = rows.findIndex((item) => item.id === req.params.id);

    if (index < 0) {
      res.status(404).json({ message: "Solicitação não encontrada" });
      return;
    }

    const existing = rows[index];
    const updated = normalizeFromApi({
      ...existing,
      ...payload,
      id: existing.id,
      codigo: payload.codigo || existing.codigo,
    });

    rows[index] = updated;
    await writeSolicitacoes(rows);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Erro interno do servidor" });
});

const port = Number(process.env.PORT || 3001);

Promise.all([seedIfEmpty(), seedConcursosIfEmpty()])
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


