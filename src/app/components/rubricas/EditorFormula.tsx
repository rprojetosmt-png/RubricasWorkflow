import React, { useState } from "react";
import { Lightbulb, Trash2, Plus, Sigma, Circle } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import type { FormulaToken } from "../../data/rubrica-data";

export interface EditorFormulaProps {
  tokens: FormulaToken[];
  onRemoveToken: (id: string) => void;
  onClear: () => void;
  onCadastrarExcecao?: () => void;
  excecaoDisabled?: boolean;
  onReorder?: (dragIndex: number, hoverIndex: number) => void;
}

export function EditorFormula({
  tokens,
  onRemoveToken,
  onClear,
  onCadastrarExcecao,
  excecaoDisabled,
  onReorder
}: EditorFormulaProps) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (idx !== draggedIdx) setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== idx && onReorder) {
      onReorder(draggedIdx, idx);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const formulaDescritiva = tokens.map((t) => t.symbol).join(" ");

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-blue-700">
          <Sigma className="w-5 h-5" />
          <p className="font-bold">Fórmula Atual</p>
        </div>
        <div className="flex gap-2">
          {onClear && tokens.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Limpar
            </Button>
          )}
        </div>
      </div>

      <div 
        className={cn(
          "formula-canvas mb-4",
          tokens.length > 0 ? "active" : "empty"
        )}
      >
        {tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-2 h-full py-8">
            <Lightbulb className="w-8 h-8 text-slate-300 opacity-70" />
            <p className="text-sm font-medium">Clique nos elementos e operadores para construir sua fórmula</p>
          </div>
        ) : (
          tokens.map((token, idx) => (
            <div
              key={token.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              onClick={() => onRemoveToken(token.id)}
              className={cn(
                "formula-token token-enter",
                `formula-token-${token.type === "paren" ? "operator" : token.type}`,
                dragOverIdx === idx && "ring-2 ring-blue-500 scale-105",
                draggedIdx === idx && "opacity-50"
              )}
              title="Clique para remover. Arraste para reordenar."
            >
              {token.label}
              <Trash2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 mb-3 text-sm text-slate-500 font-medium">
        <Circle className="w-4 h-4" />
        {tokens.length === 0 ? "Fórmula Vazia" : "Fórmula Preenchida"}
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
        <p className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Fórmula Descritiva</p>
        <p className="font-mono text-sm text-slate-800 break-words leading-relaxed min-h-[20px]">
          {tokens.length === 0 ? "—" : formulaDescritiva}
        </p>
      </div>

      <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 mb-6 flex gap-3 items-start">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-amber-800 text-xs leading-relaxed font-medium">
          <strong className="font-bold text-amber-900">Dica:</strong> Use as variáveis do sistema (ex: Salário Base), operadores matemáticos (+, -, *, /) e condicionais (SE/ENTÃO) para montar a regra de cálculo desta rubrica.
        </p>
      </div>

      {onCadastrarExcecao && (
        <div className="mt-auto pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={excecaoDisabled || tokens.length === 0}
            onClick={onCadastrarExcecao}
            className="w-full h-11 border-slate-300 text-slate-600 hover:bg-slate-50 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Nova Exceção
          </Button>
        </div>
      )}
    </div>
  );
}
