import { Outlet, Link, useLocation } from "react-router";
import {
  FileText,
  Settings,
  LayoutDashboard,
  ChevronRight,
  Home,
  Menu,
  User,
  X,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useState } from "react";

export function RootLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-[#0c4a6e] text-white transition-all duration-300 z-50 flex flex-col",
          isSidebarOpen ? "w-64" : "w-0"
        )}
      >
        {isSidebarOpen && (
          <>
            {/* Logo Section */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-semibold truncate">
                    Estado de Mato Grosso
                  </h1>
                  <p className="text-xs text-white/70 truncate">
                    Sistema de Gestão
                  </p>
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">RENAN ARAUJO</p>
                  <p className="text-xs text-white/70">Versão 1</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
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

                {/* Cadastro Group */}
                <li>
                  <div className="px-3 py-2.5 flex items-center gap-2 text-sm text-white/90">
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                    <span>Cadastro</span>
                  </div>
                  <ul className="ml-6 mt-1 space-y-1 border-l border-white/20 pl-3">
                    <li>
                      <Link
                        to="/"
                        className={cn(
                          "block px-3 py-2 rounded text-xs transition-colors",
                          isActive("/") &&
                            !location.pathname.includes("configuracao")
                            ? "text-white bg-white/10"
                            : "text-white/80 hover:text-white hover:bg-white/5"
                        )}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/configuracao"
                        className={cn(
                          "block px-3 py-2 rounded text-xs transition-colors",
                          isActive("/configuracao")
                            ? "text-white bg-white/10"
                            : "text-white/80 hover:text-white hover:bg-white/5"
                        )}
                      >
                        Configuração da Esteira
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* Other Menu Items */}
                <li>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/90 hover:bg-white/10 transition-colors">
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span>Parametrização</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <p className="text-xs text-white/60 text-center">
                SEFLAG - STI
              </p>
              <p className="text-xs text-white/60 text-center">
                Coordenadoria de Sistemas
              </p>
            </div>
          </>
        )}
      </aside>

      {/* Main Content Area */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", isSidebarOpen ? "ml-64" : "ml-0")}>
        {/* Top Header */}
        <header className="bg-[#0c4a6e] text-white sticky top-0 z-40 border-b border-white/10">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <h2 className="text-sm font-medium">gestão - Rubricas</h2>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content with Watermark */}
        <main className="flex-1 relative">
          {/* Watermark Background */}
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

          {/* Page Content */}
          <div className="relative z-10 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
