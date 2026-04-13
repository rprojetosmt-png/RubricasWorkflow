import { useState, useSyncExternalStore } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Download,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { type HistoricoEtapa } from "../data/mockData";
import {
  getSolicitacaoById,
  subscribeSolicitacoes,
  updateSolicitacao,
} from "../data/solicitacoesStore";
import { getEsteiraConfig, subscribeEsteiraConfig } from "../data/esteiraStore";
import {
  getSessionContext,
  subscribeSessionContext,
} from "../data/sessionStore";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";

export function SolicitacaoDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const solicitacao = useSyncExternalStore(
    subscribeSolicitacoes,
    () => (id ? getSolicitacaoById(id) : null),
    () => (id ? getSolicitacaoById(id) : null)
  );

  const etapas = useSyncExternalStore(subscribeEsteiraConfig, getEsteiraConfig, getEsteiraConfig);
  const session = useSyncExternalStore(
    subscribeSessionContext,
    getSessionContext,
    getSessionContext
  );

  const [comentario, setComentario] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  if (!solicitacao) {
    return (
      <div className="text-center py-12">
        <h2 className="text-slate-900 mb-2">Solicitação não encontrada</h2>
        <p className="text-slate-600 mb-4">A solicitação que você está procurando não existe.</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const etapaAtual = etapas.find((e) => e.id === solicitacao.etapaAtual);
  const etapaAtualIndex = etapas.findIndex((e) => e.id === solicitacao.etapaAtual);

  if (!etapaAtual) {
    return (
      <div className="text-center py-12">
        <h2 className="text-slate-900 mb-2">Etapa atual inválida</h2>
        <p className="text-slate-600 mb-4">A configuração da esteira foi alterada e esta solicitação ficou inconsistente.</p>
        <Link to="/">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    );
  }

  const grupoPermitido = etapaAtual.gruposResponsaveis.some(
    (grupo) => grupo.id === session.activeGroupId
  );

  const membrosEtapa = etapaAtual.gruposResponsaveis
    .flatMap((grupo) => grupo.usuarios)
    .filter((usuario, i, arr) => arr.findIndex((u) => u.id === usuario.id) === i);

  const requiredSignerIds = (etapaAtual.requiredSignerIds ?? []).filter((id) =>
    membrosEtapa.some((u) => u.id === id)
  );
  const assinaturaAtual = solicitacao.assinaturasEtapa?.[etapaAtual.id] ?? [];
  const assinaturasUnicas = Array.from(new Set(assinaturaAtual));
  const missingSignerIds = requiredSignerIds.filter((id) => !assinaturasUnicas.includes(id));
  const usuarioAtualEhObrigatorio = requiredSignerIds.includes(session.activeUserId);

  const getEtapaStatus = (etapaId: string) => {
    const historico = solicitacao.historico.find((h) => h.etapaId === etapaId);
    return historico?.status || "pendente";
  };

  const getStatusIcon = (status: string, size: string = "w-5 h-5") => {
    switch (status) {
      case "aprovado":
        return <CheckCircle2 className={cn(size, "text-green-600")} />;
      case "rejeitado":
        return <XCircle className={cn(size, "text-red-600")} />;
      case "em_analise":
        return <Clock className={cn(size, "text-blue-600")} />;
      case "pendente":
        return <div className={cn(size, "rounded-full border-2 border-slate-300")} />;
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
      return [...lista.slice(0, index), atualizado, ...lista.slice(index + 1)];
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

  const handleAprovar = async () => {
    if (!grupoPermitido) {
      toast.error("Você não tem permissão para agir nesta etapa com o grupo selecionado.");
      return;
    }

    if (requiredSignerIds.length > 0 && !usuarioAtualEhObrigatorio) {
      toast.error("Este usuário não está marcado como assinante obrigatório nesta etapa.");
      return;
    }

    const dataAgora = new Date().toISOString();

    try {
      await updateSolicitacao(solicitacao.id, (prev) => {
        const etapaIndex = etapas.findIndex((e) => e.id === prev.etapaAtual);
        const etapaAtualId = prev.etapaAtual;
        const proximaEtapa = etapas[etapaIndex + 1] ?? null;

        const assinaturasEtapa = { ...(prev.assinaturasEtapa ?? {}) };
        const assinaturasExistentes = Array.from(new Set(assinaturasEtapa[etapaAtualId] ?? []));
        const requiredIdsEtapa = (etapaAtual.requiredSignerIds ?? []).filter((id) =>
          membrosEtapa.some((u) => u.id === id)
        );

        if (requiredIdsEtapa.length > 0 && !assinaturasExistentes.includes(session.activeUserId)) {
          assinaturasExistentes.push(session.activeUserId);
        }
        assinaturasEtapa[etapaAtualId] = assinaturasExistentes;

        const faltantes = requiredIdsEtapa.filter((id) => !assinaturasExistentes.includes(id));
        const liberarAvanco = requiredIdsEtapa.length === 0 || faltantes.length === 0;

        let historico = upsertHistorico(prev.historico, etapaAtualId, {
          status: liberarAvanco ? "aprovado" : "em_analise",
          data: dataAgora,
          comentario: liberarAvanco
            ? comentario.trim() || undefined
            : `Assinatura registrada (${assinaturasExistentes.length}/${requiredIdsEtapa.length})`,
          usuario: {
            id: session.activeUserId,
            nome: session.activeUserName,
          },
        });

        let novoStatusGeral = prev.statusGeral;
        let novaEtapaAtual = prev.etapaAtual;

        if (liberarAvanco) {
          if (proximaEtapa) {
            novaEtapaAtual = proximaEtapa.id;
            historico = upsertHistorico(historico, proximaEtapa.id, {
              status: "em_analise",
              data: dataAgora,
            });
          } else {
            novoStatusGeral = "aprovado";
          }
        }

        return {
          ...prev,
          etapaAtual: novaEtapaAtual,
          statusGeral: novoStatusGeral,
          historico,
          assinaturasEtapa,
        };
      });

      if (requiredSignerIds.length > 0 && missingSignerIds.length > 1) {
        toast.info("Assinatura registrada", {
          description: `Faltam ${missingSignerIds.length - 1} assinatura(s) obrigatória(s).`,
        });
      } else {
        const botaoLabel = etapaAtualIndex === etapas.length - 1 ? "Aprovar" : "Aprovar Etapa";
        toast.success(`${botaoLabel} concluído com sucesso!`);
      }

      setComentario("");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível concluir a ação");
    }
  };

  const handleRejeitar = () => {
    if (!grupoPermitido) {
      toast.error("Você não tem permissão para rejeitar esta etapa com o grupo selecionado.");
      return;
    }
    setIsRejectDialogOpen(true);
  };

  const handleConfirmarRejeicao = async () => {
    if (!motivoRejeicao.trim()) {
      toast.error("Informe o motivo da rejeição");
      return;
    }

    const dataAgora = new Date().toISOString();

    try {
      await updateSolicitacao(solicitacao.id, (prev) => {
        const etapaIndex = etapas.findIndex((e) => e.id === prev.etapaAtual);
        const etapaAtualId = prev.etapaAtual;
        const etapaAnterior = etapaIndex > 0 ? etapas[etapaIndex - 1] : null;

        let historico = upsertHistorico(prev.historico, etapaAtualId, {
          status: "rejeitado",
          data: dataAgora,
          comentario: motivoRejeicao.trim(),
          usuario: {
            id: session.activeUserId,
            nome: session.activeUserName,
          },
        });

        let novaEtapaAtual = etapaAtualId;
        if (etapaAnterior) {
          novaEtapaAtual = etapaAnterior.id;
          historico = upsertHistorico(historico, etapaAnterior.id, {
            status: "em_analise",
            data: dataAgora,
          });
        }

        return {
          ...prev,
          etapaAtual: novaEtapaAtual,
          statusGeral: "em_andamento",
          historico,
        };
      });

      toast.error("Etapa rejeitada", {
        description: `Motivo: ${motivoRejeicao.trim()}`,
      });

      setIsRejectDialogOpen(false);
      setMotivoRejeicao("");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível rejeitar a etapa");
    }
  };

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const assinaturaObrigatoriaNomes = requiredSignerIds
    .map((id) => membrosEtapa.find((u) => u.id === id)?.nome)
    .filter(Boolean) as string[];

  const assinouNomes = assinaturasUnicas
    .map((id) => membrosEtapa.find((u) => u.id === id)?.nome)
    .filter(Boolean) as string[];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
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
                  <span className="font-mono text-sm text-slate-600">{solicitacao.codigo}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {solicitacao.tipo}
                  </Badge>
                </div>
                <h2 className="text-slate-900 mb-1">{solicitacao.titulo}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {solicitacao.solicitante.nome}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(solicitacao.dataSolicitacao).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            </div>
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50">
              {solicitacao.statusGeral === "aprovado" ? "Rubrica aprovada" : "Rubrica em edição"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3 space-y-3">
          <div className="relative overflow-x-auto pb-1">
            <div className="absolute top-4 left-3 right-3 h-px bg-slate-300" />
            <div className="relative flex min-w-[820px] items-start justify-between gap-4 px-1">
              {etapas.map((etapa, index) => {
                const status = getEtapaStatus(etapa.id);
                const isAtual = etapa.id === solicitacao.etapaAtual;
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
                    <p className={cn("mt-1 text-sm font-semibold leading-tight", isAtual && "text-blue-800")}>
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
              {etapaAtualIndex + 1} de {etapas.length}
            </Badge>
            <span className="font-medium text-slate-800">Etapa Atual: {etapaAtual.nome}</span>
            <span className="text-slate-700 flex items-center gap-1">
              <User className="w-4 h-4" />
              {etapaAtual.gruposResponsaveis.map((g) => g.nome).join(", ")}
            </span>
          </div>
        </CardContent>
      </Card>

      {!grupoPermitido && solicitacao.statusGeral === "em_andamento" && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-4 flex items-start gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">Usuário sem permissão para esta etapa</p>
              <p className="text-sm">
                Selecione no topo um usuário do grupo responsável por esta etapa para aprovar ou rejeitar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">{solicitacao.descricao}</p>
            </CardContent>
          </Card>

          {solicitacao.documentos && solicitacao.documentos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Documentos Anexados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {solicitacao.documentos.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{doc}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {solicitacao.statusGeral === "em_andamento" && (
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {requiredSignerIds.length > 0 && (
                  <div className="p-3 rounded-lg border bg-slate-50 space-y-2">
                    <p className="text-sm font-medium text-slate-800">Assinaturas obrigatórias</p>
                    <p className="text-xs text-slate-600">
                      {assinouNomes.length}/{requiredSignerIds.length} assinaturas coletadas
                    </p>
                    <p className="text-xs text-slate-600">
                      Obrigatórios: {assinaturaObrigatoriaNomes.join(", ")}
                    </p>
                    <p className="text-xs text-slate-600">
                      Já assinaram: {assinouNomes.length > 0 ? assinouNomes.join(", ") : "ninguém"}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Comentário (opcional)</label>
                  <Textarea
                    placeholder="Adicione observações sobre esta etapa..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={4}
                    disabled={!grupoPermitido}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAprovar}
                    disabled={!grupoPermitido}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {requiredSignerIds.length > 0
                      ? missingSignerIds.length > 0
                        ? "Assinar Etapa"
                        : etapaAtualIndex === etapas.length - 1
                        ? "Aprovar"
                        : "Aprovar Etapa"
                      : etapaAtualIndex === etapas.length - 1
                      ? "Aprovar"
                      : "Aprovar Etapa"}
                  </Button>
                  <Button
                    onClick={handleRejeitar}
                    disabled={!grupoPermitido}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {solicitacao.historico
                  .filter((h) => h.status !== "pendente")
                  .sort((a, b) => {
                    if (!a.data || !b.data) return 0;
                    return new Date(b.data).getTime() - new Date(a.data).getTime();
                  })
                  .map((hist, index) => {
                    const etapa = etapas.find((e) => e.id === hist.etapaId);
                    if (!etapa) return null;

                    return (
                      <div key={`${hist.etapaId}-${index}`} className="relative">
                        <div className="flex gap-3">
                          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="text-xs" style={{ backgroundColor: etapa.cor + "20" }}>
                              {hist.usuario ? getInitials(hist.usuario.nome) : "SYS"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-sm font-medium text-slate-900">{etapa.nome}</p>
                              {getStatusIcon(hist.status, "w-4 h-4")}
                            </div>
                            {hist.usuario && <p className="text-xs text-slate-600 mb-1">{hist.usuario.nome}</p>}
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
            <p className="text-xs text-slate-500">Esse motivo será informado ao solicitante.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleConfirmarRejeicao}>
              Confirmar rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
