import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toDateOnly = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const fromApiToDb = (payload) => {
  const dataSolicitacao = payload.dataSolicitacao
    ? new Date(payload.dataSolicitacao)
    : new Date();

  return {
    id: payload.id,
    codigo: payload.codigo,
    titulo: payload.titulo,
    tipo: payload.tipo,
    solicitante: payload.solicitante,
    dataSolicitacao,
    statusGeral: payload.statusGeral,
    etapaAtual: payload.etapaAtual,
    descricao: payload.descricao,
    documentos: payload.documentos ?? null,
    historico: payload.historico ?? [],
  };
};

const fromDbToApi = (row) => ({
  id: row.id,
  codigo: row.codigo,
  titulo: row.titulo,
  tipo: row.tipo,
  solicitante: row.solicitante,
  dataSolicitacao: toDateOnly(row.dataSolicitacao),
  statusGeral: row.statusGeral,
  etapaAtual: row.etapaAtual,
  descricao: row.descricao,
  documentos: row.documentos ?? undefined,
  historico: row.historico ?? [],
});

const nextCodigo = async () => {
  const now = new Date();
  const ano = now.getFullYear();
  const prefix = `RUB-${ano}-`;
  const rows = await prisma.solicitacao.findMany({
    select: { codigo: true },
  });

  const seq = rows
    .map((s) => s.codigo)
    .filter((codigo) => codigo.startsWith(prefix))
    .map((codigo) => Number(codigo.slice(prefix.length)))
    .filter((n) => Number.isFinite(n));

  const maxSeq = seq.length > 0 ? Math.max(...seq) : 0;
  const nextSeq = String(maxSeq + 1).padStart(3, "0");
  return `${prefix}${nextSeq}`;
};

const seedIfEmpty = async () => {
  const count = await prisma.solicitacao.count();
  if (count > 0) return;

  try {
    const seedPath = path.join(__dirname, "seed.json");
    const content = await fs.readFile(seedPath, "utf-8");
    const items = JSON.parse(content);

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await prisma.solicitacao.create({
          data: fromApiToDb({
            ...item,
            codigo: item.codigo || (await nextCodigo()),
          }),
        });
      }
    }
  } catch (err) {
    console.warn("Seed skipped:", err?.message ?? err);
  }
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/solicitacoes/next-codigo", async (_req, res) => {
  const codigo = await nextCodigo();
  res.json({ codigo });
});

app.get("/api/solicitacoes", async (_req, res) => {
  const rows = await prisma.solicitacao.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(rows.map(fromDbToApi));
});

app.get("/api/solicitacoes/:id", async (req, res) => {
  const row = await prisma.solicitacao.findUnique({
    where: { id: req.params.id },
  });

  if (!row) {
    res.status(404).json({ message: "Solicitação não encontrada" });
    return;
  }

  res.json(fromDbToApi(row));
});

app.post("/api/solicitacoes", async (req, res) => {
  const payload = req.body;

  if (!payload?.titulo || !payload?.tipo || !payload?.descricao) {
    res.status(400).json({ message: "Dados incompletos" });
    return;
  }

  const codigo = payload.codigo || (await nextCodigo());
  const data = fromApiToDb({ ...payload, codigo });

  const created = await prisma.solicitacao.create({ data });
  res.status(201).json(fromDbToApi(created));
});

app.put("/api/solicitacoes/:id", async (req, res) => {
  const payload = req.body;

  const existing = await prisma.solicitacao.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    res.status(404).json({ message: "Solicitação não encontrada" });
    return;
  }

  const data = fromApiToDb({
    ...payload,
    id: existing.id,
    codigo: payload.codigo || existing.codigo,
  });

  const updated = await prisma.solicitacao.update({
    where: { id: existing.id },
    data,
  });

  res.json(fromDbToApi(updated));
});

const port = Number(process.env.PORT || 3001);

seedIfEmpty()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
