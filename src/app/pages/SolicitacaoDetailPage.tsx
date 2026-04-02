import { useState } from "react";
import { useParams, Link } from "react-router";
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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { solicitacoes, esteiraDefault, type Etapa } from "../data/mockData";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";

export function SolicitacaoDetailPage() {
  const { id } = useParams();
  const solicitacao = solicitacoes.find((s) => s.id === id);
  const [comentario, setComentario] = useState("");

  if (!solicitacao) {
    return (
      <div className="text-center py-12">
        <h2 className="text-slate-900 mb-2">Solicitação não encontrada</h2>
        <p className="text-slate-600 mb-4">
          A solicitação que você está procurando não existe.
        </p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    );
  }

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

  const handleAprovar = () => {
    toast.success("Etapa aprovada com sucesso!", {
      description: "A solicitação foi movida para a próxima etapa.",
    });
  };

  const handleRejeitar = () => {
    toast.error("Etapa rejeitada", {
      description: "A solicitação foi rejeitada e o solicitante foi notificado.",
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

  const etapaAtual = esteiraDefault.find((e) => e.id === solicitacao.etapaAtual);
  const etapaAtualIndex = esteiraDefault.findIndex(
    (e) => e.id === solicitacao.etapaAtual
  );

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
                {solicitacao.codigo}
              </span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {solicitacao.tipo}
              </Badge>
            </div>
            <h2 className="text-slate-900 mb-2">{solicitacao.titulo}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-600">
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
      </div>

      {/* Pipeline Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso da Esteira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Linha conectora */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200" />
            
            {/* Etapas */}
            <div className="relative grid grid-cols-8 gap-2">
              {esteiraDefault.map((etapa, index) => {
                const status = getEtapaStatus(etapa.id);
                const isAtual = etapa.id === solicitacao.etapaAtual;
                const isCompleto = status === "aprovado";
                const isRejeitado = status === "rejeitado";
                const historico = solicitacao.historico.find(
                  (h) => h.etapaId === etapa.id
                );

                return (
                  <div key={etapa.id} className="flex flex-col items-center">
                    {/* Círculo da etapa */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full border-4 bg-white flex items-center justify-center relative z-10 transition-all",
                        isCompleto && "bg-green-50 border-green-500",
                        isRejeitado && "bg-red-50 border-red-500",
                        isAtual && !isCompleto && "bg-blue-50 border-blue-500 ring-4 ring-blue-100",
                        !isCompleto && !isRejeitado && !isAtual && "border-slate-300"
                      )}
                    >
                      {getStatusIcon(status)}
                    </div>

                    {/* Nome da etapa */}
                    <div className="mt-3 text-center">
                      <p
                        className={cn(
                          "text-xs font-medium leading-tight",
                          isAtual && "text-blue-700",
                          isCompleto && "text-green-700",
                          isRejeitado && "text-red-700",
                          !isCompleto && !isRejeitado && !isAtual && "text-slate-600"
                        )}
                      >
                        {etapa.nome}
                      </p>
                      {historico?.data && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(historico.data).toLocaleDateString("pt-BR", {
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

          {/* Etapa Atual Info */}
          {etapaAtual && (
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
                    <span>
                      Responsável: {etapaAtual.grupoResponsavel.nome}
                    </span>
                  </div>
                </div>
                <Badge className="bg-blue-600 text-white">
                  {etapaAtualIndex + 1} de {esteiraDefault.length}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="col-span-2 space-y-6">
          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">{solicitacao.descricao}</p>
            </CardContent>
          </Card>

          {/* Documentos */}
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
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {doc}
                        </span>
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

          {/* Ações */}
          {solicitacao.statusGeral === "em_andamento" && (
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
                    Aprovar Etapa
                  </Button>
                  <Button
                    onClick={handleRejeitar}
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

        {/* Sidebar - Histórico */}
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
                    const etapa = esteiraDefault.find(
                      (e) => e.id === hist.etapaId
                    );
                    if (!etapa) return null;

                    return (
                      <div key={index} className="relative">
                        {index !== solicitacao.historico.length - 1 && (
                          <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-200" />
                        )}
                        <div className="flex gap-3">
                          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                            <AvatarFallback
                              className="text-xs"
                              style={{ backgroundColor: etapa.cor + "20" }}
                            >
                              {hist.usuario
                                ? getInitials(hist.usuario.nome)
                                : "SYS"}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
