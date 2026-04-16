export const CONCURSO_TIPOS = [
  "Concurso",
  "Processo Seletivo",
  "Processo Simplificado",
];

export const CONCURSO_STATUS = {
  ATIVO: "ATIVO",
  ENCERRADO: "ENCERRADO",
  CANCELADO: "CANCELADO",
};

const toDateOnly = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const normalizePublicacao = (payload = {}) => ({
  id: payload.id || `pub-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
  tipo: String(payload.tipo || "").trim(),
  titulo: String(payload.titulo || "").trim(),
  numero: payload.numero ? String(payload.numero).trim() : "",
  dataPublicacao: toDateOnly(payload.dataPublicacao),
  arquivoNome: payload.arquivoNome ? String(payload.arquivoNome).trim() : "",
  arquivoUrl: payload.arquivoUrl ? String(payload.arquivoUrl).trim() : "",
  observacao: payload.observacao ? String(payload.observacao).trim() : "",
  createdAt: payload.createdAt || new Date().toISOString(),
});

export const calcularStatusConcurso = (concurso, now = new Date()) => {
  if (concurso.dataCancelamento) {
    return CONCURSO_STATUS.CANCELADO;
  }

  if (concurso.dataValidade) {
    const validade = new Date(`${concurso.dataValidade}T23:59:59`);
    if (!Number.isNaN(validade.getTime()) && validade < now) {
      return CONCURSO_STATUS.ENCERRADO;
    }
  }

  return CONCURSO_STATUS.ATIVO;
};

export const normalizarConcurso = (payload = {}) => {
  const orgaosEnvolvidos = toArray(payload.orgaosEnvolvidos)
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  const concurso = {
    id: payload.id || `con-${Date.now()}`,
    nomeConcurso: String(payload.nomeConcurso || "").trim(),
    sigla: String(payload.sigla || "").trim(),
    numeroEdital: String(payload.numeroEdital || "").trim(),
    tipoConcurso: String(payload.tipoConcurso || "").trim(),
    regimeJuridico: String(payload.regimeJuridico || "").trim(),
    tipoVinculo: String(payload.tipoVinculo || "").trim(),
    abrangencia: String(payload.abrangencia || "").trim(),
    orgaosEnvolvidos,
    instituicaoRealizadora: String(payload.instituicaoRealizadora || "").trim(),
    setorResponsavel: String(payload.setorResponsavel || "").trim(),
    dataPublicacaoEdital: toDateOnly(payload.dataPublicacaoEdital),
    dataInicioInscricao: toDateOnly(payload.dataInicioInscricao),
    dataFimInscricao: toDateOnly(payload.dataFimInscricao),
    dataProva: toDateOnly(payload.dataProva),
    dataResultado: toDateOnly(payload.dataResultado),
    dataValidade: toDateOnly(payload.dataValidade),
    dataCancelamento: toDateOnly(payload.dataCancelamento),
    objetivo: String(payload.objetivo || "").trim(),
    observacoes: payload.observacoes ? String(payload.observacoes).trim() : "",
    motivo: payload.motivo ? String(payload.motivo).trim() : "",
    publicacoes: toArray(payload.publicacoes).map(normalizePublicacao),
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  concurso.situacao = calcularStatusConcurso(concurso);
  return concurso;
};

const ensureDateOrder = (start, end) => {
  if (!start || !end) return true;
  return new Date(start).getTime() <= new Date(end).getTime();
};

export const validarConcurso = (payload = {}) => {
  const errors = [];

  if (!payload.nomeConcurso) errors.push("nomeConcurso é obrigatório");
  if (!payload.sigla) errors.push("sigla é obrigatório");
  if (!payload.numeroEdital) errors.push("numeroEdital é obrigatório");
  if (!payload.tipoConcurso) errors.push("tipoConcurso é obrigatório");
  if (!payload.regimeJuridico) errors.push("regimeJuridico é obrigatório");
  if (!payload.tipoVinculo) errors.push("tipoVinculo é obrigatório");
  if (!payload.abrangencia) errors.push("abrangencia é obrigatório");
  if (!payload.instituicaoRealizadora) errors.push("instituicaoRealizadora é obrigatório");
  if (!payload.setorResponsavel) errors.push("setorResponsavel é obrigatório");
  if (!payload.dataPublicacaoEdital) errors.push("dataPublicacaoEdital é obrigatório");
  if (!payload.dataInicioInscricao) errors.push("dataInicioInscricao é obrigatório");
  if (!payload.dataFimInscricao) errors.push("dataFimInscricao é obrigatório");
  if (!payload.objetivo) errors.push("objetivo é obrigatório");

  const orgaos = Array.isArray(payload.orgaosEnvolvidos) ? payload.orgaosEnvolvidos.filter(Boolean) : [];
  if (orgaos.length === 0) errors.push("orgaosEnvolvidos deve ter ao menos um item");

  if (!ensureDateOrder(payload.dataInicioInscricao, payload.dataFimInscricao)) {
    errors.push("dataInicioInscricao deve ser menor ou igual a dataFimInscricao");
  }

  if (!ensureDateOrder(payload.dataPublicacaoEdital, payload.dataInicioInscricao)) {
    errors.push("dataPublicacaoEdital deve ser menor ou igual a dataInicioInscricao");
  }

  if (!ensureDateOrder(payload.dataProva, payload.dataResultado)) {
    errors.push("dataProva deve ser menor ou igual a dataResultado");
  }

  if (!ensureDateOrder(payload.dataResultado, payload.dataValidade)) {
    errors.push("dataResultado deve ser menor ou igual a dataValidade");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
