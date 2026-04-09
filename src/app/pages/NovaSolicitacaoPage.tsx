import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Plus,
  ArrowRight,
  Info,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  esteiraDefault,
  type HistoricoEtapa,
  type Solicitacao,
  type Usuario,
} from "../data/mockData";
import { addSolicitacaoCompleta, getNextCodigo } from "../data/solicitacoesStore";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import {
  classificacoes,
  orgaos,
  setores as todosSetores,
  listaPAOE,
  naturezasVerba,
  naturezaRubricaEsocial,
  gruposTrabalhistasEsocial,
  categoriasPorGrupo,
  cargosAplicaveis,
  incidenciasTributariasPrincipais,
  outrasIncidencias,
  baseLegalDocumentos,
} from "../data/formOptions";
import { MultiSelect } from "../components/MultiSelect";
import { Separator } from "../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Checkbox } from "../components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SolicitacaoFormData {
  nomeRubrica: string;
  classificacao: string;
  natureza: "Remuneratória" | "Indenizatória";
  naturezaEsocial: string;
  vigenciaInicio: Date | undefined;
  vigenciaFim: Date | undefined;
  paoe: string;
  orgaosSolicitantes: string[];
  setorId: string;
  grupoTrabalhistaId: string;
  categoriaTrabalhistaCodigo: string;
  existeOutrosGrupos: "Sim" | "Não";
  outrosGruposDescricao: string;
  cargosAplicaveis: string[];
  servidorResponsavel: string;
  carater: "Contínuo" | "Temporário";
  reterTetoRemuneratorio: "Sim" | "Não";
  incideNatalina: "Sim" | "Não";
  incideFerias: "Sim" | "Não";
  temIncidenciaTributaria: "Sim" | "Não";
  incidenciasTributarias: string[];
  outrasIncidencias: string[];
  baseLegalIds: string[];
  justificativa: string;
  aceiteTermos: boolean;
}



const usuarioAtual: Usuario = { id: "u99", nome: "Usuário Atual" };

