import { useEffect, useState } from "react";
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

const usuarioAtual: Usuario = { id: "u99", nome: "Usuário Atual" };

export function NovaSolicitacaoPage() {
  const navigate = useNavigate();
  const [etapaIndex, setEtapaIndex] = useState(0);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("Nova Rubrica");
  const [descricao, setDescricao] = useState("");
  const [documentos, setDocumentos] = useState<string[]>([]);
  const [novoDocumento, setNovoDocumento] = useState("");
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

  const handleAdicionarDocumento = () => {
    const doc = novoDocumento.trim();
    if (!doc) return;
    setDocumentos((prev) => [...prev, doc]);
    setNovoDocumento("");
  };

  const handleAprovar = async () => {
    const dataAgora = new Date().toISOString();

    let atualizado = upsertHistorico(historico, etapaAtual.id, {
      status: "aprovado",
      data: dataAgora,
      comentario: comentario.trim() || undefined,
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
      return;
    }

    const novaSolicitacao: Solicitacao = {
      id: `sol-${Date.now()}`,
      codigo: codigoPreview,
      titulo: titulo || "Nova Solicitação",
      tipo,
      solicitante: usuarioAtual,
      dataSolicitacao: new Date().toISOString().slice(0, 10),
      statusGeral: "aprovado",
      etapaAtual: etapaAtual.id,
      descricao: descricao || "Sem descrição",
      documentos: documentos.length > 0 ? documentos : undefined,
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
          <CardTitle>Progresso da Esteira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200" />
            <div className="relative grid grid-cols-5 gap-2">
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

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Adicional de Insalubridade"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nova Rubrica">Nova Rubrica</SelectItem>
                    <SelectItem value="Atualização de Rubrica">
                      Atualização de Rubrica
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva a solicitação..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos Anexados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={novoDocumento}
                  onChange={(e) => setNovoDocumento(e.target.value)}
                  placeholder="Nome do documento"
                />
                <Button variant="outline" onClick={handleAdicionarDocumento}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              {documentos.length > 0 ? (
                <div className="space-y-2">
                  {documentos.map((doc, index) => (
                    <div
                      key={`${doc}-${index}`}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {doc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Nenhum documento anexado.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Comentário (opcional)
                </label>
                <Textarea
                  placeholder="Adicione observações sobre esta etapa..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAprovar}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Avançar Etapa
                </Button>
                <Button
                  onClick={handleRejeitar}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar Etapa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
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

