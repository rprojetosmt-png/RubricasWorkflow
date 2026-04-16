import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizarConcurso } from "./concursosSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONCURSOS_DATA_PATH = path.join(__dirname, "..", "concursos-data.json");
const CONCURSOS_SEED_PATH = path.join(__dirname, "..", "concursos-seed.json");

const readJsonArray = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
};

const writeJsonArray = async (filePath, items) => {
  const data = `${JSON.stringify(items, null, 2)}\n`;
  await fs.writeFile(filePath, data, "utf-8");
};

export const seedConcursosIfEmpty = async () => {
  const current = await readJsonArray(CONCURSOS_DATA_PATH);
  if (current.length > 0) return;

  const seed = await readJsonArray(CONCURSOS_SEED_PATH);
  if (seed.length === 0) return;

  const normalized = seed.map(normalizarConcurso);
  await writeJsonArray(CONCURSOS_DATA_PATH, normalized);
};

export const readConcursos = async () => {
  const rows = await readJsonArray(CONCURSOS_DATA_PATH);
  return rows.map(normalizarConcurso);
};

export const writeConcursos = async (items = []) => {
  await writeJsonArray(CONCURSOS_DATA_PATH, items.map(normalizarConcurso));
};

export const getConcursoById = async (id) => {
  const rows = await readConcursos();
  return rows.find((item) => item.id === id) || null;
};

export const createConcurso = async (payload) => {
  const rows = await readConcursos();
  const created = normalizarConcurso(payload);
  rows.push(created);
  await writeConcursos(rows);
  return created;
};

export const updateConcurso = async (id, payload) => {
  const rows = await readConcursos();
  const index = rows.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const updated = normalizarConcurso({
    ...rows[index],
    ...payload,
    id,
    createdAt: rows[index].createdAt,
  });

  rows[index] = updated;
  await writeConcursos(rows);
  return updated;
};

export const addPublicacaoConcurso = async (id, publicacao) => {
  const rows = await readConcursos();
  const index = rows.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const existing = rows[index];
  const updated = normalizarConcurso({
    ...existing,
    publicacoes: [...(existing.publicacoes || []), publicacao],
    id,
    createdAt: existing.createdAt,
  });

  rows[index] = updated;
  await writeConcursos(rows);
  return updated;
};

export { CONCURSOS_DATA_PATH, CONCURSOS_SEED_PATH };
