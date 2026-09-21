# Observatório do Vale do Rio Real

Site institucional e de prestação de contas do Observatório do Vale do Rio Real,
projeto financiado pelo edital PNAB nº 02/2025 com prestação de contas à
FUNCAP/SE. Publicado em <https://observatoriotobiassoueu.com.br>.

O site é prova documental de execução do objeto: cada anexo tem endereço
permanente no domínio próprio, data de publicação e hash SHA-256, sem login e
sem pedido de acesso.

## Stack

Next.js (App Router, Server Components), React, TypeScript estrito, Tailwind,
PostgreSQL com Drizzle ORM, storage S3-compatível (Cloudflare R2), Biome,
Vitest e Playwright. Hospedagem na Vercel.

## Requisitos

- Node na versão de `.nvmrc`
- pnpm (a versão está em `packageManager`, no `package.json`)
- Python 3 com [uv](https://docs.astral.sh/uv/), apenas para os scripts de
  derivação de imagem e de inventário

## Instalar

```bash
pnpm install --frozen-lockfile
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha. O arquivo lista todas as
variáveis com o que cada uma significa. Nenhum segredo é versionado.

Três credenciais de banco, com privilégios distintos: `DATABASE_URL` (leitura,
usada pelo site), `DATABASE_URL_MANUTENCAO` (DML, usada pelos scripts) e
`DATABASE_URL_MIGRACAO` (DDL, usada só por `drizzle-kit`).

`SITE_URL` é obrigatória em build de produção — sem ela o build falha de
propósito, para não gerar metadados com origem errada.

## Desenvolvimento

```bash
pnpm dev
```

As rotas sob `/dev` são laboratórios visuais e respondem 404 em produção.

## Testes e verificação

```bash
pnpm verificar
```

Roda, em ordem: `tipos` (tsc), `lint` (Biome), `teste` (Vitest), `pendencias`
(trava de publicação), `build` e `a11y` (Playwright, incluindo axe). Os
comandos também existem isolados.

O gate de acessibilidade precisa de um servidor em `localhost:3100`; o
Playwright o levanta sozinho via `pnpm start:e2e`.

## Build

```bash
pnpm build
```

As páginas são geradas em build time e consultam o banco nesse momento. Nenhuma
rota consulta o banco em tempo de requisição.

## Banco

Migrações versionadas são o único mecanismo de mudança de schema:

```bash
pnpm gerar-migracao   # cria a migração a partir do schema
pnpm migrar           # aplica
```

Migração já aplicada é imutável. Correção é sempre uma migração nova.

## Operações fora do build

O pacote `.zip` de anexos nunca é gerado pelo build. Ele é publicado por
operação explícita:

```bash
pnpm publicar-zip
```

Enquanto `ZIP_ANEXOS_PUBLICADO` não for `true`, a Prestação de Contas não
oferece o download — o gate falha fechado para não apontar para um objeto
inexistente.

## Deploy

O projeto não tem integração com Git: empurrar para `main` não dispara
deployment. Production é publicada pela CLI da Vercel, em operação separada e
autorizada.
