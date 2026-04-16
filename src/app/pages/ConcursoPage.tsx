import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Search, Plus, Briefcase, CalendarDays, Building2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { listConcursos, type Concurso } from "../data/concursosStore";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";

const statusColor = (status: string) => {
  if (status === "ATIVO") return "bg-green-100 text-green-700 border-green-200";
  if (status === "ENCERRADO") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-700 border-red-200";
};

export function ConcursoPage() {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const rows = await listConcursos();
        setConcursos(rows);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar concursos";
        toast.error("Não foi possível carregar concursos", { description: message });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return concursos.filter((item) => {
      const matchBusca =
        termo.length === 0 ||
        item.nomeConcurso.toLowerCase().includes(termo) ||
        item.sigla.toLowerCase().includes(termo) ||
        item.numeroEdital.toLowerCase().includes(termo);

      const matchStatus = status === "todos" || item.situacao === status;
      return matchBusca && matchStatus;
    });
  }, [concursos, busca, status]);

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900">Concurso</h2>
          <p className="text-slate-600 mt-1">Cadastro e acompanhamento de concursos e seletivos</p>
        </div>

        <Link to="/concurso/novo">
          <Button className="bg-[#0c4a6e] hover:bg-[#0a3d5a]">
            <Plus className="w-4 h-4 mr-2" />
            Novo Concurso
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome, sigla ou edital"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as situações</SelectItem>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="ENCERRADO">Encerrado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-sm text-slate-600">Carregando concursos...</CardContent>
        </Card>
      ) : filtrados.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-700">Nenhum concurso encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtrados.map((item) => (
            <Link key={item.id} to={`/concurso/${item.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-slate-900 text-lg">{item.nomeConcurso}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {item.sigla} • {item.numeroEdital}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn("font-medium", statusColor(item.situacao))}>
                      {item.situacao}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{item.tipoConcurso}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{item.instituicaoRealizadora}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        Inscrição: {item.dataInicioInscricao ?? "-"} até {item.dataFimInscricao ?? "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
