import { useEffect, useState, useMemo, useSyncExternalStore, useRef } from "react";
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
  Building2,
  Tag,
  Users,
  Briefcase,
  Scale,
  Star,
  Landmark,
  CircleDollarSign,
  Paperclip,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert } from "../components/ui/alert";
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
  type HistoricoEtapa,
  type Solicitacao,
  type Usuario,
  historicalDataMock,
} from "../data/mockData";
import { addSolicitacaoCompleta, getNextCodigo } from "../data/solicitacoesStore";
import { getEsteiraConfig, subscribeEsteiraConfig } from "../data/esteiraStore";
import { getSessionContext, subscribeSessionContext } from "../data/sessionStore";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { HistoricalDataCard } from "../components/HistoricalDataCard";
import { RubricaEditorContainer } from "../components/rubricas/RubricaEditorContainer";
import { AnaliseTecnicaFTER } from "../components/AnaliseTecnicaFTER";
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
  listaIncidenciasTributarias,
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
  codigoRubrica: string;
  nomeRubrica: string;
  classificacao: string;
  natureza?: "Remuneratória" | "Indenizatória";
  naturezaEsocial: string;
  vigenciaInicio?: Date;
  vigenciaFim?: Date;
  paoe: string;
  orgaosSolicitantes: string[];
  setorIds: string[];
  grupoTrabalhistaIds: string[];
  categoriaTrabalhistaCodigos: string[];
  cargosAplicaveis: string[];
  servidorResponsavel: string;
  carater?: "Contínuo" | "Temporário";
  reterTetoRemuneratorio?: "Sim" | "Não";
  temIncidenciaTributaria?: "Sim" | "Não";
  incidenciasTributarias: string[];
  baseLegalIds: string[];
  justificativaLegal: string;
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
      codigoRubrica: "",
      nomeRubrica: "",
      classificacao: "",
      natureza: undefined,
      naturezaEsocial: "",
      vigenciaInicio: undefined,
      vigenciaFim: undefined,
      paoe: "",
      orgaosSolicitantes: [],
      setorIds: [],
      grupoTrabalhistaIds: [],
      categoriaTrabalhistaCodigos: [],
      cargosAplicaveis: [],
      servidorResponsavel: usuarioAtual.nome,
      carater: undefined,
      reterTetoRemuneratorio: undefined,
      temIncidenciaTributaria: undefined,
      incidenciasTributarias: [],
      baseLegalIds: [],
      justificativaLegal: "",
      justificativa: "",
      aceiteTermos: false,
    },
  });

  const selectedOrgaos = watch("orgaosSolicitantes");
  const selectedSetorIds = watch("setorIds");
  const naturezaSelecionada = watch("natureza");
  const vigenciaInicio = watch("vigenciaInicio");
  const categoriaTrabalhistaCodigos = watch("categoriaTrabalhistaCodigos") || [];
  const grupoTrabalhistaIds = watch("grupoTrabalhistaIds") || [];
  const selectedGrupoIds = watch("grupoTrabalhistaIds") || [];
  const temIncidenciaTributaria = watch("temIncidenciaTributaria");
  const baseLegalSelecionada = watch("baseLegalIds");

  const setoresFiltrados = useMemo(() => {
    return todosSetores.filter((s) => (selectedOrgaos || []).includes(s.orgaoId));
  }, [selectedOrgaos]);

  const categoriasFiltradas = useMemo(() => {
    if (grupoTrabalhistaIds.length === 0) return [];
    const allCats = grupoTrabalhistaIds.flatMap((id) => categoriasPorGrupo[id] ?? []);
    // Remover duplicatas por código
    const seen = new Set();
    return allCats.filter((cat) => {
      if (seen.has(cat.codigo)) return false;
      seen.add(cat.codigo);
      return true;
    });
  }, [grupoTrabalhistaIds]);

  const temRetroatividade = useMemo(() => {
    if (!vigenciaInicio) return false;
    const hoje = new Date();
    const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return vigenciaInicio < inicioMesAtual;
  }, [vigenciaInicio]);

  useEffect(() => {
    const validSetorIds = selectedSetorIds || [];
    const invalidSetores = validSetorIds.filter(id => !setoresFiltrados.some(s => s.id === id));
    if (invalidSetores.length > 0) {
      setValue("setorIds", validSetorIds.filter(id => !invalidSetores.includes(id)));
    }
  }, [selectedSetorIds, setoresFiltrados, setValue]);

  useEffect(() => {
    setValue("servidorResponsavel", usuarioAtual.nome);
  }, [setValue]);



  useEffect(() => {
    if (grupoTrabalhistaIds.length === 0) {
      if (watch("categoriaTrabalhistaCodigos")?.length > 0) {
        setValue("categoriaTrabalhistaCodigos", []);
      }
      return;
    }

    const currentCodigos = watch("categoriaTrabalhistaCodigos") || [];
    const codigosValidos = currentCodigos.filter((codigo) =>
      categoriasFiltradas.some((cat) => cat.codigo === codigo)
    );

    if (codigosValidos.length !== currentCodigos.length) {
      setValue("categoriaTrabalhistaCodigos", codigosValidos);
    }
  }, [grupoTrabalhistaIds, categoriasFiltradas, setValue, watch]);

  useEffect(() => {
    if (naturezaSelecionada !== "Remuneratória") {
      setValue("carater", undefined);
      setValue("reterTetoRemuneratorio", undefined);
    }
  }, [naturezaSelecionada, setValue]);

  useEffect(() => {
    if (temIncidenciaTributaria !== "Sim") {
      setValue("incidenciasTributarias", []);
    }
  }, [temIncidenciaTributaria, setValue]);

  const titulo = watch("nomeRubrica");
  const tipo = "Nova Rubrica";
  const gruposTrabalhistas = gruposTrabalhistasEsocial;
  const tributosAplicaveis = listaIncidenciasTributarias;


  const podeEnviar =
    !!watch("codigoRubrica") &&
    !!watch("nomeRubrica") &&
    !!watch("classificacao") &&
    !!watch("natureza") &&
    !!watch("naturezaEsocial") &&
    !!watch("vigenciaInicio") &&
    !!watch("paoe") &&
    (selectedOrgaos || []).length > 0 &&
    (watch("setorIds") || []).length > 0 &&
    (watch("grupoTrabalhistaIds") || []).length > 0 &&
    (watch("categoriaTrabalhistaCodigos") || []).length > 0 &&
    (watch("cargosAplicaveis") || []).length > 0 &&
    !!watch("servidorResponsavel") &&
    !!watch("temIncidenciaTributaria") &&
    (watch("baseLegalIds") || []).length > 0 &&
    !!watch("aceiteTermos") &&
    (naturezaSelecionada !== "Remuneratória" || (!!watch("carater") && !!watch("reterTetoRemuneratorio"))) &&
    (temIncidenciaTributaria !== "Sim" || (watch("incidenciasTributarias") || []).length > 0);

  const etapas = useSyncExternalStore(subscribeEsteiraConfig, getEsteiraConfig, getEsteiraConfig);
  const session = useSyncExternalStore(subscribeSessionContext, getSessionContext, getSessionContext);
  const [etapaIndex, setEtapaIndex] = useState(0);

  const preencherDadosTeste = () => {
    const orgaoId = orgaos[0]?.id ?? "";
    const setorId = todosSetores.find((s) => s.orgaoId === orgaoId)?.id ?? "";
    const grupoIds = [gruposTrabalhistasEsocial[0]?.id ?? ""];
    const categoriaIds = [(categoriasPorGrupo[grupoIds[0]] ?? [])[0]?.codigo ?? ""];

    setValue("codigoRubrica", `R-${Math.floor(Math.random() * 9000) + 1000}`, { shouldValidate: true });
    setValue("nomeRubrica", `Nova Rubrica ${Date.now()}`, { shouldValidate: true });
    setValue("classificacao", classificacoes[0], { shouldValidate: true });
    setValue("natureza", "Remuneratória", { shouldValidate: true });
    setValue("naturezaEsocial", naturezaRubricaEsocial[0]?.codigo, { shouldValidate: true });
    setValue("vigenciaInicio", new Date(), { shouldValidate: true });
    setValue("paoe", listaPAOE[0], { shouldValidate: true });
    setValue("orgaosSolicitantes", [orgaoId], { shouldValidate: true });
    setValue("setorIds", [setorId], { shouldValidate: true });
    setValue("grupoTrabalhistaIds", grupoIds, { shouldValidate: true });
    setValue("categoriaTrabalhistaCodigos", categoriaIds, { shouldValidate: true });
    setValue("cargosAplicaveis", [cargosAplicaveis[0]], { shouldValidate: true });
    setValue("carater", "Contínuo", { shouldValidate: true });
    setValue("reterTetoRemuneratorio", "Sim", { shouldValidate: true });
    setValue("temIncidenciaTributaria", "Sim", { shouldValidate: true });
    setValue("incidenciasTributarias", [listaIncidenciasTributarias[0]?.id], { shouldValidate: true });
    setValue("baseLegalIds", [baseLegalDocumentos[0]?.id ?? ""], { shouldValidate: true });
    setValue("justificativaLegal", "LEI 12.345/2024", { shouldValidate: true });
    setValue("justificativa", "Solicitação de teste.", { shouldValidate: true });
    setValue("aceiteTermos", true, { shouldValidate: true });

    toast.info("Dados de teste preenchidos!");
  };

  const handleAprovarEtapa = () => {
    if (!usuarioPermitido) {
      toast.error("Você não tem permissão para executar esta ação nesta etapa.");
      return;
    }

    const dataAgora = new Date().toISOString();

    const atuais = Array.from(
      new Set(assinaturasEtapa[etapaAtual.id] ?? [])
    );

    if (!atuais.includes(session.activeUserId)) {
      atuais.push(session.activeUserId);
    }

    setAssinaturasEtapa((prev) => ({
      ...prev,
      [etapaAtual.id]: atuais,
    }));

    const faltantes = requiredSignerIds.filter((id) => !atuais.includes(id));
    const liberarAvanco = requiredSignerIds.length === 0 || faltantes.length === 0;

    let atualizado = upsertHistorico(historico, etapaAtual.id, {
      status: liberarAvanco ? "aprovado" : "em_analise",
      data: dataAgora,
      comentario:
        liberarAvanco || requiredSignerIds.length === 0
          ? comentario.trim() || "Etapa aprovada."
          : `Assinatura registrada (${atuais.length}/${requiredSignerIds.length})`,
      usuario: usuarioAtual,
    });

    if (liberarAvanco) {
      const proximaEtapa = etapas[etapaIndex + 1];
      if (proximaEtapa) {
        atualizado = upsertHistorico(atualizado, proximaEtapa.id, {
          status: "em_analise",
          data: dataAgora,
          usuario: usuarioAtual,
        });
      }
      setEtapaIndex((prevIndex) => prevIndex + 1);
      setComentario("");
      toast.success("Etapa aprovada com sucesso!");
    } else {
      setComentario("");
      toast.info("Assinatura registrada.", {
        description: `Faltam ${faltantes.length} assinatura(s) obrigatória(s).`,
      });
    }

    setHistorico(atualizado);


  };


  const [comentario, setComentario] = useState("");
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isRejectRubricaDialogOpen, setIsRejectRubricaDialogOpen] = useState(false);
  const [motivoRejeicaoRubrica, setMotivoRejeicaoRubrica] = useState("");
  const [historico, setHistorico] = useState<HistoricoEtapa[]>([]);
  const [assinaturasEtapa, setAssinaturasEtapa] = useState<Record<string, string[]>>({});
  const [codigoPreview, setCodigoPreview] = useState("RUB-YYYY-000");
  const [arquivosAnexados, setArquivosAnexados] = useState<File[]>([]);
  const [fterDadosSalvos, setFterDadosSalvos] = useState<any>(null);
  const [isAjustesModalOpen, setIsAjustesModalOpen] = useState(false);
  const [etapaDestinoId, setEtapaDestinoId] = useState("");
  const [motivoAjuste, setMotivoAjuste] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);


  const etapaAtual = etapas[etapaIndex];
  const etapaAtualIndex = etapaIndex + 1;
  const grupoPermitido = etapaAtual?.gruposResponsaveis.some(
    (grupo) => grupo.id === session.activeGroupId
  );

  const membrosEtapa = etapaAtual?.gruposResponsaveis
    .flatMap((grupo) => grupo.usuarios)
    .filter((usuario, index, arr) => arr.findIndex((u) => u.id === usuario.id) === index) ?? [];

  const requiredSignerIds = (etapaAtual?.requiredSignerIds ?? []).filter((id) =>
    membrosEtapa.some((usuario) => usuario.id === id)
  );

  const assinaturasAtuais = Array.from(
    new Set(assinaturasEtapa[etapaAtual?.id ?? ""] ?? [])
  );
  const assinaturasColetadas = assinaturasAtuais.length;
  const assinaturasObrigatorias = requiredSignerIds.length;
  const assinaturasFaltantes = requiredSignerIds.filter((id) => !assinaturasAtuais.includes(id));
  const assinouUsuarios = membrosEtapa.filter((usuario) => assinaturasAtuais.includes(usuario.id));
  const obrigatoriosNomes = membrosEtapa
    .filter((usuario) => requiredSignerIds.includes(usuario.id))
    .map((usuario) => usuario.nome);
  const assinouNomes = assinouUsuarios.map((usuario) => usuario.nome);

  const usuarioPermitido = Boolean(
    grupoPermitido &&
      (requiredSignerIds.length === 0 || requiredSignerIds.includes(session.activeUserId))
  );

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

    const proximaEtapa = etapas[etapaIndex + 1];

    if (etapaIndex === 0 && proximaEtapa) {
      atualizado = upsertHistorico(atualizado, proximaEtapa.id, {
        status: "em_analise",
        data: dataAgora,
        usuario: usuarioAtual,
      });

      const novaSolicitacao: Solicitacao = {
        id: `sol-${Date.now()}`,
        codigo: data.codigoRubrica,
        titulo: data.nomeRubrica || "Nova Solicitação",
        tipo: "Nova Rubrica",
        solicitante: usuarioAtual,
        dataSolicitacao: new Date().toISOString().slice(0, 10),
        statusGeral: "em_andamento",
        etapaAtual: proximaEtapa.id,
        descricao: data.justificativa || "Solicitação sem justificativa detalhada.",
        historico: atualizado,
      };

      try {
        await addSolicitacaoCompleta(novaSolicitacao);
        toast.success("Solicitação enviada", {
          description: "Solicitação enviada para Análise Documental.",
        });
        setHistorico(atualizado);
        setEtapaIndex(1);
      } catch (err) {
        console.error(err);
        toast.error("Não foi possível salvar a solicitação");
      }

      return;
    }

    const novaSolicitacao: Solicitacao = {
      id: `sol-${Date.now()}`,
      codigo: data.codigoRubrica,
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
    if (!usuarioPermitido) {
      toast.error("Você não tem permissão para executar esta ação nesta etapa.");
      return;
    }
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
      const etapaAnterior = etapas[etapaIndex - 1];
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
    toast.error("Etapa reprovada", {
      description: `Motivo: ${motivoRejeicao.trim()}`,
    });
  };

  const handleRejeitarRubrica = () => {
    if (!usuarioPermitido) {
      toast.error("Você não tem permissão para executar esta ação nesta etapa.");
      return;
    }
    setIsRejectRubricaDialogOpen(true);
  };

  const handleConfirmarRejeicaoRubrica = async () => {
    if (!motivoRejeicaoRubrica.trim()) {
      toast.error("Informe o motivo da rejeição da rubrica");
      return;
    }

    const dataAgora = new Date().toISOString();
    const atualizado = upsertHistorico(historico, etapaAtual.id, {
      status: "rejeitado",
      data: dataAgora,
      comentario: motivoRejeicaoRubrica.trim(),
      usuario: usuarioAtual,
    });

    const novaSolicitacao = {
      id: `sol-${Date.now()}`,
      codigo: watch("codigoRubrica") || codigoPreview,
      titulo: watch("nomeRubrica") || "Nova Solicitação",
      tipo: "Nova Rubrica",
      solicitante: usuarioAtual,
      dataSolicitacao: new Date().toISOString().slice(0, 10),
      statusGeral: "rejeitado" as const,
      etapaAtual: etapaAtual.id,
      descricao: watch("justificativaLegal") || "Solicitação rejeitada.",
      historico: atualizado,
    };

    try {
      await addSolicitacaoCompleta(novaSolicitacao);
      toast.error("Rubrica rejeitada", {
        description: `A solicitação foi encerrada. Motivo: ${motivoRejeicaoRubrica.trim()}`,
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível registrar a rejeição");
    }
  };

  const handleConfirmarAjuste = (destinoId: string, motivo: string) => {
    const dataAgora = new Date().toISOString();
    const destinoEtapa = etapas.find(e => e.id === destinoId);
    const destinoIndex = etapas.findIndex(e => e.id === destinoId);

    if (!destinoEtapa || destinoIndex === -1) return;

    // 1. Registrar a ação de ajuste no histórico da etapa atual
    let atualizado = upsertHistorico(historico, etapaAtual.id, {
      status: "rejeitado",
      data: dataAgora,
      comentario: `SOLICITAÇÃO DE AJUSTE PARA ${destinoEtapa.nome.toUpperCase()}: ${motivo}`,
      usuario: usuarioAtual,
    });

    // 2. Reset de Workflow: Limpar aprovações das etapas entre destino e atual
    const novasAssinaturas = { ...assinaturasEtapa };
    
    etapas.forEach((etapa, idx) => {
      if (idx >= destinoIndex && idx < etapaIndex) {
        // Resetar histórico da etapa intermediária para pendente
        atualizado = upsertHistorico(atualizado, etapa.id, {
          status: "pendente",
          data: undefined,
          usuario: undefined,
          comentario: undefined
        });
        
        // Limpar assinaturas coletadas
        delete novasAssinaturas[etapa.id];
      }
    });

    // 3. Colocar a etapa de destino em análise com o motivo
    atualizado = upsertHistorico(atualizado, destinoId, {
      status: "em_analise",
      data: dataAgora,
      usuario: undefined,
      comentario: `AJUSTE PENDENTE: ${motivo}`
    });

    setAssinaturasEtapa(novasAssinaturas);
    setHistorico(atualizado);
    setEtapaIndex(destinoIndex);
    setIsAjustesModalOpen(false);
    setEtapaDestinoId("");
    setMotivoAjuste("");
    setComentario("");

    toast.info(`Solicitação devolvida para: ${destinoEtapa.nome}`, {
      description: "As etapas posteriores foram resetadas para nova análise.",
    });
  };

  const preencherDebugEtapa1 = () => {
    const orgaoId = orgaos[0]?.id ?? "";
    const setorId = todosSetores.find((s) => s.orgaoId === orgaoId)?.id ?? "";
    const grupoIds = [gruposTrabalhistasEsocial[0]?.id ?? ""];
    const categoriaIds = [(categoriasPorGrupo[grupoIds[0]] ?? [])[0]?.codigo ?? ""];

    setValue("codigoRubrica", `RUB-DEBUG-${Math.floor(Math.random() * 900) + 100}`, { shouldValidate: true, shouldDirty: true });
    setValue("nomeRubrica", `DEBUG Rubrica ${Date.now()}`, { shouldValidate: true, shouldDirty: true });
    setValue("classificacao", classificacoes[0] ?? "Vantagem", { shouldValidate: true, shouldDirty: true });
    setValue("natureza", "Remuneratória", { shouldValidate: true, shouldDirty: true });
    setValue("naturezaEsocial", naturezaRubricaEsocial[0]?.codigo ?? "1000", { shouldValidate: true, shouldDirty: true });
    setValue("vigenciaInicio", new Date(), { shouldValidate: true, shouldDirty: true });
    setValue("vigenciaFim", undefined, { shouldValidate: true, shouldDirty: true });
    setValue("paoe", listaPAOE[0] ?? "", { shouldValidate: true, shouldDirty: true });

    setValue("orgaosSolicitantes", orgaoId ? [orgaoId] : [], { shouldValidate: true, shouldDirty: true });
    setValue("setorIds", setorId ? [setorId] : [], { shouldValidate: true, shouldDirty: true });
    setValue("grupoTrabalhistaIds", grupoIds, { shouldValidate: true, shouldDirty: true });
    setValue("categoriaTrabalhistaCodigos", categoriaIds, { shouldValidate: true, shouldDirty: true });
    setValue("cargosAplicaveis", [cargosAplicaveis[0] ?? "Analista Administrativo"], { shouldValidate: true, shouldDirty: true });
    setValue("servidorResponsavel", usuarioAtual.nome, { shouldValidate: true, shouldDirty: true });

    setValue("carater", "Contínuo", { shouldValidate: true, shouldDirty: true });
    setValue("reterTetoRemuneratorio", "Não", { shouldValidate: true, shouldDirty: true });
    setValue("temIncidenciaTributaria", "Sim", { shouldValidate: true, shouldDirty: true });
    setValue("incidenciasTributarias", [listaIncidenciasTributarias[0]?.id ?? "irpf"], { shouldValidate: true, shouldDirty: true });

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

  const buildHistoricalDataConfig = (customTitle?: string) => {
    const orgsStr = (watch("orgaosSolicitantes") || []).map((id: string) => orgaos.find(o => o.id === id)?.nome).filter(Boolean).join(", ") || "Não informado";
    const setoresStr = (watch("setorIds") || []).map((id: string) => todosSetores.find(s => s.id === id)?.nome).filter(Boolean).join(", ") || "Não informado";
    const inicioStr = watch("vigenciaInicio") ? new Date(watch("vigenciaInicio")).toLocaleDateString("pt-BR") : "Não informado";
    const fimStr = watch("vigenciaFim") ? new Date(watch("vigenciaFim")).toLocaleDateString("pt-BR") : "Não informado";
    const gruposStr = (watch("grupoTrabalhistaIds") || []).map((id: string) => gruposTrabalhistasEsocial.find(g => g.id === id)?.nome).filter(Boolean).join(", ") || "Não informado";
    const catsStr = (watch("categoriaTrabalhistaCodigos") || []).map((codigo: string) => categoriasFiltradas.find(c => c.codigo === codigo)?.descricao).filter(Boolean).join(", ") || "Não informado";
    const baseLegalStr = (watch("baseLegalIds") || []).map((id: string) => baseLegalDocumentos.find(b => b.id === id)?.titulo).filter(Boolean).join(", ") || "Não informado";
    const tipo = watch("classificacao") || "Vantagem";
    const esocialStr = naturezaRubricaEsocial.find(n => n.codigo === watch("naturezaEsocial"))?.descricao || "Não informado";
    const justificativaVal = watch("justificativaLegal")?.trim() || "Não informado";

    return {
      id: watch("codigoRubrica") || "0000",
      title: customTitle || watch("nomeRubrica") || "Nova Rubrica",
      subtitle: orgsStr,
      status: tipo,
      readOnly: true,
      sections: [
        {
          title: "INFORMAÇÕES GERAIS",
          fields: [
            { label: "Órgão", value: orgsStr, icon: <Building2 strokeWidth={1.5} /> },
            { label: "Setores", value: setoresStr, icon: <Building2 strokeWidth={1.5} /> },
            { label: "Servidor Responsável", value: watch("servidorResponsavel") || "Não informado", icon: <User strokeWidth={1.5} /> },
            { label: "Tipo", value: tipo, icon: <Tag strokeWidth={1.5} />, type: "badge-info" as const },
            { label: "Data de Início", value: inicioStr, icon: <Calendar strokeWidth={1.5} /> },
            { label: "Data Fim", value: fimStr, icon: <Calendar strokeWidth={1.5} />, type: !watch("vigenciaFim") ? ("disabled" as const) : undefined },
            { label: "PAOE", value: watch("paoe") || "Não informado", icon: <FileText strokeWidth={1.5} /> },
          ]
        },
        {
          title: "GRUPOS E CARGOS",
          fields: [
            { label: "Grupo Trabalhista", value: gruposStr, icon: <Users strokeWidth={1.5} /> },
            { label: "Categoria Trabalhista", value: catsStr, icon: <Users strokeWidth={1.5} /> },
            { label: "Cargos Vinculados", value: watch("cargosAplicaveis") || [], icon: <Briefcase strokeWidth={1.5} /> },
            { label: "Base Legal", value: baseLegalStr, icon: <Scale strokeWidth={1.5} /> },
          ]
        },
        {
          title: "NATUREZA DA VERBA",
          fields: [
            { label: "Natureza", value: watch("natureza") || "Não informado", icon: <Landmark strokeWidth={1.5} /> },
            { label: "Tabela 03 (eSocial)", value: esocialStr, icon: <FileText strokeWidth={1.5} /> },
            { label: "Caráter", value: watch("carater") || "Não informado", icon: <CheckCircle2 strokeWidth={1.5} /> },
            { label: "Reter Teto", value: watch("reterTetoRemuneratorio") || "Não informado", icon: <CheckCircle2 strokeWidth={1.5} />, type: watch("reterTetoRemuneratorio") === "Sim" ? ("badge-warning" as const) : undefined },
          ]
        },
        {
          title: "INCIDÊNCIA TRIBUTÁRIA",
          fields: [
            { label: "Tem Incidência", value: watch("temIncidenciaTributaria") || "Não", icon: <CircleDollarSign strokeWidth={1.5} />, type: watch("temIncidenciaTributaria") === "Sim" ? ("badge-warning" as const) : undefined },
            { label: "Tributos", value: (watch("incidenciasTributarias") || []).map((id: string) => tributosAplicaveis.find(t => t.id === id)?.nome).filter(Boolean), icon: <CircleDollarSign strokeWidth={1.5} />, type: (watch("incidenciasTributarias") || []).length > 0 ? ("badge-warning" as const) : undefined },
          ]
        },
        {
          title: "JUSTIFICATIVA LEGAL",
          fields: [
            { label: "Justificativa", value: justificativaVal, icon: <FileText strokeWidth={1.5} /> },
          ]
        }
      ],
      attachments: (watch("baseLegalIds") || []).map((id: string) => {
        const doc = baseLegalDocumentos.find(b => b.id === id);
        return { name: `${doc?.titulo || 'Documento'}.pdf`, size: "245 KB" };
      })
    };
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
                  <span className="font-mono text-sm text-slate-600">{watch("codigoRubrica") || "---"}</span>
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
              {etapas.map((etapa, index) => {
                const status =
                  historico.find((h) => h.etapaId === etapa.id)?.status ??
                  (index === etapaIndex ? "em_analise" : "pendente");
                const isAtual = index === etapaIndex;
                const isCompleto = status === "aprovado";
                const isRejeitado = status === "rejeitado";

                return (
                  <div key={etapa.id} className="w-36 shrink-0 text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setEtapaIndex(index)}>
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
              {etapaAtualIndex} de {etapas.length}
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

      {/* Banner de Ajuste Solicitado */}
      {(() => {
        const ajustePendente = historico.find(h => h.etapaId === etapaAtual.id && h.comentario?.startsWith("AJUSTE PENDENTE:"));
        if (ajustePendente) {
          return (
            <Alert className="bg-amber-50 border-amber-200 text-amber-900 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <Clock className="h-4 w-4 text-amber-600" />
              <div className="ml-2">
                <p className="font-bold text-sm">Ajuste Solicitado</p>
                <p className="text-xs opacity-90">{ajustePendente.comentario?.replace("AJUSTE PENDENTE: ", "")}</p>
              </div>
            </Alert>
          );
        }
        return null;
      })()}

      {etapaIndex === 1 ? (
        <AnaliseTecnicaFTER 
          dadosSolicitacao={watch()} 
          onAprovar={(dadosFTER) => {
            setFterDadosSalvos(dadosFTER);
            handleAprovarEtapa();
          }}
          onReprovar={(motivo) => {
            setMotivoRejeicao(motivo);
            handleConfirmarRejeicao();
          }}
          onSolicitarAjustes={() => {
            setIsAjustesModalOpen(true);
          }}
          onSalvar={(dados) => {
            setFterDadosSalvos(dados);
          }}
          dadosSalvos={fterDadosSalvos}
          grupoPermitido={grupoPermitido}
          usuarioPermitido={usuarioPermitido}
          assinaturasColetadas={assinaturasColetadas}
          assinaturasObrigatorias={assinaturasObrigatorias}
          assinaturasFaltantes={assinaturasFaltantes}
          obrigatoriosNomes={obrigatoriosNomes}
          assinouNomes={assinouNomes}
        />
      ) : (
        <div className="grid grid-cols-3 gap-6 pb-20">
          <div className="col-span-2 space-y-6">
            {etapaIndex === 0 ? (
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
  <Card className="border-none shadow-md overflow-hidden">
    <div className="h-1 bg-blue-600 w-full" />
    <CardHeader className="flex flex-row items-center justify-between gap-3">
      <CardTitle className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        Etapa 1: Identificação da Rubrica
      </CardTitle>
      <Button type="button" variant="outline" onClick={preencherDadosTeste} className="border-blue-200 text-blue-700 hover:bg-blue-50 gap-2">
        <Plus className="w-4 h-4" />
        Preencher dados fictícios
      </Button>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Código da Rubrica <span className="text-red-500">*</span></Label>
        <Controller
          name="codigoRubrica"
          control={control}
          rules={{ required: "Campo obrigatório" }}
          render={({ field }) => (
            <Input 
              {...field} 
              placeholder="Ex: 8055" 
              className={cn("border-2 h-10 font-mono uppercase", errors.codigoRubrica && "border-red-500")} 
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Nome da Rubrica <span className="text-red-500">*</span></Label>
        <Controller
          name="nomeRubrica"
          control={control}
          rules={{ required: "Campo obrigatório", maxLength: { value: 50, message: "Máximo de 50 caracteres" } }}
          render={({ field }) => <Input {...field} maxLength={50} placeholder="Ex: Adicional de Tempo de Serviço" className={cn("border-2 h-10", errors.nomeRubrica && "border-red-500")} />}
        />
        <p className="text-xs text-slate-500">Máximo de 50 caracteres.</p>
      </div>

      <div className="space-y-2">
        <Label>Classificação <span className="text-red-500">*</span></Label>
        <Controller
          name="classificacao"
          control={control}
          rules={{ required: "Campo obrigatório" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className={cn("border-2 h-10", errors.classificacao && "border-red-500")}><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>{classificacoes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          )}
        />
      </div>



      <div className="col-span-2 space-y-2">
        <Label>Tabela 03 - Natureza das Rubricas (eSocial) <span className="text-red-500">*</span></Label>
        <Controller
          name="naturezaEsocial"
          control={control}
          rules={{ required: "Campo obrigatório" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className={cn("border-2 h-10", errors.naturezaEsocial && "border-red-500")}><SelectValue placeholder="Selecione o código eSocial" /></SelectTrigger>
              <SelectContent>{naturezaRubricaEsocial.map((n) => <SelectItem key={n.codigo} value={n.codigo}>{n.codigo} - {n.descricao}</SelectItem>)}</SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Vigência - Data de início <span className="text-red-500">*</span></Label>
        <Controller
          name="vigenciaInicio"
          control={control}
          rules={{ required: "Campo obrigatório" }}
          render={({ field }) => <Input type="date" value={field.value ? format(field.value, "yyyy-MM-dd") : ""} onChange={(e) => field.onChange(e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined)} className={cn("border-2 h-10", errors.vigenciaInicio && "border-red-500")} />}
        />
        {temRetroatividade && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">Atenção: data de início anterior ao mês atual (retroatividade).</p>}
      </div>

      <div className="space-y-2">
        <Label>Vigência - Data fim (opcional)</Label>
        <Controller
          name="vigenciaFim"
          control={control}
          render={({ field }) => <Input type="date" value={field.value ? format(field.value, "yyyy-MM-dd") : ""} onChange={(e) => field.onChange(e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined)} className="border-2 h-10" />}
        />
      </div>

      <div className="col-span-2 space-y-2">
        <Label>Projeto/Atividade (PAOE) <span className="text-red-500">*</span></Label>
        <Controller
          name="paoe"
          control={control}
          rules={{ required: "Campo obrigatório" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className={cn("border-2 h-10", errors.paoe && "border-red-500")}><SelectValue placeholder="Selecione a ação..." /></SelectTrigger>
              <SelectContent>{listaPAOE.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          )}
        />
      </div>
    </CardContent>
  </Card>

  <Card className="border-none shadow-md overflow-hidden">
    <div className="h-1 bg-cyan-600 w-full" />
    <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-cyan-600" />Etapa 2: Abrangência e Público</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div className="col-span-2 space-y-2">
        <Label>Órgãos Solicitantes <span className="text-red-500">*</span></Label>
        <Controller 
          name="orgaosSolicitantes" 
          control={control} 
          rules={{ validate: (v) => (Array.isArray(v) && v.length > 0) || "Selecione pelo menos um órgão" }} 
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
      </div>

      <div className="space-y-2">
        <Label>Setores <span className="text-red-500">*</span></Label>
        <Controller name="setorIds" control={control} rules={{ validate: (v) => (Array.isArray(v) && v.length > 0) || "Selecione um setor" }} render={({ field }) => (
          <Select disabled={selectedOrgaos.length === 0} onValueChange={(value) => field.onChange(value ? [value] : [])} value={Array.isArray(field.value) ? (field.value[0] ?? "") : ""}>
            <SelectTrigger className={cn("border-2 h-10", errors.setorIds && "border-red-500")}><SelectValue placeholder={selectedOrgaos.length === 0 ? "Selecione o órgão primeiro" : "Selecione o setor"} /></SelectTrigger>
            <SelectContent>{setoresFiltrados.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}</SelectContent>
          </Select>
        )} />
      </div>



      <div className="space-y-2">
        <Label>Grupo Trabalhista (eSocial) <span className="text-red-500">*</span></Label>
        <Controller 
          name="grupoTrabalhistaIds" 
          control={control} 
          rules={{ validate: (v) => (Array.isArray(v) && v.length > 0) || "Selecione o grupo" }} 
          render={({ field }) => (
            <MultiSelect
              options={gruposTrabalhistas.map(g => ({ label: g.nome, value: g.id }))}
              selected={field.value}
              onChange={field.onChange}
              placeholder="Selecione os grupos..."
              error={!!errors.grupoTrabalhistaIds}
            />
          )} 
        />
      </div>

      <div className="space-y-2">
        <Label>Categoria Trabalhista <span className="text-red-500">*</span></Label>
        <Controller 
          name="categoriaTrabalhistaCodigos" 
          control={control} 
          rules={{ validate: (v) => (Array.isArray(v) && v.length > 0) || "Selecione a categoria" }} 
          render={({ field }) => (
            <MultiSelect
              disabled={grupoTrabalhistaIds.length === 0}
              options={categoriasFiltradas.map(cat => ({ label: `${cat.codigo} - ${cat.descricao}`, value: cat.codigo }))}
              selected={field.value}
              onChange={field.onChange}
              placeholder={grupoTrabalhistaIds.length === 0 ? "Selecione o grupo primeiro" : "Selecione as categorias..."}
              error={!!errors.categoriaTrabalhistaCodigos}
            />
          )} 
        />
      </div>



      <div className="col-span-2 space-y-2">
        <Label>Cargos que utilizarão a rubrica <span className="text-red-500">*</span></Label>
        <Controller 
          name="cargosAplicaveis" 
          control={control} 
          rules={{ validate: (v) => (Array.isArray(v) && v.length > 0) || "Selecione pelo menos um cargo" }} 
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
      </div>
    </CardContent>
  </Card>

  <Card className="border-none shadow-md overflow-hidden">
    <div className="h-1 bg-amber-500 w-full" />
    <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500" />Etapa 3: Incidências e Regras</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div className="col-span-2 space-y-2">
        <Label>Natureza da Verba <span className="text-red-500">*</span></Label>
        <Controller
          name="natureza"
          control={control}
          rules={{ required: "Campo obrigatório" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className={cn("border-2 h-10", errors.natureza && "border-red-500")}><SelectValue placeholder="Selecione a natureza" /></SelectTrigger>
              <SelectContent>{naturezasVerba.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          )}
        />
      </div>

      {naturezaSelecionada === "Remuneratória" && (
        <>
          <div className="space-y-2">
            <Label>Caráter <span className="text-red-500">*</span></Label>
            <Controller name="carater" control={control} rules={{ required: "Selecione o caráter" }} render={({ field }) => (
              <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2"><RadioGroupItem value="Contínuo" id="carater-continuo" /><Label htmlFor="carater-continuo" className="font-normal">Contínuo (incide previdência)</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="Temporário" id="carater-temp" /><Label htmlFor="carater-temp" className="font-normal">Temporário (não incide)</Label></div>
              </RadioGroup>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Reter teto remuneratório? <span className="text-red-500">*</span></Label>
            <Controller name="reterTetoRemuneratorio" control={control} rules={{ required: "Selecione uma opção" }} render={({ field }) => (
              <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2">
                <div className="flex items-center gap-2"><RadioGroupItem value="Sim" id="teto-sim" /><Label htmlFor="teto-sim" className="font-normal">Sim</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="Não" id="teto-nao" /><Label htmlFor="teto-nao" className="font-normal">Não</Label></div>
              </RadioGroup>
            )} />
          </div>
        </>
      )}



      <div className="col-span-2 space-y-2">
        <Label>Esta rubrica possui incidências tributárias? <span className="text-red-500">*</span></Label>
        <Controller name="temIncidenciaTributaria" control={control} rules={{ required: "Selecione uma opção" }} render={({ field }) => (
          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2">
            <div className="flex items-center gap-2"><RadioGroupItem value="Sim" id="incidencia-sim" /><Label htmlFor="incidencia-sim" className="font-normal">Sim</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="Não" id="incidencia-nao" /><Label htmlFor="incidencia-nao" className="font-normal">Não</Label></div>
          </RadioGroup>
        )} />
      </div>

      {temIncidenciaTributaria === "Sim" && (
        <div className="col-span-2 space-y-2">
          <Label>Incidências e Tributos (selecione pelo menos 1) <span className="text-red-500">*</span></Label>
          <Controller
            name="incidenciasTributarias"
            control={control}
            rules={{ validate: (v) => temIncidenciaTributaria !== "Sim" || (Array.isArray(v) && v.length > 0) || "Selecione pelo menos uma incidência" }}
            render={({ field }) => (
              <MultiSelect
                options={listaIncidenciasTributarias.map(t => ({ label: t.nome, value: t.id }))}
                selected={field.value ?? []}
                onChange={field.onChange}
                placeholder="Selecione as incidências..."
                error={!!errors.incidenciasTributarias}
              />
            )}
          />
        </div>
      )}
    </CardContent>
  </Card>

  <Card className="border-none shadow-md overflow-hidden">
    <div className="h-1 bg-indigo-600 w-full" />
    <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" />Etapa 4: Amparo Legal e Formalização</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label>Base Legal (obrigatório) <span className="text-red-500">*</span></Label>
        <Controller name="baseLegalIds" control={control} rules={{ validate: (v) => (Array.isArray(v) && v.length > 0) || "Selecione ao menos um documento" }} render={({ field }) => {
          const selected = Array.isArray(field.value) ? field.value : [];
          return <div className={cn("rounded-md border p-3 space-y-2", errors.baseLegalIds && "border-red-500")}>{baseLegalDocumentos.map((doc) => <div key={doc.id} className="flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm cursor-pointer"><Checkbox checked={selected.includes(doc.id)} onCheckedChange={(checked) => checked ? field.onChange([...selected, doc.id]) : field.onChange(selected.filter((v: string) => v !== doc.id))} /><span>{doc.titulo}</span></label><Button type="button" variant="link" className="h-auto p-0">Visualizar PDF</Button></div>)}</div>;
        }} />
        <p className="text-xs text-slate-500">Lista do módulo de Documentos Legais. Upload direto não é permitido.</p>
        {baseLegalSelecionada.length === 0 && <Link to="/documentos-legais" className="text-sm text-blue-700 underline">Cadastrar novo documento</Link>}
      </div>

      <div className="space-y-2">
        <Label>Justificativa da criação da rubrica</Label>
        <Controller name="justificativaLegal" control={control} render={({ field }) => <Textarea {...field} className="border-2 min-h-24" placeholder="Descreva o motivo da criação da rubrica" />} />
      </div>

      <div className="rounded-lg border bg-slate-50 p-3 space-y-2">
        <Label className="flex items-center gap-2 text-sm"><Controller name="aceiteTermos" control={control} rules={{ required: true }} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} />Termo de compromisso <span className="text-red-500">*</span></Label>
        <p className="text-xs text-slate-600">Declaro que as informações são verdadeiras e assumo responsabilidade pelo conteúdo enviado.</p>
      </div>

      <div className="flex gap-4 pt-2">
        <Button type="submit" disabled={!podeEnviar} className={cn("flex-1 h-11", podeEnviar ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-400 cursor-not-allowed")}>Enviar Solicitação<ArrowRight className="ml-2 w-4 h-4" /></Button>
        <Link to="/" className="flex-1"><Button type="button" variant="outline" className="w-full h-11">Cancelar</Button></Link>
      </div>
    </CardContent>
  </Card>
</form>

          ) : (
            <div className="space-y-6">
              {/* Visualização de Análise (Etapas > 0) */}
              {etapaIndex === 3 ? (
                <RubricaEditorContainer />
              ) : (
                <HistoricalDataCard {...buildHistoricalDataConfig()} />
              )}

              {/* Card Documentos Anexados */}
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

              {/* Card Parecer Técnico (ex-Ações) */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-3 border-b border-slate-50">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg">Parecer Técnico</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-tight">
                      <Users className="w-3.5 h-3.5" />
                      Responsabilidade: {etapaAtual.gruposResponsaveis.map((g) => g.nome).join(", ")}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Descreva o parecer técnico desta etapa... *"
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      rows={4}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                    />
                    {comentario.trim() === "" && (
                      <p className="text-xs text-red-500">O parecer técnico é obrigatório para aprovar ou reprovar a etapa.</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    {!usuarioPermitido && (
                      <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 flex items-center gap-3 text-amber-800 rounded-lg">
                        <AlertTriangle className="w-5 h-5" />
                        <div className="text-sm">
                          <span className="font-bold">Usuário sem permissão.</span> Apenas membros autorizados para esta etapa podem utilizar os controles da barra fixa.
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-3 pt-2">
                      <Button
                        onClick={() => {
                          if (!comentario.trim()) {
                            toast.error("Preencha o parecer técnico antes de aprovar.");
                            return;
                          }
                          handleAprovarEtapa();
                        }}
                        disabled={!usuarioPermitido || !comentario.trim()}
                        className={cn(
                          "flex-1 h-12 shadow-lg font-bold",
                          !usuarioPermitido || !comentario.trim()
                            ? "bg-slate-400 text-slate-700 cursor-not-allowed shadow-none"
                            : "bg-green-600 hover:bg-green-700 shadow-green-200"
                        )}
                      >
                        <CheckCircle2 className="mr-2 w-5 h-5" />
                        Aprovar Etapa
                      </Button>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            if (!comentario.trim()) {
                              toast.error("Preencha o parecer técnico antes de solicitar ajustes.");
                              return;
                            }
                            setIsAjustesModalOpen(true);
                          }}
                          disabled={!usuarioPermitido || !comentario.trim()}
                          variant="outline"
                          className={cn(
                            "flex-1 h-12 font-bold border-amber-500 text-amber-700 hover:bg-amber-50",
                            (!usuarioPermitido || !comentario.trim()) && "opacity-50 grayscale"
                          )}
                        >
                          <Clock className="mr-2 w-5 h-5" />
                          Solicitar Ajustes
                        </Button>
                        
                        <Button
                          onClick={() => {
                            if (!comentario.trim()) {
                              toast.error("Preencha o parecer técnico antes de reprovar.");
                              return;
                            }
                            handleRejeitar();
                          }}
                          disabled={!usuarioPermitido || !comentario.trim()}
                          variant="outline"
                          className={cn(
                            "flex-1 h-12 font-bold",
                            !usuarioPermitido || !comentario.trim()
                              ? "border-slate-300 text-slate-400 hover:bg-transparent cursor-not-allowed"
                              : "border-orange-500 text-orange-600 hover:bg-orange-50"
                          )}
                        >
                          <XCircle className="mr-2 w-5 h-5" />
                          Reprovar Etapa
                        </Button>
                      </div>

                      <Button
                        onClick={handleRejeitarRubrica}
                        disabled={!usuarioPermitido}
                        variant="outline"
                        className={cn(
                          "w-full h-12 font-bold",
                          !usuarioPermitido
                            ? "border-slate-300 text-slate-400 hover:bg-transparent cursor-not-allowed"
                            : "border-red-600 text-red-600 hover:bg-red-50"
                        )}
                      >
                        <AlertTriangle className="mr-2 w-5 h-5" />
                        Rejeitar Rubrica
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-6">


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
                      const etapa = etapas.find((e) => e.id === hist.etapaId);
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
    )}

      {/* Dialog: Reprovar Etapa */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Reprovar etapa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="motivo-rejeicao">Motivo da reprovação</Label>
            <Textarea
              id="motivo-rejeicao"
              placeholder="Descreva o motivo da reprovação..."
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-slate-500">
              Esse motivo será informado ao solicitante e a etapa retornará para revisão.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleConfirmarRejeicao}
            >
              Confirmar reprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Solicitar Ajustes (Devolução de Workflow) */}
      <Dialog open={isAjustesModalOpen} onOpenChange={setIsAjustesModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              Confirmação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-slate-600 text-sm">Deseja realmente devolver esta solicitação para ajustes?</p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <p className="font-semibold mb-1">Regra de Negócio:</p>
              <p>Ao devolver para uma etapa anterior, todas as aprovações intermediárias serão anuladas e o fluxo deverá ser refeito linearmente.</p>
            </div>

            <div className="space-y-2">
              <Label>Etapa de Destino <span className="text-red-500">*</span></Label>
              <Select value={etapaDestinoId} onValueChange={setEtapaDestinoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a etapa para correção..." />
                </SelectTrigger>
                <SelectContent>
                  {etapas
                    .filter((e, idx) => idx < etapaIndex)
                    .map((etapa) => (
                      <SelectItem key={etapa.id} value={etapa.id}>
                        Etapa {etapas.indexOf(etapa) + 1}: {etapa.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="motivo-ajuste">Justificativa <span className="text-red-500">*</span></Label>
                <span className={cn("text-[10px]", motivoAjuste.length < 10 || motivoAjuste.length > 250 ? "text-red-500" : "text-slate-400")}>
                  {motivoAjuste.length}/250
                </span>
              </div>
              <Textarea
                id="motivo-ajuste"
                placeholder="Descreva detalhadamente o que deve ser corrigido..."
                value={motivoAjuste}
                onChange={(e) => setMotivoAjuste(e.target.value)}
                rows={4}
              />
              <p className="text-[11px] text-slate-500">Mínimo de 10 e máximo de 250 caracteres.</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsAjustesModalOpen(false)}
              className="border-slate-200 text-blue-600 hover:bg-slate-50 font-semibold px-6"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Não
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 shadow-md shadow-blue-100"
              onClick={() => handleConfirmarAjuste(etapaDestinoId, motivoAjuste)}
              disabled={!etapaDestinoId || motivoAjuste.length < 10 || motivoAjuste.length > 250}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Reprovar Etapa */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Reprovar etapa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="motivo-rejeicao">Motivo da reprovação</Label>
            <Textarea
              id="motivo-rejeicao"
              placeholder="Descreva o motivo da reprovação..."
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-slate-500">
              Esse motivo será informado ao solicitante e a etapa retornará para revisão.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleConfirmarRejeicao}
            >
              Confirmar reprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Rejeitar Rubrica (cancelamento definitivo) */}
      <Dialog open={isRejectRubricaDialogOpen} onOpenChange={setIsRejectRubricaDialogOpen}>
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
            <Label htmlFor="motivo-rejeicao-rubrica">Motivo da rejeição <span className="text-red-500">*</span></Label>
            <Textarea
              id="motivo-rejeicao-rubrica"
              placeholder="Descreva o motivo da rejeição definitiva da rubrica..."
              value={motivoRejeicaoRubrica}
              onChange={(e) => setMotivoRejeicaoRubrica(e.target.value)}
              rows={4}
              className="border-red-200 focus:border-red-400"
            />
            {motivoRejeicaoRubrica.trim() === "" && (
              <p className="text-xs text-red-500">O motivo é obrigatório.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsRejectRubricaDialogOpen(false);
              setMotivoRejeicaoRubrica("");
            }}>
              Cancelar
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-800"
              onClick={handleConfirmarRejeicaoRubrica}
              disabled={!motivoRejeicaoRubrica.trim()}
            >
              Confirmar rejeição da rubrica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


































