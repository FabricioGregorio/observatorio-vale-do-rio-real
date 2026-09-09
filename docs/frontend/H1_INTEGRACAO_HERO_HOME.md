# H1 — Integração do Hero Manifesto na Home

**Data:** 2026-09-09

**Estado:** implementado e validado localmente; não publicado

**Baseline:** `9ef823d` — `feat: refina hero manifesto aprovado`

## 1. Decisão aplicada

A Home local passou a usar exclusivamente o **Hero B revisado**, aprovado pelo
responsável humano. A integração reutiliza sem alteração visual o componente e
os derivados congelados na baseline: fotografia com art direction, símbolo
oficial do Observatório, título em texto real e selo circular do Coletivo
Cultural “Tobias, sou Eu!”.

A abertura estrutural anterior foi removida da composição da Home. Assim, não
há título antigo, CTA duplicada nessa abertura nem segundo `h1`.

## 2. Cabeçalho e navegação

A casca aprovada do cabeçalho foi reutilizada na Home. O cabeçalho legado do
layout raiz é ocultado somente quando `#home-com-hero` está presente; as demais
rotas continuam inalteradas.

Na Home real, o menu renderiza apenas destinos existentes:

- Observatório — `/observatorio`;
- Pesquisa — `/pesquisa`;
- Dados — `/dados`;
- PodObservar — `/podobservar`.

`Território` e `Acervo` continuam visíveis apenas no laboratório `/dev/hero`,
como texto de demonstração. Na Home eles são omitidos: nenhuma rota, link ou
página provisória foi inventada. A ação institucional continua apontando para
`/prestacao-de-contas`.

O Hero e o cabeçalho continuam Server Components. Nenhum Client Component foi
criado nesta integração. A Home já hidratava `MenuMobile` e `MapaInterativo`;
agora também alcança as duas folhas aprovadas `CabecalhoReativo` e
`CentralAcessibilidade`: **2 → 4 ilhas alcançáveis**, sem dependência nova.

## 3. Continuidade com a Home existente

`CaminhosPrioritarios`, `SecaoMapa` e `ChamadaAcervo` foram preservados. A única
transição adicionada é a passagem direta do quadro fotográfico para o fundo da
página, com borda semântica discreta e o espaçamento já existente. Não houve
redesenho do mapa, dos municípios, da pesquisa, dos dados, do acervo, do rodapé
ou da Sala do Avaliador.

## 4. Validação visual e acessível

Capturas reais da Home local foram conferidas em:

- 1440 px — claro e escuro;
- 375 px — claro e escuro;
- 320 px — claro.

Elas incluem a primeira dobra e o início de `Caminhos prioritários` e ficaram
fora do Git. A inspeção confirmou:

- um único `h1`, com o nome oficial completo;
- um único cabeçalho visível, além dos landmarks de navegação, conteúdo e rodapé;
- duas marcas circulares reconhecíveis, sem distorção;
- fotografia desktop em 1440 e composição mobile em 375/320;
- ausência de overflow horizontal em 320/375/768/1440, claro e escuro;
- título e transição utilizáveis no equivalente a zoom de 200%;
- Central abre como diálogo, troca o tema, fecha com `Escape` e devolve foco;
- contraste do Hero preservado: mínimo já medido de **6,45:1**, acima de AA;
- `/dev/hero` responde **404** no build de produção.

## 5. Build e peso transferido

O build de produção gerou 20 páginas estáticas. Medição em `next start`, com
contextos novos por largura:

| Largura | HTML | CSS | JavaScript | mídia do Hero | total da página |
|---|---:|---:|---:|---:|---:|
| 1440 px | 53.270 B | 6.331 B | 143.428 B | 340.986 B | **668.029 B** |
| 375 px | 53.270 B | 6.331 B | 143.428 B | 232.158 B | **549.280 B** |

O LCP observado foi a fotografia correta do Hero nos dois casos:

- 1440 px: `hero-observatorio-desktop-1440.webp`, 144 ms no ensaio local;
- 375 px: `hero-observatorio-mobile-540.webp`, 92 ms no ensaio local.

O referencial de 500 kB permanece excedido, como já registrado no protótipo.
Não se recomprimiu nem degradou a fotografia para fabricar aprovação numérica;
o peso também inclui o HTML extenso do mapa existente e as ilhas já carregadas
pelo layout. Esta pendência continua sendo decisão de publicação/performance,
não falha nova desta integração.

## 6. Gates

- `pnpm build`: passou;
- `pnpm tipos`: passou;
- `pnpm lint`: passou com os quatro avisos CSS preexistentes;
- `pnpm teste`: 375 passaram; 3 pulados;
- `pnpm a11y`: 156 passaram;
- `pnpm pendencias`: código 0, sem atestado porque `DATABASE_URL` estava
  ausente; nenhum dado foi consultado.

Não houve deploy, push, banco, R2, Vercel, DNS ou alteração de infraestrutura.