export function NovaSolicitacaoPage() {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SolicitacaoFormData>({
    defaultValues: {
      nomeRubrica: "",
      classificacao: "",
      natureza: undefined,
      naturezaEsocial: "",
      vigenciaInicio: undefined,
      vigenciaFim: undefined,
      paoe: "",
      orgaosSolicitantes: [],
      setorId: "",
      grupoTrabalhistaId: "",
      categoriaTrabalhistaCodigo: "",
      existeOutrosGrupos: "Não",
      outrosGruposDescricao: "",
      cargosAplicaveis: [],
      servidorResponsavel: usuarioAtual.nome,
      carater: undefined,
      reterTetoRemuneratorio: undefined,
      incideNatalina: undefined,
      incideFerias: undefined,
      temIncidenciaTributaria: undefined,
      incidenciasTributarias: [],
      outrasIncidencias: [],
      baseLegalIds: [],
      justificativa: "",
      aceiteTermos: false,
    },
  });

  const selectedOrgaos = watch("orgaosSolicitantes");
  const selectedSetorId = watch("setorId");
  const naturezaSelecionada = watch("natureza");
  const vigenciaInicio = watch("vigenciaInicio");
  const grupoTrabalhistaId = watch("grupoTrabalhistaId");
  const existeOutrosGrupos = watch("existeOutrosGrupos");
  const temIncidenciaTributaria = watch("temIncidenciaTributaria");
  const baseLegalSelecionada = watch("baseLegalIds");

  const setoresFiltrados = useMemo(() => {
    return todosSetores.filter((s) => selectedOrgaos.includes(s.orgaoId));
  }, [selectedOrgaos]);

  const categoriasFiltradas = useMemo(() => {
    if (!grupoTrabalhistaId) return [];
    return categoriasPorGrupo[grupoTrabalhistaId] ?? [];
  }, [grupoTrabalhistaId]);

  const temRetroatividade = useMemo(() => {
    if (!vigenciaInicio) return false;
    const hoje = new Date();
    const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return vigenciaInicio < inicioMesAtual;
  }, [vigenciaInicio]);

  useEffect(() => {
    if (selectedSetorId && !setoresFiltrados.some((s) => s.id === selectedSetorId)) {
      setValue("setorId", "");
    }
  }, [selectedSetorId, setoresFiltrados, setValue]);

  useEffect(() => {
    setValue("servidorResponsavel", usuarioAtual.nome);
  }, [setValue]);

  useEffect(() => {
    setValue("categoriaTrabalhistaCodigo", "");
  }, [grupoTrabalhistaId, setValue]);

  useEffect(() => {
    if (existeOutrosGrupos !== "Sim") {
      setValue("outrosGruposDescricao", "");
    }
  }, [existeOutrosGrupos, setValue]);

  useEffect(() => {
    if (naturezaSelecionada !== "Remuneratória") {
      setValue("carater", undefined);
      setValue("reterTetoRemuneratorio", undefined);
    }
  }, [naturezaSelecionada, setValue]);

  useEffect(() => {
    if (temIncidenciaTributaria !== "Sim") {
      setValue("incidenciasTributarias", []);
      setValue("outrasIncidencias", []);
    }
  }, [temIncidenciaTributaria, setValue]);

  const titulo = watch("nomeRubrica");
  const tipo = "Nova Rubrica";

  const podeEnviar =
    !!watch("nomeRubrica") &&
    !!watch("classificacao") &&
    !!watch("natureza") &&
    !!watch("naturezaEsocial") &&
    !!watch("vigenciaInicio") &&
    !!watch("paoe") &&
    selectedOrgaos.length > 0 &&
    !!watch("setorId") &&
    !!watch("grupoTrabalhistaId") &&
    !!watch("categoriaTrabalhistaCodigo") &&
    watch("cargosAplicaveis").length > 0 &&
    !!watch("servidorResponsavel") &&
    !!watch("incideNatalina") &&
    !!watch("incideFerias") &&
    !!watch("temIncidenciaTributaria") &&
    watch("baseLegalIds").length > 0 &&
    !!watch("justificativa") &&
    !!watch("aceiteTermos") &&
    (naturezaSelecionada !== "Remuneratória" || (!!watch("carater") && !!watch("reterTetoRemuneratorio"))) &&
    (temIncidenciaTributaria !== "Sim" || watch("incidenciasTributarias").length > 0) &&
    (existeOutrosGrupos !== "Sim" || !!watch("outrosGruposDescricao")?.trim());


  const [etapaIndex, setEtapaIndex] = useState(0);

  const [comentario, setComentario] = useState("");
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [historico, setHistorico] = useState<HistoricoEtapa[]>([]);
  const [codigoPreview, setCodigoPreview] = useState("RUB-YYYY-000");

  const etapaAtual = esteiraDefault[etapaIndex];
  const etapaAtualIndex = etapaIndex + 1;

  useEffect(() => {
    let isActive = true;
    getNextCodigo()
      .then((codigo) => {
        if (isActive) setCodigoPreview(codigo);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      isActive = false;
    };
  }, []);


  const getStatusIcon = (status: string, size: string = "w-5 h-5") => {
    switch (status) {
      case "aprovado":
        return <CheckCircle2 className={cn(size, "text-green-600")} />;
      case "rejeitado":
        return <XCircle className={cn(size, "text-red-600")} />;
      case "em_analise":
        return <Clock className={cn(size, "text-blue-600")} />;
      case "pendente":
        return (
          <div
            className={cn(
              size.replace("w-", "w-").replace("h-", "h-"),
              "rounded-full border-2 border-slate-300"
            )}
          />
        );
      default:
        return null;
    }
  };

  const upsertHistorico = (
    lista: HistoricoEtapa[],
    etapaId: string,
    patch: Partial<HistoricoEtapa>
  ) => {
    const index = lista.findIndex((h) => h.etapaId === etapaId);
    if (index >= 0) {
      const atualizado = { ...lista[index], ...patch } as HistoricoEtapa;
      return [
        ...lista.slice(0, index),
        atualizado,
        ...lista.slice(index + 1),
      ];
    }

    return [
      ...lista,
      {
        etapaId,
        status: patch.status ?? "pendente",
        ...patch,
      } as HistoricoEtapa,
    ];
  };

  const onFormSubmit = async (data: SolicitacaoFormData) => {
    const dataAgora = new Date().toISOString();

    let atualizado = upsertHistorico(historico, etapaAtual.id, {
      status: "aprovado",
      data: dataAgora,
      comentario: comentario.trim() || "Solicitação preenchida conforme regras da etapa 1.",
      usuario: usuarioAtual,
    });

    const proximaEtapa = esteiraDefault[etapaIndex + 1];
    if (proximaEtapa) {
      atualizado = upsertHistorico(atualizado, proximaEtapa.id, {
        status: "em_analise",
        data: dataAgora,
        usuario: usuarioAtual,
      });
      setHistorico(atualizado);
      setEtapaIndex((prevIndex) => prevIndex + 1);
      setComentario("");
      toast.success("Solicitação enviada", {
        description: "A solicitação foi enviada para análise documental.",
      });
      return;
    }

    const novaSolicitacao: Solicitacao = {
      id: `sol-${Date.now()}`,
      codigo: codigoPreview,
      titulo: data.nomeRubrica || "Nova Solicitação",
      tipo: "Nova Rubrica",
      solicitante: usuarioAtual,
      dataSolicitacao: new Date().toISOString().slice(0, 10),
      statusGeral: "aprovado",
      etapaAtual: etapaAtual.id,
      descricao: data.justificativa || "Solicitação sem justificativa detalhada.",
      historico: atualizado,
    };

    try {
      const created = await addSolicitacaoCompleta(novaSolicitacao);
      toast.success("Solicitação concluída", {
        description: "A solicitação passou por todas as etapas.",
      });
      navigate(`/solicitacao/${created.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar a solicitação");
    }
  };


  const handleRejeitar = () => {
    setIsRejectDialogOpen(true);
  };

  const handleConfirmarRejeicao = () => {
    if (!motivoRejeicao.trim()) {
      toast.error("Informe o motivo da rejeição");
      return;
    }

    const dataAgora = new Date().toISOString();

    let atualizado = upsertHistorico(historico, etapaAtual.id, {
      status: "rejeitado",
      data: dataAgora,
      comentario: motivoRejeicao.trim(),
      usuario: usuarioAtual,
    });

    if (etapaIndex > 0) {
      const etapaAnterior = esteiraDefault[etapaIndex - 1];
      atualizado = upsertHistorico(atualizado, etapaAnterior.id, {
        status: "em_analise",
        data: dataAgora,
        usuario: usuarioAtual,
      });
      setEtapaIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }

    setHistorico(atualizado);
    setIsRejectDialogOpen(false);
    setMotivoRejeicao("");
    toast.error("Etapa rejeitada", {
      description: `Motivo: ${motivoRejeicao.trim()}`,
    });
  };

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* Contexto + Fluxo */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="py-3 pb-2 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-slate-600">{codigoPreview}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {tipo}
                  </Badge>
                </div>
                <h2 className="text-slate-900 mb-1">{titulo || "Nova Solicitação"}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {usuarioAtual.nome}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            </div>
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50">
              Rubrica em edição
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3 space-y-3">
          <div className="relative overflow-x-auto pb-1">
            <div className="absolute top-4 left-3 right-3 h-px bg-slate-300" />
            <div className="relative flex min-w-[940px] items-start justify-between gap-4 px-1">
              {esteiraDefault.map((etapa, index) => {
                const status =
                  historico.find((h) => h.etapaId === etapa.id)?.status ??
                  (index === etapaIndex ? "em_analise" : "pendente");
                const isAtual = index === etapaIndex;
                const isCompleto = status === "aprovado";
                const isRejeitado = status === "rejeitado";

                return (
                  <div key={etapa.id} className="w-36 shrink-0 text-center">
                    <div
                      className={cn(
                        "mx-auto h-8 w-8 rounded-full border-2 bg-white flex items-center justify-center relative z-10 font-semibold text-xs",
                        isCompleto && "border-blue-700 bg-blue-700 text-white",
                        isRejeitado && "border-red-500 bg-red-50 text-red-600",
                        isAtual && !isCompleto && "border-blue-700 text-blue-700 ring-2 ring-blue-100",
                        !isCompleto && !isRejeitado && !isAtual && "border-slate-300 text-slate-500"
                      )}
                    >
                      {isCompleto ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-sm font-semibold leading-tight",
                        isAtual && "text-blue-800",
                        isCompleto && "text-slate-800",
                        isRejeitado && "text-red-700",
                        !isCompleto && !isRejeitado && !isAtual && "text-slate-600"
                      )}
                    >
                      {etapa.nome}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{etapa.descricao}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-3 py-2 bg-slate-50 rounded-md border border-slate-200 flex flex-wrap items-center gap-2 text-sm">
            <Badge className="bg-blue-700 text-white hover:bg-blue-700">
              {etapaAtualIndex} de {esteiraDefault.length}
            </Badge>
            <span className="font-medium text-slate-800">Etapa Atual: {etapaAtual.nome}</span>
            <span className="text-slate-600">{etapaAtual.descricao}</span>
            <span className="text-slate-700 flex items-center gap-1">
              <User className="w-4 h-4" />
              {etapaAtual.gruposResponsaveis.map((g) => g.nome).join(", ")}
            </span>
          </div>
        </CardContent>
      </Card>
      <form onSubmit={handleSubmit(onFormSubmit)} className="grid grid-cols-3 gap-6 pb-20">
        <div className="col-span-2 space-y-6">
          {/* Seção: Dados Básicos */}
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-1 bg-blue-600 w-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Dados Básicos
              </CardTitle>
            </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="flex items-center gap-1">
                  Nome da Rubrica <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="nomeRubrica"
                  control={control}
                  rules={{
                    required: "Campo obrigatório",
                    maxLength: { value: 50, message: "Máximo de 50 caracteres" },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      maxLength={50}
                      placeholder="Ex: Adicional de Tempo de Serviço"
                      className={cn("border-2 h-10", errors.nomeRubrica && "border-red-500")}
                    />
                  )}
                />
                {errors.nomeRubrica && <p className="text-xs text-red-500 mt-1">{errors.nomeRubrica.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Classificação <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="classificacao"
                  control={control}
                  rules={{ required: "Campo obrigatório" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={cn("border-2 h-10", errors.classificacao && "border-red-500")}>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {classificacoes.map((item) => (
                          <SelectItem key={item} value={item}>{item}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.classificacao && <p className="text-xs text-red-500 mt-1">{errors.classificacao.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Natureza da Verba <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="natureza"
                  control={control}
                  rules={{ required: "Selecione a natureza" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={cn("border-2 h-10", errors.natureza && "border-red-500")}>
                        <SelectValue placeholder="Selecione a natureza" />
                      </SelectTrigger>
                      <SelectContent>
                        {naturezasVerba.map((naturezaItem) => (
                          <SelectItem key={naturezaItem} value={naturezaItem}>{naturezaItem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.natureza && <p className="text-xs text-red-500 mt-1">{errors.natureza.message}</p>}
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="flex items-center gap-1">
                  Tabela 03 - Natureza das Rubricas (eSocial) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="naturezaEsocial"
                  control={control}
                  rules={{ required: "Selecione a natureza da rubrica no eSocial" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={cn("border-2 h-10", errors.naturezaEsocial && "border-red-500")}>
                        <SelectValue placeholder="Selecione o código eSocial" />
                      </SelectTrigger>
                      <SelectContent>
                        {naturezaRubricaEsocial.map((item) => (
                          <SelectItem key={item.codigo} value={item.codigo}>{item.codigo} - {item.descricao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.naturezaEsocial && <p className="text-xs text-red-500 mt-1">{errors.naturezaEsocial.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">Vigência - Data de início <span className="text-red-500">*</span></Label>
                <Controller
                  name="vigenciaInicio"
                  control={control}
                  rules={{ required: "Data de início obrigatória" }}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-2 h-10", !field.value && "text-muted-foreground", errors.vigenciaInicio && "border-red-500")}>
                          <Calendar className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha a data inicial</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.vigenciaInicio && <p className="text-xs text-red-500 mt-1">{errors.vigenciaInicio.message}</p>}
                {temRetroatividade && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">Atenção: data de início anterior ao mês atual (retroatividade).</p>}
              </div>

              <div className="space-y-2">
                <Label>Vigência - Data fim (opcional)</Label>
                <Controller
                  name="vigenciaFim"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-2 h-10", !field.value && "text-muted-foreground")}>
                          <Calendar className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Data fim (se houver)</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">PAOE <span className="text-red-500">*</span></Label>
                <Controller
                  name="paoe"
                  control={control}
                  rules={{ required: "Campo obrigatório" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={cn("border-2 h-10", errors.paoe && "border-red-500")}>
                        <SelectValue placeholder="Selecione a ação..." />
                      </SelectTrigger>
                      <SelectContent>
                        {listaPAOE.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.paoe && <p className="text-xs text-red-500 mt-1">{errors.paoe.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">Órgãos Solicitantes <span className="text-red-500">*</span></Label>
                <Controller
                  name="orgaosSolicitantes"
                  control={control}
                  rules={{ required: "Selecione pelo menos um órgão" }}
                  render={({ field }) => (
                    <MultiSelect
                      options={orgaos.map((o) => ({ label: o.nome, value: o.id }))}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione os órgãos..."
                      error={!!errors.orgaosSolicitantes}
                    />
                  )}
                />
                {errors.orgaosSolicitantes && <p className="text-xs text-red-500 mt-1">{errors.orgaosSolicitantes.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">Setor <span className="text-red-500">*</span></Label>
                <Controller
                  name="setorId"
                  control={control}
                  rules={{ required: "Selecione um setor" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={selectedOrgaos.length === 0}>
                      <SelectTrigger className={cn("border-2 h-10", errors.setorId && "border-red-500")}>
                        <SelectValue placeholder={selectedOrgaos.length > 0 ? "Selecione o setor" : "Selecione o órgão primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {setoresFiltrados.map((setor) => (
                          <SelectItem key={setor.id} value={setor.id}>{setor.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.setorId && <p className="text-xs text-red-500 mt-1">{errors.setorId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">Grupo Trabalhista (eSocial) <span className="text-red-500">*</span></Label>
                <Controller
                  name="grupoTrabalhistaId"
                  control={control}
                  rules={{ required: "Selecione o grupo trabalhista" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={cn("border-2 h-10", errors.grupoTrabalhistaId && "border-red-500")}>
                        <SelectValue placeholder="Selecione o grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {gruposTrabalhistasEsocial.map((grupo) => (
                          <SelectItem key={grupo.id} value={grupo.id}>{grupo.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.grupoTrabalhistaId && <p className="text-xs text-red-500 mt-1">{errors.grupoTrabalhistaId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">Categoria Trabalhista (eSocial) <span className="text-red-500">*</span></Label>
                <Controller
                  name="categoriaTrabalhistaCodigo"
                  control={control}
                  rules={{ required: "Selecione a categoria trabalhista" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={!grupoTrabalhistaId}>
                      <SelectTrigger className={cn("border-2 h-10", errors.categoriaTrabalhistaCodigo && "border-red-500")}>
                        <SelectValue placeholder={grupoTrabalhistaId ? "Selecione a categoria" : "Selecione o grupo primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasFiltradas.map((categoria) => (
                          <SelectItem key={categoria.codigo} value={categoria.codigo}>{categoria.codigo} - {categoria.descricao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoriaTrabalhistaCodigo && <p className="text-xs text-red-500 mt-1">{errors.categoriaTrabalhistaCodigo.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Existem outros grupos?</Label>
                <Controller
                  name="existeOutrosGrupos"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="Sim" id="outros-grupos-sim" />
                        <Label htmlFor="outros-grupos-sim" className="font-normal">Sim</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="Não" id="outros-grupos-nao" />
                        <Label htmlFor="outros-grupos-nao" className="font-normal">Não</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Outros grupos (se aplicável)</Label>
                <Controller
                  name="outrosGruposDescricao"
                  control={control}
                  rules={{
                    validate: (value) => (existeOutrosGrupos === "Sim" ? !!value.trim() || "Informe os grupos adicionais" : true),
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      disabled={existeOutrosGrupos !== "Sim"}
                      placeholder={existeOutrosGrupos === "Sim" ? "Descreva os grupos adicionais" : "Campo habilitado quando resposta for Sim"}
                      className={cn("border-2 h-10", errors.outrosGruposDescricao && "border-red-500")}
                    />
                  )}
                />
                {errors.outrosGruposDescricao && <p className="text-xs text-red-500 mt-1">{errors.outrosGruposDescricao.message}</p>}
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="flex items-center gap-1">Cargos que utilizarão a rubrica <span className="text-red-500">*</span></Label>
                <Controller
                  name="cargosAplicaveis"
                  control={control}
                  rules={{ required: "Selecione pelo menos um cargo" }}
                  render={({ field }) => (
                    <MultiSelect
                      options={cargosAplicaveis.map((cargo) => ({ label: cargo, value: cargo }))}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione os cargos..."
                      error={!!errors.cargosAplicaveis}
                    />
                  )}
                />
                {errors.cargosAplicaveis && <p className="text-xs text-red-500 mt-1">{errors.cargosAplicaveis.message}</p>}
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="flex items-center gap-1">Servidor responsável <span className="text-red-500">*</span></Label>
                <Controller
                  name="servidorResponsavel"
                  control={control}
                  rules={{ required: "Campo obrigatório" }}
                  render={({ field }) => (
                    <Input {...field} className={cn("border-2 h-10", errors.servidorResponsavel && "border-red-500")} />
                  )}
                />
                {errors.servidorResponsavel && <p className="text-xs text-red-500 mt-1">{errors.servidorResponsavel.message}</p>}
              </div>
            </CardContent>
          </Card>

                    <div className="grid grid-cols-1 gap-6">
            <Card className="border-none shadow-md overflow-hidden">
              <div className="h-1 bg-amber-500 w-full" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  Etapa 3 - Incidências e Regras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {naturezaSelecionada === "Remuneratória" && (
                  <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">Caráter <span className="text-red-500">*</span></Label>
                      <Controller
                        name="carater"
                        control={control}
                        rules={{ required: "Informe o caráter da verba" }}
                        render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Contínuo" id="carater-continuo" />
                              <Label htmlFor="carater-continuo" className="font-normal">Contínuo (incide previdência)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Temporário" id="carater-temporario" />
                              <Label htmlFor="carater-temporario" className="font-normal">Temporário (não incide)</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {errors.carater && <p className="text-xs text-red-500">{errors.carater.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">Reter teto remuneratório <span className="text-red-500">*</span></Label>
                      <Controller
                        name="reterTetoRemuneratorio"
                        control={control}
                        rules={{ required: "Informe a regra de teto" }}
                        render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Sim" id="teto-sim" />
                              <Label htmlFor="teto-sim" className="font-normal">Sim</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Não" id="teto-nao" />
                              <Label htmlFor="teto-nao" className="font-normal">Não</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {errors.reterTetoRemuneratorio && <p className="text-xs text-red-500">{errors.reterTetoRemuneratorio.message}</p>}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">Incidirá gratificação natalina? <span className="text-red-500">*</span></Label>
                    <Controller
                      name="incideNatalina"
                      control={control}
                      rules={{ required: "Selecione uma opção" }}
                      render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                          <div className="flex items-center space-x-2"><RadioGroupItem value="Sim" id="natalina-sim" /><Label htmlFor="natalina-sim" className="font-normal">Sim</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="Não" id="natalina-nao" /><Label htmlFor="natalina-nao" className="font-normal">Não</Label></div>
                        </RadioGroup>
                      )}
                    />
                    {errors.incideNatalina && <p className="text-xs text-red-500">{errors.incideNatalina.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">Incidirá 1/3 de férias? <span className="text-red-500">*</span></Label>
                    <Controller
                      name="incideFerias"
                      control={control}
                      rules={{ required: "Selecione uma opção" }}
                      render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                          <div className="flex items-center space-x-2"><RadioGroupItem value="Sim" id="ferias-sim" /><Label htmlFor="ferias-sim" className="font-normal">Sim</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="Não" id="ferias-nao" /><Label htmlFor="ferias-nao" className="font-normal">Não</Label></div>
                        </RadioGroup>
                      )}
                    />
                    {errors.incideFerias && <p className="text-xs text-red-500">{errors.incideFerias.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">Terá incidência tributária? <span className="text-red-500">*</span></Label>
                    <Controller
                      name="temIncidenciaTributaria"
                      control={control}
                      rules={{ required: "Selecione uma opção" }}
                      render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                          <div className="flex items-center space-x-2"><RadioGroupItem value="Sim" id="tributaria-sim" /><Label htmlFor="tributaria-sim" className="font-normal">Sim</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="Não" id="tributaria-nao" /><Label htmlFor="tributaria-nao" className="font-normal">Não</Label></div>
                        </RadioGroup>
                      )}
                    />
                    {errors.temIncidenciaTributaria && <p className="text-xs text-red-500">{errors.temIncidenciaTributaria.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
                    {/* Seção: Etapa 4 */}
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-1 bg-indigo-500 w-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">4</Badge>
                Etapa 4 - Amparo Legal e Formalização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {temIncidenciaTributaria === "Sim" && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Incidências tributárias principais</Label>
                  <Controller
                    name="incidenciasTributarias"
                    control={control}
                    rules={{ validate: (value) => (temIncidenciaTributaria === "Sim" ? value.length > 0 || "Selecione ao menos uma incidência principal" : true) }}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 gap-3">
                        {incidenciasTributariasPrincipais.map((item) => (
                          <label key={item.id} className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-2 bg-slate-50">
                            <Checkbox
                              checked={field.value.includes(item.id)}
                              onCheckedChange={(checked) => {
                                if (checked) field.onChange([...field.value, item.id]);
                                else field.onChange(field.value.filter((v: string) => v !== item.id));
                              }}
                            />
                            <span className="text-sm">{item.nome}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  {errors.incidenciasTributarias && <p className="text-xs text-red-500">{errors.incidenciasTributarias.message}</p>}

                  <Label className="text-sm font-semibold">Outras incidências (checkbox)</Label>
                  <Controller
                    name="outrasIncidencias"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 gap-3">
                        {outrasIncidencias.map((item) => (
                          <label key={item.id} className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-2 bg-slate-50">
                            <Checkbox
                              checked={field.value.includes(item.id)}
                              onCheckedChange={(checked) => {
                                if (checked) field.onChange([...field.value, item.id]);
                                else field.onChange(field.value.filter((v: string) => v !== item.id));
                              }}
                            />
                            <span className="text-sm">{item.nome}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-1">Base Legal (documentos) <span className="text-red-500">*</span></Label>
                <Controller
                  name="baseLegalIds"
                  control={control}
                  rules={{ required: "Selecione ao menos 1 base legal" }}
                  render={({ field }) => (
                    <MultiSelect
                      options={baseLegalDocumentos.map((doc) => ({ label: doc.titulo, value: doc.id }))}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione documentos legais"
                      error={!!errors.baseLegalIds}
                    />
                  )}
                />
                {errors.baseLegalIds && <p className="text-xs text-red-500">{errors.baseLegalIds.message}</p>}

                {baseLegalSelecionada.length > 0 ? (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-2">
                    {baseLegalDocumentos
                      .filter((doc) => baseLegalSelecionada.includes(doc.id))
                      .map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{doc.titulo}</span>
                          <Button type="button" variant="outline" size="sm" asChild>
                            <a href={doc.url} target="_blank" rel="noreferrer">Visualizar PDF</a>
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 flex items-center justify-between">
                    <span>Nenhum documento selecionado.</span>
                    <Button type="button" variant="link" className="p-0 h-auto" asChild>
                      <Link to="/configuracao">Cadastrar novo documento</Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">Justificativa da criação da rubrica <span className="text-red-500">*</span></Label>
                <Controller
                  name="justificativa"
                  control={control}
                  rules={{ required: "Informe a justificativa", minLength: { value: 10, message: "Descreva melhor a justificativa" } }}
                  render={({ field }) => (
                    <Textarea {...field} className={cn("border-2 min-h-24", errors.justificativa && "border-red-500")} placeholder="Explique a necessidade da criação da rubrica" />
                  )}
                />
                {errors.justificativa && <p className="text-xs text-red-500">{errors.justificativa.message}</p>}
              </div>
            </CardContent>
          </Card>
          {/* Seção: Termo de Compromisso */}
          <Card className="border-none shadow-md overflow-hidden bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                Termo de Responsabilidade e Compromisso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
                Declaro para os devidos fins que todas as informações prestadas neste formulário são verdadeiras e de minha inteira responsabilidade. Estou ciente de que a criação desta rubrica impactará na folha de pagamento e nos cálculos tributários da instituição, devendo estar estritamente de acordo com a base legal informada. Comprometo-me a fornecer documentação complementar caso solicitada em etapas posteriores do fluxo de rubrica.
              </div>

              <div className="flex items-start space-x-3 items-center p-2">
                <Controller
                  name="aceiteTermos"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Checkbox
                      id="aceite-termos"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-slate-500 data-[state=checked]:bg-blue-500"
                    />
                  )}
                />
                <Label htmlFor="aceite-termos" className="text-sm font-medium leading-none cursor-pointer text-slate-200">
                  Li e aceito os termos de responsabilidade <span className="text-red-400">*</span>
                </Label>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="submit"
                  disabled={!podeEnviar}
                  className={cn(
                    "flex-1 h-12 text-base font-bold transition-all",
                    podeEnviar ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/40" : "bg-slate-700 text-slate-400 cursor-not-allowed"
                  )}
                >
                  Enviar Solicitação
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  type="button"
                  onClick={handleRejeitar}
                  variant="outline"
                  className="px-6 h-12 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg">Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex gap-3 items-start">
                <div className="bg-blue-500 p-1.5 rounded-md mt-0.5">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Atenção</p>
                  <p className="text-xs text-blue-800 leading-normal">
                    Todos os campos marcados com um asterisco vermelho (<span className="text-red-600">*</span>) são de preenchimento obrigatório para avançar na esteira.
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Status da Etapa</Label>
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 p-2 rounded-md border border-emerald-100 w-fit">
                  <Clock className="w-4 h-4" />
                  Aguardando Preenchimento
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg">Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {historico.length === 0 ? (
                <div className="text-sm text-slate-500">
                  Ainda não há atividades registradas.
                </div>
              ) : (
                <div className="space-y-4">
                  {historico
                    .filter((h) => h.status !== "pendente")
                    .sort((a, b) => {
                      if (!a.data || !b.data) return 0;
                      return new Date(b.data).getTime() - new Date(a.data).getTime();
                    })
                    .map((hist, index) => {
                      const etapa = esteiraDefault.find((e) => e.id === hist.etapaId);
                      if (!etapa) return null;

                      return (
                        <div key={index} className="relative">
                          {index !== historico.length - 1 && (
                            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-200" />
                          )}
                          <div className="flex gap-3">
                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                              <AvatarFallback
                                className="text-xs"
                                style={{ backgroundColor: etapa.cor + "20" }}
                              >
                                {hist.usuario ? getInitials(hist.usuario.nome) : "SYS"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 pb-4">
                              <div className="flex items-start justify-between mb-1">
                                <p className="text-sm font-medium text-slate-900">
                                  {etapa.nome}
                                </p>
                                {getStatusIcon(hist.status, "w-4 h-4")}
                              </div>
                              {hist.usuario && (
                                <p className="text-xs text-slate-600 mb-1">
                                  {hist.usuario.nome}
                                </p>
                              )}
                              {hist.data && (
                                <p className="text-xs text-slate-500">
                                  {new Date(hist.data).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              )}
                              {hist.comentario && (
                                <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-700 border border-slate-200">
                                  <MessageSquare className="w-3 h-3 inline mr-1" />
                                  {hist.comentario}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Rejeitar etapa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="motivo-rejeicao">Motivo da rejeição</Label>
            <Textarea
              id="motivo-rejeicao"
              placeholder="Descreva o motivo da rejeição..."
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-slate-500">
              Esse motivo será informado ao solicitante.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmarRejeicao}
            >
              Confirmar rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}




