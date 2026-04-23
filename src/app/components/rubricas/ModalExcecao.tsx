import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { MultiSelect } from "../MultiSelect";
import { OperadoresMatematicos } from "./OperadoresMatematicos";
import { PainelLogica } from "./PainelLogica";
import { PainelValorFixo } from "./PainelValorFixo";
import { EditorFormula } from "./EditorFormula";
import { BibliotecaElementos } from "./BibliotecaElementos";
import { 
  orgaos, tiposVinculo, categorias, cargos, situacoesFuncionais, 
  type Excecao, type TipoPessoa 
} from "../../data/excecao-data";
import type { FormulaToken } from "../../data/rubrica-data";
import { nanoid } from "nanoid";

interface ModalExcecaoProps {
  open: boolean;
  onClose: () => void;
  onSave: (excecao: Partial<Excecao>) => void;
  editData?: Excecao | null;
  readOnly?: boolean;
}

export function ModalExcecao({ open, onClose, onSave, editData, readOnly }: ModalExcecaoProps) {
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>("servidor");
  const [filtros, setFiltros] = useState<Excecao["filtros"]>({
    orgaos: [], tiposVinculo: [], categorias: [], cargos: [], situacoesFuncionais: [], servidores: [], dataInicio: "", dataFim: ""
  });
  const [tokens, setTokens] = useState<FormulaToken[]>([]);

  useEffect(() => {
    if (open) {
      if (editData) {
        setTipoPessoa(editData.tipoPessoa);
        setFiltros(editData.filtros);
        setTokens(editData.tokens);
      } else {
        setTipoPessoa("servidor");
        setFiltros({ orgaos: [], tiposVinculo: [], categorias: [], cargos: [], situacoesFuncionais: [], servidores: [], dataInicio: "", dataFim: "" });
        setTokens([]);
      }
    }
  }, [open, editData]);

  const handleSave = () => {
    onSave({
      id: editData?.id || nanoid(),
      tipoPessoa,
      filtros,
      tokens,
      formulaDescritiva: tokens.map(t => t.symbol).join(" "),
      formulaHumana: tokens.map(t => t.label).join(" ")
    });
  };

  const handleAddToken = (token: FormulaToken) => {
    if (readOnly) return;
    setTokens(prev => [...prev, token]);
  };

  const handleRemoveToken = (id: string) => {
    if (readOnly) return;
    setTokens(prev => prev.filter(t => t.id !== id));
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    if (readOnly) return;
    setTokens(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(dragIndex, 1);
      result.splice(hoverIndex, 0, removed);
      return result;
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-[95vw] w-[1400px] max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50">
        <DialogHeader className="px-6 py-4 bg-white border-b border-slate-200">
          <DialogTitle className="text-xl text-slate-800">
            {readOnly ? "Visualizar Exceção" : editData ? "Editar Exceção" : "Cadastrar Nova Exceção"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="panel-section-title">Público Alvo (Filtros)</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Tipo de Pessoa</Label>
                <RadioGroup 
                  disabled={readOnly}
                  value={tipoPessoa} 
                  onValueChange={(v) => setTipoPessoa(v as TipoPessoa)} 
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2"><RadioGroupItem value="servidor" id="tipo-servidor" /><Label htmlFor="tipo-servidor">Servidor</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="pessoa_fisica" id="tipo-pf" /><Label htmlFor="tipo-pf">Pessoa Física</Label></div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Órgãos <span className="text-red-500">*</span></Label>
                  <MultiSelect 
                    options={orgaos.map(o => ({ label: o.label, value: o.id }))} 
                    selected={filtros.orgaos} 
                    onChange={v => !readOnly && setFiltros(f => ({ ...f, orgaos: v }))} 
                    placeholder="Selecione..." 
                    className={readOnly ? "pointer-events-none opacity-80" : ""}
                  />
                </div>

                {tipoPessoa === "servidor" && (
                  <div className="space-y-1.5">
                    <Label>Tipos de Vínculo <span className="text-red-500">*</span></Label>
                    <MultiSelect 
                      options={tiposVinculo.map(o => ({ label: o.label, value: o.id }))} 
                      selected={filtros.tiposVinculo} 
                      onChange={v => !readOnly && setFiltros(f => ({ ...f, tiposVinculo: v }))} 
                      placeholder="Selecione..." 
                      className={readOnly ? "pointer-events-none opacity-80" : ""}
                    />
                  </div>
                )}

                {tipoPessoa === "servidor" && (
                  <div className="space-y-1.5">
                    <Label>Categorias <span className="text-red-500">*</span></Label>
                    <MultiSelect 
                      options={categorias.map(o => ({ label: o.label, value: o.id }))} 
                      selected={filtros.categorias} 
                      onChange={v => !readOnly && setFiltros(f => ({ ...f, categorias: v }))} 
                      placeholder="Selecione..." 
                      className={readOnly ? "pointer-events-none opacity-80" : ""}
                    />
                  </div>
                )}

                {tipoPessoa === "servidor" && (
                  <div className="space-y-1.5">
                    <Label>Cargos <span className="text-red-500">*</span></Label>
                    <MultiSelect 
                      options={cargos.map(o => ({ label: o.label, value: o.id }))} 
                      selected={filtros.cargos} 
                      onChange={v => !readOnly && setFiltros(f => ({ ...f, cargos: v }))} 
                      placeholder="Selecione..." 
                      className={readOnly ? "pointer-events-none opacity-80" : ""}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Situações Funcionais <span className="text-red-500">*</span></Label>
                  <MultiSelect 
                    options={situacoesFuncionais.map(o => ({ label: o.label, value: o.id }))} 
                    selected={filtros.situacoesFuncionais} 
                    onChange={v => !readOnly && setFiltros(f => ({ ...f, situacoesFuncionais: v }))} 
                    placeholder="Selecione..." 
                    className={readOnly ? "pointer-events-none opacity-80" : ""}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 min-h-[500px]">
            <div className="flex flex-col gap-4 overflow-y-auto pr-1">
              {!readOnly && (
                <>
                  <OperadoresMatematicos onAddToken={handleAddToken} />
                  <PainelLogica onAddToken={handleAddToken} />
                  <PainelValorFixo onAddToken={handleAddToken} />
                </>
              )}
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-1">
              <div className="flex-1 h-full">
                <EditorFormula 
                  tokens={tokens}
                  onRemoveToken={handleRemoveToken}
                  onClear={() => !readOnly && setTokens([])}
                  onReorder={handleReorder}
                />
              </div>
            </div>
            {!readOnly && (
              <div className="hidden xl:block overflow-y-auto pr-1 absolute right-6 top-[280px] w-[320px] bottom-[80px]">
                <BibliotecaElementos onAddToken={handleAddToken} />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 mt-auto">
          <Button variant="outline" onClick={onClose}>
            {readOnly ? "Fechar" : "Cancelar"}
          </Button>
          {!readOnly && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handleSave}
              disabled={tokens.length === 0}
            >
              Salvar Exceção
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
