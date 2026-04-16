export type ConcursoStatus = "ATIVO" | "ENCERRADO" | "CANCELADO";

export interface ConcursoPublicacaoInput {
  tipo: string;
  titulo: string;
  numero?: string;
  dataPublicacao: string | null;
  arquivoNome?: string;
  arquivoUrl?: string;
  observacao?: string;
}

export interface ConcursoPublicacao {
  id: string;
  tipo: string;
  titulo: string;
  numero?: string;
  dataPublicacao: string | null;
  arquivoNome?: string;
  arquivoUrl?: string;
  observacao?: string;
  createdAt?: string;
}

export interface Concurso {
  id: string;
  nomeConcurso: string;
  sigla: string;
  numeroEdital: string;
  tipoConcurso: string;
  regimeJuridico: string;
  tipoVinculo: string;
  abrangencia: string;
  orgaosEnvolvidos: string[];
  instituicaoRealizadora: string;
  setorResponsavel: string;
  dataPublicacaoEdital: string | null;
  dataInicioInscricao: string | null;
  dataFimInscricao: string | null;
  dataProva?: string | null;
  dataResultado?: string | null;
  dataValidade?: string | null;
  dataCancelamento?: string | null;
  objetivo: string;
  observacoes?: string;
  motivo?: string;
  situacao: ConcursoStatus;
  publicacoes?: ConcursoPublicacao[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ConcursoInput {
  nomeConcurso: string;
  sigla: string;
  numeroEdital: string;
  tipoConcurso: string;
  regimeJuridico: string;
  tipoVinculo: string;
  abrangencia: string;
  orgaosEnvolvidos: string[];
  instituicaoRealizadora: string;
  setorResponsavel: string;
  dataPublicacaoEdital: string | null;
  dataInicioInscricao: string | null;
  dataFimInscricao: string | null;
  dataProva?: string | null;
  dataResultado?: string | null;
  dataValidade?: string | null;
  dataCancelamento?: string | null;
  objetivo: string;
  observacoes?: string;
  motivo?: string;
}

const API_BASE = "http://localhost:3001/api";

const parseError = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.join("; ");
    }
    return data?.message || "Erro na requisição";
  } catch {
    return "Erro na requisição";
  }
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

export const listConcursos = async (): Promise<Concurso[]> => {
  const response = await fetch(`${API_BASE}/concursos`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const getConcurso = async (id: string): Promise<Concurso> => {
  const response = await fetch(`${API_BASE}/concursos/${id}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
};

export const createConcurso = async (payload: ConcursoInput): Promise<Concurso> => {
  const response = await fetch(`${API_BASE}/concursos`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
};

export const updateConcurso = async (id: string, payload: ConcursoInput): Promise<Concurso> => {
  const response = await fetch(`${API_BASE}/concursos/${id}`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
};


export const addConcursoPublicacao = async (
  id: string,
  payload: ConcursoPublicacaoInput
): Promise<ConcursoPublicacao[]> => {
  const response = await fetch(`${API_BASE}/concursos/${id}/publicacoes`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
};
