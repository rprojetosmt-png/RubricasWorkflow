import type { Solicitacao } from "./mockData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const listeners = new Set<() => void>();
let data: Solicitacao[] = [];
let loaded = false;
let loadingPromise: Promise<void> | null = null;

const emit = () => {
  listeners.forEach((listener) => listener());
};

const fetchJson = async <T>(input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Erro na API");
  }
  return (await res.json()) as T;
};

export const refreshSolicitacoes = async () => {
  data = await fetchJson<Solicitacao[]>(`${API_URL}/api/solicitacoes`);
  emit();
};

const ensureLoaded = () => {
  if (loaded) return;
  loaded = true;
  loadingPromise = refreshSolicitacoes().catch((err) => {
    console.error(err);
  });
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
  const result = await fetchJson<{ codigo: string }>(
    `${API_URL}/api/solicitacoes/next-codigo`
  );
  return result.codigo;
};

export const addSolicitacao = async (payload: Omit<Solicitacao, "id">) => {
  const created = await fetchJson<Solicitacao>(`${API_URL}/api/solicitacoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await refreshSolicitacoes();
  return created;
};

export const addSolicitacaoCompleta = async (solicitacao: Solicitacao) => {
  const created = await fetchJson<Solicitacao>(`${API_URL}/api/solicitacoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(solicitacao),
  });
  await refreshSolicitacoes();
  return created;
};

export const updateSolicitacao = async (
  id: string,
  updater: (current: Solicitacao) => Solicitacao
) => {
  const current = data.find((s) => s.id === id);
  if (!current) return null;

  const updatedPayload = updater(current);
  const updated = await fetchJson<Solicitacao>(
    `${API_URL}/api/solicitacoes/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPayload),
    }
  );
  await refreshSolicitacoes();
  return updated;
};

export const waitForInitialLoad = async () => {
  ensureLoaded();
  if (loadingPromise) {
    await loadingPromise;
  }
};
