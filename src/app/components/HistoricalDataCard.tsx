import React, { useState } from "react";
import { ChevronDown, FileText, Paperclip, Download } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

export interface HistoricalField {
  label: string;
  value: string | string[];
  icon?: React.ReactNode;
  type?: "badge-success" | "badge-warning" | "badge-info" | "text" | "disabled";
}

export interface HistoricalSection {
  title: string;
  fields: HistoricalField[];
}

export interface HistoricalAttachment {
  name: string;
  size: string;
}

export interface HistoricalDataCardProps {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  readOnly?: boolean;
  sections: HistoricalSection[];
  attachments?: HistoricalAttachment[];
  defaultExpanded?: boolean;
}

function FieldValue({ field }: { field: HistoricalField }) {
  if (Array.isArray(field.value)) {
    if (field.value.length === 0)
      return <span className="text-sm italic text-slate-400">Não informado</span>;
    return (
      <div className="flex flex-wrap gap-1 mt-0.5">
        {field.value.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center px-2 py-0.5 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            {v}
          </span>
        ))}
      </div>
    );
  }

  if (field.type === "badge-success")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-lime-100 text-lime-700">
        {field.value || "Sim"}
      </span>
    );

  if (field.type === "badge-warning")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded border border-yellow-300 text-xs font-semibold bg-yellow-50 text-yellow-700">
        {field.value}
      </span>
    );

  if (field.type === "badge-info")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
        {field.value}
      </span>
    );

  if (field.type === "disabled")
    return <span className="text-sm italic text-slate-400">{field.value || "Não informado"}</span>;

  return <span className="text-sm font-semibold text-slate-800">{field.value || "—"}</span>;
}

export function HistoricalDataCard({
  id,
  title,
  subtitle,
  status,
  sections,
  attachments,
  defaultExpanded = false,
}: HistoricalDataCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header / Trigger */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-500">{id}</span>
              <span className="font-semibold text-slate-900 truncate">{title}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                {status}
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className="text-xs font-medium text-slate-500">
            {expanded ? "Ocultar" : "Ver Detalhes"}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Collapsible Content */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-5 bg-slate-50/50">
          {/* Sections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 rounded-lg p-4 space-y-3 shadow-sm"
              >
                {/* Section title */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-1 border-b border-slate-100">
                  {section.title}
                </p>

                {/* Fields */}
                <div className="space-y-3">
                  {section.fields.map((field, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2">
                      {field.icon && (
                        <span className="text-slate-400 mt-0.5 shrink-0 w-4 h-4">
                          {field.icon}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                          {field.label}
                        </p>
                        <FieldValue field={field} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Documentos Anexados
                </p>
              </div>
              <div className="space-y-2">
                {attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={`/assets/${file.name}`}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 rounded text-blue-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{file.name}</p>
                        <p className="text-xs text-slate-400">{file.size}</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
