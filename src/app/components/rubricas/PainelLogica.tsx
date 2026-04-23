import { nanoid } from "nanoid";
import { logicaItems } from "../../data/rubrica-data";

export function PainelLogica({ onAddToken }: { onAddToken: (token: any) => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <p className="panel-section-title">Lógica</p>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {logicaItems.map((item) => (
          <button
            key={item.symbol}
            className="chip-btn chip-btn-logic h-10 w-full"
            onClick={() =>
              onAddToken({
                id: nanoid(),
                type: "logic",
                label: item.label,
                symbol: item.symbol,
                description: item.description,
              })
            }
            title={item.description}
          >
            {item.symbol === item.label ? (
              <span className="font-bold text-sm tracking-wide">{item.symbol}</span>
            ) : (
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span className="font-mono">{item.symbol}</span>
                <span className="font-sans font-medium">{item.label}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
