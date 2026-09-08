# Segundo deployment controlado na Vercel — 2026-09-08

## Escopo e autorização

Autorização humana para **exatamente um** deployment Production, com o objetivo
de validar na infraestrutura real as duas correções do Prompt 4.8. A
autorização excluía domínio customizado, DNS, integração GitHub, push,
publicação de ZIP, upload no R2, escrita no banco, migrations e qualquer
terceiro deployment.

Commit publicado: `3c68bd45ef5ae8e17824cd4ddb1ce047e3994d86` —
*fix: corrige sala para primeiro deploy*, branch `feat/home-indicadores`, sem
upstream.

## Preflight

Working tree limpa e HEAD no commit esperado. Os quatro gates rodaram **uma vez
cada** e passaram:

| Gate | Resultado |
|---|---|
| `pnpm tipos` | passou |
| `pnpm lint` | passou, com os quatro warnings CSS preexistentes |
| `pnpm teste` | **256 aprovados, 3 omitidos, zero falhas** |
| `pnpm a11y` | **54 aprovados** |

A falha intermitente registrada no Prompt 4.8 **não voltou a ocorrer** nesta
rodada. A suíte não foi repetida para transformar vermelho em verde: houve uma
única execução, e ela já foi verde.

`pnpm pendencias` não foi usado como gate, conforme instrução: nesta máquina ele
roda sem `.env.local` e declara `DATABASE_URL ausente`, sem verificar nada.

## Estado remoto antes do deployment

| Item | Valor |
|---|---|
| Deployments | 1 |
| Git conectado | não — `project inspect` não reporta repositório |
| Custom Domains | **0** |
| Envs Production | `DATABASE_URL` (Secret/Hidden), `SITE_URL` e `STORAGE_PUBLIC_URL` (Config) |
| `ZIP_ANEXOS_PUBLICADO` | **ausente**, como planejado |
| Preview / Development | sem variáveis |

Nenhum valor secreto foi revelado; `vercel env pull` não foi usado.

Baseline do banco por `DATABASE_URL` somente leitura, role `app_observatorio`:
`documento=33`, `arquivo=18`, `documento_arquivo=18`, `vw_anexo_publico=8`,
`PUBLICAVEL=2`, `pessoa=0`, `consentimento=0`.

Baseline do bucket público por `ListObjectsV2` somente leitura: **8 objetos,
nenhum ZIP**.

## Deployment e build remoto

Executado uma única vez:

```text
pnpm dlx vercel@latest deploy --prod --yes --logs
```

| Campo | Valor |
|---|---|
| Deployment | `dpl_9uudmMsKygEowzpSkt6Gpt73BUiE` |
| Target | Production |
| Status | `READY` |
| URL imutável | `https://observatorio-vale-rio-real-625so9uc2.vercel.app` |
| Alias público | `https://observatorio-vale-rio-real.vercel.app` |
| Região de build | `iad1` |
| Node | `24.x` |
| pnpm | `11.25.0` |
| Next.js | `16.3.4` |
| Build Command | `pnpm build` → `next build` |
| Arquivos enviados | 223 |
| Páginas estáticas | 19/19 |
| Duração | 23 s |

O cache de build do deployment anterior foi restaurado. A instalação terminou
em *Already up to date*. **Nenhum erro.** O único warning foi o já conhecido do
driver PostgreSQL sobre a futura semântica de `sslmode`; ele não revelou URL nem
credencial. A tabela de rotas trouxe as mesmas 18 rotas do deployment anterior.

A URL imutável responde 302 para o SSO da Vercel, por proteção de deployment —
comportamento idêntico ao da primeira rodada e não um defeito. O smoke usou o
alias público do projeto, que não é Custom Domain.

## Validação da correção 1 — CTA do ZIP

Verificado no HTML servido pelo deployment real, não em ambiente local:

| Verificação em `/prestacao-de-contas` | Resultado |
|---|---|
| Ocorrências de `anexos.zip` | **0** |
| Ocorrências de `Baixar tudo` | **0** |
| Ocorrências da string `zip`, em qualquer forma | **0** |
| `display:none` / `visibility:hidden` na página | **0** |
| Links `Baixar` individuais | **8** |

