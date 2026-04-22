import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  type Excecao,
  type TipoPessoa,
  cargosExcecao,
  situacoesFuncionais,
  servidores,
} from "../../data/excecao-data";
import {
  type FormulaToken,
  buildDescriptiveFormula,
} from "../../data/rubrica-data";
import { OperadoresMatematicos } from "./OperadoresMatematicos";
import { PainelLogica } from "./PainelLogica";
import { PainelValorFixo } from "./PainelValorFixo";
import { EditorFormula } from "./EditorFormula";
import { BibliotecaElementos } from "./BibliotecaElementos";
import { ScrollArea } from "../ui/scroll-area";
import { X, CheckCircle2, Calculator } from "lucide-react";

interface ModalExcecaoProps {
  open: boolean;
  onClose: () => void;
  onSave: (excecao: Omit<Excecao, "id" | "numero">) => void;
  editData?: Excecao | null;
}

export function ModalExcecao({ open, onClose, onSave, editData }: ModalExcecaoProps) {
  const [tipoPessoa] = useState<TipoPessoa>(editData?.tipoPessoa ?? "servidor");
  const [filtros, setFiltros] = useState(
    editData?.filtros ?? {
      orgaos: [] as string[],
      tiposVinculo: [] as string[],
      categorias: [] as string[],
      cargos: [] as string[],
      situacoesFuncionais: [] as string[],
      servidores: [] as string[],
      dataInicio: "",
      dataFim: "",
    }
  );
  const [tokens, setTokens] = useState<FormulaToken[]>(editData?.tokens ?? []);

  const updateFiltro = <K extends keyof typeof filtros>(key: K, val: (typeof filtros)[K]) => {
    setFiltros((prev) => ({ ...prev, [key]: val }));
  };

  const addToken = useCallback((token: FormulaToken) => {
    setTokens((prev) => [...prev, token]);
  }, []);

  const removeToken = useCallback((id: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearTokens = useCallback(() => setTokens([]), []);

  const reorderTokens = useCallback((newTokens: FormulaToken[]) => {
    setTokens(newTokens);
  }, []);

  const handleSave = () => {
    onSave({
      tipoPessoa,
      filtros,
      tokens,
      formulaDescritiva: buildDescriptiveFormula(tokens),
      formulaHumana: buildDescriptiveFormula(tokens),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[1400px] w-[95vw] max-h-[90vh] p-0 overflow-hidden flex flex-col bg-white border-none shadow-2xl">
        {/* Header Personalizado conforme imagem */}
        <div className="px-6 py-5 flex items-start justify-between border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Cadastrar Nova Exceção</h2>
            <p className="text-sm text-slate-500">Defina os filtros e a fórmula de cálculo específica para esta exceção.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-full h-8 w-8 -mt-1">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Seção de Filtros (Top) - Fundo cinza conforme imagem */}
            <div className="bg-[#f8fafc] rounded-xl border border-slate-200 p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <Select onValueChange={(v) => updateFiltro("cargos", [v])} value={filtros.cargos[0]}>
                    <SelectTrigger className="bg-white border-slate-200 h-11 text-slate-600">
                      <SelectValue placeholder="Selecione cargo(s)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cargosExcecao.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Select onValueChange={(v) => updateFiltro("situacoesFuncionais", [v])} value={filtros.situacoesFuncionais[0]}>
                    <SelectTrigger className="bg-white border-slate-200 h-11 text-slate-600">
                      <SelectValue placeholder="Selecione situação(ões)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {situacoesFuncionais.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Select onValueChange={(v) => updateFiltro("servidores", [v])} value={filtros.servidores[0]}>
                    <SelectTrigger className="bg-white border-slate-200 h-11 text-slate-600">
                      <SelectValue placeholder="Selecione servidor(es)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {servidores.map(s => <SelectItem key={s.id} value={s.id}>{s.matricula} - {s.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DATA INÍCIO</Label>
                  <Input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => updateFiltro("dataInicio", e.target.value)}
                    className="bg-white border-slate-200 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DATA FIM</Label>
                  <Input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => updateFiltro("dataFim", e.target.value)}
                    className="bg-white border-slate-200 h-11"
                  />
                </div>
              </div>
            </div>

            {/* Grid Inferior (2 Colunas) */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start min-w-0">
              
              {/* Esquerda: Painéis de Ferramentas */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">OPERADORES MATEMÁTICOS</h3>
                  </div>
                  <div className="p-5">
                    <OperadoresMatematicos onAddToken={addToken} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">LÓGICA</h3>
                  </div>
                  <div className="p-5">
                    <PainelLogica onAddToken={addToken} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">VALOR FIXO</h3>
                  </div>
                  <div className="p-5">
                    <PainelValorFixo onAddToken={addToken} />
                  </div>
                </div>
              </div>

              {/* Direita: Editor e Biblioteca */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">Fórmula de Exceção</h3>
                  </div>
                  <div className="p-5 flex-1">
                    <EditorFormula
                      tokens={tokens}
                      onRemoveToken={removeToken}
                      onClear={clearTokens}
                      onReorderTokens={reorderTokens}
                      hideTitle={true}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">BIBLIOTECA DE ELEMENTOS</h3>
                  </div>
                  <div className="p-0">
                    <BibliotecaElementos onAddToken={addToken} hideTitle={true} />
                  </div>
                </div>
              </div>

            </div>
        </div>

        {/* Footer conforme imagem */}
        <div className="px-6 py-5 border-t border-slate-100 bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="h-10 px-8 border-slate-200 text-slate-600 font-medium">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={tokens.length === 0}
            className="h-10 px-8 bg-slate-500 hover:bg-slate-600 text-white gap-2 font-medium"
            style={{ backgroundColor: tokens.length > 0 ? '#7c8fa1' : undefined }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Salvar Exceção
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
