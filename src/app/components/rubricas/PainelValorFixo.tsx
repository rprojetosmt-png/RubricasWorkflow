import { useState } from "react";
import { nanoid } from "nanoid";
import { Hash, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

export function PainelValorFixo({ onAddToken }: { onAddToken: (token: any) => void }) {
  const [valor, setValor] = useState("");

  const handleAdd = () => {
    if (!valor.trim()) return;
    const parsed = parseFloat(valor.replace(",", "."));
    if (isNaN(parsed)) {
      toast.error("Valor numérico inválido");
      return;
    }
    
    const formatted = parsed.toString().replace(".", ",");
    onAddToken({
      id: nanoid(),
      type: "value",
      label: formatted,
      symbol: formatted,
      description: "Valor fixo numérico"
    });
    setValor("");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Hash className="w-4 h-4 text-amber-500" />
        <p className="panel-section-title !mb-0">Valor Fixo</p>
      </div>
      <div className="flex items-center gap-2">
        <Input 
          type="text" 
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ex: 100,50"
          className="h-10 border-slate-300"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button type="button" onClick={handleAdd} className="h-10 w-10 shrink-0 bg-amber-500 hover:bg-amber-600 p-0 text-white border-0">
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
