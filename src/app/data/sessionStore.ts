import { gruposUsuarios, type GrupoUsuarios, type Usuario } from "./mockData";
import { getEsteiraConfig } from "./esteiraStore";

export interface SessionContext {
  activeUserId: string;
  activeUserName: string;
  activeGroupId: string;
}

const STORAGE_KEY = "rubricas.session.context";

const listeners = new Set<() => void>();
let contextCache: SessionContext | null = null;

const collectUsersFromConfig = (): Array<Usuario & { groupId: string; groupName: string }> => {
  const etapas = getEsteiraConfig();
  const groupsById = new Map<string, GrupoUsuarios>();

  etapas.forEach((etapa) => {
    etapa.gruposResponsaveis.forEach((grupo) => {
      groupsById.set(grupo.id, grupo);
    });
  });

  if (groupsById.size === 0) {
    gruposUsuarios.forEach((grupo) => groupsById.set(grupo.id, grupo));
  }

  const users: Array<Usuario & { groupId: string; groupName: string }> = [];
  groupsById.forEach((grupo) => {
    grupo.usuarios.forEach((usuario) => {
      users.push({ ...usuario, groupId: grupo.id, groupName: grupo.nome });
    });
  });

  return users;
};

export const getSessionUserOptions = () => collectUsersFromConfig();

const getDefaultSession = (): SessionContext => {
  const users = collectUsersFromConfig();
  if (users.length === 0) {
    return {
      activeUserId: "u99",
      activeUserName: "Usuário Atual",
      activeGroupId: "grupo-1",
    };
  }

  const first = users[0];
  return {
    activeUserId: first.id,
    activeUserName: first.nome,
    activeGroupId: first.groupId,
  };
};

const emit = () => {
  listeners.forEach((listener) => listener());
};

const save = (context: SessionContext) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
};

const sanitizeContext = (input: SessionContext): SessionContext => {
  const users = collectUsersFromConfig();
  const match = users.find((u) => u.id === input.activeUserId && u.groupId === input.activeGroupId);

  if (match) {
    return {
      activeUserId: match.id,
      activeUserName: match.nome,
      activeGroupId: match.groupId,
    };
  }

  return getDefaultSession();
};

const isSameContext = (a: SessionContext, b: SessionContext) =>
  a.activeUserId === b.activeUserId &&
  a.activeUserName === b.activeUserName &&
  a.activeGroupId === b.activeGroupId;

const loadContext = (): SessionContext => {
  const fallback = getDefaultSession();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as SessionContext;
    return sanitizeContext(parsed);
  } catch {
    return fallback;
  }
};

const ensureLoaded = () => {
  if (!contextCache) {
    contextCache = loadContext();
  }
};

export const getSessionContext = (): SessionContext => {
  ensureLoaded();
  return contextCache as SessionContext;
};

export const setSessionContext = (patch: Partial<SessionContext>) => {
  const current = getSessionContext();
  const next = sanitizeContext({
    ...current,
    ...patch,
  });

  if (isSameContext(current, next)) {
    return current;
  }

  contextCache = next;
  save(next);
  emit();
  return next;
};

export const setActiveUser = (userId: string) => {
  const users = collectUsersFromConfig();
  const target = users.find((u) => u.id === userId);
  if (!target) return getSessionContext();

  return setSessionContext({
    activeUserId: target.id,
    activeUserName: target.nome,
    activeGroupId: target.groupId,
  });
};

export const subscribeSessionContext = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
