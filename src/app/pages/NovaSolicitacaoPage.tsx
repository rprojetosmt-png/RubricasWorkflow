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
  gruposTrabalhistas,
  cargosAplicaveis,
  tributosAplicaveis,
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
  orgaosSolicitantes: string[];
  setores: string[];
  servidorResponsavel: string;
  dataVigencia: Date | undefined;
  paoe: string;
  gruposTrabalhistas: string[];
  cargosAplicaveis: string[];
  baseLegal: string;
  incideNatalina: "Sim" | "Não";
  incideFerias: "Sim" | "Não";
  natureza: "Remuneratória" | "Indenizatória";
  carater: "Permanente" | "Temporário" | "Eventual";
  compõeTeto: "Sim" | "Não";
  tributos: string[];
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
      orgaosSolicitantes: [],
      setores: [],
      servidorResponsavel: "",
      dataVigencia: undefined,
      paoe: "",
      gruposTrabalhistas: [],
      cargosAplicaveis: [],
      baseLegal: "",
      incideNatalina: undefined,
      incideFerias: undefined,
      natureza: undefined,
      carater: undefined,
      compõeTeto: undefined,
      tributos: [],
      aceiteTermos: false,
    },
  });

  const selectedOrgaos = watch("orgaosSolicitantes");
  const selectedSetores = watch("setores");

  const setoresFiltrados = useMemo(() => {
    return todosSetores.filter((s) => selectedOrgaos.includes(s.orgaoId));
  }, [selectedOrgaos]);

  // Sync sectors: remove those that don't belong to selected organs
  useEffect(() => {
    const validSetores = selectedSetores.filter((sId) =>
      setoresFiltrados.some((sf) => sf.id === sId)
    );
    if (validSetores.length !== selectedSetores.length) {
      setValue("setores", validSetores);
    }
  }, [selectedOrgaos, setoresFiltrados, selectedSetores, setValue]);

  const titulo = watch("nomeRubrica");
  const tipo = "Nova Rubrica";

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
      comentario: comentario.trim() || "Formulário preenchido e enviado.",
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
      descricao: data.baseLegal || "Sem descrição",
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-slate-600">
                {codigoPreview}
              </span>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {tipo}
              </Badge>
            </div>
            <h2 className="text-slate-900 mb-2">
              {titulo || "Nova Solicitação"}
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-600">
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
      </div>

      {/* Pipeline Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Rubrica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200" />
            <div className="relative grid grid-cols-6 gap-2">
              {esteiraDefault.map((etapa, index) => {
                const status =
                  historico.find((h) => h.etapaId === etapa.id)?.status ??
                  (index === etapaIndex ? "em_analise" : "pendente");
                const isAtual = index === etapaIndex;
                const isCompleto = status === "aprovado";
                const isRejeitado = status === "rejeitado";
                const hist = historico.find((h) => h.etapaId === etapa.id);

                return (
                  <div key={etapa.id} className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full border-4 bg-white flex items-center justify-center relative z-10 transition-all",
                        isCompleto && "bg-green-50 border-green-500",
                        isRejeitado && "bg-red-50 border-red-500",
                        isAtual &&
                          !isCompleto &&
                          "bg-blue-50 border-blue-500 ring-4 ring-blue-100",
                        !isCompleto &&
                          !isRejeitado &&
                          !isAtual &&
                          "border-slate-300"
                      )}
                    >
                      {getStatusIcon(status)}
                    </div>
                    <div className="mt-3 text-center">
                      <p
                        className={cn(
                          "text-xs font-medium leading-tight",
                          isAtual && "text-blue-700",
                          isCompleto && "text-green-700",
                          isRejeitado && "text-red-700",
                          !isCompleto &&
                            !isRejeitado &&
                            !isAtual &&
                            "text-slate-600"
                        )}
                      >
                        {etapa.nome}
                      </p>
                      {hist?.data && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(hist.data).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Etapa Atual: {etapaAtual.nome}
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  {etapaAtual.descricao}
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <User className="w-4 h-4" />
                  <span>Responsáveis: {etapaAtual.gruposResponsaveis.map((g) => g.nome).join(", ")}</span>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white">
                {etapaAtualIndex} de {esteiraDefault.length}
              </Badge>
            </div>
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

