import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, CalendarDays, Building2, FileText, Pencil, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  addConcursoPublicacao,
  getConcurso,
  type Concurso,
  type ConcursoPublicacaoInput,
} from "../data/concursosStore";
import { toast } from "sonner";

const emptyPublicacao: ConcursoPublicacaoInput = {
  tipo: "",
  titulo: "",
  numero: "",
  dataPublicacao: null,
  arquivoNome: "",
  arquivoUrl: "",
  observacao: "",
};

export function ConcursoDetailPage() {
  const { id = "" } = useParams();
  const [concurso, setConcurso] = useState<Concurso | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPublicacao, setSavingPublicacao] = useState(false);
  const [publicacaoForm, setPublicacaoForm] = useState<ConcursoPublicacaoInput>(emptyPublicacao);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await getConcurso(id);
        setConcurso(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar concurso";
        toast.error("Não foi possível carregar o concurso", { description: message });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const setPubField = <K extends keyof ConcursoPublicacaoInput>(key: K, value: ConcursoPublicacaoInput[K]) => {
    setPublicacaoForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddPublicacao = async () => {
    if (!concurso) return;

    try {
      setSavingPublicacao(true);
      const rows = await addConcursoPublicacao(concurso.id, {
        ...publicacaoForm,
        tipo: publicacaoForm.tipo.trim(),
        titulo: publicacaoForm.titulo.trim(),
        numero: publicacaoForm.numero?.trim() || "",
        arquivoNome: publicacaoForm.arquivoNome?.trim() || "",
        arquivoUrl: publicacaoForm.arquivoUrl?.trim() || "",
        observacao: publicacaoForm.observacao?.trim() || "",
      });

      setConcurso((prev) => (prev ? { ...prev, publicacoes: rows } : prev));
      setPublicacaoForm(emptyPublicacao);
      toast.success("Publicação adicionada com sucesso");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao adicionar publicação";
      toast.error("Não foi possível adicionar publicação", { description: message });
    } finally {
      setSavingPublicacao(false);
    }
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/concurso">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h2 className="text-slate-900">Detalhe do Concurso</h2>
            <p className="text-slate-600 mt-1">Visualização da estrutura principal do concurso</p>
          </div>
        </div>

        {!!concurso && (
          <Link to={`/concurso/${concurso.id}/editar`}>
            <Button className="bg-[#0c4a6e] hover:bg-[#0a3d5a]" size="sm">
              <Pencil className="w-4 h-4 mr-2" />
              Editar Concurso
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-sm text-slate-600">Carregando...</CardContent>
        </Card>
      ) : !concurso ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-sm text-slate-600">Concurso não encontrado.</CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{concurso.nomeConcurso}</CardTitle>
                <Badge variant="outline">{concurso.situacao}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p><strong>Sigla:</strong> {concurso.sigla}</p>
              <p><strong>Número do Edital:</strong> {concurso.numeroEdital}</p>
              <p><strong>Tipo:</strong> {concurso.tipoConcurso}</p>
              <p><strong>Objetivo:</strong> {concurso.objetivo}</p>
              <p><strong>Órgãos envolvidos:</strong> {concurso.orgaosEnvolvidos.join(", ")}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Organização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p><strong>Instituição realizadora:</strong> {concurso.instituicaoRealizadora}</p>
                <p><strong>Setor responsável:</strong> {concurso.setorResponsavel}</p>
                <p><strong>Abrangência:</strong> {concurso.abrangencia}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Datas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p><strong>Publicação:</strong> {concurso.dataPublicacaoEdital ?? "-"}</p>
                <p><strong>Início inscrição:</strong> {concurso.dataInicioInscricao ?? "-"}</p>
                <p><strong>Fim inscrição:</strong> {concurso.dataFimInscricao ?? "-"}</p>
                <p><strong>Resultado:</strong> {concurso.dataResultado ?? "-"}</p>
                <p><strong>Validade:</strong> {concurso.dataValidade ?? "-"}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Publicação
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Input value={publicacaoForm.tipo} onChange={(e) => setPubField("tipo", e.target.value)} placeholder="Edital, Retificação, Resultado..." />
              </div>
              <div>
                <Label>Título</Label>
                <Input value={publicacaoForm.titulo} onChange={(e) => setPubField("titulo", e.target.value)} placeholder="Título da publicação" />
              </div>
              <div>
                <Label>Número</Label>
                <Input value={publicacaoForm.numero ?? ""} onChange={(e) => setPubField("numero", e.target.value)} placeholder="Opcional" />
              </div>
              <div>
                <Label>Data de Publicação</Label>
                <Input type="date" value={publicacaoForm.dataPublicacao ?? ""} onChange={(e) => setPubField("dataPublicacao", e.target.value || null)} />
              </div>
              <div>
                <Label>Arquivo (nome)</Label>
                <Input value={publicacaoForm.arquivoNome ?? ""} onChange={(e) => setPubField("arquivoNome", e.target.value)} placeholder="ex.: edital_01_2026.pdf" />
              </div>
              <div>
                <Label>URL do arquivo</Label>
                <Input value={publicacaoForm.arquivoUrl ?? ""} onChange={(e) => setPubField("arquivoUrl", e.target.value)} placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <Label>Observação</Label>
                <Textarea rows={2} value={publicacaoForm.observacao ?? ""} onChange={(e) => setPubField("observacao", e.target.value)} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="button" onClick={handleAddPublicacao} className="bg-[#0c4a6e] hover:bg-[#0a3d5a]" disabled={savingPublicacao}>
                  <Plus className="w-4 h-4 mr-2" />
                  {savingPublicacao ? "Salvando..." : "Adicionar Publicação"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Publicações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(concurso.publicacoes ?? []).length === 0 ? (
                <p className="text-sm text-slate-600">Nenhuma publicação cadastrada.</p>
              ) : (
                <div className="space-y-2">
                  {(concurso.publicacoes ?? []).map((pub) => (
                    <div key={pub.id} className="rounded-md border border-slate-200 p-3 text-sm">
                      <p className="font-medium text-slate-900">{pub.titulo}</p>
                      <p className="text-slate-600">{pub.tipo} • {pub.dataPublicacao ?? "-"}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
