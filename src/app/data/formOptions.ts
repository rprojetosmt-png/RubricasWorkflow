export const classificacoes = ["Vantagem", "Desconto", "Auxiliar"];

export const naturezasVerba = ["Remuneratória", "Indenizatória"] as const;

export const naturezaRubricaEsocial = [
  { codigo: "1000", descricao: "Salário, vencimento, soldo" },
  { codigo: "1001", descricao: "Subsídio" },
  { codigo: "1002", descricao: "Diferenças salariais" },
  { codigo: "1003", descricao: "Adicional por tempo de serviço" },
  { codigo: "1004", descricao: "Adicional noturno" },
  { codigo: "1005", descricao: "Adicional de periculosidade" },
  { codigo: "1006", descricao: "Adicional de insalubridade" },
  { codigo: "1007", descricao: "Gratificação de função" },
  { codigo: "1008", descricao: "Comissões" },
  { codigo: "1009", descricao: "13º salário" },
  { codigo: "1010", descricao: "Férias gozadas" },
  { codigo: "1800", descricao: "Verbas indenizatórias diversas" },
];

export const orgaos = [
  { id: "sec-saude", nome: "Secretaria de Saúde" },
  { id: "sec-educacao", nome: "Secretaria de Educação" },
  { id: "sec-seguranca", nome: "Secretaria de Segurança" },
  { id: "sec-fazenda", nome: "Secretaria da Fazenda" },
  { id: "sec-administracao", nome: "Secretaria de Administração" },
];

export const setores = [
  { id: "set-rh-saude", nome: "RH - Saúde", orgaoId: "sec-saude" },
  { id: "set-financeiro-saude", nome: "Financeiro - Saúde", orgaoId: "sec-saude" },
  { id: "set-folha-educacao", nome: "Folha de Pagamento - Educação", orgaoId: "sec-educacao" },
  { id: "set-rh-educacao", nome: "RH - Educação", orgaoId: "sec-educacao" },
  { id: "set-operacional-seguranca", nome: "Operacional - Segurança", orgaoId: "sec-seguranca" },
  { id: "set-rh-seguranca", nome: "RH - Segurança", orgaoId: "sec-seguranca" },
  { id: "set-fiscal-fazenda", nome: "Fiscal - Fazenda", orgaoId: "sec-fazenda" },
  { id: "set-contabil-fazenda", nome: "Contábil - Fazenda", orgaoId: "sec-fazenda" },
  { id: "set-patrimonio-adm", nome: "Patrimônio - Administração", orgaoId: "sec-administracao" },
  { id: "set-rh-adm", nome: "RH - Administração", orgaoId: "sec-administracao" },
];

export const listaPAOE = [
  "2044 - Gestão de Pessoas do Estado",
  "2045 - Manutenção de Serviços Administrativos",
  "2048 - Modernização Institucional",
  "2050 - Capacitação de Servidores",
  "2100 - Atenção Básica à Saúde",
  "2200 - Manutenção do Ensino Fundamental",
];

export const gruposTrabalhistasEsocial = [
  { id: "empregado-temporario", nome: "Empregado e Trabalhador Temporário" },
  { id: "avulso", nome: "Trabalhador Avulso" },
  { id: "servidor-publico", nome: "Servidor Público" },
  { id: "contribuinte-individual", nome: "Contribuinte Individual" },
  { id: "estagiario", nome: "Estagiário" },
];

export const categoriasPorGrupo: Record<string, { codigo: string; descricao: string }[]> = {
  "empregado-temporario": [
    { codigo: "101", descricao: "Empregado geral" },
    { codigo: "102", descricao: "Trabalhador rural" },
    { codigo: "103", descricao: "Aprendiz" },
    { codigo: "104", descricao: "Doméstico" },
    { codigo: "105", descricao: "Contrato a termo" },
    { codigo: "106", descricao: "Temporário" },
    { codigo: "107", descricao: "Verde e Amarelo (sem FGTS antecipado)" },
    { codigo: "108", descricao: "Verde e Amarelo (com FGTS antecipado)" },
    { codigo: "111", descricao: "Intermitente" },
  ],
  avulso: [
    { codigo: "201", descricao: "Trabalhador avulso portuário" },
    { codigo: "202", descricao: "Trabalhador avulso não portuário" },
  ],
  "servidor-publico": [
    { codigo: "301", descricao: "Servidor efetivo" },
    { codigo: "302", descricao: "Servidor comissionado" },
  ],
  "contribuinte-individual": [
    { codigo: "701", descricao: "Contribuinte individual" },
  ],
  estagiario: [{ codigo: "901", descricao: "Estagiário" }],
};

export const cargosAplicaveis = [
  "Médico",
  "Enfermeiro",
  "Professor PEB I",
  "Professor PEB II",
  "Policial Militar",
  "Policial Civil",
  "Auditor Fiscal",
  "Analista Administrativo",
  "Técnico Judiciário",
  "Auxiliar de Serviços Gerais",
];

export const incidenciasTributariasPrincipais = [
  { id: "irrf", nome: "IRRF" },
  { id: "inss-rg", nome: "INSS (Regime Geral)" },
  { id: "prev-propria", nome: "Previdência Própria" },
];

export const outrasIncidencias = [
  { id: "rpps", nome: "RPPS" },
  { id: "irrf-outras", nome: "IRRF" },
  { id: "pasep", nome: "PASEP" },
  { id: "grat-natalina", nome: "Gratificação natalina" },
  { id: "ferias-um-terco", nome: "1/3 férias" },
];

export const baseLegalDocumentos = [
  { id: "doc-lei-compl-01", titulo: "Lei Complementar 01/2024 - Estrutura de Rubricas", url: "#" },
  { id: "doc-decreto-88", titulo: "Decreto 88/2025 - Regras de Incidência", url: "#" },
  { id: "doc-portaria-12", titulo: "Portaria 12/2026 - Padronização de Eventos eSocial", url: "#" },
  { id: "doc-nota-tecnica-07", titulo: "Nota Técnica 07/2026 - Natureza de Verbas", url: "#" },
];