O elemento **não existe no DOM**. Não foi escondido por CSS — a página inteira
não contém a palavra. A `<section>` da correção responsiva aparece no HTML
entregue.

Para completar a prova, `https://acervo.observatoriotobiassoueu.com.br/prestacao-de-contas/anexos.zip`
continua respondendo **404**: o pacote segue corretamente não publicado, e agora
nada na Sala o oferece.

## Validação da correção 2 — 375 px

Medições no deployment real, `documentElement`:

| Rota | viewport | `innerWidth` | `clientWidth` | `scrollWidth` | overflow |
|---|---|---|---|---|---|
| `/prestacao-de-contas` | 375 | 375 | 375 | **375** | não |
| `/prestacao-de-contas/imprimir` | 375 | 375 | 375 | **375** | não |
| `/` | 375 | 375 | 375 | **375** | não |
| `/prestacao-de-contas` | 768 | — | 753 | 753 | não |
| `/prestacao-de-contas/imprimir` | 768 | — | 753 | 753 | não |
| `/prestacao-de-contas` | 1440 | — | 1425 | 1425 | não |
| `/prestacao-de-contas/imprimir` | 1440 | — | 1425 | 1425 | não |
| `/` | 1440 | — | 1425 | 1425 | não |

`body.scrollWidth` também é 375 nas duas rotas em 375 px. Em nenhuma largura há
rolagem horizontal de página.

### A causa está comprovadamente contida

No deployment real o contêiner tem `position: relative` e `overflow-x: auto`,
com `clientWidth` 343 e `scrollWidth` 621: **a rolagem é dele**.

Os oito `code.sr-only` continuam com borda direita em **629 px** — o mesmo
número do primeiro deployment. Isso é o esperado e é a prova de que a correção
funciona: a caixa de layout deles não mudou, mas agora o contêiner é o bloco
container desses elementos e os clipa, de modo que **eles não somam mais ao
`scrollWidth` do documento**. Documento em 375 com caixas em 629 é exatamente o
efeito pretendido.

## Acessibilidade no deployment real

| Verificação | Resultado |
|---|---|
| `<h1>` por página | 1 |
| Tabelas sem `<caption>` | 0 |
| `<th>` sem `scope` | 0 — 6 `col` + 8 `row` |
| Linhas na tabela | 8 |
| Região nomeada | `<section aria-label="Tabela de anexos — rolável na horizontal">` |
| Imagens sem `alt` | 0 |
| Links vazios | 0 |
| Erros de console | nenhum |
| Foco visível por teclado | `outline: 3px solid rgb(31,58,95)` no link focado |

Navegação por teclado conferida no ambiente real: focar o último `<summary>` da
tabela rolou o contêiner para `scrollLeft = 278`. Ou seja, a última coluna é
alcançável só com Tab, e a rolagem que acontece é a do contêiner — não a da
página. É o que justifica não ter posto `tabindex` no contêiner.

## Dívida visual do caption

Confirmada e mantida como dívida baixa. Em 375 px o `<caption>` acompanha a
largura interna da tabela e sua borda direita fica em 637 px, fora da área
visível até o usuário rolar o contêiner. Os três critérios exigidos foram
atendidos:

- ocorre **apenas dentro** do contêiner rolável;
- **não** causa overflow do documento — a página continua em 375;
- permanece íntegro no DOM e ligado à tabela, portanto acessível a leitor de
  tela.

A tabela não foi redesenhada nesta rodada.

## Endpoints e metadados

| Rota | Status |
|---|---|
| `/` | 200 |
| `/prestacao-de-contas` | 200 |
| `/prestacao-de-contas/imprimir` | 200 |
| `/anexos.json` | 200, 8 anexos |
| `/dev/estilos` | **404** |
| `/robots.txt` | 200 |
| `/sitemap.xml` | 200, 12 URLs |

`/anexos.json` traz `relatorio-tecnico-recanto-da-serra`=1 e
`identidade-visual`=7. Todas as URLs permanentes estão em
`acervo.observatoriotobiassoueu.com.br/arquivos/`. Sem `r2.dev`, sem endpoint
S3, sem A04, sem D01-08 e sem `anexos.zip`.

