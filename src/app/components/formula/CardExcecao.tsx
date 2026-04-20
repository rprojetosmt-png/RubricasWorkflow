import { useState } from "react";
import { Eye, Pencil, Trash2, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { type Excecao, getFilterLabels } from "../../data/excecao-data";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

interface CardExcecaoProps {
  excecao: Excecao;
  onView: (excecao: Excecao) => void;
  onEdit: (excecao: Excecao) => void;
  onDelete: (id: string) => void;
}

export function CardExcecao({ excecao, onView, onEdit, onDelete }: CardExcecaoProps) {
  const [showFilters, setShowFilters] = useState(false);
  const filterLabels = getFilterLabels(excecao.filtros);
  const filterCount = filterLabels.length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden token-enter">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-800">Exceção #{excecao.numero}</span>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              excecao.tipoPessoa === "servidor"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-violet-50 text-violet-700 border-violet-200"
            )}
          >
            {excecao.tipoPessoa === "servidor" ? "Servidor" : "Pessoa Física"}
          </Badge>
          <span className="text-xs text-slate-400">{excecao.tokens.length} elementos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="icon"
            className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => onView(excecao)}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => onEdit(excecao)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white"
            onClick={() => onDelete(excecao.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Fórmula</p>
        <p className="font-mono text-sm text-slate-700 bg-slate-50 rounded px-2 py-1.5 border border-slate-100">
          {excecao.formulaDescritiva || "—"}
        </p>
      </div>

      {/* Filtros */}
      {filterCount > 0 && (
        <div className="px-4 pb-3">
          <button
            type="button"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3 h-3" />
            <span>Filtros Aplicados ({filterCount})</span>
            {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showFilters && (
            <div className="mt-2 space-y-1.5">
              {filterLabels.map((f, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="font-semibold text-slate-600 shrink-0">{f.campo}:</span>
                  <span className="text-slate-500">{f.valores}</span>
                </div>
              ))}
            </div>
          )}
          {!showFilters && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {filterLabels.slice(0, 3).map((f, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-slate-50">
                  {f.campo}: {f.valores.length > 30 ? f.valores.slice(0, 30) + "…" : f.valores}
                </Badge>
              ))}
              {filterCount > 3 && (
                <Badge variant="outline" className="text-xs bg-slate-50">+{filterCount - 3}</Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
