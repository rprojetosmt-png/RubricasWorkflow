import { useState } from "react";
import { Search } from "lucide-react";
import { generateId, variaveis, rubricasRef, type FormulaToken } from "../../data/rubrica-data";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";

interface BibliotecaElementosProps {
  onAddToken: (token: FormulaToken) => void;
}

export function BibliotecaElementos({ onAddToken }: BibliotecaElementosProps) {
  const [activeTab, setActiveTab] = useState<"variaveis" | "rubricas">("variaveis");
  const [search, setSearch] = useState("");

  const handleTabChange = (tab: "variaveis" | "rubricas") => {
    setActiveTab(tab);
    setSearch("");
  };

  const filteredVariaveis = variaveis.filter(
    (v) =>
      v.nome.toLowerCase().includes(search.toLowerCase()) ||
      v.simbolo.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRubricas = rubricasRef.filter(
    (r) =>
      r.nome.toLowerCase().includes(search.toLowerCase()) ||
      r.codigo.includes(search)
  );

  const rubricasByType = {
    vantagem: filteredRubricas.filter((r) => r.tipo === "vantagem"),
    desconto: filteredRubricas.filter((r) => r.tipo === "desconto"),
    auxiliar: filteredRubricas.filter((r) => r.tipo === "auxiliar"),
  };

  const tipoBadgeStyle = {
    vantagem: "bg-blue-100 text-blue-700 border-blue-200",
    desconto: "bg-red-100 text-red-700 border-red-200",
    auxiliar: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const tipoLabel = {
    vantagem: "Vantagem",
    desconto: "Desconto",
    auxiliar: "Auxiliar",
  };

  return (
    <div className="space-y-3">
      <p className="panel-section-title">Biblioteca de Elementos</p>

      {/* Segmented Control */}
      <div className="flex rounded-lg p-1" style={{ backgroundColor: "#F3F5F7" }}>
        <button
          type="button"
          className={cn(
            "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === "variaveis"
              ? "bg-white shadow-sm text-slate-900"
              : "text-slate-500 hover:text-slate-700"
          )}
          onClick={() => handleTabChange("variaveis")}
        >
          Variáveis
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === "rubricas"
              ? "bg-white shadow-sm text-slate-900"
              : "text-slate-500 hover:text-slate-700"
          )}
          onClick={() => handleTabChange("rubricas")}
        >
          Rubricas
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 border-2"
        />
      </div>

      {/* Content */}
      <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
        {activeTab === "variaveis" && (
          <>
            {filteredVariaveis.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Nenhuma variável encontrada</p>
            ) : (
              filteredVariaveis.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
                  onClick={() =>
                    onAddToken({
                      id: generateId(),
                      type: "variable",
                      label: v.nome,
                      symbol: v.simbolo,
                      description: v.descricao,
                    })
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800 group-hover:text-blue-700">
                      {v.nome}
                    </span>
                    <code className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {v.simbolo}
                    </code>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{v.descricao}</p>
                </button>
              ))
            )}
          </>
        )}

        {activeTab === "rubricas" && (
          <>
            {filteredRubricas.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Nenhuma rubrica encontrada</p>
            ) : (
              (Object.keys(rubricasByType) as Array<keyof typeof rubricasByType>).map((tipo) => {
                const items = rubricasByType[tipo];
                if (items.length === 0) return null;
                return (
                  <div key={tipo} className="space-y-1">
                    <div className="flex items-center gap-2 px-2 pt-2">
                      <Badge variant="outline" className={cn("text-xs", tipoBadgeStyle[tipo])}>
                        {tipoLabel[tipo]}
                      </Badge>
                      <span className="text-xs text-slate-400">{items.length}</span>
                    </div>
                    {items.map((r) => (
                      <button
                        key={r.codigo}
                        type="button"
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all group"
                        onClick={() =>
                          onAddToken({
                            id: generateId(),
                            type: "rubrica",
                            label: r.nome,
                            symbol: r.codigo,
                            description: `Rubrica ${r.codigo} - ${r.nome}`,
                          })
                        }
                      >
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {r.codigo}
                          </code>
                          <span className="text-sm font-medium text-slate-800 group-hover:text-orange-700">
                            {r.nome}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
