import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "data.json");
const seedPath = path.join(__dirname, "seed.json");

let data = [];

const readJsonIfExists = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    if (err?.code === "ENOENT") return null;
    throw err;
  }
};

const writeData = async () => {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");
};

const toDateOnly = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const normalizeItem = (item) => ({
  ...item,
  dataSolicitacao: toDateOnly(item.dataSolicitacao) ?? toDateOnly(new Date()),
  documentos: item.documentos ?? undefined,
  historico: item.historico ?? [],
});

const nextCodigo = () => {
  const now = new Date();
  const ano = now.getFullYear();
  const prefix = `RUB-${ano}-`;
  const seq = data
    .map((s) => s.codigo)
    .filter((codigo) => codigo.startsWith(prefix))
    .map((codigo) => Number(codigo.slice(prefix.length)))
    .filter((n) => Number.isFinite(n));

  const maxSeq = seq.length > 0 ? Math.max(...seq) : 0;
  const nextSeq = String(maxSeq + 1).padStart(3, "0");
  return `${prefix}${nextSeq}`;
};

const loadData = async () => {
  const existing = await readJsonIfExists(dataPath);
  if (existing) {
    data = existing.map(normalizeItem);
    return;
  }

  const seed = (await readJsonIfExists(seedPath)) ?? [];
  data = seed.map(normalizeItem);
  await writeData();
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/solicitacoes/next-codigo", (_req, res) => {
  res.json({ codigo: nextCodigo() });
});

app.get("/api/solicitacoes", (_req, res) => {
  const ordered = [...data].sort((a, b) => {
    const aTime = new Date(a.dataSolicitacao).getTime();
    const bTime = new Date(b.dataSolicitacao).getTime();
    return bTime - aTime;
  });
  res.json(ordered);
});

app.get("/api/solicitacoes/:id", (req, res) => {
  const row = data.find((s) => s.id === req.params.id);
  if (!row) {
    res.status(404).json({ message: "Solicitação não encontrada" });
    return;
  }
  res.json(row);
});

app.post("/api/solicitacoes", async (req, res) => {
  const payload = req.body;

  if (!payload?.titulo || !payload?.tipo || !payload?.descricao) {
    res.status(400).json({ message: "Dados incompletos" });
    return;
  }

  const codigo = payload.codigo || nextCodigo();
  const created = normalizeItem({
    ...payload,
    id: payload.id || `sol-${Date.now()}`,
    codigo,
    dataSolicitacao: payload.dataSolicitacao || toDateOnly(new Date()),
  });

  data = [created, ...data];
  await writeData();
  res.status(201).json(created);
});

app.put("/api/solicitacoes/:id", async (req, res) => {
  const payload = req.body;
  const index = data.findIndex((s) => s.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ message: "Solicitação não encontrada" });
    return;
  }

  const updated = normalizeItem({
    ...data[index],
    ...payload,
    id: data[index].id,
    codigo: payload.codigo || data[index].codigo,
  });

  data = [...data.slice(0, index), updated, ...data.slice(index + 1)];
  await writeData();
  res.json(updated);
});

const port = Number(process.env.PORT || 3001);

loadData()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
      console.log(`Data file: ${dataPath}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