Canonical, Open Graph, `robots.txt` e as 12 URLs do sitemap mantêm
intencionalmente `https://observatoriotobiassoueu.com.br`. **Zero** ocorrências
de `vercel.app` no sitemap. `SITE_URL` não foi alterada.

Os oito links do acervo responderam **8/8 com HTTP 200**.

## Privacidade e integridade

Varredura em seis páginas HTML e nos oito bundles JavaScript do deployment:

| Termo | Ocorrências |
|---|---|
| `postgres://`, `postgresql://`, `DATABASE_URL` | 0 |
| `r2.dev`, `r2.cloudflarestorage`, `STORAGE_PRIVATE`, `ACCESS_KEY` | 0 |
| `observatorio-privado`, `OBSERVATORIO_FONTES_DIR` | 0 |
| Caminho local (`C:\Users`, `/home/`) | 0 |
| `D01-08`, `primeiro-post` | 0 |
| `anexos.zip` | 0 |
| Source maps públicos (`.map` com 200) | 0 |

**Falso positivo registrado:** a string `serra-dos-macacos` aparece uma vez, na
Home. É a `key` de um `<li>` do mapa territorial exibindo o topônimo *Serra dos
Macacos*, um dos quatro pontos de visita declarados em
`src/dados/territorio/pontos.ts`. **Não é o documento A04**, cujo slug é
`relatorio-tecnico-serra-dos-macacos`: ele não aparece na Sala, no
`/anexos.json` nem em qualquer bundle, e nenhum arquivo, hash ou link dele foi
publicado.

Snapshots antes e depois:

| Recurso | Antes | Depois | Alteração |
|---|---:|---:|---:|
| `documento` | 33 | 33 | 0 |
| `arquivo` | 18 | 18 | 0 |
| `documento_arquivo` | 18 | 18 | 0 |
| `vw_anexo_publico` | 8 | 8 | 0 |
| `PUBLICAVEL` | 2 | 2 | 0 |
| objetos R2 públicos | 8 | 8 | 0 |
| ZIPs no R2 | 0 | 0 | 0 |

A listagem do bucket público é **byte a byte idêntica** antes e depois, chave,
tamanho e ETag. Nenhuma escrita foi feita: as consultas usaram exclusivamente
`DATABASE_URL`, e a leitura da tabela de migrations foi negada por permissão,
confirmando que o role continua mínimo.

Envs e domínios reconferidos após o deployment: as mesmas três variáveis, zero
Custom Domains. `ZIP_ANEXOS_PUBLICADO` continua ausente.

## Nota operacional

A primeira invocação da CLI reportou `Logged out` e a chamada seguinte abriu um
fluxo de device code, concluído com `Success! Logged in.`. A autorização
ocorreu fora deste processo, no navegador do responsável. Registrado por
transparência: nenhuma credencial foi manipulada aqui.

## Estado final desta rodada

- deployments totais: **2**;
- deployment Production `READY`: 2;
- terceiro deployment: **não**;
- Custom Domains: **0**;
- Git conectado: **não**;
- push: **não**;
- ZIP publicado: **não**;
- banco/R2 alterados: **não**;
- domínio/DNS alterados: **não**;
- segredo exposto: **não**.

Os dois bloqueios que impediam a promoção estão validados na infraestrutura
real. A associação de `observatoriotobiassoueu.com.br` e a configuração de DNS
continuam sendo etapa própria, com autorização própria.

---

## Encerramento — domínio institucional associado

Este deployment é o que passou a servir o domínio público. Em 2026-09-08, sem
qualquer deployment adicional, `observatoriotobiassoueu.com.br` e
`www.observatoriotobiassoueu.com.br` foram associados ao projeto, o DNS foi
apontado manualmente na Cloudflare e a Vercel emitiu certificado para os dois.

O apex é o domínio canônico e responde 200; o `www` responde **308 permanente**
para o apex, preservando path e query. O acervo no R2 permaneceu intocado.

Os artefatos validados aqui — CTA do ZIP ausente e ausência de overflow em
375 px — foram reconferidos no domínio real, com o mesmo resultado.

Detalhes em [`PLANO_DEPLOY_VERCEL_2026-09-08.md`](./PLANO_DEPLOY_VERCEL_2026-09-08.md), seção 20.
