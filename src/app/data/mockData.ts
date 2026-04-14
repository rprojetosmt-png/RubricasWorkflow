export interface Usuario {
  id: string;
  nome: string;
  cpf?: string;
  matricula?: string;
  avatar?: string;
}

export interface GrupoUsuarios {
  id: string;
  nome: string;
  usuarios: Usuario[];
}

export interface Etapa {
  id: string;
  nome: string;
  descricao: string;
  ordem: number;
  gruposResponsaveis: GrupoUsuarios[];
  requiredSignerIds?: string[];
  cor: string;
}

export interface HistoricoEtapa {
  etapaId: string;
  status: "pendente" | "em_analise" | "aprovado" | "rejeitado";
  usuario?: Usuario;
  data?: string;
  comentario?: string;
}

export interface Solicitacao {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  solicitante: Usuario;
  dataSolicitacao: string;
  statusGeral: "em_andamento" | "aprovado" | "rejeitado";
  etapaAtual: string;
  historico: HistoricoEtapa[];
  assinaturasEtapa?: Record<string, string[]>;
  descricao: string;
  documentos?: string[];
}

// Grupos de usuários
export const gruposUsuarios: GrupoUsuarios[] = [
  {
    id: "grupo-1",
    nome: "Departamento Pessoal",
    usuarios: [
      { id: "u1", nome: "Maria Silva" },
      { id: "u2", nome: "João Santos" },
      { id: "u3", nome: "Ana Costa" },
    ],
  },
  {
    id: "grupo-2",
    nome: "Jurídico",
    usuarios: [
      { id: "u4", nome: "Carlos Oliveira" },
      { id: "u5", nome: "Patricia Souza" },
    ],
  },
  {
    id: "grupo-3",
    nome: "Financeiro",
    usuarios: [
      { id: "u6", nome: "Roberto Lima" },
      { id: "u7", nome: "Juliana Martins" },
      { id: "u8", nome: "Fernando Alves" },
    ],
  },
  {
    id: "grupo-4",
    nome: "TI/Sistemas",
    usuarios: [
      { id: "u9", nome: "Ricardo Pereira" },
      { id: "u10", nome: "Camila Rodrigues" },
    ],
  },
  {
    id: "grupo-5",
    nome: "Qualidade/Testes",
    usuarios: [
      { id: "u11", nome: "Lucas Fernandes" },
      { id: "u12", nome: "Amanda Barbosa" },
    ],
  },
  {
    id: "grupo-6",
    nome: "Diretoria",
    usuarios: [
      { id: "u13", nome: "Eduardo Mendes" },
      { id: "u14", nome: "Beatriz Carvalho" },
    ],
  },
];

// Configuração da esteira padrão
export const esteiraDefault: Etapa[] = [
  {
    id: "etapa-1",
    nome: "Solicitação",
    descricao: "Abertura e registro da solicitação de nova rubrica",
    ordem: 1,
    gruposResponsaveis: [gruposUsuarios[0]],
    cor: "#3b82f6",
  },
  {
    id: "etapa-2",
    nome: "Análise Documental",
    descricao: "Verificação e validação da documentação apresentada",
    ordem: 2,
    gruposResponsaveis: [gruposUsuarios[0]],
    cor: "#8b5cf6",
  },
  {
    id: "etapa-3",
    nome: "Parecer Jurídico",
    descricao: "Análise e parecer legal sobre a rubrica",
    ordem: 3,
    gruposResponsaveis: [gruposUsuarios[1]],
    cor: "#ec4899",
  },
  {
    id: "etapa-4",
    nome: "Criação",
    descricao: "Criação da rubrica no sistema",
    ordem: 4,
    gruposResponsaveis: [gruposUsuarios[3]],
    cor: "#f59e0b",
  },
  {
    id: "etapa-5",
    nome: "Testes",
    descricao: "Validação e testes de funcionamento",
    ordem: 5,
    gruposResponsaveis: [gruposUsuarios[4]],
    cor: "#6366f1",
  },
  {
    id: "etapa-6",
    nome: "Aprovação Final",
    descricao: "Aprovação final da diretoria",
    ordem: 6,
    gruposResponsaveis: [gruposUsuarios[5]],
    cor: "#059669",
  },
];

