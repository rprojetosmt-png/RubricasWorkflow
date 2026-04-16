import { createBrowserRouter } from "react-router";
import { DashboardPage } from "./pages/DashboardPage";
import { SolicitacaoDetailPage } from "./pages/SolicitacaoDetailPage";
import { ConfiguracaoEsteiraPage } from "./pages/ConfiguracaoEsteiraPage";
import { NovaSolicitacaoPage } from "./pages/NovaSolicitacaoPage";
import { RootLayout } from "./layouts/RootLayout";
import { ConcursoPage } from "./pages/ConcursoPage";
import { ConcursoDetailPage } from "./pages/ConcursoDetailPage";
import { ConcursoNovoPage } from "./pages/ConcursoNovoPage";
import { ConcursoEditPage } from "./pages/ConcursoEditPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "nova-solicitacao", Component: NovaSolicitacaoPage },
      { path: "solicitacao/:id", Component: SolicitacaoDetailPage },
      { path: "configuracao", Component: ConfiguracaoEsteiraPage },
      { path: "concurso", Component: ConcursoPage },
      { path: "concurso/novo", Component: ConcursoNovoPage },
      { path: "concurso/:id", Component: ConcursoDetailPage },
      { path: "concurso/:id/editar", Component: ConcursoEditPage },
    ],
  },
]);
