import { useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router";
import { Plus, Filter, Search, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { esteiraDefault } from "../data/mockData";
import { getSolicitacoes, subscribeSolicitacoes } from "../data/solicitacoesStore";
import { cn } from "../components/ui/utils";

export function DashboardPage() {
  const solicitacoes = useSyncExternalStore(
    subscribeSolicitacoes,
    getSolicitacoes,
    getSolicitacoes
  );
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const solicitacoesFiltradas = useMemo(() => {
    return solicitacoes.filter((sol) => {
      const matchBusca =
        busca === "" ||
        sol.codigo.toLowerCase().includes(busca.toLowerCase()) ||
        sol.titulo.toLowerCase().includes(busca.toLowerCase());

      const matchStatus =
        filtroStatus === "todos" || sol.statusGeral === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [busca, filtroStatus, solicitacoes]);

  const getEtapaAtual = (etapaId: string) => {
    return esteiraDefault.find((e) => e.id === etapaId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "em_andamento":
        return <Clock className="w-4 h-4" />;
      case "aprovado":
        return <CheckCircle2 className="w-4 h-4" />;
      case "rejeitado":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_andamento":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "aprovado":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejeitado":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "em_andamento":
        return "Em Andamento";
      case "aprovado":
        return "Aprovado";
      case "rejeitado":
        return "Rejeitado";
      default:
        return status;
    }
  };

  const stats = useMemo(
    () => ({
      total: solicitacoes.length,
      emAndamento: solicitacoes.filter((s) => s.statusGeral === "em_andamento")
        .length,
      aprovados: solicitacoes.filter((s) => s.statusGeral === "aprovado").length,
      rejeitados: solicitacoes.filter((s) => s.statusGeral === "rejeitado")
        .length,
    }),
    [solicitacoes]
  );

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900">Rubrica</h2>
          <p className="text-slate-600 mt-1">
            Acompanhe todas as solicitações de rubricas
          </p>
        </div>
        <Link to="/nova-solicitacao">
          <Button className="bg-[#0c4a6e] hover:bg-[#0a3d5a]">
            <Plus className="w-4 h-4 mr-2" />
            Nova Solicitação
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Em Andamento</p>
                <p className="text-2xl font-semibold text-blue-600 mt-1">
                  {stats.emAndamento}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Aprovados</p>
                <p className="text-2xl font-semibold text-green-600 mt-1">
                  {stats.aprovados}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Rejeitados</p>
                <p className="text-2xl font-semibold text-red-600 mt-1">
                  {stats.rejeitados}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por código ou título..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="aprovado">Aprovados</SelectItem>
                <SelectItem value="rejeitado">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Solicitações */}
      <div className="space-y-3">
        {solicitacoesFiltradas.map((solicitacao) => {
          const etapaAtual = getEtapaAtual(solicitacao.etapaAtual);
          const progressoPercentual =
            (solicitacao.historico.filter((h) => h.status === "aprovado").length /
              esteiraDefault.length) *
            100;

          return (
            <Link key={solicitacao.id} to={`/solicitacao/${solicitacao.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-slate-600">
                          {solicitacao.codigo}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "flex items-center gap-1",
                            getStatusColor(solicitacao.statusGeral)
                          )}
                        >
                          {getStatusIcon(solicitacao.statusGeral)}
                          {getStatusLabel(solicitacao.statusGeral)}
                        </Badge>
                      </div>
                      <h3 className="text-slate-900 mb-1">
                        {solicitacao.titulo}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {solicitacao.descricao}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Solicitante: {solicitacao.solicitante.nome}</span>
                        <span>•</span>
                        <span>
                          {new Date(
                            solicitacao.dataSolicitacao
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4 min-w-[200px]">
                      {etapaAtual && (
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: etapaAtual.cor }}
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {etapaAtual.nome}
                          </span>
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Progresso</span>
                          <span>{Math.round(progressoPercentual)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                            style={{ width: `${progressoPercentual}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {solicitacoesFiltradas.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 mb-2">
              Nenhuma solicitação encontrada
            </h3>
            <p className="text-slate-600">
              Tente ajustar os filtros ou criar uma nova solicitação
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
