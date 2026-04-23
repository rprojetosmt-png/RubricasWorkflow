import type { FormulaToken } from "./rubrica-data";
 
export type TipoPessoa = "servidor" | "pessoa_fisica";
 
export interface OpcaoFiltro { id: string; label: string; }
 
export const orgaos: OpcaoFiltro[] = [
  { id: "seplag",  label: "SEPLAG - Sec. de Planejamento e Gestão" },
  { id: "seduc",   label: "SEDUC - Sec. de Educação" },
  { id: "ses",     label: "SES - Sec. de Saúde" },
  { id: "sejusp",  label: "SEJUSP - Sec. de Justiça e Seg. Pública" },
  { id: "sad",     label: "SAD - Sec. de Administração" },
  { id: "sefaz",   label: "SEFAZ - Sec. de Fazenda" },
  { id: "seinfra", label: "SEINFRA - Sec. de Infraestrutura" },
  { id: "semagro", label: "SEMAGRO - Sec. de Meio Ambiente" },
];
 
export const tiposVinculo: OpcaoFiltro[] = [
  { id: "efetivo",      label: "Efetivo" },
  { id: "comissionado", label: "Comissionado" },
  { id: "temporario",   label: "Temporário" },
  { id: "celetista",    label: "Celetista" },
  { id: "estagiario",   label: "Estagiário" },
];
 
export const categorias: OpcaoFiltro[] = [
  { id: "servidor_efetivo",      label: "Servidor Público Efetivo" },
  { id: "servidor_comissionado", label: "Servidor Comissionado" },
  { id: "empregado_publico",     label: "Empregado Público" },
  { id: "agente_politico",       label: "Agente Político" },
  { id: "militar",               label: "Militar" },
];
 
export const cargos: OpcaoFiltro[] = [
  { id: "analista_sistemas", label: "Analista de Sistemas" },
  { id: "tecnico_ti",        label: "Técnico de TI" },
  { id: "professor",         label: "Professor" },
  { id: "medico",            label: "Médico" },
  { id: "enfermeiro",        label: "Enfermeiro" },
  { id: "auditor_fiscal",    label: "Auditor Fiscal" },
  { id: "assistente_admin",  label: "Assistente Administrativo" },
  { id: "engenheiro",        label: "Engenheiro" },
  { id: "delegado",          label: "Delegado" },
  { id: "perito",            label: "Perito Criminal" },
];
 
export const situacoesFuncionais: OpcaoFiltro[] = [
  { id: "ativo",      label: "Ativo" },
  { id: "afastado",   label: "Afastado" },
  { id: "licenca",    label: "Em Licença" },
  { id: "cedido",     label: "Cedido" },
  { id: "aposentado", label: "Aposentado" },
  { id: "exonerado",  label: "Exonerado" },
];
 
export const servidores = [
  { id: "s1",  matricula: "100234", nome: "Maria Silva Santos" },
  { id: "s2",  matricula: "100456", nome: "João Carlos Oliveira" },
  { id: "s3",  matricula: "100789", nome: "Ana Paula Ferreira" },
  { id: "s4",  matricula: "101023", nome: "Pedro Henrique Costa" },
  { id: "s5",  matricula: "101345", nome: "Luciana Almeida Souza" },
  { id: "s6",  matricula: "101567", nome: "Roberto Nascimento Lima" },
  { id: "s7",  matricula: "101890", nome: "Fernanda Ribeiro Mendes" },
  { id: "s8",  matricula: "102012", nome: "Carlos Eduardo Pereira" },
  { id: "s9",  matricula: "102345", nome: "Patrícia Gomes Araújo" },
  { id: "s10", matricula: "102678", nome: "Marcos Vinícius Barbosa" },
];
 
export interface Excecao {
  id: string;
  numero: number;
  tipoPessoa: TipoPessoa;
  filtros: {
    orgaos: string[];
    tiposVinculo: string[];
    categorias: string[];
    cargos: string[];
    situacoesFuncionais: string[];
    servidores: string[];
    dataInicio: string;
    dataFim: string;
  };
  tokens: FormulaToken[];
  formulaDescritiva: string;
  formulaHumana: string;
}
 
export function getFilterLabels(filtros: Excecao["filtros"]) {
  const result: { campo: string; valores: string }[] = [];
  if (filtros.orgaos.length)             result.push({ campo: "Órgão",             valores: filtros.orgaos.map(id => orgaos.find(o => o.id === id)?.label ?? id).join(", ") });
  if (filtros.tiposVinculo.length)       result.push({ campo: "Tipo de Vínculo",   valores: filtros.tiposVinculo.map(id => tiposVinculo.find(o => o.id === id)?.label ?? id).join(", ") });
  if (filtros.categorias.length)         result.push({ campo: "Categoria",         valores: filtros.categorias.map(id => categorias.find(o => o.id === id)?.label ?? id).join(", ") });
  if (filtros.cargos.length)             result.push({ campo: "Cargo",             valores: filtros.cargos.map(id => cargos.find(o => o.id === id)?.label ?? id).join(", ") });
  if (filtros.situacoesFuncionais.length) result.push({ campo: "Situação Funcional", valores: filtros.situacoesFuncionais.map(id => situacoesFuncionais.find(o => o.id === id)?.label ?? id).join(", ") });
  if (filtros.servidores.length)         result.push({ campo: "Pessoa",            valores: filtros.servidores.map(id => { const s = servidores.find(o => o.id === id); return s ? `${s.matricula} - ${s.nome}` : id; }).join(", ") });
  if (filtros.dataInicio)                result.push({ campo: "Data Início",       valores: filtros.dataInicio });
  if (filtros.dataFim)                   result.push({ campo: "Data Fim",          valores: filtros.dataFim });
  return result;
}
