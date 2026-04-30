import { createHashRouter } from "react-router";
import { DashboardPage } from "./pages/DashboardPage";
import { SolicitacaoDetailPage } from "./pages/SolicitacaoDetailPage";
import { ConfiguracaoEsteiraPage } from "./pages/ConfiguracaoEsteiraPage";
import { NovaSolicitacaoPage } from "./pages/NovaSolicitacaoPage";
import { RootLayout } from "./layouts/RootLayout";
import { ComponentesPage } from "./pages/ComponentesPage";

export const router = createHashRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "nova-solicitacao", Component: NovaSolicitacaoPage },
      { path: "solicitacao/:id", Component: SolicitacaoDetailPage },
      { path: "configuracao", Component: ConfiguracaoEsteiraPage },
      { path: "componentes", Component: ComponentesPage },
    ],
  },
]);
