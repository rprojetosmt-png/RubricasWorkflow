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
    nome: "Criação",
    descricao: "Criação da rubrica no sistema",
    ordem: 2,
    gruposResponsaveis: [gruposUsuarios[3]],
    cor: "#f59e0b",
  },
];

// Solicitações mockadas
export const solicitacoes: Solicitacao[] = [];

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


