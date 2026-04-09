export const classificacoes = [
  "Provento",
  "Desconto",
  "Base de Cálculo",
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

export const gruposTrabalhistas = [
  "Efetivos",
  "Comissionados",
  "Temporários",
  "Estagiários",
  "Aposentados",
  "Pensionistas",
];

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

export const tributosAplicaveis = [
  { id: "irrf", nome: "IRRF" },
  { id: "inss", nome: "INSS" },
  { id: "fgts", nome: "FGTS" },
  { id: "pss", nome: "PSS" },
  { id: "iss", nome: "ISS" },
  { id: "pis-pasep", nome: "PIS/PASEP" },
];
