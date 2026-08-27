# TAREFA 05 — Migração 0002: arquivo, documento e a view de anexos

**Fase:** 1 · **Depende de:** 04 · **Estimativa de diff:** médio

## Objetivo

O núcleo da prestação de contas no banco: separação entre obra intelectual e binário.

## Contexto obrigatório

- `docs/02-arquitetura-banco.md`, seções 5 e 13

## Arquivos permitidos

```
db/schema.ts  db/migrations/0002_*.sql  src/dados/consultas/anexos.ts
```

## Critérios de aceite

- [ ] Tabelas `arquivo`, `documento` e `documento_arquivo` idênticas ao documento,
      incluindo `sha256 char(64)`, `origem_url`, `espelhado_em` e `licenca`
- [ ] Coluna gerada `busca tsvector` usando `sem_acento`, com índice GIN
- [ ] `CHECK publicado_exige_data` implementado
- [ ] Índice parcial único garantindo no máximo um arquivo principal por documento
- [ ] Índice parcial de anexos exigidos pelo edital
- [ ] View `vw_anexo_publico` conforme a seção 13
- [ ] Constraint alguma foi simplificada, removida ou "adaptada"

## Como verificar

```bash
pnpm migrar && pnpm tipos
psql "$DATABASE_URL" -c "\d+ documento"
```

Comparar a saída de `\d+` linha a linha com a seção 5 do documento de banco e colar a
comparação no PR.

## Fora de escopo

Interface. Esta tarefa é só banco.
