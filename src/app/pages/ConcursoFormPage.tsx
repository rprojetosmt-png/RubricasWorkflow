import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { MultiSelect } from "../components/MultiSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { orgaos, setores } from "../data/formOptions";
import { createConcurso, getConcurso, updateConcurso, type ConcursoInput } from "../data/concursosStore";
import { toast } from "sonner";

const tiposConcurso = ["Concurso", "Processo Seletivo", "Processo Simplificado"];
const regimesJuridicos = ["Estatutário", "CLT", "Temporário"];
const tiposVinculo = ["Efetivo", "Temporário", "Comissionado"];
const abrangencias = ["Municipal", "Estadual", "Federal"];
const instituicoes = ["Fundação Cesgranrio", "FGV", "IBFC", "VUNESP", "Instituto AOCP"];

interface FormState extends ConcursoInput {}

const emptyForm: FormState = {
  nomeConcurso: "",
  sigla: "",
  numeroEdital: "",
  tipoConcurso: "",
  regimeJuridico: "",
  tipoVinculo: "",
  abrangencia: "",
  orgaosEnvolvidos: [],
  instituicaoRealizadora: "",
  setorResponsavel: "",
  dataPublicacaoEdital: null,
  dataInicioInscricao: null,
  dataFimInscricao: null,
  dataProva: null,
  dataResultado: null,
  dataValidade: null,
  dataCancelamento: null,
  objetivo: "",
  observacoes: "",
  motivo: "",
};

const toInputDate = (value?: string | null) => value ?? "";
const fromInputDate = (value: string) => (value.trim() ? value : null);

