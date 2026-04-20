import { useState } from "react";
import { Hash, Plus } from "lucide-react";
import { generateId, type FormulaToken } from "../../data/rubrica-data";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface PainelValorFixoProps {
  onAddToken: (token: FormulaToken) => void;
}

export function PainelValorFixo({ onAddToken }: PainelValorFixoProps) {
  const [valor, setValor] = useState("");

  const handleAdd = () => {
    const trimmed = valor.trim();
    if (!trimmed) {
      toast.error("Informe um valor numérico.");
      return;
    }
    const num = parseFloat(trimmed.replace(",", "."));
    if (isNaN(num)) {
      toast.error("Valor inválido. Use apenas números.");
      return;
    }
    const formatted = num.toString();
    onAddToken({
      id: generateId(),
      type: "value",
      label: formatted,
      symbol: formatted,
      description: `Valor fixo: ${formatted}`,
    });
    setValor("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <p className="panel-section-title flex items-center gap-1.5">
        <Hash className="w-3.5 h-3.5" />
        Valor Fixo
      </p>
      <div className="flex gap-2">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Ex: 0.15"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-9 border-2"
        />
        <Button
          type="button"
          size="icon"
          className="h-9 w-9 bg-blue-700 hover:bg-blue-800 shrink-0"
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
