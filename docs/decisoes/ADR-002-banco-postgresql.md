# ADR-002 — PostgreSQL como SGBD, Drizzle ORM como camada de acesso

## Status

Aceita

## Data

2025-08-27

## Contexto

A decisão ADR-001 definiu que o projeto usa banco de dados para a camada de gestão.
É preciso escolher o SGBD e a camada de acesso no código. A escolha do provedor de
hospedagem é tratada separadamente na ADR-004.

Requisitos derivados da arquitetura:

- Chave pública `slug citext` para URLs limpas (doc 02 §1).
- Busca full-text em português com `tsvector` e `unaccent` (doc 02 §4, §5, §6.5).
- Coordenadas geográficas com `numeric(9,6)`, PostGIS apenas se necessário (doc 02 §6.2).
- Constraints compostas: `num_nonnulls`, `CHECK` com subconsulta, colunas geradas (doc 02 §7, §8).
- Row Level Security para separar leitura pública de escrita administrativa (doc 02 §14).
- Views materializadas e não materializadas para consumo no build (doc 02 §13).
- Volume esperado inferior a 5 mil linhas e 1 GB de metadados (doc 02 §15).
- Migrações versionadas em SQL, imutáveis após aplicadas (doc 02 §1, doc 03 §6).

## Decisão

- **SGBD:** PostgreSQL 15+ (provedor de hospedagem definido na ADR-004).
- **ORM:** Drizzle ORM + Drizzle Kit, com schema em TypeScript espelhando fielmente
  o SQL do documento de banco.
- **O que Drizzle não expressa** — `CHECK` composto, `num_nonnulls`, colunas geradas
  com `tsvector`, RLS, views e triggers — vai em SQL bruto dentro do arquivo de
  migração.
- **Migrações** geradas por `drizzle-kit generate`, revisadas à mão, aplicadas no CI.
  Migração aplicada é imutável; correção é sempre uma nova migração.
- **Dois usuários de banco:** um com DDL para migrações (CI), outro sem DDL para a
  aplicação — separação que impede alteração de schema fora do fluxo de migração.

## Alternativas consideradas

- **SQLite / Turso:** simples e barato, mas sem `tsvector`, sem `citext`, sem RLS e
  sem `num_nonnulls` — exigiria reimplementar no código da aplicação constraints que
  o PostgreSQL resolve nativamente.

- **MongoDB / Firestore:** modelo documental não se alinha à natureza relacional do
  domínio (metas N:N com evidências, documento com múltiplos arquivos versionados,
  formulário com questões e respostas tipadas).

- **Prisma como ORM:** camada de abstração mais pesada, schema próprio divergente
  do SQL, e dificuldade com SQL bruto para colunas geradas e constraints compostas.

## Consequências

Benefícios:

- PostgreSQL resolve nativamente busca full-text em português, constraints compostas
  e RLS — sem código adicional na aplicação.
- Volume previsto (< 5 mil linhas) é coberto pela faixa gratuita dos provedores
  managed disponíveis (ver ADR-004).
- Drizzle mantém o schema TypeScript como espelho legível do SQL, sem camada mágica.
- Migrações em SQL versionado permitem auditoria completa do histórico de schema.

Custos:

- O que Drizzle não expressa exige SQL bruto manual, aumentando a superfície de
  revisão em migrações.
- Dependência de provedor managed (ver ADR-004); mitigada pelo fato de que o
  PostgreSQL é portável e o site não depende do banco em tempo de requisição
  (ADR-001).
- Dois usuários de banco adicionam complexidade à configuração de ambiente.

## Impacto técnico

Arquivos ou módulos afetados:

- `db/schema.ts` — espelho fiel do documento de banco (doc 03 §6)
- `db/migrations/` — SQL versionado, imutável após aplicado
- `db/seed.ts` — dados reais do Relatório Parcial, idempotente
- `db/importar-formularios.ts` — importação de CSV do Google Forms
- `src/dados/cliente.ts` — conexão com o banco
- `src/dados/consultas/` — funções tipadas pelo schema Drizzle
- `.env.local` — `DATABASE_URL` e `DATABASE_URL_MIGRACAO` (doc 03 §13)

Fontes:

- doc 02 §0 (justificativa da introdução do banco)
- doc 02 §1 (convenções: snake_case, uuid, citext, timestamptz, soft delete)
- doc 02 §14 (Row Level Security)
- doc 02 §15 (operação: volume, backup, ambientes)
- doc 03 §1 (stack: PostgreSQL + Drizzle)
- doc 03 §6 (banco: da documentação ao código)
