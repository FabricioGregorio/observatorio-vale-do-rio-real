# ADR-001 — Arquitetura híbrida: banco para gestão, estático para preservação

## Status

Aceita

## Data

2025-08-27

## Contexto

O projeto é financiado por edital público (PNAB nº 02/2025) e o site funciona como
prova documental da execução do objeto. A durabilidade e a rastreabilidade dos links
são mais importantes do que qualquer sofisticação visual. O maior risco técnico
identificado é a fragilidade dos links apontando para Google Drive, Google Docs e
Figma — endereços que quebram, mudam de permissão e não sobrevivem a uma auditoria
(doc 01 §0).

Ao mesmo tempo, funcionalidades além do escopo mínimo — formulário de escuta
permanente, painel de indicadores atualizáveis, metas com relação N:N, busca
full-text, continuidade pós-edital — exigem persistência estruturada (doc 02 §0).

A questão central: como conciliar a necessidade de banco de dados com a garantia de
que o site sobrevive sem ele?

## Decisão

Adotar arquitetura híbrida em duas camadas:

- **Camada de gestão:** PostgreSQL armazena metadados, relações e dados estruturados.
- **Camada de preservação:** Next.js gera HTML estático (SSG/ISR) em build time;
  arquivos binários (PDF, MP3, imagens, CSV) vivem em armazenamento de objetos com
  URL própria e hash SHA-256.

O banco nunca é consultado em tempo de requisição pelo visitante. Toda página é gerada
estaticamente e revalidada via webhook. Se o banco cair, o site continua no ar e a
prestação de contas permanece íntegra.

```
Postgres (gestão)  ──build/webhook──▶  Next.js SSG/ISR  ──▶  HTML estático (preservação)
       │                                                          ▲
       └──▶ Blob/R2: PDF, MP3, imagens (URL estável + SHA-256) ───┘
```

(doc 02 §0, diagrama)

## Alternativas consideradas

- **Sem banco, tudo em MDX/Git (doc 01 §6 — recomendação da v1 para o escopo
  mínimo):** suficiente para publicar PDFs e páginas de leitura, mas não sustenta
  formulário de escuta, busca full-text, relação N:N de metas com evidências nem
  continuidade pós-edital.

- **Banco como camada única:** risco de perda total se o provedor ou a assinatura
  expirarem — inaceitável num projeto de prestação de contas com vida útil maior que
  o contrato.

- **CMS headless pago (Sanity, Contentful):** custo recorrente, dependência de
  terceiro, dados fora do controle do projeto.

## Consequências

Benefícios:

- Site sobrevive à morte do banco, à expiração do provedor e à ausência de
  manutenção ativa.
- Custo de hospedagem próximo de zero; resistência a picos de acesso.
- Conteúdo editorial (MDX no Git) e dados estruturados (Postgres) coexistem sem
  conflito.
- Nenhum anexo obrigatório depende exclusivamente de link externo.

Custos:

- Toda alteração de dados exige rebuild ou revalidação para refletir no site.
- Duas fontes de conteúdo (MDX + banco) exigem clareza sobre onde cada tipo de
  informação vive.
- A equipe precisa manter o banco funcional para atualizar conteúdo, mesmo que o
  site público não dependa dele em tempo de requisição.

## Impacto técnico

Arquivos ou módulos afetados:

- `src/app/` — todas as rotas usam Server Components com dados resolvidos em build time
- `src/dados/consultas/` — única camada de acesso ao banco
- `db/schema.ts` e `db/migrations/` — definição e versionamento do schema
- `scripts/verificar-pendencias.ts` — gate de CI que valida integridade da camada de preservação
- `content/` — conteúdo editorial em MDX, fora do banco

Fontes:

- doc 01 §0, §6 (decisões e justificativas)
- doc 02 §0 (correção de rota deliberada)
- doc 03 §1, §5, §6 (stack, componentes, banco)
