# Rubrica - Esteira de aprovação

Este projeto possui front-end (Vite + React) e um backend local (Express) com persistência em arquivo JSON (temporário).

## Pré-requisitos

- Node.js (LTS)

## Backend (API local - JSON)

1. Abra um terminal na pasta `server`.
2. Instale dependências:
   - `cmd /c npm i`
3. Inicie a API:
   - `cmd /c npm run dev`

A API roda por padrão em `http://localhost:3001` e grava os dados em `server/data.json`.

## Front-end

1. Abra outro terminal na raiz do projeto.
2. Instale dependências:
   - `cmd /c npm i`
3. Inicie o front:
   - `cmd /c npm run dev`

O front-end usa a API local em `http://localhost:3001`. Se quiser mudar, defina `VITE_API_URL`.
