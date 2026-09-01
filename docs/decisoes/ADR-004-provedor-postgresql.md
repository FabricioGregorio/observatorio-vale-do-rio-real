# ADR-004 — Provedor de hospedagem do PostgreSQL

## Status

Aceita

## Data

2025-08-27

**Validação e aceite:** 2026-08-27

**Atualizada em:** 2026-08-30 — driver de conexão fixado, provisionamento de
roles movido para a ADR-007 e situação da validação operacional revista.

## Contexto

A ADR-002 definiu PostgreSQL 15+ como SGBD e Drizzle ORM como camada de acesso.
Resta decidir **onde** o PostgreSQL será hospedado.

A documentação de arquitetura menciona "Supabase ou Neon" como candidatos (doc 02
cabeçalho, doc 03 §1) sem fixar um deles. A escolha depende de critérios que ainda
precisam de avaliação prática pela equipe.

Restrições já definidas:

- Volume inferior a 5 mil linhas e < 1 GB de metadados (doc 02 §15).
- Faixa gratuita deve cobrir o volume previsto (doc 02 §15).
- Row Level Security é requisito — o provedor precisa suportá-la nativamente
  (doc 02 §14).
- Dois usuários separados: um com DDL (migrações/CI), outro sem DDL (aplicação)
  (doc 03 §6, §13).
- Backup `pg_dump` diário para R2/S3, retenção de 30 dias (doc 02 §15).
- Ambientes separados: `dev` (local, Docker), `preview` (branch, seed), `prod`
  (doc 02 §15).
- O banco não é consultado em tempo de requisição — a escolha do provedor não
  afeta a latência percebida pelo visitante (ADR-001).

## Decisão

Adotar **Neon** como provedor de hospedagem do PostgreSQL.

A escolha se apoia no perfil operacional do projeto: volume pequeno, carga
intermitente, banco consultado somente em build time e necessidade de ambiente de
preview isolado por branch. O Neon inclui branching e scale-to-zero na faixa gratuita;
quando o uso crescer, o plano Launch cobra compute e armazenamento por consumo.

Manter dois papéis de acesso distintos — aplicação (sem DDL, via `DATABASE_URL`) e
migração (com DDL, via `DATABASE_URL_MIGRACAO`). **A forma de provisionar esses roles
não é responsabilidade desta ADR nem das migrações de schema**: ela está definida na
ADR-007. A redação anterior desta ADR dizia "roles criados por migração"; isso foi
substituído, porque criação de role é provisionamento de infraestrutura e não faz
parte do schema versionado.

**Driver de conexão:** `pg` (node-postgres), via `drizzle-orm/node-postgres`, tanto na
aplicação quanto nos scripts de `db/` e no Drizzle Kit. Nenhum driver específico do
provedor. O Neon é hospedagem, não dependência de código: o mesmo cliente conecta em
PostgreSQL local em Docker, no serviço do CI e em qualquer PostgreSQL futuro. Um driver
HTTP proprietário quebraria os ambientes `dev` e de CI previstos no doc 02 §15 e
anularia, na prática, a portabilidade citada abaixo como benefício.

**TLS:** as conexões de produção usam `sslmode=verify-full` explicitamente (ADR-008).

Manter também o backup externo definido no doc 02 §15: `pg_dump` diário para R2/S3,
retenção de 30 dias e dump mensal versionado. A restauração nativa do provedor não
substitui a cópia independente.

### Base da decisão

**Esta decisão foi tomada por avaliação arquitetural**, a partir da comparação
documentada em `docs/tarefas/04-validacao-provedor.md` (critérios: modelo de
permissões, branching por PR, faixa gratuita, custo após crescimento, recuperação de
backup e administração). Ela **não** se apoia em uma bateria completa de testes
operacionais.

O que foi de fato executado contra um projeto Neon descartável, em 2026-08-30, está
registrado em `docs/tarefas/04-validacao-provedor.md`: conexão autenticada e aplicação
da migração `0001_fundacao` pelo fluxo oficial, com conferência dos objetos no banco.

**A validação operacional permanece como atividade posterior** e não foi executada:
provisionamento e teste dos dois roles, verificação explícita de negação de DDL para o
role da aplicação, `pg_dump`/`pg_restore --list`, teste de recuperação de backup e
execução remota do workflow no GitHub Actions. Esses itens continuam abertos e **não
devem ser apresentados como aprovados**. Nenhum deles altera a escolha arquitetural;
todos precisam estar verdes antes da configuração de produção.

