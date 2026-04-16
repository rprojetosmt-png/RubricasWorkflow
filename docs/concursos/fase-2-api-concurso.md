# Fase 2 - API Concurso (Backend)

Data: 2026-04-16
Projeto: RubricasWorkflow

## Entregas

Foram implementados os endpoints REST de Concurso usando persistencia local JSON.

### Endpoints criados

- GET `/api/concursos`
- GET `/api/concursos/:id`
- POST `/api/concursos`
- PUT `/api/concursos/:id`
- PATCH `/api/concursos/:id/cancelar`
- GET `/api/concursos/:id/publicacoes`
- POST `/api/concursos/:id/publicacoes`

## Regras aplicadas

- Validacao de campos obrigatorios no POST e PUT via `validarConcurso`.
- Validacao de ordem de datas no POST e PUT.
- Cancelamento com data automatica quando nao enviada (`toDateOnly(new Date())`).
- Publicacoes exigem `tipo`, `titulo` e `dataPublicacao`.
- Respostas 404 para concurso inexistente.

## Startup do servidor

- Inicializacao combinada de seeds:
  - `seedIfEmpty()` (solicitacoes)
  - `seedConcursosIfEmpty()` (concursos)

## Arquivo alterado

- `server/index.js`

## Smoke test

- `node --check` executado com sucesso em:
  - `server/index.js`
  - `server/concursos/concursosSchema.js`
  - `server/concursos/concursosRepository.js`

- Teste rapido de leitura executado:
  - `seedConcursosIfEmpty()`
  - `readConcursos()`
  - retorno validado com pelo menos 1 concurso.