// Solicitações mockadas
export const solicitacoes: Solicitacao[] = [
  {
    id: "sol-1",
    codigo: "RUB-2026-001",
    titulo: "Adicional de Periculosidade",
    tipo: "Nova Rubrica",
    solicitante: { id: "u1", nome: "Maria Silva" },
    dataSolicitacao: "2026-03-25",
    statusGeral: "em_andamento",
    etapaAtual: "etapa-4",
    descricao:
      "Solicitação de criação de rubrica para adicional de periculosidade conforme legislação vigente CLT Art. 193.",
    documentos: [
      "CLT_Art_193.pdf",
      "Laudo_Periculosidade.pdf",
      "Memoria_Calculo.xlsx",
    ],
    historico: [
      {
        etapaId: "etapa-1",
        status: "aprovado",
        usuario: { id: "u1", nome: "Maria Silva" },
        data: "2026-03-25",
        comentario: "Solicitação criada com documentação completa.",
      },
      {
        etapaId: "etapa-2",
        status: "aprovado",
        usuario: { id: "u2", nome: "João Santos" },
        data: "2026-03-26",
        comentario: "Documentação verificada e aprovada.",
      },
      {
        etapaId: "etapa-3",
        status: "aprovado",
        usuario: { id: "u4", nome: "Carlos Oliveira" },
        data: "2026-03-27",
        comentario: "Parecer jurídico favorável à implementação.",
      },
      {
        etapaId: "etapa-4",
        status: "em_analise",
        usuario: { id: "u9", nome: "Ricardo Pereira" },
        data: "2026-03-28",
      },
    ],
  },
  {
    id: "sol-2",
    codigo: "RUB-2026-002",
    titulo: "Vale Alimentação",
    tipo: "Nova Rubrica",
    solicitante: { id: "u3", nome: "Ana Costa" },
    dataSolicitacao: "2026-03-28",
    statusGeral: "em_andamento",
    etapaAtual: "etapa-2",
    descricao:
      "Implementação de rubrica para vale alimentação conforme PAT - Programa de Alimentação do Trabalhador.",
    documentos: ["PAT_Legislacao.pdf", "Proposta_Fornecedor.pdf"],
    historico: [
      {
        etapaId: "etapa-1",
        status: "aprovado",
        usuario: { id: "u3", nome: "Ana Costa" },
        data: "2026-03-28",
        comentario: "Solicitação criada.",
      },
      {
        etapaId: "etapa-2",
        status: "em_analise",
        usuario: { id: "u2", nome: "João Santos" },
        data: "2026-03-29",
      },
    ],
  },
  {
    id: "sol-3",
    codigo: "RUB-2026-003",
    titulo: "Bônus por Performance",
    tipo: "Nova Rubrica",
    solicitante: { id: "u6", nome: "Roberto Lima" },
    dataSolicitacao: "2026-03-20",
    statusGeral: "em_andamento",
    etapaAtual: "etapa-5",
    descricao:
      "Criação de rubrica para bônus variável baseado em metas de performance individual e coletiva.",
    documentos: [
      "Politica_Bonus.pdf",
      "Criterios_Avaliacao.pdf",
      "Simulacao_Impacto.xlsx",
    ],
    historico: [
      {
        etapaId: "etapa-1",
        status: "aprovado",
        usuario: { id: "u6", nome: "Roberto Lima" },
        data: "2026-03-20",
      },
      {
        etapaId: "etapa-2",
        status: "aprovado",
        usuario: { id: "u1", nome: "Maria Silva" },
        data: "2026-03-21",
      },
      {
        etapaId: "etapa-3",
        status: "aprovado",
        usuario: { id: "u5", nome: "Patricia Souza" },
        data: "2026-03-22",
      },
      {
        etapaId: "etapa-4",
        status: "aprovado",
        usuario: { id: "u10", nome: "Camila Rodrigues" },
        data: "2026-03-24",
      },
      {
        etapaId: "etapa-5",
        status: "em_analise",
        usuario: { id: "u11", nome: "Lucas Fernandes" },
        data: "2026-03-27",
      },
    ],
  },
  {
    id: "sol-4",
    codigo: "RUB-2026-004",
    titulo: "Hora Extra 50%",
    tipo: "Atualização de Rubrica",
    solicitante: { id: "u1", nome: "Maria Silva" },
    dataSolicitacao: "2026-03-15",
    statusGeral: "aprovado",
    etapaAtual: "etapa-6",
    descricao:
      "Atualização do cálculo de hora extra 50% para adequação à nova convenção coletiva.",
    documentos: ["Convencao_Coletiva_2026.pdf"],
    historico: [
      {
        etapaId: "etapa-1",
        status: "aprovado",
        data: "2026-03-15",
      },
      {
        etapaId: "etapa-2",
        status: "aprovado",
        data: "2026-03-16",
      },
      {
        etapaId: "etapa-3",
        status: "aprovado",
        data: "2026-03-17",
      },
      {
        etapaId: "etapa-4",
        status: "aprovado",
        data: "2026-03-18",
      },
      {
        etapaId: "etapa-5",
        status: "aprovado",
        data: "2026-03-22",
      },
      {
        etapaId: "etapa-6",
        status: "aprovado",
        usuario: { id: "u13", nome: "Eduardo Mendes" },
        data: "2026-03-23",
        comentario: "Aprovado. Rubrica atualizada com sucesso.",
      },
    ],
  },
  {
    id: "sol-5",
    codigo: "RUB-2026-005",
    titulo: "Auxílio Home Office",
    tipo: "Nova Rubrica",
    solicitante: { id: "u8", nome: "Fernando Alves" },
    dataSolicitacao: "2026-03-30",
    statusGeral: "em_andamento",
    etapaAtual: "etapa-1",
    descricao:
      "Criação de rubrica para auxílio mensal aos colaboradores em regime de trabalho remoto.",
    documentos: ["Politica_Home_Office.pdf"],
    historico: [
      {
        etapaId: "etapa-1",
        status: "pendente",
      },
    ],
  },
];

export const historicalDataMock = {
  "id": "8055",
  "title": "Adicional de Complexidade",
  "status": "Vantagem",
  "readOnly": true,
  "sections": [
    {
      "title": "INFORMAÇÕES GERAIS",
      "fields": [
        {"label": "Órgão", "value": "SEPLAG", "icon": "business"},
        {"label": "Data de Início", "value": "31/03/2024", "icon": "event"}
      ]
    },
    {
      "title": "INCIDÊNCIAS",
      "fields": [
        {"label": "Gratificação Natalina", "value": "Sim", "type": "badge-success"},
        {"label": "1/3 de Férias", "value": "Sim", "type": "badge-success"}
      ]
    }
  ],
  "attachments": [
    {"name": "Decreto_8055_Adicional_Complexidade.pdf", "size": "245 KB"},
    {"name": "Portaria_SEPLAG_2024_Regulamentacao.pdf", "size": "1,2 MB"}
  ]
};


