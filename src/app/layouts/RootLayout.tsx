import { Outlet, Link, useLocation } from "react-router";
import {
  FileText,
  Settings,
  Home,
  Menu,
  User,
  X,
  ClipboardList,
  Users,
  ChevronDown,
  Boxes,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useState, useSyncExternalStore } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  getSessionContext,
  getSessionUserOptions,
  setActiveUser,
  subscribeSessionContext,
} from "../data/sessionStore";

export function RootLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const session = useSyncExternalStore(
    subscribeSessionContext,
    getSessionContext,
    getSessionContext
  );
  const sessionUsers = getSessionUserOptions();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-[#0c4a6e] text-white transition-all duration-300 z-50 flex flex-col",
          isSidebarOpen ? "w-64" : "w-0"
        )}
      >
        {isSidebarOpen && (
          <>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-semibold truncate">Estado de Mato Grosso</h1>
                  <p className="text-xs text-white/70 truncate">Sistema de Gestão</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.activeUserName}</p>
                  <p className="text-xs text-white/70 truncate">Grupo ativo: {session.activeGroupId}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                      isActive("/") &&
                        !location.pathname.includes("configuracao") &&
                        !location.pathname.includes("solicitacao")
                        ? "bg-white/20 text-white"
                        : "text-white/90 hover:bg-white/10"
                    )}
                  >
                    <Home className="w-4 h-4 flex-shrink-0" />
                    <span>Página Inicial</span>
                  </Link>
                </li>

                <li className="border-t border-white/10 pt-1 mt-1">
                  <div className="px-3 py-3 flex items-center justify-between text-sm font-medium text-white hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-5 h-5 text-white/80 group-hover:text-white" />
                      <span>Cadastro</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/60" />
                  </div>

                  <ul className="mt-1 space-y-0.5">
                    <li>
                      <div className="pl-10 pr-3 py-2.5 flex items-center justify-between text-[13px] font-medium text-white/90 hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-white/60 group-hover:text-white" />
                          <span>Rubrícas</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                      </div>

                      <ul className="mt-0.5 space-y-0.5">
                        <li>
                          <Link
                            to="/"
                            className={cn(
                              "pl-16 pr-3 py-2 flex items-center gap-2 text-xs transition-all",
                              isActive("/") &&
                                !location.pathname.includes("configuracao") &&
                                !location.pathname.includes("solicitacao")
                                ? "text-white bg-white/10 font-semibold"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isActive("/") &&
                                  !location.pathname.includes("configuracao") &&
                                  !location.pathname.includes("solicitacao")
                                  ? "bg-blue-300"
                                  : "bg-white/20"
                              )}
                            />
                            Solicitação de Rubrica
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/configuracao"
                            className={cn(
                              "pl-16 pr-3 py-2 flex items-center gap-2 text-xs transition-all",
                              isActive("/configuracao")
                                ? "text-white bg-white/10 font-semibold"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isActive("/configuracao") ? "bg-blue-300" : "bg-white/20"
                              )}
                            />
                            Fluxo de Aprovadores
                          </Link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>

                <li>
                  <Link
                    to="/componentes"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                      isActive("/componentes")
                        ? "bg-white/20 text-white"
                        : "text-white/90 hover:bg-white/10"
                    )}
                  >
                    <Boxes className="w-4 h-4 flex-shrink-0" />
                    <span>Componentes</span>
                  </Link>
                </li>

                <li>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/90 hover:bg-white/10 transition-colors">
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span>Parametrização</span>
                  </button>
                </li>
              </ul>
            </nav>

            <div className="p-4 border-t border-white/10">
              <p className="text-xs text-white/60 text-center">SEPLAG - SITEC</p>
              <p className="text-xs text-white/60 text-center">Coordenadoria de Sistemas</p>
            </div>
          </>
        )}
      </aside>

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <header className="bg-[#0c4a6e] text-white sticky top-0 z-40 border-b border-white/10">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="text-sm font-medium">gestão - Rubricas</h2>
            </div>

            <div className="flex items-center gap-3">
              <Select value={session.activeUserId} onValueChange={setActiveUser}>
                <SelectTrigger className="h-9 w-[280px] border-white/20 bg-white/10 text-white data-[placeholder]:text-white/70">
                  <SelectValue placeholder="Selecionar usuário" />
                </SelectTrigger>
                <SelectContent>
                  {sessionUsers.map((user) => (
                    <SelectItem key={`${user.groupId}-${user.id}`} value={user.id}>
                      {user.nome} - {user.groupName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <div className="w-96 h-96">
              <svg viewBox="0 0 200 200" className="w-full h-full text-slate-400">
                <circle cx="100" cy="100" r="90" fill="currentColor" opacity="0.1" />
                <text
                  x="100"
                  y="105"
                  textAnchor="middle"
                  fontSize="16"
                  fill="currentColor"
                  fontWeight="bold"
                >
                  MT
                </text>
              </svg>
            </div>
          </div>

          <div className="relative z-10 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
