# TAREFA TEMPORÁRIA 04 — Validação do provedor PostgreSQL

**Fase:** validação arquitetural · **Depende de:** 01 · **Estimativa de diff:** pequeno

## Objetivo

Comparar Supabase e Neon para escolher o provedor PostgreSQL, sem criar funcionalidade
de produto.

## Contexto obrigatório

- `docs/02-arquitetura-banco.md`, seções 14 e 15
- `docs/03-guia-implementacao.md`, seções 1, 6, 8 e 13
- `docs/decisoes/ADR-002-banco-postgresql.md`
- `docs/decisoes/ADR-004-provedor-postgresql.md`
- `AGENTS.md`

## Arquivos permitidos

```text
docs/tarefas/04-validacao-provedor.md
docs/decisoes/ADR-004-provedor-postgresql.md
```

Editar fora desta lista exige justificativa explícita no PR.

## Situação — 2026-08-30

**A decisão de provedor está encerrada: Neon, formalizada na ADR-004.** A comparação
entre Supabase e Neon que motivou esta tarefa não será retomada.

**A validação operacional remota NÃO foi concluída** e permanece como atividade
posterior. Os itens abaixo marcados como não executados não devem ser tratados como
aprovados em nenhum relatório, PR ou prestação de contas.

## Critérios de aceite

### Banco

- [x] Instância descartável criada — **somente no Neon**. Nenhuma instância Supabase
      foi criada; a comparação foi encerrada por decisão arquitetural (ADR-004), não
      por teste comparativo.
- [x] Drizzle conectado à instância Neon — `pnpm migrar` conectou pelo driver `pg`
      (PostgreSQL 18.6, banco `neondb`)
- [x] Migração executada — foi aplicada a migração real `0001_fundacao`, e não uma
      migração vazia; critério superado
- [ ] **NÃO EXECUTADO** — Criar usuário da aplicação sem DDL
- [ ] **NÃO EXECUTADO** — Criar usuário de migração com DDL
- [ ] **NÃO EXECUTADO** — Verificar explicitamente que o usuário da aplicação não
      consegue executar DDL
- [ ] **NÃO EXECUTADO** — `pg_dump` e leitura do arquivo por `pg_restore --list`

O provisionamento dos dois roles deixou de ser responsabilidade das migrações e passou
a ser infraestrutura (ADR-007).

### CI

- [ ] **NÃO EXECUTADO** — Confirmar no GitHub Actions remoto a sequência `checkout` →
      instalação de dependências → conexão com o banco → migração → testes. A inspeção
      foi apenas local, sobre o YAML.

### Operação

- [x] Identificar quem consegue administrar cada projeto
- [x] Documentar como recuperar backup
- [x] Documentar como criar ambiente de preview
- [x] Comparar o custo depois do crescimento

## Evidências da execução — 2026-08-27

### Ambiente disponível

- O repositório está no bootstrap e ainda não possui Drizzle, cliente PostgreSQL ou
  migração real. O script `pnpm migrar` termina com código 0, mas declara explicitamente
  que não existem migrações.
- Não havia sessão autenticada no Supabase, Neon ou GitHub. Não foram encontradas
  credenciais de banco no ambiente.
- `psql`, `pg_dump`, Supabase CLI e Neon CLI não estavam instalados.
- O Docker Desktop foi iniciado, mas o engine não ficou disponível durante a janela do
  teste. Nenhum contêiner foi criado.

Essas condições impedem marcar como executados os testes de instância, Drizzle,
usuários, migração e backup. Eles permanecem abertos; não foram substituídos por uma
simulação nem considerados aprovados por documentação.

### Verificação local do fluxo de CI

| Etapa | Resultado | Evidência |
|---|---|---|
| Checkout | Inspecionada | `.github/workflows/ci.yml` usa `actions/checkout@v4`. |
| Instalar dependências | Executada | `pnpm install --frozen-lockfile`: concluído, lockfile já atualizado. |
| Conectar banco | Não executada | O workflow declara PostgreSQL 16 como serviço, mas não houve runner remoto nem engine Docker local. |
| Rodar migration | Não validada | `pnpm migrar` saiu com código 0 executando somente a mensagem de placeholder. |
| Testar | Executada | `pnpm teste`: 1 arquivo e 1 teste aprovados. |
| Tipos | Executada | `pnpm tipos`: aprovado. |
| Lint | Executada | aprovado com quatro avisos preexistentes sobre `!important`. |
| Build | Executada | aprovado; houve aviso preexistente do parser sobre `@theme` em `tokens.css`. |
| Acessibilidade | Executada | Playwright: 1 teste aprovado; o servidor repetiu o aviso preexistente sobre `@theme`. |
| Pendências | Não validada | o script termina com código 0, mas ainda é um placeholder sem consulta ao banco. |
| GitHub Actions remoto | Não executado | GitHub CLI sem autenticação e navegador sem sessão autenticada. |

