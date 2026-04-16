# Fase 0 - Alinhamento Funcional do Menu Concurso

Data: 2026-04-15
Projeto: RubricasWorkflow
Responsavel: Codex + Time SIGEP

## 1) Objetivo da Fase 0
Fechar o escopo funcional do novo menu `Concurso`, padronizar nomenclaturas e definir matriz de acesso para permitir implementacao segura na Fase 1.

## 2) Escopo confirmado (MVP)
O menu `Concurso` tera cadastro de concurso/processo seletivo como processo administrativo estruturado, sem gestao de vagas e sem execucao de candidatos.

### 2.1 Entra no MVP
- Identificacao do concurso
- Classificacao juridica e de vinculo
- Contexto institucional (multi-orgao)
- Datas do ciclo
- Publicacoes e documentos
- Status calculado automaticamente

### 2.2 Nao entra no MVP
- Vagas por cargo/localidade/reservas
- Inscricoes e homologacao de candidatos
- Classificacao, convocacao, nomeacao

## 3) Nomenclaturas padrao

### 3.1 Entidade principal
- Nome tecnico: `Concurso`
- Rotulo em tela: `Concurso`
- Escopo de tipo: Concurso, Processo Seletivo, Processo Simplificado

### 3.2 Campos obrigatorios (MVP)
- nomeConcurso
- sigla
- numeroEdital
- tipoConcurso
- regimeJuridico
- tipoVinculo
- abrangencia
- orgaosEnvolvidos (multiplos)
- instituicaoRealizadora
- setorResponsavel
- dataPublicacaoEdital
- dataInicioInscricao
- dataFimInscricao
- objetivo

### 3.3 Campos opcionais (MVP)
- dataProva
- dataResultado
- dataValidade
- dataCancelamento
- observacoes
- motivo (quando nao ativo)

## 4) Regras de negocio acordadas

### 4.1 Regra de status (calculado)
- `CANCELADO`: quando `dataCancelamento` estiver preenchida
- `ENCERRADO`: quando `dataValidade` existir e ja estiver no passado
- `ATIVO`: demais casos

### 4.2 Validacoes minimas de datas
- dataInicioInscricao <= dataFimInscricao
- dataPublicacaoEdital <= dataInicioInscricao
- se dataResultado existir e dataProva existir, dataProva <= dataResultado
- se dataValidade existir e dataResultado existir, dataResultado <= dataValidade

### 4.3 Regra de separacao institucional
- `orgaosEnvolvidos` identifica quem demanda/usa
- `instituicaoRealizadora` identifica quem executa o certame
- nao permitir gravar concurso sem essa separacao

## 5) Matriz de acesso (proposta para MVP)
Mapeada ao modelo de sessao atual (`activeUserId`, `activeGroupId`) com grupos ja existentes.

### 5.1 Perfis
- `CONCURSO_ADMIN`: cria, edita, cancela, publica documentos
- `CONCURSO_EDITOR`: cria e edita, sem cancelar
- `CONCURSO_LEITOR`: somente consulta

### 5.2 Mapeamento inicial de grupos (mock)
- TI/Sistemas -> CONCURSO_ADMIN
- Departamento Pessoal -> CONCURSO_EDITOR
- Diretoria -> CONCURSO_LEITOR
- Demais grupos -> CONCURSO_LEITOR

Observacao: este mapeamento e inicial para prototipo local e pode ser externalizado na Fase 2/3.

## 6) Navegacao planejada (para Fase 1/3)

### 6.1 Menu lateral
Novo item em `Cadastro`:
- Concurso

### 6.2 Rotas planejadas
- `/concurso` (lista)
- `/concurso/novo` (cadastro)
- `/concurso/:id` (detalhe)
- `/concurso/:id/editar` (edicao)

## 7) Criterios de aceite da Fase 0
- Escopo de Concurso isolado de Vagas e Execucao
- Campos e nomenclaturas padronizados
- Regra de status aprovada
- Matriz de acesso inicial definida
- Navegacao alvo definida

## 8) Pendencias para validacao rapida do PO
1. Confirmar lista fechada de tipos de concurso
2. Confirmar lista fechada de regime juridico
3. Confirmar lista fechada de tipo de vinculo
4. Confirmar se `dataValidade` sera obrigatoria para `Concurso` e opcional para `Processo Seletivo`

Ate confirmacao, o desenvolvimento seguira com essas premissas como padrao do MVP.
