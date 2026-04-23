import { nanoid } from "nanoid";
import { operadores } from "../../data/rubrica-data";

export function OperadoresMatematicos({ onAddToken }: { onAddToken: (token: any) => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <p className="panel-section-title">Operadores Matemáticos</p>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {operadores.map((op) => (
          <button
            key={op.symbol}
            className="chip-btn chip-btn-operator flex flex-col h-[72px] justify-center items-center gap-0.5 rounded-md"
            onClick={() =>
              onAddToken({
                id: nanoid(),
                type: op.symbol === "(" || op.symbol === ")" ? "paren" : "operator",
                label: op.label,
                symbol: op.symbol,
                description: op.description,
              })
            }
            title={op.description}
          >
            <span className="text-xl font-bold font-mono leading-none">{op.symbol}</span>
            <span className="text-[10px] font-bold tracking-tight">{op.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
