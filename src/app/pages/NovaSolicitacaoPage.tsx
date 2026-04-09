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
  Download,
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

  const preencherDadosTeste = () => {
    setValue("nomeRubrica", "Gratificação de Desempenho Institucional");
    setValue("classificacao", "Provento");
    setValue("orgaosSolicitantes", [orgaos[0].id]);
    setValue("setores", [todosSetores[0].id]);
    setValue("servidorResponsavel", "João da Silva");
    setValue("dataVigencia", new Date());
    setValue("paoe", listaPAOE[0]);
    setValue("gruposTrabalhistas", [gruposTrabalhistas[0]]);
    setValue("cargosAplicaveis", [cargosAplicaveis[7]]);
    setValue("baseLegal", "Lei Complementar nº 123/2024, Artigo 45.");
    setValue("incideNatalina", "Sim");
    setValue("incideFerias", "Sim");
    setValue("natureza", "Remuneratória");
    setValue("carater", "Permanente");
    setValue("compõeTeto", "Sim");
    setValue("tributos", [tributosAplicaveis[0].nome, tributosAplicaveis[1].nome]);
    setValue("aceiteTermos", true);
    toast.info("Dados de teste preenchidos!");
  };

  const handleAprovarEtapa = () => {
    const dataAgora = new Date().toISOString();

    let atualizado = upsertHistorico(historico, etapaAtual.id, {
      status: "aprovado",
      data: dataAgora,
      comentario: comentario.trim() || "Etapa aprovada.",
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
      toast.success("Etapa aprovada com sucesso!");
    } else {
      // Se for a última etapa, finaliza a solicitação
      onFormSubmit(watch());
    }
  };


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

  const preencherDebugEtapa1 = () => {
    const orgaoId = orgaos[0]?.id ?? "";
    const setorId = todosSetores.find((s) => s.orgaoId === orgaoId)?.id ?? "";
    const grupoId = gruposTrabalhistasEsocial[0]?.id ?? "";
    const categoriaId = (categoriasPorGrupo[grupoId] ?? [])[0]?.codigo ?? "";

    setValue("nomeRubrica", `DEBUG Rubrica ${Date.now()}`, { shouldValidate: true, shouldDirty: true });
    setValue("classificacao", classificacoes[0] ?? "Vantagem", { shouldValidate: true, shouldDirty: true });
    setValue("natureza", "Remuneratória", { shouldValidate: true, shouldDirty: true });
    setValue("naturezaEsocial", naturezaRubricaEsocial[0]?.codigo ?? "1000", { shouldValidate: true, shouldDirty: true });
    setValue("vigenciaInicio", new Date(), { shouldValidate: true, shouldDirty: true });
    setValue("vigenciaFim", undefined, { shouldValidate: true, shouldDirty: true });
    setValue("paoe", listaPAOE[0] ?? "", { shouldValidate: true, shouldDirty: true });

    setValue("orgaosSolicitantes", orgaoId ? [orgaoId] : [], { shouldValidate: true, shouldDirty: true });
    setValue("setorId", setorId, { shouldValidate: true, shouldDirty: true });
    setValue("grupoTrabalhistaId", grupoId, { shouldValidate: true, shouldDirty: true });
    setValue("categoriaTrabalhistaCodigo", categoriaId, { shouldValidate: true, shouldDirty: true });
    setValue("existeOutrosGrupos", "Não", { shouldValidate: true, shouldDirty: true });
    setValue("outrosGruposDescricao", "", { shouldValidate: true, shouldDirty: true });
    setValue("cargosAplicaveis", [cargosAplicaveis[0] ?? "Analista Administrativo"], { shouldValidate: true, shouldDirty: true });
    setValue("servidorResponsavel", usuarioAtual.nome, { shouldValidate: true, shouldDirty: true });

    setValue("carater", "Contínuo", { shouldValidate: true, shouldDirty: true });
    setValue("reterTetoRemuneratorio", "Não", { shouldValidate: true, shouldDirty: true });
    setValue("incideNatalina", "Sim", { shouldValidate: true, shouldDirty: true });
    setValue("incideFerias", "Sim", { shouldValidate: true, shouldDirty: true });
    setValue("temIncidenciaTributaria", "Sim", { shouldValidate: true, shouldDirty: true });
    setValue("incidenciasTributarias", [incidenciasTributariasPrincipais[0]?.id ?? "irrf"], { shouldValidate: true, shouldDirty: true });
    setValue("outrasIncidencias", [outrasIncidencias[0]?.id ?? "rpps"], { shouldValidate: true, shouldDirty: true });

    setValue("baseLegalIds", [baseLegalDocumentos[0]?.id ?? "doc-lei-compl-01"], { shouldValidate: true, shouldDirty: true });
    setValue("justificativa", "Preenchimento automático de debug para validar gravação e avanço da etapa de solicitação.", { shouldValidate: true, shouldDirty: true });
    setValue("aceiteTermos", true, { shouldValidate: true, shouldDirty: true });
  };

  const handleDebugPreencherESalvar = () => {
    preencherDebugEtapa1();
    setTimeout(() => {
      void handleSubmit(onFormSubmit)();
    }, 0);
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

      <div className="grid grid-cols-3 gap-6 pb-20">
        <div className="col-span-2 space-y-6">
          {etapaIndex === 0 ? (
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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
                      rules={{ required: "Campo obrigatório" }}
                      render={({ field }) => (
                        <Input {...field} placeholder="Ex: Adicional de Tempo de Serviço" className={cn("border-2 h-10", errors.nomeRubrica && "border-red-500")} />
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
                            {classificacoes.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.classificacao && <p className="text-xs text-red-500 mt-1">{errors.classificacao.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Órgãos Solicitantes <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="orgaosSolicitantes"
                      control={control}
                      rules={{ required: "Selecione pelo menos um órgão" }}
                      render={({ field }) => (
                        <MultiSelect
                          options={orgaos.map(o => ({ label: o.nome, value: o.id }))}
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
                    <Label className="flex items-center gap-1">
                      Setores <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="setores"
                      control={control}
                      rules={{ required: "Selecione pelo menos um setor" }}
                      render={({ field }) => (
                        <MultiSelect
                          options={setoresFiltrados.map(s => ({ label: s.nome, value: s.id }))}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder={selectedOrgaos.length > 0 ? "Selecione os setores..." : "Selecione órgãos primeiro"}
                          error={!!errors.setores}
                        />
                      )}
                    />
                    {errors.setores && <p className="text-xs text-red-500 mt-1">{errors.setores.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Servidor Responsável <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="servidorResponsavel"
                      control={control}
                      rules={{ required: "Campo obrigatório" }}
                      render={({ field }) => (
                        <Input {...field} placeholder="Digite o nome completo" className={cn("border-2 h-10", errors.servidorResponsavel && "border-red-500")} />
                      )}
                    />
                    {errors.servidorResponsavel && <p className="text-xs text-red-500 mt-1">{errors.servidorResponsavel.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Data de Vigência <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="dataVigencia"
                      control={control}
                      rules={{ required: "Campo obrigatório" }}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal border-2 h-10",
                                !field.value && "text-muted-foreground",
                                errors.dataVigencia && "border-red-500"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    {errors.dataVigencia && <p className="text-xs text-red-500 mt-1">{errors.dataVigencia.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      PAOE <span className="text-red-500">*</span>
                    </Label>
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
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.paoe && <p className="text-xs text-red-500 mt-1">{errors.paoe.message}</p>}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="flex items-center gap-1">
                      Grupos/Categorias Trabalhistas <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="gruposTrabalhistas"
                      control={control}
                      rules={{ required: "Selecione pelo menos um grupo" }}
                      render={({ field }) => (
                        <MultiSelect
                          options={gruposTrabalhistas.map(g => ({ label: g, value: g }))}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Selecione as categorias..."
                          error={!!errors.gruposTrabalhistas}
                        />
                      )}
                    />
                    {errors.gruposTrabalhistas && <p className="text-xs text-red-500 mt-1">{errors.gruposTrabalhistas.message}</p>}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="flex items-center gap-1">
                      Cargos Aplicáveis <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="cargosAplicaveis"
                      control={control}
                      rules={{ required: "Selecione pelo menos um cargo" }}
                      render={({ field }) => (
                        <MultiSelect
                          options={cargosAplicaveis.map(c => ({ label: c, value: c }))}
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
                    <Label className="flex items-center gap-1">
                      Base Legal <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="baseLegal"
                      control={control}
                      rules={{ required: "Campo obrigatório" }}
                      render={({ field }) => (
                        <Textarea {...field} placeholder="Justificativa legal para a solicitação" className={cn("border-2 min-h-24", errors.baseLegal && "border-red-500")} />
                      )}
                    />
                    {errors.baseLegal && <p className="text-xs text-red-500 mt-1">{errors.baseLegal.message}</p>}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                {/* Seção: Incidências */}
                <Card className="border-none shadow-md overflow-hidden">
                  <div className="h-1 bg-amber-500 w-full" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <CheckCircle2 className="w-5 h-5 text-amber-500" />
                      Incidências
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Incide em Gratificação Natalina? <span className="text-red-500">*</span></Label>
                      <Controller
                        name="incideNatalina"
                        control={control}
                        rules={{ required: "Selecione uma opção" }}
                        render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Sim" id="natalina-sim" />
                              <Label htmlFor="natalina-sim" className="font-normal">Sim</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Não" id="natalina-nao" />
                              <Label htmlFor="natalina-nao" className="font-normal">Não</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {errors.incideNatalina && <p className="text-xs text-red-500">{errors.incideNatalina.message}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Incide em 1/3 de Férias? <span className="text-red-500">*</span></Label>
                      <Controller
                        name="incideFerias"
                        control={control}
                        rules={{ required: "Selecione uma opção" }}
                        render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Sim" id="ferias-sim" />
                              <Label htmlFor="ferias-sim" className="font-normal">Sim</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Não" id="ferias-nao" />
                              <Label htmlFor="ferias-nao" className="font-normal">Não</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {errors.incideFerias && <p className="text-xs text-red-500">{errors.incideFerias.message}</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Seção: Natureza da Verba */}
                <Card className="border-none shadow-md overflow-hidden">
                  <div className="h-1 bg-emerald-500 w-full" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Info className="w-5 h-5 text-emerald-500" />
                      Natureza da Verba
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-3">
                      <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Natureza <span className="text-red-500">*</span></Label>
                      <Controller
                        name="natureza"
                        control={control}
                        rules={{ required: "Selecione a natureza" }}
                        render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Remuneratória" id="natureza-rem" />
                              <Label htmlFor="natureza-rem" className="font-normal">Remuneratória</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Indenizatória" id="natureza-ind" />
                              <Label htmlFor="natureza-ind" className="font-normal">Indenizatória</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {errors.natureza && <p className="text-xs text-red-500">{errors.natureza.message}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Caráter <span className="text-red-500">*</span></Label>
                      <Controller
                        name="carater"
                        control={control}
                        rules={{ required: "Selecione o caráter" }}
                        render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Permanente" id="carater-perm" />
                              <Label htmlFor="carater-perm" className="font-normal">Permanente</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Temporário" id="carater-temp" />
                              <Label htmlFor="carater-temp" className="font-normal">Temporário</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Eventual" id="carater-eve" />
                              <Label htmlFor="carater-eve" className="font-normal">Eventual</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {errors.carater && <p className="text-xs text-red-500">{errors.carater.message}</p>}
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Compõe Teto? <span className="text-red-500">*</span></Label>
                      <Controller
                        name="compõeTeto"
                        control={control}
                        rules={{ required: "Selecione uma opção" }}
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
                      {errors.compõeTeto && <p className="text-xs text-red-500">{errors.compõeTeto.message}</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Seção: Incidência Tributária */}
              <Card className="border-none shadow-md overflow-hidden">
                <div className="h-1 bg-red-500 w-full" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">$</Badge>
                    Incidência Tributária
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Tributos Aplicáveis (pelo menos 1 obrigatório) <span className="text-red-500">*</span></Label>
                    <Controller
                      name="tributos"
                      control={control}
                      rules={{ required: "Selecione pelo menos um tributo" }}
                      render={({ field }) => (
                        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          {tributosAplicaveis.map((t) => (
                            <div key={t.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                              <Checkbox
                                id={`tributo-${t.id}`}
                                checked={field.value.includes(t.nome)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, t.nome]);
                                  } else {
                                    field.onChange(field.value.filter((v: string) => v !== t.nome));
                                  }
                                }}
                              />
                              <Label htmlFor={`tributo-${t.id}`} className="font-medium cursor-pointer flex-1">{t.nome}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                    {errors.tributos && <p className="text-xs text-red-500">{errors.tributos.message}</p>}
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
                      disabled={!watch("aceiteTermos")}
                      className={cn(
                        "flex-1 h-12 text-base font-bold transition-all",
                        watch("aceiteTermos") ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/40" : "bg-slate-700 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      Enviar Solicitação
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Link to="/" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        Cancelar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Visualização de Análise (Etapas > 0) */}
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 leading-relaxed italic">
                    {watch("baseLegal") || "Solicitação de criação de rubrica conforme legislação vigente informada na etapa inicial de registro."}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Documentos Anexados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Legislacao_Vinculada.pdf",
                    "Memoria_Calculo.xlsx",
                    "Parecer_Tecnico_Preliminar.pdf"
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{doc}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-600">Comentário (opcional)</Label>
                    <Textarea
                      placeholder="Adicione observações sobre esta etapa..."
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      rows={4}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                    />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <Button
                      onClick={handleAprovarEtapa}
                      className="flex-1 h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 font-bold"
                    >
                      <CheckCircle2 className="mr-2 w-5 h-5" />
                      Aprovar Etapa
                    </Button>
                    <Button
                      onClick={handleRejeitar}
                      variant="outline"
                      className="flex-1 h-12 border-red-500 text-red-500 hover:bg-red-50 font-bold"
                    >
                      <XCircle className="mr-2 w-5 h-5" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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

              {etapaIndex === 0 && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={preencherDadosTeste}
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Preencher dados de teste
                  </Button>
                </div>
              )}
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
      </div>

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




