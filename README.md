# Valora

Valora é uma aplicação de gestão financeira pessoal com foco em:

- controle de dívidas e entradas
- importação de faturas em PDF com IA
- acompanhamento de valores que outras pessoas te devem
- visão consolidada no dashboard

## O que o projeto faz

### 1. Dashboard financeiro
- saldo atual
- saldo projetado (incluindo valores a receber)
- total de dívidas em aberto
- total a receber
- gastos e entradas do mês
- próximas contas a vencer
- pessoas que te devem (com total por pessoa)

### 2. Gestão de dívidas
- criar, editar e excluir dívidas
- marcar se a dívida é sua (`PAYABLE`) ou se alguém te deve (`RECEIVABLE`)
- vincular dívida a uma pessoa relacionada
- filtros por período (data inicial/final)

### 3. Gestão de entradas
- criar, editar e excluir entradas (CLT/PJ)
- filtros por período e tipo

### 4. Importação de fatura com IA
- upload de PDF
- extração e classificação automática dos itens
- revisão manual antes de confirmar
- escolha por item: dívida sua ou de outra pessoa
- opção de aplicar responsável para todos os itens de uma vez

## Stack

- Next.js 16
- React 19 + TypeScript
- Tailwind CSS
- Prisma + MySQL
- Better Auth
- Vercel AI SDK (OpenAI / Anthropic)
- Turborepo + Bun

## Estrutura do monorepo

```txt
valora/
├─ apps/
│  └─ web/                # aplicação web (Next.js)
└─ packages/
   ├─ ai/                 # integração IA e classificação de fatura
   ├─ auth/               # auth + prisma schema/client
   ├─ env/                # validação de variáveis de ambiente
   ├─ ui/                 # componentes compartilhados
   └─ config/             # configurações TS comuns
```

## Como rodar localmente

### Pré-requisitos
- Bun instalado (`bun@1.2.19` recomendado)
- MySQL rodando

### 1) Instalar dependências
```bash
bun install
```

### 2) Configurar variáveis de ambiente
Você vai precisar, no mínimo:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `CORS_ORIGIN`
- `AI_PROVIDER` (`openai` ou `anthropic`)
- `AI_MODEL` (opcional)
- `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY`

Sugestão: use `.env` em `apps/web` e `packages/auth` conforme seu setup local.

### 3) Rodar banco e gerar client Prisma
```bash
bun --cwd packages/auth run db:migrate
bun --cwd packages/auth run db:generate
```

### 4) Subir app web
```bash
bun run dev:web
```

Abra: `http://localhost:3001`

## Scripts úteis

- `bun run dev`: roda tudo em modo desenvolvimento
- `bun run dev:web`: roda só o app web
- `bun run build`: build do monorepo
- `bun run check-types`: checagem de tipos
- `bun run check`: lint/format com Biome

## Observações

- O projeto usa `.gitignore` para ocultar `.env` e arquivos MCP locais com chaves.
- Em Windows + OneDrive, o Prisma pode ocasionalmente bloquear o `query_engine`; se acontecer, pare processos Node/Bun e rode `db:generate` novamente.
