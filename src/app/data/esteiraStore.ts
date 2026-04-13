import { esteiraDefault, type Etapa, type GrupoUsuarios } from "./mockData";

export const ESTEIRA_STORAGE_KEY = "rubricas.esteira.config";

const listeners = new Set<() => void>();
let etapasCache: Etapa[] | null = null;

const uniqueUsers = (grupos: GrupoUsuarios[]) => {
  const seen = new Set<string>();
  return grupos
    .flatMap((grupo) => grupo.usuarios)
    .filter((usuario) => {
      if (seen.has(usuario.id)) return false;
      seen.add(usuario.id);
      return true;
    });
};

const normalizeEtapa = (etapa: Etapa): Etapa => {
  const gruposResponsaveis = Array.isArray(etapa.gruposResponsaveis)
    ? etapa.gruposResponsaveis
    : [];

  const allowedIds = new Set(uniqueUsers(gruposResponsaveis).map((u) => u.id));
  const requiredSignerIds = Array.isArray(etapa.requiredSignerIds)
    ? etapa.requiredSignerIds.filter((id) => allowedIds.has(id))
    : [];

  return {
    ...etapa,
    gruposResponsaveis,
    requiredSignerIds,
  };
};

const normalizeEtapas = (etapas: Etapa[]) =>
  etapas
    .map(normalizeEtapa)
    .sort((a, b) => a.ordem - b.ordem)
    .map((etapa, index) => ({ ...etapa, ordem: index + 1 }));

const loadEtapasFromStorage = (): Etapa[] => {
  try {
    const raw = localStorage.getItem(ESTEIRA_STORAGE_KEY);
    if (!raw) return normalizeEtapas(esteiraDefault);

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return normalizeEtapas(esteiraDefault);
    }

    return normalizeEtapas(parsed as Etapa[]);
  } catch {
    return normalizeEtapas(esteiraDefault);
  }
};

const ensureLoaded = () => {
  if (!etapasCache) {
    localStorage.removeItem(ESTEIRA_STORAGE_KEY); // Temporary flush to apply new changes from mockData
    etapasCache = loadEtapasFromStorage();
  }
};

const emit = () => {
  listeners.forEach((listener) => listener());
};

export const getEsteiraConfig = (): Etapa[] => {
  ensureLoaded();
  return etapasCache as Etapa[];
};

export const saveEsteiraConfig = (etapas: Etapa[]) => {
  const normalized = normalizeEtapas(etapas);
  etapasCache = normalized;
  localStorage.setItem(ESTEIRA_STORAGE_KEY, JSON.stringify(normalized));
  emit();
  return normalized;
};

export const subscribeEsteiraConfig = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
