import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { type Excecao } from "../../data/excecao-data";
import { CardExcecao } from "./CardExcecao";
import { Badge } from "../ui/badge";

interface ExcecoesContainerProps {
  excecoes: Excecao[];
  onView: (excecao: Excecao) => void;
  onEdit: (excecao: Excecao) => void;
  onDelete: (id: string) => void;
}

export function ExcecoesContainer({ excecoes, onView, onEdit, onDelete }: ExcecoesContainerProps) {
  const [expanded, setExpanded] = useState(true);

  if (excecoes.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-200 hover:bg-amber-100/60 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-bold text-amber-800">Exceções Cadastradas</span>
          <Badge className="bg-amber-200 text-amber-800 border-amber-300 hover:bg-amber-200">
            {excecoes.length}
          </Badge>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-amber-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-600" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-4 py-3 space-y-3">
          {excecoes.map((exc) => (
            <CardExcecao
              key={exc.id}
              excecao={exc}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
