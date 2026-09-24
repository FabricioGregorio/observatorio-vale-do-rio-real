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

Não há credencial de banco: o projeto não usa banco. Os dados públicos são
versionados em `src/dados/publicado/` e o site os lê do próprio repositório.

As variáveis que existem são de storage (R2, público e privado), a fonte
canônica local fora do repositório (`OBSERVATORIO_FONTES_DIR`) e a origem
do site. `SITE_URL` é obrigatória em build de produção — sem ela o build
falha de propósito, para não gerar metadados com origem errada.

## Desenvolvimento

```bash
pnpm dev
```

As rotas sob `/dev` são laboratórios visuais e respondem 404 em produção.

## Testes e verificação

```bash
pnpm verificar
```

Roda, em ordem: `tipos` (tsc), `lint` (Biome), `teste` (Vitest), `build` e
`a11y` (Playwright, incluindo axe). Os comandos também existem isolados.

A suíte roda offline: nenhum teste abre conexão com serviço remoto, e os
poucos que exercitam o R2 de verdade se declaram `skipped` quando a
credencial não está no ambiente.

O gate de acessibilidade precisa de um servidor em `localhost:3100`; o
Playwright o levanta sozinho via `pnpm start:e2e`.

## Build

```bash
pnpm build
```

As páginas e o inventário são gerados em build time, a partir do snapshot
versionado. O build não abre conexão com serviço nenhum — nem banco, nem
storage, nem a Production. A rota de download resolve o arquivo no snapshot
e confere o SHA-256 antes de entregar o arquivo como anexo.

## Dados

A fonte dos dados públicos é o repositório: `src/dados/publicado/acervo.json`,
`episodios.json` e `release.json`. O manifesto declara os totais e o SHA-256
dos outros dois, e a leitura confere um contra o outro.

O projeto usou PostgreSQL até 24/09/2026. Cliente, schema, consultas,
migrações como mecanismo e dependências foram removidos; o histórico das
migrações continua em `db/migrations/`, como registro, sem nada que o
execute. `testes/guarda-banco.test.ts` falha se qualquer dessas peças voltar.

## Operações fora do build

Publicação de binário e empacotamento nunca acontecem no build: são operações
explícitas, locais e autorizadas, com flag própria. O empacotador do
`.zip` de anexos será redesenhado para selecionar pelo catálogo canônico de
`acervo.json`; enquanto ele não existir, `ZIP_ANEXOS_PUBLICADO` permanece
sem valor e nenhuma superfície oferece o download.

## Deploy

O projeto **não tem integração com Git**: empurrar para `main` não dispara
deployment. Production é publicada pela CLI da Vercel, em operação separada e
autorizada.

Configuração do projeto na Vercel: framework Next.js, raiz `.`, Build Command
`pnpm build`, Install e Output nos defaults, Node 24.x, Production Branch
`main`.

A allowlist de variáveis de Production contém **somente** `SITE_URL` e
`STORAGE_PUBLIC_URL`. As credenciais de storage privado nunca entram na
Vercel: pertencem a operações locais autorizadas.

Nenhum comando da Vercel executa espelhamento, upload ou empacotamento.
Essas operações são sempre separadas e explícitas.
