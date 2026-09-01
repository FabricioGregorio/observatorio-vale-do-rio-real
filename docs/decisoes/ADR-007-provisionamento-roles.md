# ADR-007 — Roles de banco provisionados como infraestrutura

## Status

Aceita

## Data

2026-08-30

## Contexto

A ADR-002 exige dois usuários de banco: um com DDL para migrações e outro sem DDL
para a aplicação — separação que impede um agente de alterar o schema fora do
fluxo de migração. O doc 03 §13 fixa as variáveis `DATABASE_URL_MIGRACAO` e
`DATABASE_URL` como as duas credenciais correspondentes.

A redação original da ADR-004 dizia que esses roles seriam "criados por
migração". Ao implementar a Tarefa 04 ficou claro que essa formulação é
inviável, por quatro razões independentes:

1. **Senha em migração é segredo em repositório.** `CREATE ROLE ... LOGIN
   PASSWORD '...'` só funciona com a senha literal no SQL. Migrações são
   versionadas no Git; o AGENTS.md proíbe commitar segredo. As duas regras não
   podem valer ao mesmo tempo.
2. **Role é objeto de cluster, não de schema.** Um role vive fora do banco e é
   compartilhado entre bancos do mesmo cluster. Migração versiona schema.
3. **Migração aplicada é imutável e replayable; `CREATE ROLE` não é idempotente.**
   Aplicar o mesmo histórico contra um cluster onde o role já existe falharia,
   quebrando justamente a garantia que o doc 02 §1 e a ADR-002 exigem.
4. **Os ambientes não têm o mesmo modelo de roles.** O CI usa o superusuário
   `postgres` do contêiner de teste; o `dev` local em Docker é administrado pelo
   desenvolvedor; `preview` e `prod` são administrados no provedor. Uma migração
   que criasse roles produziria resultados diferentes — ou falharia — em cada um.

## Decisão

**Os roles da aplicação e de migração são provisionados como infraestrutura,
separadamente das migrações de schema.**

Regras que decorrem disso:

1. **Nenhuma migração cria, altera ou remove role.** A `0001_fundacao.sql`
   permanece exclusivamente responsável por extensões, tipos, funções e demais
   objetos de schema definidos pela arquitetura.
2. **Identidade e senha dos roles são provisionamento**, feito no console do
   provedor ou por script de operação que lê a senha do ambiente. A senha nunca
   entra em arquivo versionado, migração, ADR ou relatório.
3. **Privilégios são concedidos no provisionamento, não por migração.** Para que
   tabelas criadas por migrações futuras já nasçam acessíveis à aplicação sem que
   cada migração precise conhecer o nome do role, o provisionamento define
   privilégios padrão:

   ```sql
   GRANT CONNECT ON DATABASE <banco> TO <role_aplicacao>;
   GRANT USAGE ON SCHEMA public TO <role_aplicacao>;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public
     GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO <role_aplicacao>;
   ```

   O `ALTER DEFAULT PRIVILEGES` **precisa ser executado pelo role de migração**,
   porque só se aplica a objetos criados por quem o definiu. É um detalhe fácil
   de errar e por isso está registrado aqui.
4. **O role da aplicação não recebe DDL.** No PostgreSQL 15+, o schema `public`
   já não concede `CREATE` a `PUBLIC` por padrão, então o role nasce sem poder
   criar objetos; nenhuma revogação adicional é necessária, mas a ausência de DDL
   deve ser **verificada explicitamente**, não presumida.
5. **A separação é conceitual antes de ser operacional.** Em ambientes onde os
   dois roles ainda não existem — CI e `dev` local hoje — as duas variáveis podem
   apontar para a mesma credencial administrativa. Isso é aceitável para teste,
   e **inaceitável em produção**. O CI não é evidência de que a separação
   funciona.

## Alternativas consideradas

- **Criar os roles dentro da migração inicial** (redação original da ADR-004)
  - Vantagem: um único fluxo, tudo versionado.
  - Rejeitada pelas quatro razões do Contexto. A que sozinha já decide é a
    senha em repositório.

- **Criar os roles por migração, com a senha vinda de variável de ambiente**
  - Drizzle Kit aplica arquivos `.sql` estáticos; não há interpolação de
    ambiente no arquivo de migração. Exigiria um caminho paralelo ao fluxo
    oficial, contradizendo o doc 03 §6.

- **Usar um único role administrativo para tudo**
  - Simplifica a operação e elimina esta ADR.
  - Rejeitada: destrói o controle central da ADR-002. Num projeto operado por
    agentes de IA, o role sem DDL é a barreira que impede alteração de schema
    fora do fluxo revisado. É controle de integridade de prestação de contas,
    não conveniência.

## Consequências

Benefícios:

- Nenhum segredo em arquivo versionado.
- Migrações continuam idempotentes no histórico e replayáveis em cluster limpo.
- Cada ambiente provisiona seus roles conforme sua própria realidade.
- A `0001_fundacao.sql` permanece imutável e restrita a schema.

Custos e riscos:

- O provisionamento vira etapa manual, fora do Git, e portanto **não auditável
  pelo histórico do repositório**. Precisa de runbook próprio e de verificação
  periódica.
- Risco real de deriva: nada impede que produção fique rodando com uma única
  credencial administrativa e ninguém perceba. A mitigação é uma verificação
  explícita de negação de DDL antes de considerar o ambiente pronto.
- O `ALTER DEFAULT PRIVILEGES` precisa ser reexecutado se o role que aplica
  migrações mudar.

## Impacto técnico

Arquivos ou módulos afetados:

- `db/migrations/` — **não** contém e não conterá `CREATE ROLE` / `GRANT` de identidade
- `.env.example` / `.env.local` — `DATABASE_URL` e `DATABASE_URL_MIGRACAO`
- `.github/workflows/ci.yml` — hoje aponta as duas variáveis para o superusuário do
  serviço de teste; documentar que isso não valida a separação
- runbook de provisionamento — a ser escrito, fora do escopo desta ADR

Decisões relacionadas:

- ADR-002 — dois usuários de banco; migração aplicada é imutável
- ADR-004 — provedor do PostgreSQL; substitui a redação "roles criados por migração"
- ADR-008 — TLS das conexões que usam essas credenciais

Fontes:

- doc 02 §1 (migrações versionadas, sem alteração manual em produção)
- doc 02 §15 (ambientes `dev`, `preview`, `prod`)
- doc 03 §6 (migrações geradas por `drizzle-kit generate`, aplicadas no CI)
- doc 03 §13 (variáveis de ambiente; aplicação sem DDL)
- AGENTS.md ("Nunca commitar segredo, `.env` ou chave de serviço")
