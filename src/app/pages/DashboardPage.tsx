import { useMemo, useState, useEffect, useSyncExternalStore } from "react";
import { Link } from "react-router";
import { Plus, Filter, Search, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
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
import { getEsteiraConfig, subscribeEsteiraConfig } from "../data/esteiraStore";
import { getSolicitacoes, subscribeSolicitacoes } from "../data/solicitacoesStore";
import { cn } from "../components/ui/utils";

export function DashboardPage() {
  const solicitacoes = useSyncExternalStore(
    subscribeSolicitacoes,
    getSolicitacoes,
    getSolicitacoes
  );
  const etapas = useSyncExternalStore(subscribeEsteiraConfig, getEsteiraConfig, getEsteiraConfig);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(5);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroStatus, itensPorPagina]);

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

  const totalPaginas = Math.ceil(solicitacoesFiltradas.length / itensPorPagina);
  const solicitacoesPaginadas = solicitacoesFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const getEtapaAtual = (etapaId: string) => {
    return etapas.find((e) => e.id === etapaId);
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
        {solicitacoesPaginadas.map((solicitacao) => {
          const etapaAtual = getEtapaAtual(solicitacao.etapaAtual);
          return (
            <Link key={solicitacao.id} to={`/solicitacao/${solicitacao.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
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
                      <h3 className="text-slate-900 mb-2 font-medium">
                        {solicitacao.titulo}
                      </h3>
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

                    <div className="ml-4 min-w-[200px] flex justify-end">
                      {etapaAtual && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">
                            {etapaAtual.nome}
                          </span>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: etapaAtual.cor }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Paginação */}
      {solicitacoesFiltradas.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Itens por página:</span>
            <Select 
              value={itensPorPagina.toString()} 
              onValueChange={(v) => setItensPorPagina(Number(v))}
            >
              <SelectTrigger className="w-[80px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-slate-600">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

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


