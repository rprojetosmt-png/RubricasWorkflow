# Rubrica - Esteira de aprovação

Este projeto possui front-end (Vite + React) e um backend local (Express + Prisma + SQLite) para persistência.

## Pré-requisitos

- Node.js (LTS)

## Backend (API local)

1. Abra um terminal na pasta `server`.
2. Instale dependências:
   - `cmd /c npm i`
3. Gere o banco e rode a migração:
   - `cmd /c npx prisma migrate dev --name init`
4. Inicie a API:
   - `cmd /c npm run dev`

A API roda por padrão em `http://localhost:3001` e já faz seed inicial a partir de `server/seed.json`.

## Front-end

1. Abra outro terminal na raiz do projeto.
2. Instale dependências:
   - `cmd /c npm i`
3. Inicie o front:
   - `cmd /c npm run dev`

O front-end usa a API local em `http://localhost:3001`. Se quiser mudar, defina `VITE_API_URL`.
