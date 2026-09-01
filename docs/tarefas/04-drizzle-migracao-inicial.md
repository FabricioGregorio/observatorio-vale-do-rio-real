# TAREFA 04 — Conexão, Drizzle e migração 0001

**Fase:** 1 · **Depende de:** 01 · **Estimativa de diff:** médio

## Objetivo

Banco conectado e migração inicial com extensões, enums, funções e triggers.

## Contexto obrigatório

- `docs/02-arquitetura-banco.md`, seções 1, 3, 4 e 15

## Arquivos permitidos

```
db/schema.ts  db/migrations/0001_*.sql  db/cliente.ts
src/dados/cliente.ts  drizzle.config.ts  package.json (scripts migrar/seed)
```

## Situação — 2026-08-30

**Implementação local concluída. Validação remota parcial.**

Implementado e verificado localmente:

- `db/schema.ts` com os dez enums espelhando o doc 02 §3
- `db/migrations/0001_fundacao.sql` — extensões, funções e enums
- `db/cliente.ts` e `src/dados/cliente.ts`, ambos em `drizzle-orm/node-postgres` + `pg`
- `drizzle.config.ts` com validação explícita de `DATABASE_URL_MIGRACAO`
- `package.json` com `migrar` e `gerar-migracao` reais, sem placeholder
- `pnpm tipos`, `pnpm lint`, `pnpm teste`, `pnpm a11y`, `pnpm build` e `pnpm verificar`
  aprovados

A migração foi aplicada **uma vez** contra um projeto Neon descartável, pelo fluxo
oficial (`pnpm migrar`), com os objetos conferidos diretamente no banco. Os itens que
dependem de roles separados e de idempotência **não foram executados** e seguem
abertos abaixo.

## Critérios de aceite

- [x] Extensões `pgcrypto`, `citext` e `unaccent` criadas
      — conferidas em `pg_extension` (1.4 / 1.8 / 1.1) no banco descartável
- [x] Todos os dez tipos enumerados da seção 3, com os valores exatos do documento
      — dez enums conferidos em `pg_enum`, valor a valor e na mesma ordem do doc 02 §3
- [x] Funções `sem_acento` (IMMUTABLE) e `set_atualizado_em` criadas
      — `sem_acento`: IMMUTABLE, PARALLEL SAFE, STRICT; teste funcional
      `sem_acento('ação São Cristóvão')` devolveu `acao Sao Cristovao`
- [x] `db/schema.ts` declara os enums espelhando o SQL
      — comparação automatizada entre doc 02 §3, SQL da migração e `schema.ts`
- [ ] **NÃO EXECUTADO** — Usuário da aplicação sem permissão de DDL; migração roda com
      credencial separada. Os dois roles não foram provisionados; a validação usou
      apenas a credencial administrativa. Provisionamento definido na ADR-007.
- [ ] **NÃO EXECUTADO** — `pnpm migrar` é idempotente em base já migrada. A migração
      rodou uma única vez; a segunda execução não foi feita.

## Como verificar

```bash
pnpm migrar && pnpm tipos
psql "$DATABASE_URL" -c "\dT+"
```

## Fora de escopo

Qualquer tabela. Esta tarefa cria apenas a fundação.
