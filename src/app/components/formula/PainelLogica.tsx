import { generateId, logicaItems, type FormulaToken } from "../../data/rubrica-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface PainelLogicaProps {
  onAddToken: (token: FormulaToken) => void;
}

export function PainelLogica({ onAddToken }: PainelLogicaProps) {
  const handleClick = (item: (typeof logicaItems)[number]) => {
    onAddToken({
      id: generateId(),
      type: "logic",
      label: item.label,
      symbol: item.symbol,
      description: item.description,
    });
  };

  return (
    <div>
      <p className="panel-section-title">Lógica Condicional</p>
      <TooltipProvider delayDuration={200}>
        <div className="grid grid-cols-2 gap-2">
          {logicaItems.map((item) => (
            <Tooltip key={item.symbol}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="chip-btn chip-btn-logic"
                  onClick={() => handleClick(item)}
                >
                  <span className="font-mono">{item.symbol}</span>
                  <span className="text-xs font-normal">{item.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">{item.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
