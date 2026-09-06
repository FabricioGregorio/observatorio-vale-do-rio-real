# ADR-011 — Credencial separada para manutenção com DML

## Status

Aceita

## Data

2026-09-04

## Contexto

O provisionamento executado no ambiente confirmou três necessidades distintas:
leitura do site, manutenção de metadados e aplicação de migrações. A credencial da
aplicação passou a ser somente leitura; os scripts de espelhamento e catalogação
continuam precisando inserir e atualizar linhas, mas não precisam de DDL.

## Decisão

Adotar três roles e três variáveis independentes, aplicando menor privilégio:

- `DATABASE_URL` → `app_observatorio` → `SELECT`;
- `DATABASE_URL_MANUTENCAO` → `manutencao_observatorio` → `SELECT, INSERT, UPDATE, DELETE`;
- `DATABASE_URL_MIGRACAO` → `neondb_owner` (ou o role real provisionado) → migrations e DDL.

O cliente de manutenção vive em `src/dados/clienteManutencao.ts`. Ele não faz
fallback para `DATABASE_URL` nem para `DATABASE_URL_MIGRACAO`; sem a variável, o
script falha com erro explícito. Nenhum dos roles de aplicação ou manutenção recebe
`CREATE` no schema.

Esta ADR supersede somente:

1. a previsão de `SELECT, INSERT, UPDATE, DELETE` para o role da aplicação na
   ADR-007 §Decisão, item 3;
2. a regra da Tarefa 06 — `docs/tarefas/06-espelhamento-de-arquivos.md`, seção
   “Credencial de banco” — que proibia terceira credencial e novo módulo de cliente.

O restante da ADR-007 permanece histórico e válido: roles são infraestrutura,
segredos não entram no Git, migrations não criam roles e privilégios padrão devem
ser configurados para o role real que cria os objetos.

## Consequências

Scripts que fazem DML não podem mais importar o cliente de leitura. A separação
torna a permissão verificável e limita o impacto de um erro ou comprometimento do
caminho de renderização. O custo operacional é manter uma variável adicional e
provisionar/rotacionar uma terceira credencial.

## Fontes

- ADR-007 — provisionamento dos roles como infraestrutura;
- `docs/02-arquitetura-banco.md` — menor privilégio e ordem de provisionamento;
- adendo obrigatório do Prompt 1, §§A–E.
