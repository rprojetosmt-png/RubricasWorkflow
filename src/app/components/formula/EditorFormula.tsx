import { useState, useCallback } from "react";
import { Lightbulb, X, Trash2, GripVertical, AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { type FormulaToken, validateFormula, buildDescriptiveFormula } from "../../data/rubrica-data";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface EditorFormulaProps {
  tokens: FormulaToken[];
  onRemoveToken: (id: string) => void;
  onClear: () => void;
  onReorderTokens?: (tokens: FormulaToken[]) => void;
  onCadastrarExcecao?: () => void;
  excecaoDisabled?: boolean;
  hideTitle?: boolean;
}

export function EditorFormula({
  tokens,
  onRemoveToken,
  onClear,
  onReorderTokens,
  onCadastrarExcecao,
  excecaoDisabled = true,
  hideTitle = false,
}: EditorFormulaProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const status = validateFormula(tokens);
  const descriptive = buildDescriptiveFormula(tokens);
  const isEmpty = tokens.length === 0;

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [dragIndex]
  );

  const handleDrop = useCallback(
    (index: number) => {
      if (dragIndex !== null && dragIndex !== index && onReorderTokens) {
        const newTokens = [...tokens];
        const [moved] = newTokens.splice(dragIndex, 1);
        newTokens.splice(index, 0, moved);
        onReorderTokens(newTokens);
      }
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, tokens, onReorderTokens]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const getTokenClass = (type: FormulaToken["type"]) => {
    switch (type) {
      case "variable": return "formula-token formula-token-variable";
      case "operator": return "formula-token formula-token-operator";
      case "logic":    return "formula-token formula-token-logic";
      case "value":    return "formula-token formula-token-value";
      case "rubrica":  return "formula-token formula-token-rubrica";
      case "paren":    return "formula-token formula-token-paren";
      default:         return "formula-token";
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      {!hideTitle && (
        <div className="flex items-center justify-between">
          <p className="panel-section-title mb-0">Fórmula de Cálculo</p>
          {!isEmpty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-7 gap-1"
              onClick={onClear}
            >
              <Trash2 className="w-3 h-3" />
              Limpar
            </Button>
          )}
        </div>
      )}

      {/* Canvas */}
      <div
        className={cn(
          "formula-canvas",
          !isEmpty && "active",
          isEmpty && "empty"
        )}
      >
        {isEmpty ? (
          <div className="flex flex-col items-center gap-2 text-center py-8">
            <Lightbulb className="w-10 h-10 text-slate-300" />
            <p className="text-sm text-slate-400">
              Clique nos elementos para construir a fórmula de exceção
            </p>
          </div>
        ) : (
          tokens.map((token, index) => (
            <div
              key={token.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              className={cn(
                getTokenClass(token.type),
                "cursor-grab active:cursor-grabbing group token-enter",
                dragOverIndex === index && "ring-2 ring-blue-500"
              )}
              onClick={() => onRemoveToken(token.id)}
              title={`${token.description || token.label} — clique para remover`}
            >
              <GripVertical className="w-3 h-3 opacity-30 group-hover:opacity-60" />
              <span>{token.symbol}</span>
              <X className="w-3 h-3 opacity-0 group-hover:opacity-100 text-red-500 transition-opacity" />
            </div>
          ))
        )}
      </div>

      {/* DESCRIÇÃO (Fórmula descritiva) */}
      <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
          DESCRIÇÃO
        </p>
        <p className="text-sm text-slate-600 min-h-[1.5rem]">
          {isEmpty ? "—" : descriptive}
        </p>
      </div>

      {/* Status de validação */}
      {!isEmpty && (
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
            status === "valid" && "bg-green-50 text-green-700 border border-green-200",
            status === "invalid" && "bg-red-50 text-red-700 border border-red-200",
            status === "incomplete" && "bg-amber-50 text-amber-700 border border-amber-200"
          )}
        >
          {status === "valid" && <CheckCircle2 className="w-4 h-4" />}
          {status === "invalid" && <AlertTriangle className="w-4 h-4" />}
          {status === "incomplete" && <AlertTriangle className="w-4 h-4" />}
          <span>
            {status === "valid" && "Fórmula válida"}
            {status === "invalid" && "Parênteses desbalanceados"}
            {status === "incomplete" && "Fórmula incompleta — não pode terminar em operador"}
          </span>
        </div>
      )}

      {/* Dica */}
      <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800">
          <strong>Dica:</strong> Clique em um token para removê-lo. Arraste para reordenar.
          Use exceções para definir fórmulas diferenciadas por grupo de servidores.
        </p>
      </div>

      {/* Botão Cadastrar Exceção */}
      {onCadastrarExcecao && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full h-10 gap-2",
                    !excecaoDisabled
                      ? "border-amber-400 text-amber-700 hover:bg-amber-50"
                      : "opacity-50 cursor-not-allowed"
                  )}
                  disabled={excecaoDisabled}
                  onClick={onCadastrarExcecao}
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar Nova Exceção
                </Button>
              </div>
            </TooltipTrigger>
            {excecaoDisabled && (
              <TooltipContent>
                <p className="text-xs">Monte a fórmula principal antes de cadastrar exceções.</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
