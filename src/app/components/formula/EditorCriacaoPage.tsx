import { useState, useCallback } from "react";
import { Undo2, HelpCircle, ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { type FormulaToken, generateId, buildDescriptiveFormula } from "../../data/rubrica-data";
import { type Excecao } from "../../data/excecao-data";
import { OperadoresMatematicos } from "./OperadoresMatematicos";
import { PainelLogica } from "./PainelLogica";
import { PainelValorFixo } from "./PainelValorFixo";
import { EditorFormula } from "./EditorFormula";
import { BibliotecaElementos } from "./BibliotecaElementos";
import { ExcecoesContainer } from "./ExcecoesContainer";
import { ModalExcecao } from "./ModalExcecao";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { cn } from "../ui/utils";

export function EditorCriacaoPage() {
  // Estado principal
  const [tokens, setTokens] = useState<FormulaToken[]>([]);
  const [history, setHistory] = useState<FormulaToken[][]>([]);
  const [excecoes, setExcecoes] = useState<Excecao[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExcecao, setEditingExcecao] = useState<Excecao | null>(null);
  const [viewingExcecao, setViewingExcecao] = useState<Excecao | null>(null);

  // Handlers de token
  const addToken = useCallback(
    (token: FormulaToken) => {
      setHistory((prev) => [...prev, tokens]);
      setTokens((prev) => [...prev, token]);
    },
    [tokens]
  );

  const removeToken = useCallback(
    (id: string) => {
      setHistory((prev) => [...prev, tokens]);
      setTokens((prev) => prev.filter((t) => t.id !== id));
    },
    [tokens]
  );

  const clearTokens = useCallback(() => {
    setHistory((prev) => [...prev, tokens]);
    setTokens([]);
  }, [tokens]);

  const reorderTokens = useCallback(
    (newTokens: FormulaToken[]) => {
      setHistory((prev) => [...prev, tokens]);
      setTokens(newTokens);
    },
    [tokens]
  );

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setTokens(prev);
    setHistory((h) => h.slice(0, -1));
  }, [history]);

  // Handlers de exceção
  const handleSaveExcecao = useCallback(
    (data: Omit<Excecao, "id" | "numero">) => {
      if (editingExcecao) {
        // Editar existente
        setExcecoes((prev) =>
          prev.map((exc) =>
            exc.id === editingExcecao.id
              ? { ...exc, ...data }
              : exc
          )
        );
        toast.success("Exceção atualizada com sucesso.");
      } else {
        // Nova exceção
        const newExcecao: Excecao = {
          ...data,
          id: generateId(),
          numero: excecoes.length + 1,
        };
        setExcecoes((prev) => [...prev, newExcecao]);
        toast.success("Exceção cadastrada com sucesso.");
      }
      setEditingExcecao(null);
      setModalOpen(false);
    },
    [editingExcecao, excecoes.length]
  );

  const handleDeleteExcecao = useCallback((id: string) => {
    setExcecoes((prev) => {
      const filtered = prev.filter((exc) => exc.id !== id);
      // Renumerar
      return filtered.map((exc, i) => ({ ...exc, numero: i + 1 }));
    });
    toast.success("Exceção removida.");
  }, []);

  const handleViewExcecao = useCallback((excecao: Excecao) => {
    setViewingExcecao(excecao);
    setEditingExcecao(excecao);
    setModalOpen(true);
  }, []);

  const handleEditExcecao = useCallback((excecao: Excecao) => {
    setEditingExcecao(excecao);
    setModalOpen(true);
  }, []);

  const handleOpenNewExcecao = useCallback(() => {
    setEditingExcecao(null);
    setViewingExcecao(null);
    setModalOpen(true);
  }, []);

  const handleSalvarRegras = () => {
    if (tokens.length === 0) {
      toast.error("Monte a fórmula de cálculo antes de salvar.");
      return;
    }
    toast.success("Regras de cálculo salvas com sucesso!");
  };

  return (
    <>
      {/* Título da Etapa */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">
          Fórmula de Cálculo
        </h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={history.length === 0}
            onClick={undo}
          >
            <Undo2 className="w-3.5 h-3.5" />
            Desfazer
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-slate-500"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Ajuda
          </Button>
        </div>
      </div>

      {/* Layout 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 items-start">
        {/* Coluna esquerda: Painéis de entrada */}
        <div className="space-y-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <OperadoresMatematicos onAddToken={addToken} />
          <PainelLogica onAddToken={addToken} />
          <PainelValorFixo onAddToken={addToken} />

          {/* Aviso */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              A fórmula define como a rubrica será calculada no processamento da folha.
              Certifique-se de que os operadores e variáveis estão corretos antes de salvar.
            </p>
          </div>
        </div>

        {/* Coluna direita: Editor + Exceções + Biblioteca */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <EditorFormula
              tokens={tokens}
              onRemoveToken={removeToken}
              onClear={clearTokens}
              onReorderTokens={reorderTokens}
              onCadastrarExcecao={handleOpenNewExcecao}
              excecaoDisabled={tokens.length === 0}
            />
          </div>

          <ExcecoesContainer
            excecoes={excecoes}
            onView={handleViewExcecao}
            onEdit={handleEditExcecao}
            onDelete={handleDeleteExcecao}
          />

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <BibliotecaElementos onAddToken={addToken} />
          </div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
        <Button type="button" variant="outline" className="h-10 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Solicitação
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {tokens.length} tokens • {excecoes.length} exceções
          </span>
          <Button
            type="button"
            className={cn(
              "h-10 gap-2",
              tokens.length > 0
                ? "bg-blue-700 hover:bg-blue-800"
                : "bg-slate-400 cursor-not-allowed"
            )}
            disabled={tokens.length === 0}
            onClick={handleSalvarRegras}
          >
            <Save className="w-4 h-4" />
            Salvar Regras de Cálculo
          </Button>
        </div>
      </div>

      {/* Modal de Exceção */}
      <ModalExcecao
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingExcecao(null);
          setViewingExcecao(null);
        }}
        onSave={handleSaveExcecao}
        editData={editingExcecao}
      />
    </>
  );
}