export function ConcursoFormPage({ mode }: { mode: "new" | "edit" }) {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  const orgaosOptions = useMemo(
    () => orgaos.map((item) => ({ label: item.nome, value: item.nome })),
    []
  );

  useEffect(() => {
    if (mode !== "edit") return;

    const run = async () => {
      try {
        setLoading(true);
        const data = await getConcurso(id);
        setForm({
          nomeConcurso: data.nomeConcurso,
          sigla: data.sigla,
          numeroEdital: data.numeroEdital,
          tipoConcurso: data.tipoConcurso,
          regimeJuridico: data.regimeJuridico,
          tipoVinculo: data.tipoVinculo,
          abrangencia: data.abrangencia,
          orgaosEnvolvidos: data.orgaosEnvolvidos,
          instituicaoRealizadora: data.instituicaoRealizadora,
          setorResponsavel: data.setorResponsavel,
          dataPublicacaoEdital: data.dataPublicacaoEdital,
          dataInicioInscricao: data.dataInicioInscricao,
          dataFimInscricao: data.dataFimInscricao,
          dataProva: data.dataProva ?? null,
          dataResultado: data.dataResultado ?? null,
          dataValidade: data.dataValidade ?? null,
          dataCancelamento: data.dataCancelamento ?? null,
          objetivo: data.objetivo,
          observacoes: data.observacoes ?? "",
          motivo: data.motivo ?? "",
        });
      } catch (err) {
        toast.error("Não foi possível carregar o concurso");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, mode]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload: ConcursoInput = {
        ...form,
        nomeConcurso: form.nomeConcurso.trim(),
        sigla: form.sigla.trim(),
        numeroEdital: form.numeroEdital.trim(),
        objetivo: form.objetivo.trim(),
        observacoes: form.observacoes?.trim() || "",
        motivo: form.motivo?.trim() || "",
      };

      if (mode === "edit") {
        await updateConcurso(id, payload);
        toast.success("Concurso atualizado com sucesso");
        navigate(`/concurso/${id}`);
      } else {
        const created = await createConcurso(payload);
        toast.success("Concurso criado com sucesso");
        navigate(`/concurso/${created.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao salvar concurso";
      toast.error("Não foi possível salvar", { description: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to={mode === "edit" ? `/concurso/${id}` : "/concurso"}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h2 className="text-slate-900">{mode === "edit" ? "Editar Concurso" : "Novo Concurso"}</h2>
          <p className="text-slate-600 mt-1">Cadastro estruturado de concurso/processo seletivo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Identificação</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Nome do Concurso</Label><Input value={form.nomeConcurso} onChange={(e) => setField("nomeConcurso", e.target.value)} /></div>
            <div><Label>Sigla</Label><Input value={form.sigla} onChange={(e) => setField("sigla", e.target.value)} /></div>
            <div><Label>Número do Edital</Label><Input value={form.numeroEdital} onChange={(e) => setField("numeroEdital", e.target.value)} /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipoConcurso} onValueChange={(v) => setField("tipoConcurso", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{tiposConcurso.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Classificação</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Regime Jurídico</Label>
              <Select value={form.regimeJuridico} onValueChange={(v) => setField("regimeJuridico", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{regimesJuridicos.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Vínculo</Label>
              <Select value={form.tipoVinculo} onValueChange={(v) => setField("tipoVinculo", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{tiposVinculo.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Abrangência</Label>
              <Select value={form.abrangencia} onValueChange={(v) => setField("abrangencia", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{abrangencias.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Organização</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Órgãos envolvidos</Label>
              <MultiSelect options={orgaosOptions} selected={form.orgaosEnvolvidos} onChange={(v) => setField("orgaosEnvolvidos", v)} placeholder="Selecione um ou mais órgãos" />
            </div>
            <div>
              <Label>Instituição realizadora</Label>
              <Select value={form.instituicaoRealizadora} onValueChange={(v) => setField("instituicaoRealizadora", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{instituicoes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setor responsável</Label>
              <Select value={form.setorResponsavel} onValueChange={(v) => setField("setorResponsavel", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{setores.map((item) => <SelectItem key={item.id} value={item.nome}>{item.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Datas</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>Publicação do edital</Label><Input type="date" value={toInputDate(form.dataPublicacaoEdital)} onChange={(e) => setField("dataPublicacaoEdital", fromInputDate(e.target.value))} /></div>
            <div><Label>Início inscrição</Label><Input type="date" value={toInputDate(form.dataInicioInscricao)} onChange={(e) => setField("dataInicioInscricao", fromInputDate(e.target.value))} /></div>
            <div><Label>Fim inscrição</Label><Input type="date" value={toInputDate(form.dataFimInscricao)} onChange={(e) => setField("dataFimInscricao", fromInputDate(e.target.value))} /></div>
            <div><Label>Data prova</Label><Input type="date" value={toInputDate(form.dataProva)} onChange={(e) => setField("dataProva", fromInputDate(e.target.value))} /></div>
            <div><Label>Data resultado</Label><Input type="date" value={toInputDate(form.dataResultado)} onChange={(e) => setField("dataResultado", fromInputDate(e.target.value))} /></div>
            <div><Label>Data validade</Label><Input type="date" value={toInputDate(form.dataValidade)} onChange={(e) => setField("dataValidade", fromInputDate(e.target.value))} /></div>
            <div><Label>Data cancelamento</Label><Input type="date" value={toInputDate(form.dataCancelamento)} onChange={(e) => setField("dataCancelamento", fromInputDate(e.target.value))} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Informações Adicionais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Objetivo</Label><Textarea rows={3} value={form.objetivo} onChange={(e) => setField("objetivo", e.target.value)} /></div>
            <div><Label>Observações</Label><Textarea rows={3} value={form.observacoes ?? ""} onChange={(e) => setField("observacoes", e.target.value)} /></div>
            <div><Label>Motivo (se não ativo)</Label><Textarea rows={2} value={form.motivo ?? ""} onChange={(e) => setField("motivo", e.target.value)} /></div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-[#0c4a6e] hover:bg-[#0a3d5a]" disabled={loading || saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : mode === "edit" ? "Salvar Alterações" : "Criar Concurso"}
          </Button>
        </div>
      </form>
    </div>
  );
}
