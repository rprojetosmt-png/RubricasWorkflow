// Tipos de token da fórmula
export type TokenType = "variable" | "operator" | "logic" | "value" | "rubrica" | "paren";

export interface FormulaToken {
  id: string;
  type: TokenType;
  label: string;
  symbol: string;
  description?: string;
}

// Operadores matemáticos
export const operadores = [
  { symbol: "+", label: "Somar",       description: "Soma dois valores" },
  { symbol: "-", label: "Subtrair",    description: "Subtrai dois valores" },
  { symbol: "*", label: "Multiplicar", description: "Multiplica dois valores" },
  { symbol: "/", label: "Dividir",     description: "Divide dois valores" },
  { symbol: "(", label: "Abre ( )",    description: "Agrupa expressões" },
  { symbol: ")", label: "Fecha ( )",   description: "Fecha agrupamento" },
];

// Operadores lógicos
export const logicaItems = [
  { symbol: "SE",    label: "Se",        description: "Condição: se verdadeiro" },
  { symbol: "ENTÃO", label: "Então",     description: "Resultado se verdadeiro" },
  { symbol: "SENÃO", label: "Senão",     description: "Resultado se falso" },
  { symbol: ">",     label: "Maior",     description: "Maior que" },
  { symbol: "<",     label: "Menor",     description: "Menor que" },
  { symbol: "=",     label: "Igual",     description: "Igual a" },
  { symbol: "!=",    label: "Diferente", description: "Diferente de" },
];

// Variáveis do sistema
export interface Variavel {
  id: string;
  nome: string;
  descricao: string;
  categoria: "remuneracao" | "tempo" | "dependentes" | "base";
  simbolo: string;
}

export const variaveis: Variavel[] = [
  { id: "salario_base",      nome: "Salário Base",       descricao: "Salário base do servidor",            categoria: "remuneracao", simbolo: "SAL_BASE"    },
  { id: "base_inss",         nome: "Base INSS",          descricao: "Base de cálculo para INSS",           categoria: "base",        simbolo: "BASE_INSS"   },
  { id: "num_dependentes",   nome: "Num. Dependentes",   descricao: "Quantidade de dependentes",           categoria: "dependentes", simbolo: "NUM_DEP"     },
  { id: "dias_uteis",        nome: "Dias Úteis",         descricao: "Dias úteis no mês",                   categoria: "tempo",       simbolo: "DIAS_UTEIS"  },
  { id: "dias_trabalhados",  nome: "Dias Trabalhados",   descricao: "Dias efetivamente trabalhados",       categoria: "tempo",       simbolo: "DIAS_TRAB"   },
  { id: "carga_horaria",     nome: "Carga Horária",      descricao: "Carga horária mensal do servidor",    categoria: "tempo",       simbolo: "CARGA_HOR"   },
  { id: "nivel_cargo",       nome: "Nível do Cargo",     descricao: "Nível hierárquico do cargo",          categoria: "base",        simbolo: "NIVEL_CARGO" },
  { id: "percentual_gratif", nome: "% Gratificação",     descricao: "Percentual de gratificação definido", categoria: "remuneracao", simbolo: "PERC_GRATIF" },
];

// Rubricas de referência
export interface RubricaRef {
  codigo: string;
  nome: string;
  tipo: "vantagem" | "desconto" | "auxiliar";
}

export const rubricasRef: RubricaRef[] = [
  { codigo: "1010", nome: "Salário Base",               tipo: "vantagem" },
  { codigo: "1020", nome: "Gratificação de Função",     tipo: "vantagem" },
  { codigo: "1030", nome: "Adicional de Insalubridade", tipo: "vantagem" },
  { codigo: "1040", nome: "Adicional Noturno",          tipo: "vantagem" },
  { codigo: "1050", nome: "Horas Extras",               tipo: "vantagem" },
  { codigo: "2010", nome: "Desconto INSS",              tipo: "desconto" },
  { codigo: "2020", nome: "Desconto IRRF",              tipo: "desconto" },
  { codigo: "2030", nome: "Desconto Plano de Saúde",    tipo: "desconto" },
  { codigo: "3010", nome: "Base Cálculo INSS",          tipo: "auxiliar" },
  { codigo: "3020", nome: "Base Cálculo IRRF",          tipo: "auxiliar" },
  { codigo: "3030", nome: "Total Bruto",                tipo: "auxiliar" },
];

// Validação da fórmula
export type ValidationStatus = "empty" | "valid" | "invalid" | "incomplete";

export function validateFormula(tokens: FormulaToken[]): ValidationStatus {
  if (tokens.length === 0) return "empty";

  // Verificar parênteses balanceados
  let depth = 0;
  for (const t of tokens) {
    if (t.symbol === "(") depth++;
    if (t.symbol === ")") depth--;
    if (depth < 0) return "invalid";
  }
  if (depth !== 0) return "invalid";

  // Não pode terminar em operador ou lógica
  const last = tokens[tokens.length - 1];
  if (last.type === "operator" || last.type === "logic") return "incomplete";

  return "valid";
}

// Construir fórmula descritiva
export function buildDescriptiveFormula(tokens: FormulaToken[]): string {
  return tokens.map((t) => t.symbol).join(" ");
}

// Gerar ID único
export function generateId(): string {
  return crypto.randomUUID();
}