## Alternativas consideradas

- **Supabase**
  - PostgreSQL managed com RLS como cidadão de primeira classe.
  - Painel de administração integrado (Studio) — pode facilitar a gestão de
    conteúdo pela equipe sem ferramenta adicional.
    **Observação:** a arquitetura não prevê painel administrativo na primeira
    versão. Caso seja necessário um CMS futuramente, essa decisão será
    revisada em ADR própria. A existência do Studio não deve ser, por si só,
    critério de escolha do provedor.
  - `anon` e `service_role` facilitam as políticas da API, mas não substituem os
    dois roles de conexão exigidos para aplicação e migração.
  - Faixa gratuita: 500 MB de banco, 1 GB de storage (pode servir para arquivos
    menores; os maiores iriam para R2/S3 de qualquer forma).
  - Risco: se o projeto free-tier for pausado por inatividade, exige ação manual
    para restaurar — mitigado pelo fato de que o site estático continua no ar
    (ADR-001).

- **Neon**
  - PostgreSQL serverless com branching nativo — cada preview da Vercel pode ter
    seu próprio branch de banco, alinhado ao fluxo de "preview por branch"
    (doc 03 §8).
  - Scale-to-zero reduz custo em períodos de inatividade.
  - Faixa gratuita: 0,5 GB de storage, 100 CU-h mensais por projeto, branching e
    restauração de até 6 horas ou 1 GB de mudanças (limites conferidos em 2026-08-27).
  - RLS suportado (é PostgreSQL padrão), mas sem painel de administração
    comparável ao Supabase Studio.
  - Risco: compute serverless pode ter cold start — irrelevante neste projeto,
    pois o banco só é consultado em build time.

- **PostgreSQL autogerido (VPS / Docker em cloud)**
  - Controle total, sem limite de tier.
  - Custo de operação e manutenção incompatível com o perfil da equipe e o
    orçamento do projeto.
  - Sem justificativa dado o volume previsto.

## Consequências

Benefícios:

- Preview por PR pode usar branches efêmeros sem exigir o plano pago.
- Scale-to-zero é adequado ao uso esporádico do banco em build time.
- PostgreSQL padrão, Drizzle e `pg_dump` preservam a portabilidade para outro provedor.
- O crescimento inicial é cobrado por consumo, sem piso mensal no plano Launch.

Custos e riscos:

- A faixa gratuita oferece janela curta de restauração; o backup externo e seu teste de
  recuperação são obrigatórios.
- Não há equivalente direto ao Supabase Studio para a gestão editorial. Isso não bloqueia
  a v1, que não prevê painel administrativo; uma necessidade futura exige ADR própria.
- Preview que herda dados de produção pode expor dados pessoais. Preferir branch somente
  de schema ou seed anonimizado.
- A criação automatizada de branches exige segredo/API key no GitHub e rotina de limpeza.

## Impacto técnico

Arquivos ou módulos afetados (independem da escolha, mas a configuração muda):

- `.env.local` / `.env.example` — `DATABASE_URL` e `DATABASE_URL_MIGRACAO`
- `src/dados/cliente.ts` — string de conexão e pool settings
- `.github/workflows/ci.yml` — variáveis de ambiente para migrações no CI
- `db/migrations/` — SQL padrão, sem depender de roles específicos de provedor; **não**
  cria roles (ADR-007)
- `db/cliente.ts` e `src/dados/cliente.ts` — ambos em `drizzle-orm/node-postgres` + `pg`
- `drizzle.config.ts` — `dialect: "postgresql"`, sem `driver` proprietário

Decisões relacionadas:

- ADR-006 — Cloudflare R2 como provedor de storage de objetos
- ADR-007 — provisionamento dos roles como infraestrutura
- ADR-008 — `sslmode=verify-full` nas conexões de produção

Fontes:

- doc 02 cabeçalho ("PostgreSQL 15+ (Supabase ou Neon)")
- doc 02 §14 (Row Level Security com roles `anon` e `service_role`)
- doc 02 §15 (operação: volume, backup, ambientes, custo esperado)
- doc 03 §1 (stack: "PostgreSQL (Supabase ou Neon)")
- doc 03 §8 (preview por branch na Vercel)
- doc 03 §13 (variáveis de ambiente)
- validação temporária `docs/tarefas/04-validacao-provedor.md` (2026-08-27)
- documentação oficial do Neon sobre preços, organizações, branching e backup lógico
