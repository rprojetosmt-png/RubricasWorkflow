import React, { useState } from "react";
import { Lightbulb, Trash2, Plus } from "lucide-react";
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
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="panel-section-title !mb-0">Fórmula Principal</p>
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
          "formula-canvas mb-4 flex-1",
          tokens.length > 0 ? "active" : "empty"
        )}
      >
        {tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-2 h-full py-6">
            <Lightbulb className="w-8 h-8 text-amber-300 opacity-50" />
            <p className="text-sm font-medium">Clique nos painéis para adicionar elementos</p>
            <p className="text-xs text-slate-400 text-center max-w-[200px]">Arraste os elementos para reordenar a fórmula</p>
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

      {tokens.length > 0 && (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
          <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">Pré-visualização da Regra</p>
          <p className="font-mono text-sm text-slate-800 break-words leading-relaxed">{formulaDescritiva}</p>
        </div>
      )}

      {onCadastrarExcecao && (
        <Button
          type="button"
          variant="outline"
          disabled={excecaoDisabled || tokens.length === 0}
          onClick={onCadastrarExcecao}
          title={tokens.length === 0 ? "Crie a regra principal antes de adicionar exceções" : "Criar regra específica para um público"}
          className={cn(
            "w-full h-11 border-dashed",
            tokens.length > 0 ? "border-amber-400 text-amber-700 hover:bg-amber-50" : "opacity-50 cursor-not-allowed text-slate-400"
          )}
        >
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Nova Exceção
        </Button>
      )}
    </div>
  );
}
