# ADR-008 — TLS das conexões PostgreSQL com `sslmode=verify-full`

## Status

Aceita

## Data

2026-08-30

## Contexto

O banco guarda dados pessoais identificáveis: `pessoa`, `consentimento`,
`entrevista` e `contribuicao_escuta` (doc 02 §6.3, §11, §14). A conexão sai da
Vercel ou do GitHub Actions e atravessa a internet pública até o provedor. A
proteção dessa conexão nunca foi decidida formalmente — nem a ADR-002, nem a
ADR-004, nem o doc 03 §13 mencionam TLS.

O problema apareceu de forma concreta ao aplicar a migração `0001_fundacao` pelo
fluxo oficial. O driver `pg` emitiu:

> `SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are
> treated as aliases for 'verify-full'.` Em `pg-connection-string` v3 e `pg` v9
> esses modos adotarão a semântica padrão do libpq, com garantias mais fracas.

O ponto importante é o que isso significa na prática. Hoje, uma URL com
`sslmode=require` é tratada pelo `pg` como `verify-full` — ou seja, **mais**
segura do que o nome sugere. Quando o `pg` chegar à v9, a mesma URL passará a
significar apenas "criptografe, sem verificar quem está do outro lado".

Isso é um rebaixamento silencioso de segurança disparado por atualização de
dependência: nenhuma linha do projeto muda, nenhum teste falha, e a conexão
deixa de ser resistente a man-in-the-middle. Um projeto de prestação de contas
pública com dados de pessoas identificáveis não pode ter esse comportamento
dependendo do padrão de uma biblioteca.

## Decisão

**As conexões de produção usam `sslmode=verify-full` explicitamente na URL.**

Regras que decorrem disso:

1. `DATABASE_URL` e `DATABASE_URL_MIGRACAO` de `preview` e `prod` terminam em
   `?sslmode=verify-full`. Não se confia no padrão do driver.
2. **TLS é responsabilidade da URL de conexão, não do código.** Nenhum objeto
   `ssl: {...}` fixo em `src/dados/cliente.ts`, `db/cliente.ts` ou
   `drizzle.config.ts`. É o que permite ao mesmo arquivo conectar em produção
   com TLS verificado e em Docker local sem TLS, sem ramificação por ambiente.
3. **Exceção documentada:** `dev` local em Docker e o serviço `postgres:16` do
   CI não expõem TLS e conectam sem `sslmode`. São ambientes com dados
   descartáveis, em rede local ou efêmera. A exceção vale para esses dois casos
   e para nenhum outro.
4. **Nunca desabilitar a verificação para contornar erro de certificado.**
   `rejectUnauthorized: false` e `sslmode=no-verify` estão proibidos em
   qualquer ambiente que toque dado real. Falha de certificado é problema a
   diagnosticar, não a silenciar.
5. `verify-full` valida cadeia **e** hostname. O provedor precisa apresentar
   certificado emitido por CA publicamente confiável — o caso do Neon (ADR-004),
   que assim não exige distribuir CA própria.

## Alternativas consideradas

- **Continuar com `sslmode=require`**
  - Funciona hoje e é o que a maioria dos provedores documenta.
  - Rejeitada: é exatamente a string cuja semântica vai mudar. Manter significa
    aceitar que uma futura atualização do `pg` rebaixe a segurança sem aviso.

- **Fixar `ssl: { rejectUnauthorized: true }` no código dos clientes**
  - Garantiria a verificação independentemente da URL.
  - Rejeitada: quebra `dev` local e o CI, que não têm TLS, obrigando a
    ramificação por ambiente dentro do cliente — a complexidade que a decisão de
    manter TLS na URL existe para evitar.

- **`uselibpqcompat=true&sslmode=require`**, sugerido pelo próprio aviso
  - Preserva o comportamento atual de forma explícita.
  - Rejeitada por ser mais obscura e por não dizer o que se quer: o objetivo é
    verificação completa, e `verify-full` diz isso sem intermediários.

## Consequências

Benefícios:

- A garantia de segurança fica declarada na configuração, não herdada de um
  padrão de biblioteca sujeito a mudança.
- Atualizar `pg` para a v9 não altera o comportamento das conexões de produção.
- Proteção contra man-in-the-middle nas conexões que carregam dado pessoal.

Custos e riscos:

- Erro de certificado passa a falhar a conexão em vez de degradar em silêncio.
  É o comportamento desejado, mas exige diagnóstico correto quando ocorrer.
- Divergência deliberada entre produção (com TLS verificado) e CI (sem TLS):
  **o CI não exercita o caminho TLS**, e portanto não é evidência de que a
  conexão de produção funciona. Precisa de verificação própria.
- Se o projeto migrar para um provedor com CA privada, será necessário
  distribuir o certificado raiz — e esta ADR terá de ser revisitada.

## Impacto técnico

Arquivos ou módulos afetados:

- `.env.example` — documentar `sslmode=verify-full` no comentário das duas URLs
- variáveis de ambiente da Vercel e secrets do GitHub Actions — URLs de `preview`
  e `prod`
- `src/dados/cliente.ts`, `db/cliente.ts`, `drizzle.config.ts` — permanecem **sem**
  configuração fixa de SSL, por decisão
- `.github/workflows/ci.yml` — segue sem `sslmode`, como exceção documentada

Decisões relacionadas:

- ADR-002 — dois usuários de banco
- ADR-004 — Neon como provedor; certificado de CA pública
- ADR-007 — provisionamento das credenciais que usam estas URLs

Fontes:

- doc 02 §6.3, §11 (dados pessoais: `pessoa`, `consentimento`, `contribuicao_escuta`)
- doc 02 §14 (segurança e Row Level Security)
- doc 03 §13 (variáveis de ambiente e segredos)
- aviso de depreciação do `pg` observado na aplicação da migração `0001` (2026-08-30)
- documentação do libpq sobre modos de SSL
