import { solicitacoes as initialSolicitacoes, esteiraDefault } from "./mockData";
import type { HistoricoEtapa, Solicitacao, Usuario } from "./mockData";

const listeners = new Set<() => void>();
let data: Solicitacao[] = initialSolicitacoes.map((s) => ({
  ...s,
  solicitante: { ...s.solicitante },
  historico: s.historico.map((h) => ({
    ...h,
    usuario: h.usuario ? { ...h.usuario } : undefined,
  })),
  documentos: s.documentos ? [...s.documentos] : undefined,
}));

const usuarioAtual: Usuario = {
  id: "u99",
  nome: "Renan Araujo",
};

const emit = () => {
  listeners.forEach((listener) => listener());
};

export const getSolicitacoes = () => data;

export const getSolicitacaoById = (id: string) => {
  return data.find((s) => s.id === id);
};

export const subscribeSolicitacoes = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

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

export const getNextCodigo = () => nextCodigo();

export const addSolicitacao = (params: {
  titulo: string;
  tipo: string;
  descricao: string;
  documentos?: string[];
  comentario?: string;
}) => {
  const now = new Date();
  const dataISO = now.toISOString();
  const dataSolicitacao = dataISO.slice(0, 10);
  const primeiraEtapa = esteiraDefault[0];

  const historico: HistoricoEtapa[] = [
    {
      etapaId: primeiraEtapa.id,
      status: "em_analise",
      usuario: usuarioAtual,
      data: dataISO,
      comentario: params.comentario?.trim() || undefined,
    },
  ];

  const nova: Solicitacao = {
    id: `sol-${Date.now()}`,
    codigo: nextCodigo(),
    titulo: params.titulo.trim(),
    tipo: params.tipo,
    solicitante: usuarioAtual,
    dataSolicitacao,
    statusGeral: "em_andamento",
    etapaAtual: primeiraEtapa.id,
    historico,
    descricao: params.descricao.trim(),
    documentos: params.documentos && params.documentos.length > 0 ? params.documentos : undefined,
  };

  data = [nova, ...data];
  emit();
  return nova;
};

export const addSolicitacaoCompleta = (solicitacao: Solicitacao) => {
  data = [solicitacao, ...data];
  emit();
  return solicitacao;
};

export const updateSolicitacao = (
  id: string,
  updater: (current: Solicitacao) => Solicitacao
) => {
  const index = data.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updated = updater(data[index]);
  data = [...data.slice(0, index), updated, ...data.slice(index + 1)];
  emit();
  return updated;
};
