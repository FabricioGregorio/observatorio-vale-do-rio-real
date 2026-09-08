# Primeiro deployment controlado na Vercel — 2026-09-08

## Escopo e autorização

Primeiro deployment manual do projeto `observatorio-vale-rio-real`, autorizado
para Production a partir do checkpoint
`7dea44bada6a7c7d9f4b59c067fb9cdde452c6a9`, branch
`feat/home-indicadores`. A autorização cobria exatamente um deployment e
excluía domínio customizado, DNS, integração GitHub, push, ZIP, banco, R2 e
migrations.

## Preflight local e source bundle

O baseline estava limpo e no checkpoint esperado. Antes do envio passaram:

- `pnpm tipos`;
- `pnpm lint`, sem erros e com quatro warnings CSS preexistentes;
- `pnpm teste`: 252 testes passaram e 3 foram omitidos;
- `pnpm a11y`: 46 testes passaram.

O dry-run oficial da Vercel detectou Next.js e 221 entradas. Não incluiu
`.env.local`, `.vercel`, `.next`, `node_modules`, ZIP, originais restritos,
D01-08 ou material fora do projeto. A varredura de oito valores sensíveis
locais contra os arquivos candidatos encontrou zero ocorrência. `.gitignore`
já protegia os artefatos locais; não foi criado `.vercelignore` artificial.

Antes do deployment, a leitura remota confirmou zero deployments, zero Custom
Domains e somente `DATABASE_URL`, `SITE_URL` e `STORAGE_PUBLIC_URL` em
Production. O Git continuava desconectado.

## Deployment e build remoto

Foi executado uma única vez:

```text
pnpm dlx vercel@latest deploy --prod
```

Resultado:

| Campo | Valor |
|---|---|
| Deployment | `dpl_8f6opr5pwpnqgDcFEJWzVzEyHWu6` |
| Target | Production |
| Status | `READY` |
| URL imutável | `https://observatorio-vale-rio-real-75v7er8wc.vercel.app` |
| Alias público | `https://observatorio-vale-rio-real.vercel.app` |
| Região de build | `iad1` |
| Node | `24.x` |
| pnpm | `11.25.0` |
| Next.js | `16.3.4` |
| Build Command | `pnpm build` |
| Páginas estáticas | 19/19 |

A instalação e a validação do lockfile passaram. `pnpm build` executou
`next build`, TypeScript e geração estática com sucesso. Não houve erro. O log
registrou apenas o warning conhecido do driver PostgreSQL sobre futura mudança
de semântica de `sslmode`; ele não revelou URL nem credencial.

A URL imutável responde 302 para o SSO da Vercel por proteção de deployment.
O alias padrão do projeto responde publicamente e foi usado nos testes. Esses
aliases `*.vercel.app` não são Custom Domains; o domínio institucional não foi
associado.

## Smoke remoto

| Verificação no alias público | Resultado |
|---|---|
| `GET /` | 200 |
| `GET /prestacao-de-contas` | 200 |
| `GET /anexos.json` | 200; JSON válido; 8 anexos |
| `GET /dev/estilos` | 404 |
| `GET /robots.txt` | 200 |
| `GET /sitemap.xml` | 200 |
| `GET /prestacao-de-contas/imprimir` | 200 |
| links públicos do acervo | 8/8 com HTTP 200 |

O JSON e a Sala contêm A02=1 e D01-01..07=7. A04=0 e D01-08=0. Todos os links
permanentes usam `acervo.observatoriotobiassoueu.com.br`; não há URL privada.
Canonical, Open Graph e sitemap mantêm corretamente o domínio canônico futuro
`https://observatoriotobiassoueu.com.br`, sem troca para `vercel.app`.

O Playwright confirmou uma única `h1`, imagens sem `alt`=0, links vazios=0,
links de conteúdo indistintos por cor=0, tabelas sem caption=0, cabeçalhos sem
scope=0 e foco visível correto nas três páginas principais. Não houve erro de
console, erro de página ou request de recurso falho. Axe não está instalado no
tooling atual, portanto não foi inventado um resultado Axe.

## Privacidade e integridade

Foram inspecionados HTML, nove bundles JavaScript, responses, logs e possíveis
source maps. Não foi encontrado valor secreto, `DATABASE_URL`, path local,
`OBSERVATORIO_FONTES_DIR`, storage privado, credencial R2, endpoint S3,
`r2.dev` ou dado `RESTRITO`. Não há source maps públicos.

Snapshots antes e depois:

| Recurso | Antes | Depois | Alteração |
|---|---:|---:|---:|
| `documento` | 33 | 33 | 0 |
| `arquivo` | 18 | 18 | 0 |
| `documento_arquivo` | 18 | 18 | 0 |
| `vw_anexo_publico` | 8 | 8 | 0 |
| objetos R2 públicos | 8 | 8 | 0 |
| objetos R2 privados | 10 | 10 | 0 |
| ZIPs no R2 | 0 | 0 | 0 |

Os fingerprints pré/pós dos dois buckets foram idênticos. A aplicação Vercel
continua sem credenciais operacionais de R2.

Os gates locais foram repetidos após o deployment e a documentação: tipos e
lint passaram, mantendo os quatro warnings CSS preexistentes; 252 testes
passaram, 3 foram omitidos e os 46 testes de acessibilidade passaram.

## Achados e decisão de promoção

O deployment está `READY`, mas o smoke encontrou dois bloqueios antes de
associar o domínio principal:

1. a Sala exibe `Baixar tudo (.zip)` apontando para
   `/prestacao-de-contas/anexos.zip`, que responde 404. Nenhum ZIP foi
   publicado; o defeito é a exposição antecipada do link;
2. em 375 px, a Sala e a versão imprimível têm `scrollWidth=629`, causado pela
   largura mínima efetiva da tabela. Em 768 px e 1440 px o smoke passou.

O Caderno de Estudos continua `PENDENTE` nas fontes documentais vigentes. A
saída pública não afirma que ele foi concluído, mas a tabela preenchida também
não apresenta uma linha explícita sobre esse estado.

Por causa dos dois achados, o deployment não deve ser promovido ao domínio
institucional. Não foi tentado segundo deployment: qualquer correção exige nova
tarefa e nova autorização humana.

## Estado final desta rodada

- deployments totais: 1;
- deployment Production `READY`: 1;
- Custom Domains: 0;
- Git conectado: não;
- push: não;
- ZIP publicado: não;
- banco/R2 alterados: não;
- domínio/DNS alterados: não.
