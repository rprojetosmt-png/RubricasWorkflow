import { type Solicitacao, solicitacoes as mockSolicitacoes } from "./mockData";

const listeners = new Set<() => void>();
let data: Solicitacao[] = [];
let loaded = false;

const emit = () => {
  listeners.forEach((listener) => listener());
};

const saveToStorage = () => {
  try {
    localStorage.setItem("solicitacoes", JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save to localStorage", err);
  }
};

const ensureLoaded = () => {
  if (loaded) return;
  loaded = true;
  try {
    const saved = localStorage.getItem("solicitacoes");
    if (saved) {
      data = JSON.parse(saved);
      if (!Array.isArray(data) || data.length === 0) {
        data = [...mockSolicitacoes];
      }
    } else {
      data = [...mockSolicitacoes];
    }
  } catch (err) {
    console.error("Failed to load from localStorage", err);
    data = [...mockSolicitacoes];
  }
};

export const refreshSolicitacoes = async () => {
  emit();
};

export const getSolicitacoes = () => {
  ensureLoaded();
  return data;
};

export const getSolicitacaoById = (id: string) => {
  ensureLoaded();
  return data.find((s) => s.id === id);
};

export const subscribeSolicitacoes = (listener: () => void) => {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getNextCodigo = async () => {
  ensureLoaded();
  const year = new Date().getFullYear();
  const count = data.filter((s) => s.codigo.includes(year.toString())).length + 1;
  return `RUB-${year}-${String(count).padStart(3, "0")}`;
};

export const addSolicitacao = async (payload: Omit<Solicitacao, "id">) => {
  ensureLoaded();
  const created: Solicitacao = { ...payload, id: `sol-${Date.now()}` };
  data.push(created);
  saveToStorage();
  emit();
  return created;
};

export const addSolicitacaoCompleta = async (solicitacao: Solicitacao) => {
  ensureLoaded();
  data.push(solicitacao);
  saveToStorage();
  emit();
  return solicitacao;
};

export const updateSolicitacao = async (
  id: string,
  updater: (current: Solicitacao) => Solicitacao
) => {
  ensureLoaded();
  const index = data.findIndex((s) => s.id === id);
  if (index === -1) return null;
  data[index] = updater(data[index]);
  saveToStorage();
  emit();
  return data[index];
};

export const waitForInitialLoad = async () => {
  ensureLoaded();
};
