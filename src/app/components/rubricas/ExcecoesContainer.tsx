import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../ui/badge";
import { CardExcecao } from "./CardExcecao";
import type { Excecao } from "../../data/excecao-data";

export function ExcecoesContainer({ 
  excecoes, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  excecoes: Excecao[];
  onView: (e: Excecao) => void;
  onEdit: (e: Excecao) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  if (excecoes.length === 0) return null;

  return (
    <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-slate-800">Exceções Cadastradas</h3>
          <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-200">
            {excecoes.length}
          </Badge>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </button>
      
      {expanded && (
        <div className="p-4 space-y-4 bg-slate-50/50 border-t border-slate-200">
          {excecoes.map((exc) => (
            <CardExcecao 
              key={exc.id} 
              excecao={exc} 
              onView={() => onView(exc)}
              onEdit={() => onEdit(exc)}
              onDelete={() => onDelete(exc.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
