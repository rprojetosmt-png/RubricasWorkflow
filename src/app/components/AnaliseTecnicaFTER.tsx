import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Scale, 
  Settings2, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  Info,
  Building2,
  Tag,
  Users,
  Search,
  History,
  Calendar,
  Briefcase,
  Landmark,
  CircleDollarSign,
  Fingerprint
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { cn } from "./ui/utils";
import { toast } from "sonner";
import { 
  orgaos as todosOrgaos,
  setores as todosSetores,
  gruposTrabalhistasEsocial,
  categoriasPorGrupo
} from "../data/formOptions";

interface AnaliseTecnicaFTERProps {
  dadosSolicitacao: any;
  onAprovar: (dados: any) => void;
  onReprovar: (motivo: string) => void;
  onSolicitarAjustes: (motivo: string) => void;
  grupoPermitido?: boolean;
  usuarioPermitido?: boolean;
  assinaturasColetadas?: number;
  assinaturasObrigatorias?: number;
  assinaturasFaltantes?: string[];
  obrigatoriosNomes?: string[];
  assinouNomes?: string[];
}

export function AnaliseTecnicaFTER({ 
  dadosSolicitacao, 
  onAprovar, 
  onReprovar, 
  onSolicitarAjustes,
  grupoPermitido = true,
  usuarioPermitido = true,
  assinaturasColetadas = 0,
  assinaturasObrigatorias = 0,
  assinaturasFaltantes = [],
  obrigatoriosNomes = [],
  assinouNomes = [],
}: AnaliseTecnicaFTERProps) {
  const [fterData, setFterData] = useState({
    numeroSEI: "",
    naturezaJuridica: "",
    vedacaoTeto: false,
    vedacaoIncorporacao: false,
    fundamentacaoLegal: "",
    tipoRubrica: "Vencimento",
    formaCalculo: "",
    unidadeMedida: "",
    periodicidade: "",
    incidenciaINSS: false,
    incidenciaIRRF: false,
    incidenciaFGTS: false,
    incidenciaRPPS: false,
    comporRescisao: false,
    situacoesRescisao: [] as string[],
    proporcionalidade: "Proporcional" as "Integral" | "Proporcional",
  });

  const [ajustesModalOpen, setAjustesModalOpen] = useState(false);
  const [reprovarModalOpen, setReprovarModalOpen] = useState(false);
  const [motivoAcao, setMotivoAcao] = useState("");

  const naturezasJuridicas = ["Remuneratória", "Indenizatória", "Eventual", "Transitória"];
  const formasCalculo = ["Valor Fixo", "Percentual", "Fórmula", "Informado Manualmente"];
  const unidadesMedida = ["Moeda", "Horas", "Dias", "Pontos"];
  const periodicidades = ["Mensal", "13º", "Férias", "Eventual"];
  const situacoesRescisaoOpcoes = ["Exoneração", "Aposentadoria", "Falecimento", "Demissão"];

  // Resolução de nomes para exibição na íntegra
  const nomesOrgaos = (dadosSolicitacao.orgaosSolicitantes || [])
    .map((id: string) => todosOrgaos.find(o => o.id === id)?.nome || id);
    
  const nomesSetores = (dadosSolicitacao.setorIds || [])
    .map((id: string) => todosSetores.find(s => s.id === id)?.nome || id);
    
  const nomesGrupos = (dadosSolicitacao.grupoTrabalhistaIds || [])
    .map((id: string) => gruposTrabalhistasEsocial.find(g => g.id === id)?.nome || id);

  const nomesCategorias = (dadosSolicitacao.categoriaTrabalhistaCodigos || [])
    .map((codigo: string) => {
      // Procurar em todos os grupos
      for (const grupo in categoriasPorGrupo) {
        const cat = categoriasPorGrupo[grupo].find(c => c.codigo === codigo);
        if (cat) return `${codigo} - ${cat.descricao}`;
      }
      return codigo;
    });

  // Lógica Condicional: Natureza Indenizatória sugere desligar incidências
  useEffect(() => {
    if (fterData.naturezaJuridica === "Indenizatória") {
      if (fterData.incidenciaINSS || fterData.incidenciaRPPS) {
        toast.warning("Rubricas Indenizatórias geralmente não possuem incidência de INSS/RPPS.", {
          description: "Verifique se deseja manter estas incidências ligadas.",
          duration: 5000,
        });
      }
    }
  }, [fterData.naturezaJuridica]);

  const isValido = 
    fterData.numeroSEI.trim() !== "" && 
    fterData.fundamentacaoLegal.trim() !== "" && 
    fterData.formaCalculo !== "";

  const handleAprovar = () => {
    if (!usuarioPermitido) {
      toast.error("Você não tem permissão para aprovar nesta etapa.");
      return;
    }
    if (isValido) {
      onAprovar(fterData);
    } else {
      toast.error("Preencha todos os campos obrigatórios (*)");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[600px] bg-slate-50/50 rounded-xl border overflow-hidden shadow-sm">
      <div className="flex flex-1 overflow-hidden">
        {/* PAINEL ESQUERDO: Revisão (Read-only) */}
        <div className="w-[40%] border-r bg-white overflow-y-auto p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Revisão da Solicitação
            </h3>
            <p className="text-sm text-slate-500">Dados originais enviados pelo solicitante.</p>
          </div>

          <div className="space-y-4">
            {/* 1. Identificação da Rubrica */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Fingerprint className="w-3.5 h-3.5" />
                Identificação
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome da Rubrica</p>
                    <p className="font-semibold text-slate-900">{dadosSolicitacao.nomeRubrica || "N/A"}</p>
                  </div>
                  <Badge variant="outline" className="bg-white">{dadosSolicitacao.codigoRubrica || "---"}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classificação</p>
                    <p className="text-sm text-slate-700">{dadosSolicitacao.classificacao || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PAOE</p>
                    <p className="text-sm text-slate-700 font-medium">{dadosSolicitacao.paoe || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Natureza</p>
                    <Badge className={cn(
                      "text-[10px] h-5",
                      dadosSolicitacao.natureza === "Remuneratória" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                    )}>
                      {dadosSolicitacao.natureza || "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Vigência e Caráter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Vigência e Caráter
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-slate-100 rounded-lg">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Início</p>
                  <p className="text-sm text-slate-700">{dadosSolicitacao.vigenciaInicio ? new Date(dadosSolicitacao.vigenciaInicio).toLocaleDateString("pt-BR") : "N/A"}</p>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-lg">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Caráter</p>
                  <p className="text-sm text-slate-700">{dadosSolicitacao.carater || "Não informado"}</p>
                </div>
                <div className="col-span-2 p-3 bg-white border border-slate-100 rounded-lg">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reter Teto Remuneratório?</p>
                  <p className="text-sm font-medium text-slate-700">{dadosSolicitacao.reterTetoRemuneratorio || "Não informado"}</p>
                </div>
              </div>
            </div>

            {/* 3. Abrangência */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Landmark className="w-3.5 h-3.5" />
                Abrangência e Público (Íntegra)
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-white border border-slate-100 rounded-lg space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Órgãos</p>
                    <div className="flex flex-wrap gap-1">
                      {nomesOrgaos.length > 0 ? nomesOrgaos.map((nome: string) => (
                        <Badge key={nome} variant="outline" className="text-[10px] bg-slate-50">{nome}</Badge>
                      )) : <span className="text-[11px] text-slate-400">Nenhum órgão selecionado</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Setores</p>
                    <div className="flex flex-wrap gap-1">
                      {nomesSetores.length > 0 ? nomesSetores.map((nome: string) => (
                        <Badge key={nome} variant="outline" className="text-[10px] bg-slate-50 border-dashed">{nome}</Badge>
                      )) : <span className="text-[11px] text-slate-400">Nenhum setor selecionado</span>}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-100 rounded-lg space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Grupos Trabalhistas</p>
                    <div className="flex flex-wrap gap-1">
                      {nomesGrupos.length > 0 ? nomesGrupos.map((nome: string) => (
                        <Badge key={nome} variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100">{nome}</Badge>
                      )) : <span className="text-[11px] text-slate-400">Nenhum grupo selecionado</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Categorias / Cargos</p>
                    <div className="flex flex-wrap gap-1">
                      {nomesCategorias.length > 0 ? nomesCategorias.map((nome: string) => (
                        <Badge key={nome} variant="secondary" className="text-[10px] bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-100">{nome}</Badge>
                      )) : null}
                      {(dadosSolicitacao.cargosAplicaveis || []).map((cargo: string) => (
                        <Badge key={cargo} variant="outline" className="text-[10px] border-slate-200">{cargo}</Badge>
                      ))}
                      {nomesCategorias.length === 0 && (dadosSolicitacao.cargosAplicaveis || []).length === 0 && (
                        <span className="text-[11px] text-slate-400">Nenhum cargo ou categoria específica</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Justificativa */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                Objetivo e eSocial
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Objetivo da Rubrica</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                    "{dadosSolicitacao.justificativa || "Nenhuma justificativa detalhada foi fornecida."}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">eSocial (Tabela 03)</p>
                    <div className="flex items-center gap-2 p-1.5 bg-blue-50 rounded border border-blue-100">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[10px] font-bold text-blue-800">{dadosSolicitacao.naturezaEsocial || "N/A"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Público-alvo</p>
                    <div className="flex items-center gap-2 p-1.5 bg-purple-50 rounded border border-purple-100">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-[10px] font-bold text-purple-800">Servidores Ativos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Incidências Originais */}
            {dadosSolicitacao.temIncidenciaTributaria === "Sim" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <CircleDollarSign className="w-3.5 h-3.5" />
                  Incidências Originais (Solicitadas)
                </div>
                <div className="flex flex-wrap gap-2">
                  {(dadosSolicitacao.incidenciasTributarias || []).map((inc: string) => (
                    <Badge key={inc} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">
                      {inc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Amparo Legal Original */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5" />
                Fundamentação Legal (Solicitante)
              </div>
              <div className="text-xs text-slate-600 p-3 border rounded bg-slate-50/30 leading-relaxed border-dashed">
                {dadosSolicitacao.justificativaLegal || "Não informado"}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 text-center">
                Solicitante: <span className="font-bold">{dadosSolicitacao.servidorResponsavel || "Sistema"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* PAINEL DIREITO: Configuração Técnica (FTER) */}
        <div className="flex-1 bg-white overflow-y-auto p-6 flex flex-col">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-indigo-600" />
                  Configuração Técnica FTER
                </h3>
                <p className="text-sm text-slate-500 italic">Preencha os parâmetros de enquadramento da folha.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("px-3 py-1", isValido ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700")}>
                  {isValido ? "Pronto para Aprovação" : "Aguardando campos obrigatórios"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sei" className="text-sm font-semibold">Número do Processo (SEI) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="sei"
                    placeholder="00000.000000/2024-00" 
                    className="pl-10 h-11 border-2 focus:border-indigo-500"
                    value={fterData.numeroSEI}
                    onChange={(e) => setFterData(prev => ({ ...prev, numeroSEI: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <Accordion type="multiple" defaultValue={["enquadramento", "calculo"]} className="space-y-4">
            {/* SEÇÃO 1: ENQUADRAMENTO LEGAL */}
            <AccordionItem value="enquadramento" className="border-none">
              <Card className="border shadow-none overflow-hidden">
                <AccordionTrigger className="px-5 py-4 hover:bg-slate-50/50 transition-colors hover:no-underline">
                  <div className="flex items-center gap-2 text-base font-bold text-slate-800">
                    <Scale className="w-5 h-5 text-slate-500" />
                    1. Enquadramento Legal (Bloco B)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase text-slate-500">Natureza Jurídica <span className="text-red-500">*</span></Label>
                      <Select 
                        value={fterData.naturezaJuridica} 
                        onValueChange={(v) => setFterData(prev => ({ ...prev, naturezaJuridica: v }))}
                      >
                        <SelectTrigger className="border-2 h-10">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {naturezasJuridicas.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase text-slate-500">Vedações Aplicáveis</Label>
                      <div className="flex flex-col gap-3 pt-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="ved-teto" 
                            checked={fterData.vedacaoTeto}
                            onCheckedChange={(v) => setFterData(prev => ({ ...prev, vedacaoTeto: v as boolean }))}
                          />
                          <Label htmlFor="ved-teto" className="text-sm font-normal cursor-pointer">Sujeita ao Teto Remuneratório</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="ved-inc" 
                            checked={fterData.vedacaoIncorporacao}
                            onCheckedChange={(v) => setFterData(prev => ({ ...prev, vedacaoIncorporacao: v as boolean }))}
                          />
                          <Label htmlFor="ved-inc" className="text-sm font-normal cursor-pointer">Vedada Incorporação Definitiva</Label>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 space-y-3">
                      <Label className="text-xs font-bold uppercase text-slate-500">Fundamentação Legal (Parecer Técnico) <span className="text-red-500">*</span></Label>
                      <Textarea 
                        placeholder="Descreva a base legal consolidada para esta rubrica..." 
                        className="border-2 min-h-[100px]"
                        value={fterData.fundamentacaoLegal}
                        onChange={(e) => setFterData(prev => ({ ...prev, fundamentacaoLegal: e.target.value }))}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* SEÇÃO 2: REGRAS DE CÁLCULO */}
            <AccordionItem value="calculo" className="border-none">
              <Card className="border shadow-none overflow-hidden">
                <AccordionTrigger className="px-5 py-4 hover:bg-slate-50/50 transition-colors hover:no-underline">
                  <div className="flex items-center gap-2 text-base font-bold text-slate-800">
                    <Settings2 className="w-5 h-5 text-slate-500" />
                    2. Regras de Cálculo e Operacionalização (Bloco D)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-3">
                      <Label className="text-xs font-bold uppercase text-slate-500">Tipo de Rubrica</Label>
                      <RadioGroup 
                        value={fterData.tipoRubrica} 
                        onValueChange={(v) => setFterData(prev => ({ ...prev, tipoRubrica: v }))}
                        className="flex gap-6 pt-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Vencimento" id="tipo-venc" />
                          <Label htmlFor="tipo-venc" className="font-normal">Vencimento</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Desconto" id="tipo-desc" />
                          <Label htmlFor="tipo-desc" className="font-normal">Desconto</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Informativa" id="tipo-info" />
                          <Label htmlFor="tipo-info" className="font-normal">Informativa</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase text-slate-500">Forma de Cálculo <span className="text-red-500">*</span></Label>
                      <Select 
                        value={fterData.formaCalculo} 
                        onValueChange={(v) => setFterData(prev => ({ ...prev, formaCalculo: v }))}
                      >
                        <SelectTrigger className="border-2 h-10">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {formasCalculo.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase text-slate-500">Unidade de Medida</Label>
                      <Select 
                        value={fterData.unidadeMedida} 
                        onValueChange={(v) => setFterData(prev => ({ ...prev, unidadeMedida: v }))}
                      >
                        <SelectTrigger className="border-2 h-10">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {unidadesMedida.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase text-slate-500">Periodicidade</Label>
                      <Select 
                        value={fterData.periodicidade} 
                        onValueChange={(v) => setFterData(prev => ({ ...prev, periodicidade: v }))}
                      >
                        <SelectTrigger className="border-2 h-10">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {periodicidades.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* SEÇÃO 3: INCIDÊNCIAS TRIBUTÁRIAS */}
            <AccordionItem value="incidencias" className="border-none">
              <Card className="border shadow-none overflow-hidden">
                <AccordionTrigger className="px-5 py-4 hover:bg-slate-50/50 transition-colors hover:no-underline">
                  <div className="flex items-center gap-2 text-base font-bold text-slate-800">
                    <ShieldCheck className="w-5 h-5 text-slate-500" />
                    3. Incidências Tributárias (Grid)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    {[
                      { id: "inc-inss", label: "INSS (Previdência Geral)", key: "incidenciaINSS" },
                      { id: "inc-irrf", label: "IRRF (Imposto de Renda)", key: "incidenciaIRRF" },
                      { id: "inc-fgts", label: "FGTS", key: "incidenciaFGTS" },
                      { id: "inc-rpps", label: "RPPS (Previdência Própria)", key: "incidenciaRPPS", highlight: true },
                    ].map((item) => (
                      <div key={item.id} className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        item.highlight ? "bg-amber-50/50 border-amber-200" : "bg-slate-50/30 border-slate-100"
                      )}>
                        <div className="space-y-0.5">
                          <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                            {item.label}
                            {item.highlight && <span className="text-amber-600 font-bold ml-1">*</span>}
                          </Label>
                          {item.highlight && <p className="text-[10px] text-amber-600 font-medium">Campo Crítico de Conformidade</p>}
                        </div>
                        <Switch 
                          id={item.id} 
                          checked={(fterData as any)[item.key]}
                          onCheckedChange={(v) => setFterData(prev => ({ ...prev, [item.key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* SEÇÃO 4: RESCISÃO */}
            <AccordionItem value="rescisao" className="border-none">
              <Card className="border shadow-none overflow-hidden">
                <AccordionTrigger className="px-5 py-4 hover:bg-slate-50/50 transition-colors hover:no-underline">
                  <div className="flex items-center gap-2 text-base font-bold text-slate-800">
                    <AlertTriangle className="w-5 h-5 text-slate-500" />
                    4. Regras de Rescisão (Bloco E)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="space-y-1">
                        <Label className="text-sm font-bold">Compor cálculo rescisório?</Label>
                        <p className="text-xs text-slate-500">Define se a rubrica será considerada na liquidação do vínculo.</p>
                      </div>
                      <Switch 
                        checked={fterData.comporRescisao}
                        onCheckedChange={(v) => setFterData(prev => ({ ...prev, comporRescisao: v }))}
                      />
                    </div>

                    {fterData.comporRescisao && (
                      <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase text-slate-500">Situações Aplicáveis</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {situacoesRescisaoOpcoes.map(sit => (
                              <div key={sit} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`sit-${sit}`} 
                                  checked={fterData.situacoesRescisao.includes(sit)}
                                  onCheckedChange={(checked) => {
                                    setFterData(prev => ({
                                      ...prev,
                                      situacoesRescisao: checked 
                                        ? [...prev.situacoesRescisao, sit]
                                        : prev.situacoesRescisao.filter(s => s !== sit)
                                    }));
                                  }}
                                />
                                <Label htmlFor={`sit-${sit}`} className="text-xs font-normal cursor-pointer">{sit}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase text-slate-500">Proporcionalidade</Label>
                          <RadioGroup 
                            value={fterData.proporcionalidade} 
                            onValueChange={(v) => setFterData(prev => ({ ...prev, proporcionalidade: v as any }))}
                            className="flex flex-col gap-3 pt-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Integral" id="prop-int" />
                              <Label htmlFor="prop-int" className="text-sm font-normal">Sempre Integral</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Proporcional" id="prop-prop" />
                              <Label htmlFor="prop-prop" className="text-sm font-normal">Proporcional aos dias trabalhados</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>

          <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4" />
              Campos marcados com <span className="text-red-500 font-bold">*</span> são de preenchimento obrigatório.
            </div>
          </div>
        </div>
      </div>

      {!usuarioPermitido && (
        <div className="px-6 py-3 bg-amber-50 border-t border-amber-200 flex items-center gap-3 text-amber-800">
          <AlertTriangle className="w-5 h-5" />
          <div className="text-sm">
            <span className="font-bold">Usuário sem permissão.</span> Apenas membros autorizados para esta etapa podem utilizar os controles da barra fixa.
          </div>
        </div>
      )}

      {assinaturasObrigatorias > 0 && (
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 space-y-2 text-sm text-slate-600">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">Assinaturas obrigatórias</span>
            <span className="text-slate-500">{assinaturasColetadas}/{assinaturasObrigatorias}</span>
          </div>
          <p>Obrigatórios: {obrigatoriosNomes.join(", ") || "Nenhum"}</p>
          <p>Já assinaram: {assinouNomes.length > 0 ? assinouNomes.join(", ") : "ninguém"}</p>
          {assinaturasFaltantes.length > 0 && (
            <p className="text-amber-700">Faltam {assinaturasFaltantes.length} assinatura(s) obrigatória(s).</p>
          )}
        </div>
      )}

      {/* FOOTER ACTION BAR */}
      <div className="h-20 bg-white border-t-2 border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            onClick={() => setAjustesModalOpen(true)}
            disabled={!usuarioPermitido}
          >
            Solicitar Ajustes
          </Button>
          <Button 
            variant="outline" 
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setReprovarModalOpen(true)}
            disabled={!usuarioPermitido}
          >
            Rejeitar Rubrica
          </Button>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Status da Conformidade</p>
            <p className={cn("text-xs font-semibold", isValido ? "text-green-600" : "text-amber-600")}>
              {isValido ? "Apto para ativação" : "Pendente de dados técnicos"}
            </p>
          </div>
          <Button 
            size="lg"
            disabled={!isValido || !usuarioPermitido}
            className={cn(
              "px-8 h-12 font-bold shadow-md transition-all",
              isValido && usuarioPermitido ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200" : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            )}
            onClick={handleAprovar}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Aprovar a Etapa
          </Button>
        </div>
      </div>

      {/* Modal: Rejeitar Rubrica */}
      <Dialog open={reprovarModalOpen} onOpenChange={setReprovarModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Rejeitar Rubrica
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <strong>Atenção:</strong> Esta ação encerrará definitivamente a solicitação e ela não poderá ser retomada.
            </div>
            <Label htmlFor="motivo-rejeicao">Motivo da rejeição <span className="text-red-500">*</span></Label>
            <Textarea
              id="motivo-rejeicao"
              placeholder="Descreva o motivo da rejeição definitiva da rubrica..."
              value={motivoAcao}
              onChange={(e) => setMotivoAcao(e.target.value)}
              rows={4}
              className="border-red-200 focus:border-red-400"
            />
            {motivoAcao.trim() === "" && (
              <p className="text-xs text-red-500">O motivo é obrigatório.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setReprovarModalOpen(false);
              setMotivoAcao("");
            }}>
              Cancelar
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-800"
              onClick={() => {
                if (!motivoAcao.trim()) {
                  toast.error("Informe o motivo da rejeição");
                  return;
                }
                onReprovar(motivoAcao);
                setMotivoAcao("");
                setReprovarModalOpen(false);
              }}
              disabled={!motivoAcao.trim()}
            >
              Confirmar rejeição da rubrica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
