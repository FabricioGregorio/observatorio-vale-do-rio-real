# Observatório do Vale do Rio Real

Site institucional e de prestação de contas do Observatório do Vale do Rio Real,
projeto financiado pelo edital PNAB nº 02/2025 com prestação de contas à
FUNCAP/SE. Publicado em <https://observatoriotobiassoueu.com.br>.

O site é prova documental de execução do objeto: cada anexo tem endereço
permanente no domínio próprio, data de publicação e hash SHA-256, sem login e
sem pedido de acesso.

Os documentos disponibilizados no Acervo e na Prestação de contas utilizam
os arquivos originais como versões canônicas. Fotografias podem utilizar WebP
para apresentação visual; a imagem com placa de veículo tem versão pública
tarjada.

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

As páginas e o inventário são gerados em build time. A rota de download
consulta a coleção pública em tempo de requisição e confere o SHA-256 antes
de entregar o arquivo como anexo.

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

O projeto **não tem integração com Git**: empurrar para `main` não dispara
deployment. Production é publicada pela CLI da Vercel, em operação separada e
autorizada.

Configuração do projeto na Vercel: framework Next.js, raiz `.`, Build Command
`pnpm build`, Install e Output nos defaults, Node 24.x, Production Branch
`main`. Preview fica desabilitado enquanto não houver banco ou role isolado —
a credencial de Production não é copiada para Preview.

A allowlist de variáveis de Production contém **somente** `DATABASE_URL`,
`SITE_URL` e `STORAGE_PUBLIC_URL`. As credenciais de manutenção, de migração e
de storage privado nunca entram na Vercel: pertencem a operações locais
autorizadas.

Nenhum comando da Vercel executa migração, seed, espelhamento, upload ou
`publicar-zip`. Essas operações são sempre separadas e explícitas.
