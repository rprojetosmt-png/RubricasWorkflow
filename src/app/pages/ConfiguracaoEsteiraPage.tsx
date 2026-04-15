import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  GripVertical,
  Settings,
  Save,
  Plus,
  ArrowLeft,
  RotateCcw,
  Users,
  Edit,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { gruposUsuarios, type Etapa, type GrupoUsuarios, type Usuario } from "../data/mockData";
import { getEsteiraConfig, saveEsteiraConfig } from "../data/esteiraStore";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";
const ITEM_TYPE = "ETAPA";

const collectGroupsFromEtapas = (etapas: Etapa[]): GrupoUsuarios[] => {
  const map = new Map<string, GrupoUsuarios>();
  gruposUsuarios.forEach((grupo) => map.set(grupo.id, grupo));
  etapas.forEach((etapa) => {
    etapa.gruposResponsaveis.forEach((grupo) => map.set(grupo.id, grupo));
  });
  return Array.from(map.values());
};

const buildCpfMock = (id: string): string => {
  const digits = id.replace(/\D/g, "").padStart(11, "0").slice(-11);
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const buildMatriculaMock = (id: string): string => {
  const digits = id.replace(/\D/g, "").padStart(6, "0").slice(-6);
  return `MAT-${digits}`;
};

const enrichUsuario = (usuario: Usuario): Usuario => ({
  ...usuario,
  cpf: usuario.cpf ?? buildCpfMock(usuario.id),
  matricula: usuario.matricula ?? buildMatriculaMock(usuario.id),
});

interface DraggableEtapaProps {
  etapa: Etapa;
  index: number;
  moveEtapa: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (etapa: Etapa) => void;
  onToggleRequiredSigner: (etapaId: string, userId: string) => void;
}

function DraggableEtapa({ etapa, index, moveEtapa, onEdit, onToggleRequiredSigner }: DraggableEtapaProps) {
  const [expanded, setExpanded] = useState(false);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveEtapa(item.index, index);
        item.index = index;
      }
    },
  });

  const membrosUnicos = etapa.gruposResponsaveis
    .flatMap((grupo) => grupo.usuarios)
    .filter((usuario, i, arr) => arr.findIndex((item) => item.id === usuario.id) === i);

  return (
    <div
      ref={(node) => dragPreview(drop(node))}
      className={cn(
        "bg-white rounded-lg border border-slate-200 transition-all",
        isDragging && "opacity-50"
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div ref={drag} className="cursor-move text-slate-400 hover:text-slate-600">
            <GripVertical className="w-5 h-5" />
          </div>

          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: etapa.cor }}
          >
            <span className="text-white text-sm font-semibold">{etapa.ordem}</span>
          </div>

          <div className="flex-1">
            <h4 className="font-medium text-slate-900">{etapa.nome}</h4>
            <p className="text-sm text-slate-600">{etapa.descricao}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(etapa)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {expanded && (
          <>
            <Separator className="my-4" />
            <div className="ml-11 space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Grupos Responsáveis</p>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Users className="w-4 h-4 text-slate-600" />
                  {etapa.gruposResponsaveis.map((grupo) => (
                    <Badge key={grupo.id} variant="secondary">
                      {grupo.nome}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Membros dos Grupos (clique para marcar assinatura obrigatória)
                </p>
                <div className="flex flex-wrap gap-2">
                  {membrosUnicos.map((usuario) => {
                    const isRequired = (etapa.requiredSignerIds ?? []).includes(usuario.id);
                    return (
                      <button
                        key={usuario.id}
                        type="button"
                        onClick={() => onToggleRequiredSigner(etapa.id, usuario.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors",
                          isRequired
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        {isRequired && <Check className="w-3.5 h-3.5" />}
                        {usuario.nome}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Obrigatórios nesta etapa: {(etapa.requiredSignerIds ?? []).length}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ConfiguracaoEsteiraPage() {
  const initialEtapas = getEsteiraConfig();
  const [etapas, setEtapas] = useState<Etapa[]>(initialEtapas);
  const [grupos, setGrupos] = useState<GrupoUsuarios[]>(() => collectGroupsFromEtapas(initialEtapas));

  const [editingEtapa, setEditingEtapa] = useState<Etapa | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupDialogMode, setGroupDialogMode] = useState<"add" | "edit">("add");
  const [editingGrupoId, setEditingGrupoId] = useState<string | null>(null);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewGrupo, setViewGrupo] = useState<GrupoUsuarios | null>(null);
  const [activeGrupoMenuId, setActiveGrupoMenuId] = useState<string | null>(null);
  const [isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen] = useState(false);
  const [grupoPendenteExclusao, setGrupoPendenteExclusao] = useState<GrupoUsuarios | null>(null);

  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formGrupoIds, setFormGrupoIds] = useState<string[]>([]);
  const [formCor, setFormCor] = useState("#3b82f6");

  const [novoGrupoNome, setNovoGrupoNome] = useState("");
  const [buscaMembro, setBuscaMembro] = useState("");
  const [membrosSelecionados, setMembrosSelecionados] = useState<Usuario[]>([]);
  const [isGroupManagerOpen, setIsGroupManagerOpen] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [filtroStatusGrupo, setFiltroStatusGrupo] = useState<"todos" | "vinculado" | "disponivel">("todos");

  const servidoresCatalogo = Array.from(
    new Map(grupos.flatMap((grupo) => grupo.usuarios).map((usuario) => [usuario.id, enrichUsuario(usuario)])).values()
  );

  const moveEtapa = (dragIndex: number, hoverIndex: number) => {
    const draggedEtapa = etapas[dragIndex];
    const newEtapas = [...etapas];
    newEtapas.splice(dragIndex, 1);
    newEtapas.splice(hoverIndex, 0, draggedEtapa);

    setEtapas(
      newEtapas.map((etapa, index) => ({
        ...etapa,
        ordem: index + 1,
      }))
    );
  };

  const handleEdit = (etapa: Etapa) => {
    setEditingEtapa(etapa);
    setFormNome(etapa.nome);
    setFormDescricao(etapa.descricao);
    setFormGrupoIds(etapa.gruposResponsaveis.map((g) => g.id));
    setFormCor(etapa.cor);
    setIsDialogOpen(true);
  };

  const handleToggleRequiredSigner = (etapaId: string, userId: string) => {
    setEtapas((prev) =>
      prev.map((etapa) => {
        if (etapa.id !== etapaId) return etapa;
        const current = etapa.requiredSignerIds ?? [];
        const exists = current.includes(userId);

        return {
          ...etapa,
          requiredSignerIds: exists ? current.filter((id) => id !== userId) : [...current, userId],
        };
      })
    );
  };

  const handleSaveEtapa = () => {
    if (!editingEtapa) return;

    const gruposSelecionados = grupos.filter((g) => formGrupoIds.includes(g.id));
    if (gruposSelecionados.length === 0) {
      toast.error("Selecione ao menos um grupo responsável");
      return;
    }

    if (!formNome.trim()) {
      toast.error("Informe o nome da etapa");
      return;
    }

    const allowedMemberIds = new Set(
      gruposSelecionados.flatMap((grupo) => grupo.usuarios).map((usuario) => usuario.id)
    );

    const updatedEtapas = etapas.map((e) =>
      e.id === editingEtapa.id
        ? {
            ...e,
            nome: formNome,
            descricao: formDescricao,
            gruposResponsaveis: gruposSelecionados,
            requiredSignerIds: (e.requiredSignerIds ?? []).filter((id) => allowedMemberIds.has(id)),
            cor: formCor,
          }
        : e
    );

    setEtapas(updatedEtapas);
    toast.success("Etapa atualizada com sucesso");
    setIsDialogOpen(false);
  };

  const handleSaveConfig = () => {
    const saved = saveEsteiraConfig(etapas);
    setEtapas(saved);
    toast.success("Configuração salva com sucesso!", {
      description: "A esteira foi atualizada e está pronta para uso.",
    });
  };

  const openAddGrupo = () => {
    setGroupDialogMode("add");
    setEditingGrupoId(null);
    setNovoGrupoNome("");
    setBuscaMembro("");
    setMembrosSelecionados([]);
    setIsGroupDialogOpen(true);
  };

  const openEditGrupo = (grupo: GrupoUsuarios) => {
    setGroupDialogMode("edit");
    setEditingGrupoId(grupo.id);
    setNovoGrupoNome(grupo.nome);
    setBuscaMembro("");
    setMembrosSelecionados(grupo.usuarios.map(enrichUsuario));
    setIsGroupDialogOpen(true);
  };

  const openViewGrupo = (grupo: GrupoUsuarios) => {
    setViewGrupo(grupo);
    setIsViewDialogOpen(true);
  };

  const handleSaveGrupo = () => {
    if (!novoGrupoNome.trim()) {
      toast.error("Informe o nome do grupo");
      return;
    }

    if (membrosSelecionados.length === 0) {
      toast.error("Informe ao menos um membro");
      return;
    }

    if (groupDialogMode === "edit" && editingGrupoId) {
      const grupoAtualizado: GrupoUsuarios = {
        id: editingGrupoId,
        nome: novoGrupoNome.trim(),
        usuarios: membrosSelecionados.map((usuario) => ({ ...usuario })),
      };

      setGrupos((prev) =>
        prev.map((grupo) => (grupo.id === editingGrupoId ? grupoAtualizado : grupo))
      );

      setEtapas((prev) =>
        prev.map((etapa) => {
          if (!etapa.gruposResponsaveis.some((g) => g.id === editingGrupoId)) {
            return etapa;
          }

          const gruposResponsaveis = etapa.gruposResponsaveis.map((grupo) =>
            grupo.id === editingGrupoId ? grupoAtualizado : grupo
          );

          const allowedMemberIds = new Set(
            gruposResponsaveis.flatMap((grupo) => grupo.usuarios).map((usuario) => usuario.id)
          );

          return {
            ...etapa,
            gruposResponsaveis,
            requiredSignerIds: (etapa.requiredSignerIds ?? []).filter((id) => allowedMemberIds.has(id)),
          };
        })
      );

      toast.success("Grupo atualizado com sucesso");
    } else {
      const grupoId = `grupo-${Date.now()}`;
      setGrupos((prev) => [
        ...prev,
        {
          id: grupoId,
          nome: novoGrupoNome.trim(),
          usuarios: membrosSelecionados.map((usuario) => ({ ...usuario })),
        },
      ]);
      toast.success("Grupo adicionado com sucesso");
    }

    setNovoGrupoNome("");
    setBuscaMembro("");
    setMembrosSelecionados([]);
    setIsGroupDialogOpen(false);
    setActiveGrupoMenuId(null);
  };

  const handleDeleteGrupo = (grupoId: string) => {
    const grupo = grupos.find((g) => g.id === grupoId);
    const grupoEmUso = etapas.some((etapa) =>
      etapa.gruposResponsaveis.some((item) => item.id === grupoId)
    );

    if (grupoEmUso) {
      toast.error("Não é possível remover: grupo vinculado a uma etapa");
      return;
    }

    setGrupoPendenteExclusao(grupo ?? null);
    setIsDeleteGroupDialogOpen(true);
    setActiveGrupoMenuId(null);
  };

  const confirmDeleteGrupo = () => {
    if (!grupoPendenteExclusao) {
      setIsDeleteGroupDialogOpen(false);
      return;
    }

    setGrupos((prev) => prev.filter((item) => item.id !== grupoPendenteExclusao.id));
    toast.success(`Grupo "${grupoPendenteExclusao.nome}" removido`);
    setIsDeleteGroupDialogOpen(false);
    setGrupoPendenteExclusao(null);
    setActiveGrupoMenuId(null);
  };

  const cores = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#6366f1", "#ef4444"];

  const termoBuscaMembro = buscaMembro.trim().toLowerCase();
  const membrosNaoSelecionados = servidoresCatalogo.filter(
    (usuario) => !membrosSelecionados.some((selecionado) => selecionado.id === usuario.id)
  );
  const resultadosBuscaMembro =
    termoBuscaMembro.length === 0
      ? []
      : membrosNaoSelecionados
          .filter((usuario) =>
            [usuario.nome, usuario.cpf ?? "", usuario.matricula ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(termoBuscaMembro)
          )
          .slice(0, 8);

  const gruposFiltrados = grupos.filter((grupo) => {
    const termo = filtroGrupo.trim().toLowerCase();
    const porTexto =
      termo.length === 0 ||
      grupo.nome.toLowerCase().includes(termo) ||
      grupo.usuarios.some((u) => u.nome.toLowerCase().includes(termo));

    const vinculado = etapas.some((etapa) => etapa.gruposResponsaveis.some((g) => g.id === grupo.id));
    const porStatus =
      filtroStatusGrupo === "todos" ||
      (filtroStatusGrupo === "vinculado" && vinculado) ||
      (filtroStatusGrupo === "disponivel" && !vinculado);

    return porTexto && porStatus;
  });

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900">Fluxo de Aprovadores</h2>
          <p className="text-slate-600 mt-1">Configure as etapas e grupos responsáveis pela aprovação de rubricas</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsGroupManagerOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar Grupos
          </Button>
          <Button onClick={handleSaveConfig} className="bg-[#0c4a6e] hover:bg-[#0a3d5a]">
            <Save className="w-4 h-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>
      </div>


      {isGroupManagerOpen && (
        <div className="space-y-4">
          <Card className="border border-slate-200">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Gerenciamento de Grupos</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Gerencie cadastro, filtros e ações dos grupos de usuários</p>
                </div>
                <Button variant="outline" onClick={() => setIsGroupManagerOpen(false)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Filtrar por grupo ou membro"
                  value={filtroGrupo}
                  onChange={(e) => setFiltroGrupo(e.target.value)}
                />
                <Select
                  value={filtroStatusGrupo}
                  onValueChange={(value: "todos" | "vinculado" | "disponivel") => setFiltroStatusGrupo(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="vinculado">Vinculado à etapa</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFiltroGrupo("");
                      setFiltroStatusGrupo("todos");
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpar Filtro
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="mb-4">
                <Button onClick={openAddGrupo} className="bg-[#0c4a6e] hover:bg-[#0a3d5a]">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Grupo
                </Button>
              </div>

              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Grupo</th>
                      <th className="text-left px-4 py-3 font-medium">Membros</th>
                      <th className="text-left px-4 py-3 font-medium">Etapas Vinculadas</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gruposFiltrados.map((grupo) => {
                      const etapasVinculadas = etapas.filter((etapa) =>
                        etapa.gruposResponsaveis.some((g) => g.id === grupo.id)
                      );
                      const grupoEmUso = etapasVinculadas.length > 0;

                      return (
                        <tr key={grupo.id} className="border-t border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{grupo.nome}</td>
                          <td className="px-4 py-3 text-slate-700">{grupo.usuarios.length}</td>
                          <td className="px-4 py-3 text-slate-700">{etapasVinculadas.length}</td>
                          <td className="px-4 py-3">
                            <Badge
                              className={cn(
                                "font-medium",
                                grupoEmUso
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              )}
                            >
                              {grupoEmUso ? "Vinculado" : "Disponível"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setActiveGrupoMenuId((prev) => (prev === grupo.id ? null : grupo.id))
                                }
                              >
                                Ações
                                <ChevronDown className="w-4 h-4 ml-2" />
                              </Button>
                              {activeGrupoMenuId === grupo.id && (
                                <div className="absolute right-0 z-20 mt-1 w-40 rounded-md border border-slate-200 bg-white p-1 shadow-md">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openViewGrupo(grupo);
                                      setActiveGrupoMenuId(null);
                                    }}
                                    className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                                  >
                                    Visualizar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openEditGrupo(grupo);
                                      setActiveGrupoMenuId(null);
                                    }}
                                    className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={grupoEmUso}
                                    onClick={() => handleDeleteGrupo(grupo.id)}
                                    className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isGroupManagerOpen && (
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etapas da Esteira</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Arraste para reordenar as etapas</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {etapas.map((etapa, index) => (
                <DraggableEtapa
                  key={etapa.id}
                  etapa={etapa}
                  index={index}
                  moveEtapa={moveEtapa}
                  onEdit={handleEdit}
                  onToggleRequiredSigner={handleToggleRequiredSigner}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grupos de Usuários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {grupos.map((grupo) => {
                const grupoEmUso = etapas.some((etapa) =>
                  etapa.gruposResponsaveis.some((g) => g.id === grupo.id)
                );

                return (
                  <div key={grupo.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-600" />
                        <p className="font-medium text-slate-900">{grupo.nome}</p>
                      </div>

                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Ações do grupo"
                          onClick={() => setActiveGrupoMenuId((prev) => (prev === grupo.id ? null : grupo.id))}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>

                        {activeGrupoMenuId === grupo.id && (
                          <div className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-slate-200 bg-white p-1 shadow-md">
                            <button
                              type="button"
                              onClick={() => {
                                openViewGrupo(grupo);
                                setActiveGrupoMenuId(null);
                              }}
                              className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                            >
                              Visualizar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                openEditGrupo(grupo);
                                setActiveGrupoMenuId(null);
                              }}
                              className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              disabled={grupoEmUso}
                              onClick={() => handleDeleteGrupo(grupo.id)}
                              className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      {grupo.usuarios.slice(0, 3).map((usuario) => (
                        <div key={usuario.id}>• {usuario.nome}</div>
                      ))}
                      {grupo.usuarios.length > 3 && (
                        <div className="text-slate-500">+ {grupo.usuarios.length - 3} mais</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Etapa</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome da Etapa</Label>
              <Input id="nome" value={formNome} onChange={(e) => setFormNome(e.target.value)} className="mt-2" />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Grupos Responsáveis</Label>
              <div className="mt-2 space-y-2">
                {grupos.map((grupo) => {
                  const checked = formGrupoIds.includes(grupo.id);
                  return (
                    <label
                      key={grupo.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border cursor-pointer",
                        checked ? "border-slate-300 bg-slate-50" : "border-slate-200"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={() => {
                          setFormGrupoIds((prev) =>
                            checked ? prev.filter((id) => id !== grupo.id) : [...prev, grupo.id]
                          );
                        }}
                      />
                      <span className="text-sm text-slate-900">{grupo.nome}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Cor da Etapa</Label>
              <div className="flex gap-2 mt-2">
                {cores.map((cor) => (
                  <button
                    key={cor}
                    onClick={() => setFormCor(cor)}
                    className={cn("w-10 h-10 rounded-lg transition-all", formCor === cor && "ring-2 ring-offset-2 ring-slate-400")}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEtapa} className="bg-[#0c4a6e] hover:bg-[#0a3d5a]">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Visualizar Grupo</DialogTitle>
          </DialogHeader>
          {viewGrupo ? (
            <div className="space-y-3 py-4">
              <div>
                <p className="text-sm text-slate-600">Nome</p>
                <p className="text-slate-900 font-medium">{viewGrupo.nome}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Membros</p>
                <div className="flex flex-wrap gap-2">
                  {viewGrupo.usuarios.map((usuario) => (
                    <Badge key={usuario.id} variant="secondary">
                      {usuario.nome}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-sm text-slate-600">Grupo não encontrado.</div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{groupDialogMode === "edit" ? "Editar Grupo" : "Novo Grupo de Usuários"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="grupo-nome">Nome do Grupo</Label>
              <Input
                id="grupo-nome"
                value={novoGrupoNome}
                onChange={(e) => setNovoGrupoNome(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="busca-membro">Buscar Servidor (nome, CPF ou matrícula)</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="busca-membro"
                  value={buscaMembro}
                  onChange={(e) => setBuscaMembro(e.target.value)}
                  placeholder="Digite nome, CPF ou matrícula"
                />
              </div>

              {termoBuscaMembro.length > 0 && (
                <div className="mt-2 max-h-48 overflow-auto rounded-md border border-slate-200">
                  {resultadosBuscaMembro.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-slate-500">Nenhum servidor encontrado.</p>
                  ) : (
                    resultadosBuscaMembro.map((usuario) => (
                      <div
                        key={usuario.id}
                        className="flex items-center justify-between border-b border-slate-100 px-3 py-2 last:border-b-0"
                      >
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">{usuario.nome}</p>
                          <p className="text-slate-500">CPF: {usuario.cpf ?? "-"} · Matrícula: {usuario.matricula ?? "-"}</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setMembrosSelecionados((prev) => [...prev, usuario]);
                            setBuscaMembro("");
                          }}
                        >
                          Adicionar
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <Label>Membros do Grupo</Label>
              <div className="mt-2 min-h-[88px] rounded-md border border-slate-200 bg-slate-50 p-2">
                {membrosSelecionados.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum membro adicionado.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {membrosSelecionados.map((usuario) => (
                      <div
                        key={usuario.id}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm"
                      >
                        <span>{usuario.nome}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setMembrosSelecionados((prev) => prev.filter((item) => item.id !== usuario.id))
                          }
                          className="text-slate-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveGrupo} className="bg-[#0c4a6e] hover:bg-[#0a3d5a]">
              {groupDialogMode === "edit" ? "Salvar Alterações" : "Adicionar Grupo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteGroupDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteGroupDialogOpen(open);
          if (!open) {
            setGrupoPendenteExclusao(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-slate-700">
            Tem certeza que deseja excluir o grupo
            <span className="font-semibold"> {grupoPendenteExclusao?.nome ?? "selecionado"}</span>?
            <p className="mt-2 text-slate-500">Essa ação não poderá ser desfeita.</p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteGroupDialogOpen(false);
                setGrupoPendenteExclusao(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={confirmDeleteGrupo} className="bg-red-600 hover:bg-red-700">
              Excluir Grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



