O YAML contém a ordem pedida, mas ainda não comprova conexão nem migração real: as duas
URLs usam o superusuário `postgres` do serviço de teste e `pnpm migrar` é um no-op.
O comando agregado `pnpm verificar` terminou com código 0.

## Execução remota — 2026-08-30

Projeto Neon descartável, sem nenhum dado real do Observatório. Credencial mantida
apenas em `.env.local`, ignorado pelo Git. Nenhuma URL, host, usuário ou senha foi
registrada aqui.

### O que foi executado

| Verificação | Resultado | Evidência |
|---|---|---|
| Conexão autenticada | APROVADO | PostgreSQL 18.6, banco `neondb`, `sslmode=require`, endpoint direto (sem pooler) |
| Estado inicial do banco | APROVADO | 0 extensões nossas, 0 enums, 0 funções, sem schema `drizzle` |
| `pnpm migrar` | APROVADO | exit 0; `Using 'pg' driver`; `migrations applied successfully` |
| Extensões | APROVADO | `pgcrypto 1.4`, `citext 1.8`, `unaccent 1.1` em `pg_extension`; PostGIS ausente, conforme doc 02 §6.2 |
| Dez enums | APROVADO | comparação automatizada com o doc 02 §3: dez enums idênticos, valor a valor e na mesma ordem |
| `sem_acento` | APROVADO | `text`, `sql`, IMMUTABLE, PARALLEL SAFE, STRICT |
| `set_atualizado_em` | APROVADO | `trigger`, `plpgsql`, VOLATILE, PARALLEL UNSAFE — os padrões do PostgreSQL, como o doc 02 §4 declara |
| Triggers | APROVADO (consistência) | 0 triggers não internos e 0 tabelas; a migração 0001 não prevê nenhum. O comportamento do trigger continua não testado |
| Controle de migrações | APROVADO | `drizzle.__drizzle_migrations` com uma linha; hash gravado idêntico ao SHA-256 do arquivo `0001_fundacao.sql` |
| Teste funcional | APROVADO | `sem_acento('ação São Cristóvão')` devolveu `acao Sao Cristovao` |

O hash coincidente é a prova de que rodou exatamente aquele arquivo, byte a byte, e não
uma variante.

### O que NÃO foi executado

Interrompido por decisão do responsável, para liberar o desenvolvimento:

- provisionamento dos roles de aplicação e de migração;
- teste explícito de negação de DDL para o role da aplicação;
- teste positivo de leitura e escrita pelo role da aplicação;
- segunda execução de `pnpm migrar` (idempotência);
- `pg_dump` e `pg_restore --list`;
- teste de recuperação de backup;
- execução remota do workflow no GitHub Actions.

Nenhum desses itens tem evidência. Nenhum deve ser apresentado como aprovado.

## Comparação operacional

Informações e preços conferidos nas fontes oficiais em 2026-08-27; valores podem mudar.

