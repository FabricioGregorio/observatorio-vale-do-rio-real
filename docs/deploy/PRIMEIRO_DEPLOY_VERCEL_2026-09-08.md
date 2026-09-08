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

> **Nota de 2026-09-08.** A atribuição do achado 2 à largura da tabela, escrita
> acima, estava **errada**. A medição do Prompt 4.8 mostrou que a tabela sempre
> foi clipada corretamente; a causa eram os `sr-only` do hash. Ver a seção de
> correção ao final deste documento.

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

---

## Correção dos dois achados — Prompt 4.8, 2026-09-08

Os dois bloqueios acima foram corrigidos localmente, a partir do checkpoint
`3e7f62fd5fff0cd5a8dc2cb0b7d835903b1dbe87`. **Nenhum segundo deployment foi
executado**, nenhum ZIP foi publicado, e banco, R2, DNS, domínio e GitHub não
foram tocados.

### Achado 1 — link do ZIP

Diagnóstico: o defeito estava no critério de exibição, não no pacote.
`urlDoZipDeAnexos()` derivava a URL de `STORAGE_PUBLIC_URL`, e a Sala mostrava
o link sempre que houvesse anexos. Depois da primeira publicação as duas
condições passaram a ser verdadeiras ao mesmo tempo, e o botão apareceu para um
objeto inexistente. Uma `ListObjectsV2` somente leitura no bucket público
confirmou o fato: **8 objetos, nenhum `prestacao-de-contas/anexos.zip`**.

Correção: a URL passou a exigir também `ZIP_ANEXOS_PUBLICADO=true` — declaração
explícita de publicação já ocorrida, fail-closed, sem nenhuma consulta remota ao
R2 no caminho de renderização. Sem o pacote, o item inteiro desaparece da Sala.
Os oito anexos individuais não dependem disso e continuam publicados.

### Achado 2 — overflow em 375 px

Diagnóstico: **a tabela não era a causa.** Com 621 px de largura, ela sempre foi
corretamente clipada pelo contêiner `overflow-x: auto`. Quem escapava eram os
oito `<code class="sr-only">` do SHA-256 integral: `position: absolute` sem
ancestral posicionado, portanto com bloco container no `<html>` e não no
contêiner de rolagem — e um contêiner de rolagem não clipa descendente cujo
bloco container está fora dele. Cada um terminava em **629 px**, o mesmo número
medido no smoke deste deployment.

Correção: `position: relative` no contêiner. Ele passa a ser o bloco container
desses elementos e a clipá-los. Nenhuma coluna foi escondida, nenhuma informação
truncada e nenhum `overflow-x: hidden` global foi introduzido.

### Medições locais, artefato de produção

| Rota | 375 antes | 375 depois | 768 | 1440 |
|---|---|---|---|---|
| `/prestacao-de-contas` | 629 | **375** | 753 | 1425 |
| `/prestacao-de-contas/imprimir` | 629 | **375** | 753 | 1425 |

`documentElement.scrollWidth` contra `clientWidth`. O contêiner da tabela
conserva rolagem própria (621 contra 343): a informação não foi reduzida.

### Situação para o segundo deployment

Os dois achados que bloqueavam a promoção estão resolvidos e verificados no
artefato de produção local. Permanecem, como antes:

- ZIP publicado: **não** — operação separada, com autorização própria;
- segundo deployment: **não executado**, aguardando autorização;
- Custom Domains, DNS, `www`, GitHub e push: **inalterados**.
