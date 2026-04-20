import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import {
  type Excecao,
  type TipoPessoa,
  orgaosExcecao,
  tiposVinculo,
  categoriasExcecao,
  cargosExcecao,
  situacoesFuncionais,
  servidores,
} from "../../data/excecao-data";
import {
  type FormulaToken,
  generateId,
  buildDescriptiveFormula,
} from "../../data/rubrica-data";
import { OperadoresMatematicos } from "./OperadoresMatematicos";
import { PainelLogica } from "./PainelLogica";
import { PainelValorFixo } from "./PainelValorFixo";
import { EditorFormula } from "./EditorFormula";
import { BibliotecaElementos } from "./BibliotecaElementos";
import { ScrollArea } from "../ui/scroll-area";

interface ModalExcecaoProps {
  open: boolean;
  onClose: () => void;
  onSave: (excecao: Omit<Excecao, "id" | "numero">) => void;
  editData?: Excecao | null;
}

function MultiCheckSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="rounded-md border border-slate-200 p-2 max-h-[140px] overflow-y-auto space-y-1">
        {options.map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 px-1 py-0.5 rounded">
            <Checkbox
              checked={value.includes(opt.id)}
              onCheckedChange={(checked) =>
                checked
                  ? onChange([...value, opt.id])
                  : onChange(value.filter((v) => v !== opt.id))
              }
            />
            <span className="text-slate-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ModalExcecao({ open, onClose, onSave, editData }: ModalExcecaoProps) {
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>(editData?.tipoPessoa ?? "servidor");
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
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{editData ? "Editar Exceção" : "Cadastrar Exceção"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">
            {/* Tipo de Pessoa */}
            <div className="space-y-2">
              <Label className="text-sm font-bold">Tipo de Pessoa</Label>
              <RadioGroup
                value={tipoPessoa}
                onValueChange={(v) => setTipoPessoa(v as TipoPessoa)}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="servidor" id="exc-servidor" />
                  <Label htmlFor="exc-servidor" className="font-normal cursor-pointer">Servidor</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="pessoa_fisica" id="exc-pf" />
                  <Label htmlFor="exc-pf" className="font-normal cursor-pointer">Pessoa Física</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Filtros */}
            <div className="space-y-3">
              <Label className="text-sm font-bold">Filtros</Label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <MultiCheckSelect
                  label="Órgão"
                  options={orgaosExcecao}
                  value={filtros.orgaos}
                  onChange={(v) => updateFiltro("orgaos", v)}
                />
                {tipoPessoa === "servidor" && (
                  <>
                    <MultiCheckSelect
                      label="Tipo de Vínculo"
                      options={tiposVinculo}
                      value={filtros.tiposVinculo}
                      onChange={(v) => updateFiltro("tiposVinculo", v)}
                    />
                    <MultiCheckSelect
                      label="Categoria"
                      options={categoriasExcecao}
                      value={filtros.categorias}
                      onChange={(v) => updateFiltro("categorias", v)}
                    />
                    <MultiCheckSelect
                      label="Cargo"
                      options={cargosExcecao}
                      value={filtros.cargos}
                      onChange={(v) => updateFiltro("cargos", v)}
                    />
                  </>
                )}
                <MultiCheckSelect
                  label="Situação Funcional"
                  options={situacoesFuncionais}
                  value={filtros.situacoesFuncionais}
                  onChange={(v) => updateFiltro("situacoesFuncionais", v)}
                />
                {tipoPessoa === "servidor" && (
                  <MultiCheckSelect
                    label="Pessoa"
                    options={servidores.map((s) => ({ id: s.id, label: `${s.matricula} - ${s.nome}` }))}
                    value={filtros.servidores}
                    onChange={(v) => updateFiltro("servidores", v)}
                  />
                )}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Data Início</Label>
                  <Input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => updateFiltro("dataInicio", e.target.value)}
                    className="h-9 border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Data Fim</Label>
                  <Input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => updateFiltro("dataFim", e.target.value)}
                    className="h-9 border-2"
                  />
                </div>
              </div>
            </div>

            {/* Editor de Fórmula */}
            <div className="space-y-3">
              <Label className="text-sm font-bold">Fórmula da Exceção</Label>
              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
                <div className="space-y-4">
                  <OperadoresMatematicos onAddToken={addToken} />
                  <PainelLogica onAddToken={addToken} />
                  <PainelValorFixo onAddToken={addToken} />
                </div>
                <div className="space-y-4">
                  <EditorFormula
                    tokens={tokens}
                    onRemoveToken={removeToken}
                    onClear={clearTokens}
                    onReorderTokens={reorderTokens}
                  />
                  <BibliotecaElementos onAddToken={addToken} />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-blue-700 hover:bg-blue-800"
            disabled={tokens.length === 0}
            onClick={handleSave}
          >
            Salvar Exceção
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
