import { useState } from "react";
import { Undo2 } from "lucide-react";
import { Button } from "../ui/button";
import { InformacoesGeraisCard } from "./InformacoesGeraisCard";
import { OperadoresMatematicos } from "./OperadoresMatematicos";
import { PainelLogica } from "./PainelLogica";
import { PainelValorFixo } from "./PainelValorFixo";
import { EditorFormula } from "./EditorFormula";
import { BibliotecaElementos } from "./BibliotecaElementos";
import { ExcecoesContainer } from "./ExcecoesContainer";
import { ModalExcecao } from "./ModalExcecao";
import type { FormulaToken } from "../../data/rubrica-data";
import type { Excecao } from "../../data/excecao-data";

export function RubricaEditorContainer() {
  const [tokens, setTokens] = useState<FormulaToken[]>([]);
  const [history, setHistory] = useState<FormulaToken[][]>([]);
  const [excecoes, setExcecoes] = useState<Excecao[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExcecao, setEditingExcecao] = useState<Excecao | null>(null);
  const [viewingExcecao, setViewingExcecao] = useState<Excecao | null>(null);

  const saveHistory = () => {
    setHistory((prev) => [...prev, [...tokens]]);
  };

  const handleAddToken = (token: FormulaToken) => {
    saveHistory();
    setTokens((prev) => [...prev, token]);
  };

  const handleRemoveToken = (id: string) => {
    saveHistory();
    setTokens((prev) => prev.filter((t) => t.id !== id));
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    saveHistory();
    setTokens(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(dragIndex, 1);
      result.splice(hoverIndex, 0, removed);
      return result;
    });
  };

  const handleClear = () => {
    if (tokens.length === 0) return;
    saveHistory();
    setTokens([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setTokens(previous);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleOpenExcecao = () => {
    setEditingExcecao(null);
    setViewingExcecao(null);
    setModalOpen(true);
  };

  const handleViewExcecao = (exc: Excecao) => {
    setEditingExcecao(null);
    setViewingExcecao(exc);
    setModalOpen(true);
  };

  const handleEditExcecao = (exc: Excecao) => {
    setViewingExcecao(null);
    setEditingExcecao(exc);
    setModalOpen(true);
  };

  const handleDeleteExcecao = (id: string) => {
    setExcecoes((prev) => prev.filter(e => e.id !== id).map((e, idx) => ({ ...e, numero: idx + 1 })));
  };

  const handleSaveExcecao = (excecao: Partial<Excecao>) => {
    if (editingExcecao) {
      setExcecoes(prev => prev.map(e => e.id === excecao.id ? { ...e, ...excecao } as Excecao : e));
    } else {
      setExcecoes(prev => [...prev, { ...excecao, numero: prev.length + 1 } as Excecao]);
    }
    setModalOpen(false);
    setEditingExcecao(null);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <InformacoesGeraisCard />
      
      <div className="flex items-center justify-between mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0">
            <span className="font-mono font-bold text-lg">{'<>'}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Etapa 4 — Fórmula de Cálculo</h2>
            <p className="text-sm text-slate-500">Construa visualmente a regra de cálculo desta rubrica sem necessidade de programação.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUndo} 
            disabled={history.length === 0}
            className="border-slate-300 text-slate-600 hover:bg-slate-100 h-9 px-4"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Desfazer
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 border-slate-300 text-slate-600">
            <span className="font-bold">?</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr] gap-4 flex-1 mb-6 items-start">
        <div className="flex flex-col gap-4">
          <OperadoresMatematicos onAddToken={handleAddToken} />
          <PainelLogica onAddToken={handleAddToken} />
          <PainelValorFixo onAddToken={handleAddToken} />
        </div>

        <div className="flex flex-col gap-4">
          <EditorFormula 
            tokens={tokens}
            onRemoveToken={handleRemoveToken}
            onClear={handleClear}
            onCadastrarExcecao={handleOpenExcecao}
            excecaoDisabled={tokens.length === 0}
            onReorder={handleReorder}
          />
          <BibliotecaElementos onAddToken={handleAddToken} />
          <ExcecoesContainer 
            excecoes={excecoes} 
            onView={handleViewExcecao}
            onEdit={handleEditExcecao}
            onDelete={handleDeleteExcecao}
          />
        </div>
      </div>

      <ModalExcecao 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        onSave={handleSaveExcecao}
        editData={editingExcecao || viewingExcecao}
        readOnly={!!viewingExcecao}
      />
    </div>
  );
}