| Critério | Supabase | Neon |
|---|---|---|
| Quem administra | Owner tem controle total; Administrator administra quase tudo; Developer altera conteúdo, mas não configurações. Escopo por projeto é restrito aos planos Team e Enterprise. | Admin controla organização, cobrança e projetos. O modelo atual também oferece Editor, Viewer, Collaborator e permissões por projeto. |
| Recuperar backup | No plano gratuito, gerar dump lógico externo com Supabase CLI/`pg_dump`. Planos pagos oferecem backups diários restauráveis no painel; restauração interrompe o projeto. Dumps Supabase devem filtrar schemas e roles internos. | Restaurar um ponto anterior criando/resetando branch dentro da janela disponível; para preservação externa, usar conexão não agrupada com `pg_dump` e restaurar com `pg_restore` em banco/branch novo. |
| Preview | Branch efêmero por PR via integração GitHub, sem dados de produção e com seed; branching não está incluído no plano gratuito e é cobrado no Pro. | Branch de banco por PR via integração GitHub, API, CLI ou Actions; branching está incluído no plano gratuito e copia dados/schema do ancestral, com opção de branch somente de schema. |
| Faixa gratuita | US$ 0; 500 MB por projeto; sem backup automático; pausa após uma semana de inatividade; sem branching. | US$ 0; 0,5 GB por projeto; 100 CU-h/mês por projeto; scale-to-zero; branching; restauração de até 6 horas ou 1 GB de mudanças. |
| Depois do crescimento | Pro a partir de US$ 25/mês por organização; 8 GB incluídos, depois US$ 0,125/GB; branch US$ 0,01344/h; PITR de 7 dias cerca de US$ 100/mês. | Launch por uso, exemplo oficial típico de US$ 15/mês; US$ 0,106/CU-h, US$ 0,35/GB-mês e US$ 0,20/GB-mês de histórico; dez branches incluídos, excedentes a US$ 0,002/h. |

### Fontes oficiais

- Supabase: [preços](https://supabase.com/pricing),
  [controle de acesso](https://supabase.com/docs/guides/platform/access-control),
  [backups](https://supabase.com/docs/guides/platform/backups),
  [backup e restauração pela CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) e
  [branching](https://supabase.com/docs/guides/deployment/branching).
- Neon: [preços](https://neon.com/pricing),
  [organizações](https://neon.com/docs/manage/orgs-manage),
  [migração com `pg_dump`/`pg_restore`](https://neon.com/docs/import/migrate-from-neon) e
  [branching com GitHub Actions](https://neon.com/docs/guides/branching-github-actions).

## Resultado

**Escolha: Neon.**

O projeto precisa de preview isolado por branch, tem carga pequena e intermitente e não
depende da latência do banco em tempo de requisição. O Neon atende esse perfil no plano
gratuito e cresce por consumo. O Supabase oferece experiência administrativa superior,
mas essa vantagem não compensa exigir o plano Pro para branching; além disso, a primeira
versão não prevê painel administrativo.

A escolha não elimina o backup independente definido no documento de banco. O job diário
de `pg_dump` para R2/S3, com retenção de 30 dias e teste periódico de restauração, continua
obrigatório porque a janela gratuita de restauração do Neon é curta.

## Como concluir os itens práticos abertos

Feito:

1. ~~Autenticar conta descartável no provedor.~~ Projeto Neon descartável criado; conexão
   comprovada em 2026-08-30.
2. ~~Implementar a Tarefa 04 original (`04-drizzle-migracao-inicial.md`), substituindo o
   placeholder de `pnpm migrar`.~~ Implementada; `pnpm migrar` executa
   `drizzle-kit migrate` de verdade e aplicou a migração `0001_fundacao`.

Em aberto — nenhum destes tem evidência hoje:

3. Provisionar os dois roles conforme a ADR-007 e verificar **explicitamente** que o role
   da aplicação não executa DDL e que o de migração executa.
4. Executar `pnpm migrar` uma segunda vez e confirmar que o Drizzle reconhece a migração
   já aplicada, sem tentar recriá-la.
5. Executar `pg_dump -Fc` contra o banco, guardar o arquivo fora do repositório e
   confirmar a leitura com `pg_restore --list`. Usar o endpoint direto do Neon, não o
   pooler.
6. Testar a **recuperação** do backup, e não apenas a geração — é o que o doc 02 §15 exige.
7. Abrir um PR descartável e anexar a URL do run do GitHub Actions com todas as etapas
   verdes, incluindo a de migração.
8. Registrar hashes e a saída de `pg_restore --list` sem registrar URLs, hosts ou senhas.

Enquanto 3 a 7 não forem executados, o ambiente de produção não pode ser considerado
pronto, e o CI não serve como evidência: hoje ele aponta as duas variáveis para o mesmo
superusuário do contêiner de teste e não exercita nem a separação de roles nem o
caminho TLS (ADR-007, ADR-008).

## Fora de escopo

Schema de domínio, funcionalidade de produto, dados de pesquisa, painel administrativo,
alteração do workflow e inclusão de credenciais no repositório.
