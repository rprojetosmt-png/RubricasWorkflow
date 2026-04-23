import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../ui/badge";
import { rubricaData } from "../../data/rubrica-data";

export function InformacoesGeraisCard() {
  const [expanded, setExpanded] = useState(false);
  const data = rubricaData;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-800">
              {data.codigo} — {data.informacoesGerais.nome}
            </h3>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">{data.informacoesGerais.tipo}</Badge>
          </div>
          <p className="text-sm text-slate-500">{data.informacoesGerais.orgao}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
          Ver Detalhes
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Informações Gerais</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold text-slate-700">Nome:</span> {data.informacoesGerais.nome}</p>
              <p><span className="font-semibold text-slate-700">Responsável:</span> {data.informacoesGerais.servidorResponsavel}</p>
              <p><span className="font-semibold text-slate-700">Data Início:</span> {data.informacoesGerais.dataInicio}</p>
              <p><span className="font-semibold text-slate-700">PAOE:</span> {data.informacoesGerais.paoe}</p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Classificação Trabalhista</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold text-slate-700">Grupo:</span> {data.informacoesGerais.grupoTrabalhista}</p>
              <p><span className="font-semibold text-slate-700">Categoria:</span> {data.informacoesGerais.categoriaTrabalhista}</p>
              <p><span className="font-semibold text-slate-700">Cargos Vinculados:</span> {data.informacoesGerais.cargosVinculados.join(", ")}</p>
              <p><span className="font-semibold text-slate-700">Base Legal:</span> {data.informacoesGerais.baseLegal}</p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Regras e Natureza</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold text-slate-700">Natureza:</span> {data.naturezaVerba.natureza}</p>
              <p><span className="font-semibold text-slate-700">Caráter:</span> {data.naturezaVerba.carater}</p>
              <p><span className="font-semibold text-slate-700">Reter Teto:</span> {data.naturezaVerba.reterTeto ? "Sim" : "Não"}</p>
              <div className="flex gap-2 flex-wrap mt-2">
                {data.incidencias.gratificacaoNatalina && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Incide Natalina</Badge>}
                {data.incidencias.tercoFerias && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Incide Férias</Badge>}
                {data.incidenciaTributaria.temIncidencia && data.incidenciaTributaria.tributos.map(t => (
                  <Badge key={t} variant="outline" className="bg-red-50 text-red-700 border-red-200">Incide {t}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
