import { useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

type Option = {
  id: string;
  label: string;
};

const INSTITUICOES: Option[] = [
  { id: "govmt", label: "Governo do Estado de Mato Grosso" },
  { id: "empaer", label: "Empresa Mato-grossense de Pesquisa, Assistência e Extensão Rural" },
  { id: "mti", label: "Empresa Mato-grossense de Tecnologia da Informação" },
  { id: "mtgas", label: "Companhia Mato-grossense de Gás" },
  { id: "sanemat", label: "Companhia de Saneamento do Estado de Mato Grosso" },
  { id: "mt_par", label: "MT Participações e Projetos S.A." },
  { id: "metamat", label: "Companhia Mato-grossense de Mineração" },
];

const ORGAOS_GOVMT: Option[] = [
  { id: "casa-civil", label: "Casa Civil do Estado de Mato Grosso" },
  { id: "cge", label: "Controladoria Geral do Estado (CGE-MT)" },
  { id: "pge", label: "Procuradoria Geral do Estado (PGE-MT)" },
  { id: "sefaz", label: "Secretaria de Estado de Fazenda (SEFAZ-MT)" },
  { id: "setasc", label: "Secretaria de Estado de Assistência Social e Cidadania (SETASC-MT)" },
  { id: "detran", label: "Departamento Estadual de Trânsito (DETRAN-MT)" },
  { id: "sesp", label: "Secretaria de Estado de Segurança Pública (SESP-MT)" },
  { id: "pm", label: "Polícia Militar do Estado de Mato Grosso" },
  { id: "pjc", label: "Polícia Judiciária Civil (PJC-MT)" },
  { id: "cbm", label: "Corpo de Bombeiros Militar (CBM-MT)" },
  { id: "seaf", label: "Secretaria de Estado de Agricultura Familiar (SEAF-MT)" },
  { id: "intermat", label: "Instituto de Terras de Mato Grosso (INTERMAT)" },
  { id: "indea", label: "Instituto de Defesa Agropecuária do Estado de MT (INDEA-MT)" },
  { id: "seduc", label: "Secretaria de Estado de Educação (SEDUC-MT)" },
  { id: "seciteci", label: "Secretaria de Estado de Ciência, Tecnologia e Inovação (SECITECI-MT)" },
  { id: "ses", label: "Secretaria de Estado de Saúde (SES-MT)" },
  { id: "seplag", label: "Secretaria de Estado de Planejamento e Gestão (SEPLAG-MT)" },
  { id: "sema", label: "Secretaria de Estado de Meio Ambiente (SEMA-MT)" },
  { id: "secom", label: "Secretaria de Estado de Comunicação (SECOM-MT)" },
  { id: "politec", label: "Perícia Oficial e Identificação Técnica (POLITEC-MT)" },
];

function PickList({
  titleAvailable,
  titleSelected,
  available,
  selected,
  onChange,
  searchPlaceholder,
}: {
  titleAvailable: string;
  titleSelected: string;
  available: Option[];
  selected: Option[];
  onChange: (next: Option[]) => void;
  searchPlaceholder: string;
}) {
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [leftMarked, setLeftMarked] = useState<string[]>([]);
  const [rightMarked, setRightMarked] = useState<string[]>([]);

  const leftFiltered = useMemo(
    () => available.filter((item) => item.label.toLowerCase().includes(leftSearch.toLowerCase())),
    [available, leftSearch]
  );

  const rightFiltered = useMemo(
    () => selected.filter((item) => item.label.toLowerCase().includes(rightSearch.toLowerCase())),
    [selected, rightSearch]
  );

  const moveSelectedToRight = () => {
    const moving = available.filter((item) => leftMarked.includes(item.id));
    onChange([...selected, ...moving]);
    setLeftMarked([]);
  };

  const moveAllToRight = () => {
    onChange([...selected, ...available]);
    setLeftMarked([]);
  };

  const moveSelectedToLeft = () => {
    onChange(selected.filter((item) => !rightMarked.includes(item.id)));
    setRightMarked([]);
  };

  const moveAllToLeft = () => {
    onChange([]);
    setRightMarked([]);
  };

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
      <div className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">{titleAvailable}</div>
        <div className="p-3">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
            placeholder={searchPlaceholder}
            value={leftSearch}
            onChange={(e) => setLeftSearch(e.target.value)}
          />
        </div>
        <div className="max-h-72 overflow-y-auto px-2 pb-2">
          {leftFiltered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setLeftMarked((prev) =>
                  prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                )
              }
              className={`mb-1 w-full rounded px-3 py-2 text-left text-sm ${
                leftMarked.includes(item.id) ? "bg-sky-100 text-sky-900" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2">
        <button type="button" onClick={moveSelectedToRight} className="rounded bg-sky-500 px-3 py-1.5 text-white hover:bg-sky-600">{">"}</button>
        <button type="button" onClick={moveAllToRight} className="rounded bg-sky-500 px-3 py-1.5 text-white hover:bg-sky-600">{">>"}</button>
        <button type="button" onClick={moveSelectedToLeft} className="rounded bg-sky-500 px-3 py-1.5 text-white hover:bg-sky-600">{"<"}</button>
        <button type="button" onClick={moveAllToLeft} className="rounded bg-sky-500 px-3 py-1.5 text-white hover:bg-sky-600">{"<<"}</button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">{titleSelected}</div>
        <div className="p-3">
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
            placeholder={searchPlaceholder}
            value={rightSearch}
            onChange={(e) => setRightSearch(e.target.value)}
          />
        </div>
        <div className="max-h-72 overflow-y-auto px-2 pb-2">
          {rightFiltered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setRightMarked((prev) =>
                  prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                )
              }
              className={`mb-1 w-full rounded px-3 py-2 text-left text-sm ${
                rightMarked.includes(item.id) ? "bg-sky-100 text-sky-900" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ComponentesPage() {
  const [instituicoesSelecionadas, setInstituicoesSelecionadas] = useState<Option[]>([]);
  const [orgaosGovmtSelecionados, setOrgaosGovmtSelecionados] = useState<Option[]>([]);

  const instituicoesDisponiveis = useMemo(
    () => INSTITUICOES.filter((item) => !instituicoesSelecionadas.some((selected) => selected.id === item.id)),
    [instituicoesSelecionadas]
  );

  const mostrarOrgaosGovmt = instituicoesSelecionadas.some((item) => item.id === "govmt");

  const orgaosGovmtDisponiveis = useMemo(
    () => ORGAOS_GOVMT.filter((item) => !orgaosGovmtSelecionados.some((selected) => selected.id === item.id)),
    [orgaosGovmtSelecionados]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Componentes</h1>
        <p className="text-sm text-slate-600">Gerencie instituições e órgãos vinculados.</p>
      </div>

      <Accordion type="multiple" defaultValue={["instituicoes", "orgaos-govmt"]} className="rounded-lg border border-slate-200 bg-slate-50 px-4">
        <AccordionItem value="instituicoes" className="border-slate-200">
          <AccordionTrigger className="text-base text-slate-800 hover:no-underline">
            Instituições
          </AccordionTrigger>
          <AccordionContent>
            <PickList
              titleAvailable="Instituições disponíveis"
              titleSelected="Instituições selecionadas"
              available={instituicoesDisponiveis}
              selected={instituicoesSelecionadas}
              onChange={(next) => {
                setInstituicoesSelecionadas(next);
                if (!next.some((item) => item.id === "govmt")) {
                  setOrgaosGovmtSelecionados([]);
                }
              }}
              searchPlaceholder="Procurar por instituição"
            />
          </AccordionContent>
        </AccordionItem>

        {mostrarOrgaosGovmt && (
          <AccordionItem value="orgaos-govmt" className="border-slate-200">
            <AccordionTrigger className="text-base text-slate-800 hover:no-underline">
              Órgãos do GOVMT
            </AccordionTrigger>
            <AccordionContent>
              <PickList
                titleAvailable="Órgãos disponíveis"
                titleSelected="Órgãos selecionados"
                available={orgaosGovmtDisponiveis}
                selected={orgaosGovmtSelecionados}
                onChange={setOrgaosGovmtSelecionados}
                searchPlaceholder="Procurar por órgão"
              />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
