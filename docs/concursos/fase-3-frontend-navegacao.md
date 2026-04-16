# Fase 3 - Frontend e Navegação (Concurso)

Data: 2026-04-16
Projeto: RubricasWorkflow

## Entregas

- Novo item `Concurso` incluído no menu lateral em `Cadastro`.
- Rotas de Concurso registradas no frontend.
- Tela de listagem de concursos com filtros e consumo da API.
- Tela de detalhe de concurso para leitura.
- Tela de novo concurso criada como placeholder funcional para próxima fase.

## Rotas adicionadas

- `/concurso`
- `/concurso/novo`
- `/concurso/:id`

## Arquivos criados

- `src/app/data/concursosStore.ts`
- `src/app/pages/ConcursoPage.tsx`
- `src/app/pages/ConcursoDetailPage.tsx`
- `src/app/pages/ConcursoNovoPage.tsx`
- `docs/concursos/fase-3-frontend-navegacao.md`

## Arquivos alterados

- `src/app/routes.tsx`
- `src/app/layouts/RootLayout.tsx`

## Comportamento entregue

- Lista carrega via `GET /api/concursos`.
- Filtros por texto e situação (`ATIVO`, `ENCERRADO`, `CANCELADO`).
- Clique em item abre detalhe (`/concurso/:id`).
- Botão `Novo Concurso` navega para `/concurso/novo`.

## Observação

- Cadastro completo de novo concurso (formulário com POST/PUT) fica para a próxima etapa de implementação funcional.
