import { generateId, operadores, type FormulaToken } from "../../data/rubrica-data";

interface OperadoresMatematicosProps {
  onAddToken: (token: FormulaToken) => void;
}

export function OperadoresMatematicos({ onAddToken }: OperadoresMatematicosProps) {
  const handleClick = (op: (typeof operadores)[number]) => {
    onAddToken({
      id: generateId(),
      type: op.symbol === "(" || op.symbol === ")" ? "paren" : "operator",
      label: op.label,
      symbol: op.symbol,
      description: op.description,
    });
  };

  return (
    <div>
      <p className="panel-section-title">Operadores Matemáticos</p>
      <div className="grid grid-cols-3 gap-2">
        {operadores.map((op) => (
          <button
            key={op.symbol}
            type="button"
            className="chip-btn chip-btn-operator"
            onClick={() => handleClick(op)}
            title={op.description}
          >
            <span className="font-mono">{op.symbol}</span>
            <span className="text-xs font-normal">{op.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
