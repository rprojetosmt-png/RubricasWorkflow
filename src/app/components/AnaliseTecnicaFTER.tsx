import React, { useState, useRef } from "react";
import {
  FileText,
  Scale,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Save,
  Building2,
  Tag,
  Users,
  History,
  Calendar,
  Briefcase,
  Landmark,
  CircleDollarSign,
  Fingerprint,
  Paperclip,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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
  onSolicitarAjustes: () => void;
  onSalvar?: (dados: any) => void;
  dadosSalvos?: any;
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
  onSalvar,
  dadosSalvos,
  grupoPermitido = true,
  usuarioPermitido = true,
  assinaturasColetadas = 0,
  assinaturasObrigatorias = 0,
  assinaturasFaltantes = [],
  obrigatoriosNomes = [],
  assinouNomes = [],
}: AnaliseTecnicaFTERProps) {
  const [sigadocNumero, setSigadocNumero] = useState(dadosSalvos?.numeroSigadoc ?? "");
  const [ultimoSalvo, setUltimoSalvo] = useState<string | null>(dadosSalvos?.numeroSigadoc ?? null);
  const [salvando, setSalvando] = useState(false);
  const [arquivosAnexados, setArquivosAnexados] = useState<File[]>([]);
  const [parecerTexto, setParecerTexto] = useState("");
  const [reprovarModalOpen, setReprovarModalOpen] = useState(false);
  const [motivoAcao, setMotivoAcao] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = sigadocNumero !== (ultimoSalvo ?? "");
  const temConteudo = sigadocNumero.trim() !== "";

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

  const isValido = sigadocNumero.trim() !== "" && parecerTexto.trim() !== "";

  const handleSalvar = () => {
    if (!usuarioPermitido) {
      toast.error("Você não tem permissão para salvar nesta etapa.");
      return;
    }
    setSalvando(true);
    try {
      onSalvar?.({ numeroSigadoc: sigadocNumero, parecerTexto, documentosAnexados: arquivosAnexados.map((file) => file.name) });
      setUltimoSalvo(sigadocNumero);
      toast.success("Rascunho salvo com sucesso", {
        description: "Você pode retornar a qualquer momento para continuar a análise.",
      });
    } finally {
      setTimeout(() => setSalvando(false), 600);
    }
  };

  const handleAprovar = () => {
    if (!usuarioPermitido) {
      toast.error("Você não tem permissão para aprovar nesta etapa.");
      return;
    }
    if (isValido) {
      onAprovar({ numeroSigadoc: sigadocNumero, parecerTexto, documentosAnexados: arquivosAnexados.map((file) => file.name) });
    } else {
      if (!sigadocNumero.trim()) {
        toast.error("Informe o número do Sigadoc antes de aprovar.");
      } else {
        toast.error("Preencha o parecer técnico antes de aprovar.");
      }
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
                    {dadosSolicitacao.justificativa || "Nenhuma justificativa detalhada foi fornecida."}
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

        <div className="flex-1 bg-white overflow-y-auto p-6 flex flex-col space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg">Número Sigadoc</CardTitle>
                <CardDescription>
                  Informe o número de protocolo vinculado à análise jurídica.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sigadoc" className="text-sm font-semibold">Número do protocolo</Label>
                <Input
                  id="sigadoc"
                  placeholder="Ex.: SIGADOC-2026/000000"
                  className="h-11 border-2 focus:border-blue-500"
                  value={sigadocNumero}
                  onChange={(e) => setSigadocNumero(e.target.value)}
                />
              </div>
              <p className="text-sm text-slate-500">Este número será utilizado para rastrear a análise documental no SIGADOC.</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Documentos Anexados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {arquivosAnexados.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhum documento anexado.</p>
              ) : (
                arquivosAnexados.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-700">{file.name}</span>
                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => setArquivosAnexados((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setArquivosAnexados((prev) => [...prev, ...files]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-4 h-4" />
                Anexar documento
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-3 border-b border-slate-50">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg">Parecer Técnico</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-tight">
                  <Users className="w-3.5 h-3.5" />
                  Responsabilidade: Departamento Pessoal
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="space-y-2">
                <Textarea
                  placeholder="Descreva o parecer técnico desta etapa... *"
                  value={parecerTexto}
                  onChange={(e) => setParecerTexto(e.target.value)}
                  rows={4}
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                />
                {parecerTexto.trim() === "" && (
                  <p className="text-xs text-red-500">O parecer técnico é obrigatório para aprovar ou reprovar a etapa.</p>
                )}
              </div>
            </CardContent>
          </Card>
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
            onClick={onSolicitarAjustes}
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
          {isDirty && (
            <div className="flex items-center gap-1.5 text-amber-600">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-medium">Alterações não salvas</span>
            </div>
          )}
          <div className="text-right hidden md:block">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Status da Conformidade</p>
            <p className={cn("text-xs font-semibold", isValido ? "text-green-600" : "text-amber-600")}>
              {isValido ? "Apto para ativação" : "Pendente de dados técnicos"}
            </p>
          </div>
          <Button 
            variant="outline"
            disabled={!usuarioPermitido || !temConteudo || salvando}
            className={cn(
              "h-12 px-6 font-semibold transition-all border-2",
              temConteudo && usuarioPermitido
                ? "border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                : "border-slate-200 text-slate-400"
            )}
            onClick={handleSalvar}
          >
            <Save className="w-4 h-4 mr-2" />
            {salvando ? "Salvando..." : "Salvar Rascunho"}
          </Button>
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
