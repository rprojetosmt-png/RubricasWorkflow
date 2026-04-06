import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  GripVertical,
  Plus,
  Save,
  Users,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  esteiraDefault,
  gruposUsuarios,
  type Etapa,
  type GrupoUsuarios,
} from "../data/mockData";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";

const ITEM_TYPE = "ETAPA";

interface DraggableEtapaProps {
  etapa: Etapa;
  index: number;
  moveEtapa: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (etapa: Etapa) => void;
}

function DraggableEtapa({ etapa, index, moveEtapa, onEdit }: DraggableEtapaProps) {
  const [expanded, setExpanded] = useState(false);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
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
          <div
            ref={drag}
            className="cursor-move text-slate-400 hover:text-slate-600"
          >
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
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
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Grupos Responsáveis
                </p>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Users className="w-4 h-4 text-slate-600" />
                  {etapa.gruposResponsaveis.length === 0 ? (
                    <span className="text-sm text-slate-600">Nenhum grupo definido</span>
                  ) : (
                    etapa.gruposResponsaveis.map((grupo) => (
                      <Badge key={grupo.id} variant="secondary">
                        {grupo.nome}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Membros dos Grupos
                </p>
                <div className="flex flex-wrap gap-2">
                  {etapa.gruposResponsaveis
                    .flatMap((grupo) => grupo.usuarios)
                    .filter(
                      (usuario, index, array) =>
                        array.findIndex((item) => item.id === usuario.id) === index
                    )
                    .map((usuario) => (
                      <Badge key={usuario.id} variant="secondary">
                        {usuario.nome}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ConfiguracaoEsteiraPage() {
  const [etapas, setEtapas] = useState<Etapa[]>(esteiraDefault);
  const [grupos, setGrupos] = useState<GrupoUsuarios[]>(gruposUsuarios);
  const [editingEtapa, setEditingEtapa] = useState<Etapa | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  // Form state
  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formGrupoIds, setFormGrupoIds] = useState<string[]>([]);
  const [formCor, setFormCor] = useState("#3b82f6");

  const [novoGrupoNome, setNovoGrupoNome] = useState("");
  const [novoGrupoMembros, setNovoGrupoMembros] = useState("");

  const moveEtapa = (dragIndex: number, hoverIndex: number) => {
    const draggedEtapa = etapas[dragIndex];
    const newEtapas = [...etapas];
    newEtapas.splice(dragIndex, 1);
    newEtapas.splice(hoverIndex, 0, draggedEtapa);

    const reorderedEtapas = newEtapas.map((etapa, index) => ({
      ...etapa,
      ordem: index + 1,
    }));

    setEtapas(reorderedEtapas);
  };

  const handleEdit = (etapa: Etapa) => {
    setEditingEtapa(etapa);
    setFormNome(etapa.nome);
    setFormDescricao(etapa.descricao);
    setFormGrupoIds(etapa.gruposResponsaveis.map((g) => g.id));
    setFormCor(etapa.cor);
    setIsDialogOpen(true);
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

    const updatedEtapas = etapas.map((e) =>
      e.id === editingEtapa.id
        ? {
            ...e,
            nome: formNome,
            descricao: formDescricao,
            gruposResponsaveis: gruposSelecionados,
            cor: formCor,
          }
        : e
    );

    setEtapas(updatedEtapas);
    toast.success("Etapa atualizada com sucesso");
    setIsDialogOpen(false);
  };

  const handleSaveConfig = () => {
    toast.success("Configuração salva com sucesso!", {
      description: "A esteira foi atualizada e está pronta para uso.",
    });
  };

  const handleAddGrupo = () => {
    if (!novoGrupoNome.trim()) {
      toast.error("Informe o nome do grupo");
      return;
    }

    const membros = novoGrupoMembros
      .split(/\n|,|;/)
      .map((m) => m.trim())
      .filter(Boolean);

    if (membros.length === 0) {
      toast.error("Informe ao menos um membro");
      return;
    }

    const grupoId = `grupo-${Date.now()}`;
    const usuarios = membros.map((nome, index) => ({
      id: `${grupoId}-u${index + 1}`,
      nome,
    }));

    setGrupos((prev) => [
      ...prev,
      {
        id: grupoId,
        nome: novoGrupoNome.trim(),
        usuarios,
      },
    ]);

    setNovoGrupoNome("");
    setNovoGrupoMembros("");
    setIsGroupDialogOpen(false);
    toast.success("Grupo adicionado com sucesso");
  };

  const handleDeleteGrupo = (grupoId: string) => {
    const grupoEmUso = etapas.some((etapa) =>
      etapa.gruposResponsaveis.some((grupo) => grupo.id === grupoId)
    );

    if (grupoEmUso) {
      toast.error("Não é possível remover: grupo vinculado a uma etapa");
      return;
    }

    const grupo = grupos.find((g) => g.id === grupoId);
    setGrupos((prev) => prev.filter((g) => g.id !== grupoId));
    if (grupo) {
      toast.success(`Grupo "${grupo.nome}" removido`);
    }
  };

  const cores = [
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // green
    "#06b6d4", // cyan
    "#6366f1", // indigo
    "#ef4444", // red
  ];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900">Configuração da Esteira</h2>
          <p className="text-slate-600 mt-1">
            Configure as etapas e grupos responsáveis pela aprovação de rubricas
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsGroupDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Grupo
          </Button>
          <Button
            onClick={handleSaveConfig}
            className="bg-[#0c4a6e] hover:bg-[#0a3d5a]"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Etapas */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etapas da Esteira</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Arraste para reordenar as etapas
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {etapas.map((etapa, index) => (
                <DraggableEtapa
                  key={etapa.id}
                  etapa={etapa}
                  index={index}
                  moveEtapa={moveEtapa}
                  onEdit={handleEdit}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Grupos */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grupos de Usuários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {grupos.map((grupo) => (
                <div
                  key={grupo.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-600" />
                      <p className="font-medium text-slate-900">{grupo.nome}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGrupo(grupo.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Remover grupo ${grupo.nome}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    {grupo.usuarios.slice(0, 3).map((usuario) => (
                      <div key={usuario.id}>• {usuario.nome}</div>
                    ))}
                    {grupo.usuarios.length > 3 && (
                      <div className="text-slate-500">
                        + {grupo.usuarios.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total de Etapas</span>
                <span className="font-semibold text-slate-900">{etapas.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Grupos Ativos</span>
                <span className="font-semibold text-slate-900">
                  {grupos.length}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total de Usuários</span>
                <span className="font-semibold text-slate-900">
                  {grupos.reduce((acc, g) => acc + g.usuarios.length, 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para Editar Etapa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Etapa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome">Nome da Etapa</Label>
              <Input
                id="nome"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Análise Documental"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value)}
                placeholder="Descreva o que acontece nesta etapa..."
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
                        checked
                          ? "border-slate-300 bg-slate-50"
                          : "border-slate-200"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={() => {
                          setFormGrupoIds((prev) =>
                            checked
                              ? prev.filter((id) => id !== grupo.id)
                              : [...prev, grupo.id]
                          );
                        }}
                      />
                      <span className="text-sm text-slate-900">{grupo.nome}</span>
                      <span className="text-xs text-slate-500 ml-auto">
                        ({grupo.usuarios.length} usuários)
                      </span>
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
                    className={cn(
                      "w-10 h-10 rounded-lg transition-all",
                      formCor === cor && "ring-2 ring-offset-2 ring-slate-400"
                    )}
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
            <Button
              onClick={handleSaveEtapa}
              className="bg-[#0c4a6e] hover:bg-[#0a3d5a]"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Adicionar Grupo */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Grupo de Usuários</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="grupo-nome">Nome do Grupo</Label>
              <Input
                id="grupo-nome"
                value={novoGrupoNome}
                onChange={(e) => setNovoGrupoNome(e.target.value)}
                placeholder="Ex: Compras"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="grupo-membros">Membros do Grupo</Label>
              <Textarea
                id="grupo-membros"
                value={novoGrupoMembros}
                onChange={(e) => setNovoGrupoMembros(e.target.value)}
                placeholder="Um nome por linha ou separados por vírgula"
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddGrupo}
              className="bg-[#0c4a6e] hover:bg-[#0a3d5a]"
            >
              Adicionar Grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}





















