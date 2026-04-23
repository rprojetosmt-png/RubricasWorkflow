import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { nanoid } from "nanoid";
import { variaveis, rubricasRef } from "../../data/rubrica-data";

export function BibliotecaElementos({ onAddToken }: { onAddToken: (token: any) => void }) {
  const [busca, setBusca] = useState("");
  const [activeTab, setActiveTab] = useState("variaveis");

  const variaveisFiltradas = variaveis.filter((v) => 
    v.nome.toLowerCase().includes(busca.toLowerCase()) || 
    v.simbolo.toLowerCase().includes(busca.toLowerCase())
  );

  const rubricasFiltradas = rubricasRef.filter((r) => 
    r.nome.toLowerCase().includes(busca.toLowerCase()) || 
    r.codigo.includes(busca)
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-full max-h-[600px]">
      <p className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-4">Biblioteca de Elementos</p>
      
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setBusca(""); }} className="flex-1 flex flex-col min-h-0 mt-0">
        <TabsList className="w-full bg-slate-50 p-1 rounded-full border border-slate-200">
          <TabsTrigger value="variaveis" className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold h-8">
            Variáveis <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{variaveis.length}</span>
          </TabsTrigger>
          <TabsTrigger value="rubricas" className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold h-8">
            Rubricas <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{rubricasRef.length}</span>
          </TabsTrigger>
        </TabsList>

        <div className="relative mt-4 mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={activeTab === "variaveis" ? "Buscar variável..." : "Buscar rubrica..."} 
            className="pl-9 h-10 bg-white border-slate-200"
          />
        </div>

        <TabsContent value="variaveis" className="flex-1 overflow-y-auto min-h-0 pr-1 mt-0">
          <div className="space-y-2 pb-2">
            {variaveisFiltradas.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">Nenhuma variável encontrada.</p>
            ) : (
              variaveisFiltradas.map((v) => (
                <div 
                  key={v.id} 
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  onClick={() => onAddToken({ id: nanoid(), type: "variable", label: v.nome, symbol: v.simbolo, description: v.descricao })}
                >
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-800">{v.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{v.simbolo}</span>
                    <span className="text-xs text-slate-500 truncate">{v.descricao}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rubricas" className="flex-1 overflow-y-auto min-h-0 pr-1 mt-0">
          <div className="space-y-2 pb-2">
            {rubricasFiltradas.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">Nenhuma rubrica encontrada.</p>
            ) : (
              rubricasFiltradas.map((r) => (
                <div 
                  key={r.codigo} 
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 cursor-pointer transition-colors group"
                  onClick={() => onAddToken({ id: nanoid(), type: "rubrica", label: r.nome, symbol: `RUB_${r.codigo}` })}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-orange-800 leading-tight">{r.nome}</p>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">{r.codigo}</span>
                  </div>
                  <div className="mt-1.5">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      r.tipo === 'vantagem' ? 'bg-blue-100 text-blue-700' :
                      r.tipo === 'desconto' ? 'bg-red-100 text-red-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {r.tipo}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
