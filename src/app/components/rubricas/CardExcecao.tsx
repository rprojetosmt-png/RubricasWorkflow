import { Eye, Pencil, Trash2, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useState } from "react";
import type { Excecao } from "../../data/excecao-data";
import { getFilterLabels } from "../../data/excecao-data";

export function CardExcecao({ 
  excecao, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  excecao: Excecao; 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void; 
}) {
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const filterLabels = getFilterLabels(excecao.filtros);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-slate-800">Exceção #{excecao.numero}</h4>
            <Badge variant="outline" className={
              excecao.tipoPessoa === "servidor" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-violet-50 text-violet-700 border-violet-200"
            }>
              {excecao.tipoPessoa === "servidor" ? "Servidor" : "Pessoa Física"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">{excecao.tokens.length} elementos na fórmula</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onView} className="w-8 h-8 bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 rounded-lg" title="Visualizar">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit} className="w-8 h-8 bg-amber-100 text-amber-600 hover:bg-amber-200 hover:text-amber-700 rounded-lg" title="Editar">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="w-8 h-8 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-lg" title="Excluir">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">Fórmula</p>
        <p className="font-mono text-sm text-slate-800 break-words leading-relaxed">{excecao.formulaDescritiva}</p>
      </div>

      <div>
        <button 
          onClick={() => setFiltrosOpen(!filtrosOpen)}
          className="flex items-center gap-2 text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors w-full text-left"
        >
          <Filter className="w-4 h-4" />
          Filtros Aplicados ({filterLabels.length})
          {filtrosOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
        </button>
        
        {filtrosOpen && filterLabels.length > 0 && (
          <div className="mt-2 space-y-1.5 pl-6 border-l-2 border-slate-100 ml-2">
            {filterLabels.map((f, i) => (
              <div key={i} className="text-xs">
                <span className="font-semibold text-slate-700">{f.campo}: </span>
                <span className="text-slate-600">{f.valores}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
