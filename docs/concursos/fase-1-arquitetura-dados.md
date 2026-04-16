# Fase 1 - Arquitetura e Dados (Concurso)

Data: 2026-04-15
Projeto: RubricasWorkflow

## Entregas realizadas

1. Estrutura backend criada em `server/concursos`.
2. Entidade e regras de negocio de Concurso definidas em schema dedicado.
3. Repositorio de persistencia local JSON implementado.
4. Seed de Concurso criado para ambiente local.
5. Startup do servidor atualizado para inicializar dados de Concurso automaticamente.

## Arquivos criados

- `server/concursos/concursosSchema.js`
- `server/concursos/concursosRepository.js`
- `server/concursos-seed.json`
- `server/concursos-data.json`

## Arquivo alterado

- `server/index.js`

## Modelo de dados (Concurso)

Campos principais:
- id
- nomeConcurso
- sigla
- numeroEdital
- tipoConcurso
- regimeJuridico
- tipoVinculo
- abrangencia
- orgaosEnvolvidos[]
- instituicaoRealizadora
- setorResponsavel
- dataPublicacaoEdital
- dataInicioInscricao
- dataFimInscricao
- dataProva
- dataResultado
- dataValidade
- dataCancelamento
- objetivo
- observacoes
- motivo
- publicacoes[]
- situacao (calculada)
- createdAt / updatedAt

## Regras implementadas

- Situacao calculada:
  - CANCELADO: quando dataCancelamento preenchida
  - ENCERRADO: quando dataValidade no passado
  - ATIVO: caso contrario

- Validacoes:
  - obrigatoriedade dos campos MVP definidos na Fase 0
  - ordenacao minima de datas (inscricao, publicacao, prova/resultado, resultado/validade)

## Observacoes

- Persistencia segue local JSON (sem Prisma), conforme combinado.
- Nesta fase nao foram criados endpoints nem telas do menu Concurso.
- Endpoints entram na Fase 2.
