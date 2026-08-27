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

## Critérios de aceite

- [ ] Extensões `pgcrypto`, `citext` e `unaccent` criadas
- [ ] Todos os dez tipos enumerados da seção 3, com os valores exatos do documento
- [ ] Funções `sem_acento` (IMMUTABLE) e `set_atualizado_em` criadas
- [ ] `db/schema.ts` declara os enums espelhando o SQL
- [ ] Usuário da aplicação sem permissão de DDL; migração roda com credencial separada
- [ ] `pnpm migrar` é idempotente em base já migrada

## Como verificar

```bash
pnpm migrar && pnpm tipos
psql "$DATABASE_URL" -c "\dT+"
```

## Fora de escopo

Qualquer tabela. Esta tarefa cria apenas a fundação.
