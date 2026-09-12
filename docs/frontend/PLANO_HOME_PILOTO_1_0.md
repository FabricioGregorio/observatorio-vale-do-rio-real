# PLANO DA HOME PILOTO 1.0
## Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real

**Versão:** 1.0
**Data:** 08/09/2026
**Status:** PLANO — NENHUMA IMPLEMENTAÇÃO AUTORIZADA POR ESTE DOCUMENTO
**Baseline Git:** `feat/home-indicadores` @ `7398b1d347b4d394fe397ab013e99c5487a01416`

**Fonte de verdade visual:** [`DIRECAO_VISUAL_FRONTEND_1_0.md`](./DIRECAO_VISUAL_FRONTEND_1_0.md).
Este plano **referencia** aquele documento; não o substitui, não o reinterpreta e
não altera nenhuma decisão fechada nele.

**Hierarquia obedecida** (`AGENTS.md`): instrução humana → `docs/02-arquitetura-banco.md`
→ `docs/01-arquitetura-informacao.md` → `docs/03-guia-implementacao.md` → código →
opinião do agente. Onde a Direção Visual e o doc 01 divergem, este plano **registra a
divergência e devolve a decisão ao humano** em vez de escolher um dos lados.

---

# 1. Objetivo

Produzir a especificação executável da **Home Piloto 1.0**: a primeira página que
materializa o conceito **CARTOGRAFIA VIVA** com qualidade suficiente para validar a
linguagem visual do projeto, sem redesenhar o site inteiro e sem inventar conteúdo.

O Piloto precisa provar cinco coisas, nesta ordem:

1. que a identidade do Observatório e a do Coletivo "Tobias, sou Eu!" coexistem sem
   que uma apague a outra;
2. que fotografia documental, cartografia e tipografia de metadados formam **um**
   sistema, e não três estéticas empilhadas;
3. que o site continua rápido, acessível e funcional sem JavaScript depois de ganhar
   Hero fotográfico, tema escuro e Central de Acessibilidade;
4. que conteúdo ausente aparece como **estado declarado**, nunca como preenchimento
   plausível;
5. que dark mode é primeira classe, e não inversão.

O que o Piloto **não** precisa provar: mapa interativo sofisticado, scrollytelling,
gráficos complexos, áudio completo. Tudo isso está marcado `PÓS-PILOTO` na §29.

---

# 2. Estado atual

## 2.1 Baseline verificado

```
branch          feat/home-indicadores
último commit   7398b1d347b4d394fe397ab013e99c5487a01416
                "docs: conclui configuracao do dominio publico"
working tree    limpa, exceto `docs/frontend/` não rastreado
```

`docs/frontend/` contém apenas `DIRECAO_VISUAL_FRONTEND_1_0.md`, movido para o
repositório — situação explicitamente permitida pela tarefa. **Baseline confere.**

## 2.2 Infraestrutura

Concluída, conforme `ESTADO_ATUAL_PROJETO.md`:

| Item | Estado |
|---|---|
| Domínio público | `observatoriotobiassoueu.com.br` no ar |
| `www` | 308 permanente para o apex |
| Acervo | `acervo.observatoriotobiassoueu.com.br` |
| Deployments Vercel | 2 |
| Git ↔ Vercel | desconectado (deploy manual controlado) |
| ZIP público | não publicado |
| Push | nenhum |

## 2.3 Stack

| Camada | Versão / ferramenta |
|---|---|
| Framework | Next.js **16.3.4**, App Router, `typedRoutes: true` |
| React | Server Components por padrão |
| CSS | Tailwind 4 via `@theme` em `src/estilos/tokens.css` |
| Fontes | `next/font` auto-hospedado — Archivo, Literata, IBM Plex Mono, subset `latin` |
| Lint/format | Biome |
| Testes | Vitest (unidade) + Playwright (`testes/a11y/`) |
| Banco | PostgreSQL + Drizzle, consultado **em build time** |
| Portão | `pnpm verificar` = tipos + lint + teste + a11y + pendências |

## 2.4 Orçamento de performance — o número que governa o Piloto

`docs/01-arquitetura-informacao.md` §7 fixa: **Home < 500 kB transferidos**,
Lighthouse ≥ 90, LCP < 2,5 s em 3G.

Medição registrada na ADR-010, build de produção servido:

| Item | Bytes |
|---|---|
| Documento HTML (inclui o mapa) | 49.967 |
| JavaScript | 142.004 |
| Fontes | 108.972 |
| CSS | 5.013 |
| Prefetch de rotas | 12.178 |
| **Total** | **318.134** |

**Folga disponível: 181.866 B.** Esse número é a restrição mais dura de todo este
plano. Ele precisa acomodar, ao mesmo tempo: a fotografia do Hero, o tema escuro, a
Central de Acessibilidade, o player de narração e o pôster cartográfico. A §28
distribui essa folga item a item.

---

# 3. Conceito visual

Adotado sem alteração da Direção Visual §2: **CARTOGRAFIA VIVA**, em três camadas
simultâneas.

| Camada | Como aparece na Home Piloto |
|---|---|
| **1 — Tecnologia / interface** | grade rígida de 12 colunas; numeração `01 —`; metadados em IBM Plex Mono; linhas de 1px; foco visível; estados de seleção do mapa; ausência declarada em vez de vazio silencioso |
| **2 — Editorial / humana** | Literata no corpo e nas introduções; fotografia documental de campo; legendas com peso de ficha de arquivo; texto com respiro |
| **3 — Identidade cultural** | teal institucional do Observatório; temperatura mata; espessura cartográfica do pôster de Sergipe; iconografia territorial **com função semântica** (§21 da Direção Visual) |

A regra de arbitragem, quando as três disputarem o mesmo espaço: **a informação vence
a composição, e a composição vence o ornamento**. Nenhum elemento das camadas 1 e 3
pode existir sem carregar informação verdadeira.

---

# 4. Assets disponíveis

## 4.1 Método

Auditados: `public/` do repositório e o corpus apontado por
`OBSERVATORIO_FONTES_DIR` em `.env.local`, fora do repositório. **Somente arquivos
efetivamente encontrados estão listados.** Nenhum arquivo foi copiado, movido,
convertido ou publicado nesta rodada.

## 4.2 `public/` do repositório — vazio de propósito

```
public/media/
├── LEIA-ME.md
├── campo/.gitkeep
├── logos/.gitkeep
├── mapa/.gitkeep
├── pessoas/.gitkeep
└── territorio/.gitkeep
```

**Nenhuma imagem existe no repositório hoje.** `public/media/LEIA-ME.md` fixa as
condições de entrada: só imagem real do projeto, `alt` obrigatório na tipagem,
consentimento verificado para pessoa identificável, logos dependentes do manual de
marcas (E02), formato WebP/AVIF com carregamento preguiçoso.

## 4.3 Corpus de identidade visual — inventário verificado

| Arquivo | Bytes | Natureza técnica **medida** |
|---|---|---|
| `elementos visuais e graficos/home.jpg` | 7.190.837 | JPEG **4000×3000**, 4:3 paisagem |
| `elementos visuais e graficos/logo observatorio.svg` | 704.083 | ⚠ **PNG base64 dentro de wrapper SVG** |
| `elementos visuais e graficos/cactus.svg` | 130.974 | ⚠ **PNG base64 dentro de wrapper SVG** |
| `elementos visuais e graficos/carcará.svg` | 91.034 | ⚠ **PNG base64 dentro de wrapper SVG** |
| `elementos visuais e graficos/igreja.svg` | 41.390 | ⚠ **PNG base64 dentro de wrapper SVG** |
| `observatorio/horizontal-monocromatica-escura.svg` | 31.520 | ✅ **vetor real** — 13 path, gradientes, 1600×900 |
| `observatorio/horizontal-monocromatica-escura.png` | 123.426 | raster |
| `observatorio/icon.svg` | 704.574 | ⚠ **PNG base64 dentro de wrapper SVG** |
| `observatorio/icon.png` | 101.189 | PNG 1080×1350 |
| `observatorio/logo-e-texto.png` | 424.897 | PNG 1080×1350 |
| `observatorio/primeiro-post-observatorio.pdf` | 35.599.475 | **D01-08 — MANTER_PRIVADO** |
| `coletivo-tobias-sou-eu/logo-oficial-tobias-sou-eu.png` | 289.486 | PNG 1280×1024, com alfa |
| `coletivo-tobias-sou-eu/logo.pdf` | 12.943.470 | PDF |

### Achado crítico 1 — cinco dos seis "SVG" não são vetores

`logo observatorio.svg`, `icon.svg`, `cactus.svg`, `carcará.svg` e `igreja.svg` são
**imagens raster PNG codificadas em base64 dentro de um invólucro SVG**, com filtro e
máscara sobre um `xlink:href="data:image/png;base64,…"`. Consequências reais:

- **não escalam** — ampliar serrilha, como qualquer PNG;
- **não podem ser recoloridos** por `currentColor` nem por token;
- **não servem como biblioteca iconográfica** (§21 da Direção Visual) na forma atual;
- `logo observatorio.svg` custa **704 kB**, mais que o orçamento inteiro da Home;
- não revelam a fonte do lettering, porque não há lettering vetorial neles.

**O único vetor real da marca é `horizontal-monocromatica-escura.svg`** — 13 caminhos,
nenhuma imagem embutida, fundo preto sólido, gradientes internos com parada `#4C545B`.
O lettering nele está **convertido em curvas**: zero elementos de texto, zero
`font-family`.

### Achado crítico 2 — cor institucional medida, não estimada

A Direção Visual §5.1 exige que o hexadecimal saia do arquivo oficial, e proíbe
"olhar e estimar". Amostragem de frequência de pixel:

| Arquivo | Cor dominante | Frequência |
|---|---|---|
| `observatorio/icon.png` | **`#026A69`** | 87,59 % |
| `observatorio/logo-e-texto.png` | **`#026A69`** | 68,07 % |
| `coletivo-tobias-sou-eu/logo-oficial-tobias-sou-eu.png` | **`#9E309E`** | 64,00 % |
| idem — acento | `#E7C500` | 4,75 % |
| idem — acento | `#F15A24` | 2,24 % |

**`#026A69` é o verde-azulado institucional do Observatório.** Ele **não existe** em
`src/estilos/tokens.css` hoje. A §20 trata da entrada dele no sistema.

**O Coletivo tem paleta própria e divergente** — magenta, amarelo e laranja. Isso não
é detalhe: é o problema central de composição do Hero e do header (§17).

### Achado 3 — asset citado na Direção Visual que não existe no corpus

A Direção Visual §25 lista `mapa observatorio(1).jpg` como referência de
inclinação/espessura. **Busca por `*mapa*` em todo o corpus retornou zero resultados.**
Também não existem os sufixos `(1)` citados em `logo observatorio(1).svg` — o arquivo
real chama-se `logo observatorio.svg`.

Isto **não altera** a Direção Visual: a referência de mapa inclinado permanece como
decisão humana descrita em texto (§10.1). Fica registrado apenas que **o arquivo de
referência não está disponível para consulta**, e que a §10 deste plano especifica a
inclinação a partir da descrição textual, não da imagem.

## 4.4 Fotografias de campo disponíveis no corpus

```
fotos/
├── centro-cultural-museu-borda-da-mata/
├── dilson-de-agripino/
├── diretor-turismo-sao-cristovao/
├── fundacao-cultura-sao-cristovao/
├── ilha-grande/
├── josenilson-bispo/
├── laerte-aguiar/
└── pedro-menezes/
```

Seis das oito pastas nomeiam **pessoas identificáveis**. Nenhuma delas pode ir ao
site antes de E01 (termos de consentimento, `Pendente`) — ver §13.

## 4.5 primeiro-post-observatorio.pdf — uso nesta rodada

Tratado **exclusivamente como referência visual interna**, conforme a decisão humana
de 2026-09-08 registrada em `ESTADO_ATUAL_PROJETO.md`: D01-08 é `MANTER_PRIVADO`.

Nesta tarefa o PDF **não foi aberto, extraído, convertido nem copiado**. Não foi
colocado em `/public`, não tem URL, não entra em build, Manifesto, `/anexos.json`,
ZIP ou Sala do Avaliador. A leitura de cor e tipografia que sustenta este plano veio
dos arquivos de marca (`icon.png`, `logo-e-texto.png`,
`horizontal-monocromatica-escura.svg`), que são D01-01..07 — **já publicados** — e não
do PDF restrito.

---

# 5. Arquitetura atual

## 5.1 Árvore de componentes hoje

```
RootLayout                                  Server   src/app/layout.tsx
├── html lang="pt-BR" + 3 variáveis de fonte
├── PularConteudo                           Server
├── Cabecalho                               Server
│   └── MenuMobile                          CLIENT   ← 1 de 2 ilhas do site
├── main id="conteudo"
│   └── Home                                Server   src/app/page.tsx
│       ├── AberturaObservatorio            Server   h1 + CTA Prestação de Contas
│       ├── CaminhosPrioritarios            Server   nav de 4 cartões
│       │   └── CartaoCaminho ×4            Server
│       ├── SecaoMapa                       Server   lê e valida o dado em build
│       │   └── MapaTerritorio              Server
│       │       ├── style CSS_DO_MAPA                escopado em .mapa-territorio
│       │       ├── MunicipioNoMapa ×75     Server   path com data-codigo
│       │       ├── MarcadorNoMapa ×N       Server   circle (0 hoje)
│       │       ├── MapaInterativo          CLIENT   ← 2 de 2; não renderiza nada
│       │       ├── Municipio ×75           Server   lista territorial
│       │       │   └── FichaMunicipio      Server
│       │       └── MarcadorVisita ×4       Server   pontos sem posição
│       └── ChamadaAcervo                   Server   /anexos.json + imprimível
└── Rodape                                  Server
    └── CreditosInstitucionais              Server   devolve null sem marcas
```

**Client Components hoje: 2.** `MenuMobile` e `MapaInterativo`. O segundo não
renderiza nada — só promove o SVG do servidor a `listbox` após a montagem.

## 5.2 Classificação MANTER / REFATORAR / SUBSTITUIR / CRIAR

| Artefato | Veredito | Motivo |
|---|---|---|
| `src/app/layout.tsx` | **REFATORAR** | script anti-FOUC de tema, `ProvedorPreferencias`, landmark de utilidades |
| `src/app/page.tsx` | **REFATORAR** | nova ordem de seções; continua Server, continua sem query |
| `src/estilos/tokens.css` | **REFATORAR** | ampliar: teal, dark mode, spacing, motion, z-index, breakpoints |
| `PularConteudo` | **MANTER** | correto e testado |
| `Cabecalho` | **REFATORAR** | brand rail + utilidades isoladas + hide-on-scroll |
| `MenuMobile` | **SUBSTITUIR** | vira `NavegacaoMobile` (§8) |
| `Rodape` | **REFATORAR** | vira `RodapeInstitucional` com presença do Coletivo |
| `CreditosInstitucionais` | **MANTER** | contrato correto; segue bloqueado por E02 |
| `AberturaObservatorio` | **SUBSTITUIR** | vira `HeroManifesto` (§7) |
| `CaminhosPrioritarios` + `CartaoCaminho` | **SUBSTITUIR** | absorvidos pelas seções numeradas — ver ressalva |
| `SecaoMapa` | **SUBSTITUIR** | vira `SecaoTerritorio`, layout 58/42 (§10) |
| `MapaTerritorio` | **REFATORAR** | enquadramento de pôster; lista extraída |
| `MunicipioNoMapa` | **MANTER** | contrato correto |
| `MarcadorNoMapa` | **MANTER** | correto; sem dado para renderizar |
| `MarcadorVisita` | **MANTER** | correto |
| `Municipio` / `FichaMunicipio` | **MANTER** | correto |
| `MapaInterativo` | **REFATORAR** | acrescenta transição pôster→ferramenta |
| `estilosDoMapa.ts` | **REFATORAR** | camada de espessura + equivalentes dark |
| `identificacao.ts` / `rotulos.ts` | **MANTER** | corretos |
| `src/dados/territorio/*` | **MANTER** | nenhuma mudança de dado nesta fase |
| `src/lib/navegacao.ts` | **BLOQUEADO** | ver §8.1 — exige decisão humana |
| `ChamadaAcervo` | **SUBSTITUIR** | vira `EntradaAcervo` com fichas reais (§15) |

**Ressalva sobre `CaminhosPrioritarios`.** Ele responde ao critério do doc 01 §2 —
"cada público chega ao seu destino em no máximo dois cliques a partir da Home" — e
está coberto por `testes/a11y/home.spec.ts` e `testes/home.test.ts`. Removê-lo sem
substituto quebra requisito **e** teste. A substituição só é legítima porque as sete
seções numeradas mais o menu passam a cobrir os mesmos destinos com um clique. **Cada
fase que mexer nisso precisa atualizar o teste na mesma entrega**, nunca depois.

## 5.3 O que já está certo e não deve ser reinventado

Cinco decisões do código atual são superiores ao que um redesenho ingênuo produziria,
e o Piloto deve **preservá-las**:

1. **Componente não consulta banco.** `SecaoMapa` lê e valida em build; `MapaTerritorio`
   recebe por props. Isso é `AGENTS.md`, doc 03 §2 e §5.
2. **A ilha cliente alcança o SVG pelo `id`, não por `children`.** Passar como
   `children` serializaria 48 kB de geometria duas vezes no documento.
3. **Atributos interativos entram só depois da montagem.** Sem JS o mapa se anuncia
   `role="img"` e não promete navegação que não pode cumprir.
4. **Roving tabindex:** o mapa é **uma** parada de Tab, não 75.
5. **Estado ausente é declarado**, não preenchido: `descricao: null` → "Em preparação";
   ponto sem coordenada → listado fora do desenho, nunca com pin aproximado.

---

# 6. Home proposta

## 6.1 Ordem recomendada

A ordem base da tarefa (§36) e da Direção Visual §9 é adotada **com um ajuste
justificado**:

```
Hero — Manifesto
00 — O Observatório e o Coletivo        ← ACRÉSCIMO JUSTIFICADO
01 — Território
02 — Pesquisa em campo
03 — Dados
04 — Pessoas
05 — PodObservar
06 — Acervo
07 — Transparência
Rodapé institucional
```

**Justificativa do bloco `00`.** A Direção Visual §4.2 exige "seção institucional
própria explicando idealização e realização" e §24 fixa a hierarquia de autoria. O
Hero comporta apenas a linha `Uma iniciativa "Tobias, sou Eu!"` — a Direção Visual §8.5
proíbe parágrafo longo na primeira dobra. Sem o bloco `00`, o Coletivo aparece uma vez
em uma linha e some até o rodapé, que é exatamente o tratamento de "logo de rodapé"
que a §29 da tarefa proíbe.

O bloco `00` é curto e não numerado como seção de pesquisa: é a ponte entre o
manifesto e o território. **Ele depende de texto humano aprovado e hoje está
bloqueado** — ver §26.

Nenhuma outra alteração de ordem é proposta. Nenhuma seção de marketing é acrescentada.

## 6.2 Ritmo e temperatura por seção

| # | Seção | Fundo | Âncora cromática | Densidade |
|---|---|---|---|---|
| — | Hero | fotografia + overlay mata | teal + milho | mínima |
| 00 | Observatório / Coletivo | pedra-fundo | teal | baixa, editorial |
| 01 | Território | pedra-fundo | mata + milho | alta |
| 02 | Pesquisa em campo | pedra-elevado | mata | média, fotográfica |
| 03 | Dados | pedra-fundo | anil + teal | alta, tabular |
| 04 | Pessoas | fotografia | tons naturais | média |
| 05 | PodObservar | mata (bloco escuro) | milho | média |
| 06 | Acervo | pedra-fundo | grafite + teal | alta, ficha |
| 07 | Transparência | neutro técnico | anil | mínima |
| — | Rodapé | mata | pedra | média |

A alternância clara/escura entre 05 e 06 é o único momento de inversão da Home. Ela
existe para separar o produto de divulgação (podcast) do repositório documental
(acervo), não por variação estética.

---

# 7. Hero — Manifesto

## 7.1 Decisões herdadas, não renegociáveis

Da Direção Visual §8 e §29:

- imagem oficial: **`home.jpg`**;
- altura: **90–100 svh**;
- fotografia cobrindo a área, overlay escuro com tendência mata/verde-azulado;
- **título:** `Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real`;
- **subtítulo/autoria:** `Uma iniciativa "Tobias, sou Eu!"`;
- sem parágrafo longo;
- sem filtro vintage, sem ruído artificial pesado.

Nenhuma copy nova é criada por este plano. Onde algo for proposta, está marcado
`PROPOSTA — A VALIDAR`.

## 7.2 A fotografia: medições

`home.jpg` — **3000×4000 px, retrato, 6.858 kB**.

> **⚠ CORRIGIDO na H1.** Este documento dizia "4000×3000, 4:3 paisagem". O
> arquivo está *gravado* assim, mas traz `Orientation = 6` no EXIF: para
> exibir corretamente é preciso girar 90° no sentido horário. **A fotografia é
> retrato.** O erro veio de ler as dimensões sem aplicar a orientação.
>
> A consequência inverte a dificuldade prevista abaixo: o mobile recebe o
> formato nativo, e é o **desktop** que precisa extrair uma faixa horizontal de
> uma origem vertical. Ver [H1](./H1_HERO_MANIFESTO_PROTOTIPO.md) §3.2.

Luminância relativa média por faixa horizontal (amostra 160 px de largura):

| Faixa | Luminância | Cor média |
|---|---|---|
| Terço superior | 0,4100 | `#646C54` |
| Terço central | 0,4035 | `#656A51` |
| Terço inferior | 0,4470 | `#6F755A` |

Duas leituras importam:

1. **A imagem já é "mata".** A cor média das três faixas é um verde-oliva. A tendência
   mata/verde-azulado do overlay **acompanha** a fotografia em vez de tingi-la — não há
   correção artificial de cor, o que atende à proibição de "cor artificial" (§7.3 da
   Direção Visual).
2. **A luminância é média em toda a altura.** Não existe faixa naturalmente escura onde
   assentar o título sem overlay. **O overlay é obrigatório**, não estilístico.

## 7.3 Overlay — opacidade calculada, não estimada

Composição de `home.jpg` com overlay sólido `--color-mata` `#12301F` em várias
opacidades. Contraste calculado contra **texto branco**, no **percentil 95 de
luminância** — isto é: o pior caso realista, não a média. O título precisa passar
sobre os pixels mais claros que encontrar.

| α | L mediana | L p95 | Contraste branco no p95 | WCAG |
|---|---|---|---|---|
| 0,35 | 0,0952 | 0,2611 | 3,37:1 | ✗ |
| 0,45 | 0,0800 | 0,2032 | 4,15:1 | ✗ |
| **0,50** | 0,0731 | 0,1776 | **4,61:1** | ✓ AA |
| **0,60** | 0,0603 | 0,1323 | **5,76:1** | ✓ AA com folga |
| 0,70 | 0,0490 | 0,0947 | 7,26:1 | ✓ AAA |

**Recomendação: α = 0,60.** Passa AA com margem para variação de crop entre
breakpoints e para o recorte que o `object-fit: cover` faz em cada viewport — margem
que α = 0,50 não tem. α = 0,70 fica reservado ao modo **alto contraste** da Central de
Acessibilidade (§9), onde alcança AAA.

O overlay é um único `background-color` com alfa, aplicado por pseudo-elemento sobre a
imagem. **Não usar gradiente decorativo** (proibido em `tokens.css`); se a leitura no
rodapé do Hero exigir reforço, usar um segundo bloco sólido de baixa altura, não um
gradiente ao longo da tela.

`ITEM A VALIDAR VISUALMENTE` — a Direção Visual §30.1 já registra "intensidade exata
do overlay do Hero" como ponto de validação. Este plano entrega o **piso medido**
(0,50) e a **recomendação** (0,60); a escolha final é humana.

---

## 7.4 Art direction por breakpoint

O arquivo é 4:3 paisagem. Em 375 px de largura com 90 svh, a área útil é
aproximadamente 375×730 — **proporção 1:1,95, vertical**. Um `cover` ingênuo descarta
cerca de 74 % da largura da fotografia e pode cortar justamente as pessoas e as placas
que a Direção Visual §7.4 manda preservar.

| Breakpoint | Enquadramento | Objetivo |
|---|---|---|
| 375 | crop vertical central, `object-position` a validar | preservar profundidade e figura humana; a §7.4 da Direção Visual pede aproveitar a verticalidade |
| 768 | crop 4:5 | transição |
| 1440+ | quadro completo ou crop 16:9 alto | preservar pessoas + placas + profundidade horizontal |

**Implementação recomendada:** `next/image` com `sizes` correto e três variantes
geradas no build, **não** três arquivos recortados à mão — recorte manual congela a
escolha e some do controle de versão. Se a validação humana concluir que o crop
automático perde o assunto, aí sim gerar derivados nomeados, registrando o
enquadramento escolhido.

`next/image` **não é usado em lugar nenhum do projeto hoje**. Sua entrada é uma
decisão nova desta fase, e a §28 registra o risco associado.

## 7.5 Peso — a restrição mais dura do Piloto

6.858 kB é **13,7 vezes** o orçamento inteiro da Home. A fotografia precisa caber, no
maior breakpoint, no envelope que a §2.4 deixa livre.

Orçamento proposto para o Hero, dentro dos 181.866 B de folga:

| Item | Teto proposto |
|---|---|
| Hero, variante servida a 1440 px (AVIF) | ~~**120.000 B**~~ — **inalcançável, ver nota** |
| Hero, variante servida a 375 px (AVIF) | 35.000 B |
| Tema + Central de Acessibilidade + narração (JS) | 25.000 B |
| Reserva para o pôster cartográfico | 15.000 B |
| **Margem restante** | ~21.866 B |

> **⚠ MEDIDO na H1: a estimativa acima não se sustenta.** Esta fotografia é o
> pior caso para compressão — folhagem e grama de alta frequência em quase todo
> o quadro. Em WebP, o derivado de 1440×936 pesa **291 kB** em qualidade 0,55, e
> mesmo em qualidade 0,4 não desce de 239 kB, já com perda visível. Somada à
> base de ~256 kB, a Home fica em **~615 kB** em 1440 — 23% acima do orçamento.
> Os 120 kB foram estimados antes de medir. Ver
> [H1](./H1_HERO_MANIFESTO_PROTOTIPO.md) §15 para os caminhos possíveis, todos
> de decisão humana.

**Critério de aceite:** a Home, no breakpoint de pior caso, permanece **< 500 kB
transferidos**, medido no build servido, do mesmo modo que a ADR-010 mediu. Se a
fotografia não couber em 120 kB com qualidade aceitável, a decisão volta ao humano —
não se resolve baixando o orçamento nem trocando a foto.

**LCP.** A fotografia do Hero será o Largest Contentful Paint. Ela deve ter
`priority`/`fetchpriority="high"` e **não** `loading="lazy"`. Isso contraria a regra
geral de `loading="lazy"` do doc 01 §7, e a exceção precisa estar escrita no PR.

## 7.6 Composição

```
┌──────────────────────────────────────────────────────────────┐
│  [marca Observatório]  ·  [Coletivo]     menu        ⓐ   ⓟ   │  header sobreposto
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│   LOC / VALE DO RIO REAL — SERGIPE                           │  mono, discreto
│                                                              │
│   Observatório de Cultura e Economia Criativa                │  Archivo
│   da Região do Vale do Rio Real                              │
│                                                              │
│   Uma iniciativa "Tobias, sou Eu!"          [marca Coletivo] │  autoria + marca
│                                                              │
│                                                              │
│                                       ▼ ver o território     │  âncora para 01
└──────────────────────────────────────────────────────────────┘
```

**Escala do título.** `--text-4xl` (3,052 rem) a `--text-5xl` (3,815 rem) no desktop,
descendo para `--text-2xl`/`--text-3xl` em 375 px. O título tem 79 caracteres e **duas
linhas obrigatórias no desktop** — a quebra entre `Criativa` e `da Região` é semântica
e deve ser controlada, não deixada ao acaso. `text-wrap: balance` já está aplicado a
`h1..h4` no `tokens.css`. `ITEM A VALIDAR` — Direção Visual §30.2.

**Metadados do Hero.** A Direção Visual §8.5 permite "metadados mínimos e verdadeiros,
por exemplo local/ano do projeto, quando documentalmente confirmados". `LOC / VALE DO
RIO REAL — SERGIPE` é sustentado por `src/dados/territorio/recorte.ts`. **Ano de
projeto: não incluir** até haver fonte documental citável — o edital é PNAB nº 02/2025
e as visitas são de 2026; misturar os dois num metadado de uma linha é ambíguo, e
ambiguidade em prestação de contas é defeito.

**Sem CTA de botão no Hero.** O CTA atual "Abrir a Prestação de Contas" migra para a
seção 07 e para as utilidades do header, onde a Direção Visual §13.2 quer que ele
esteja: fácil de localizar, fora de submenu, permanente. Um botão no Hero competiria
com o manifesto.

## 7.7 Presença do Coletivo no Hero

A tarefa §8 é explícita: "Não tratar o Coletivo como patrocinador secundário".

**Proposta:** dois pontos de presença simultâneos, ambos acima da dobra.

1. **Linha de autoria** em Literata, imediatamente abaixo do título, com o nome entre
   aspas exatamente como aprovado.
2. **Marca do Coletivo** ao lado da linha de autoria, em altura ótica equivalente à da
   marca do Observatório no header — **não menor**.

**Problema cromático a resolver.** O Coletivo é magenta `#9E309E`; o Observatório é
teal `#026A69`. Sobre o Hero escuro:

| Combinação | Contraste | Veredito |
|---|---|---|
| `#9E309E` sobre mata `#12301F` | 2,30:1 | ✗ ilegível |
| `#026A69` sobre mata `#12301F` | 2,23:1 | ✗ ilegível |
| `#E7C500` (amarelo do Coletivo) sobre mata | 8,43:1 | ✓ |

**Nenhuma das duas marcas pode aparecer em sua cor institucional sobre o Hero
escuro.** A solução correta não é recolorir marca — é usar a **versão monocromática
clara** de cada uma. O Observatório tem essa versão em vetor real
(`horizontal-monocromatica-escura.svg`, que é a marca clara sobre fundo escuro). **O
Coletivo não tem versão monocromática no corpus.**

`BLOQUEIO REGISTRADO` — ver §31, questão Q3.

---

# 8. Navegação

## 8.1 ✅ RESOLVIDO — o menu alvo foi decidido

> **Atualização de 2026-09-09.** O responsável decidiu que o menu da Direção Visual é
> o alvo, e a decisão é posterior ao doc 01. Está registrada na
> [ADR-017](../decisoes/ADR-017-navegacao-alvo-do-frontend.md), junto da estratégia
> incremental que impede link quebrado, e o doc 01 §3 recebeu o apontamento.
>
> **O que permanece:** `/territorio` e `/acervo` ainda não existem como rotas, e
> `typedRoutes` reprova link para rota inexistente. A troca do menu continua sendo da
> **H1**, e depende de as duas rotas existirem primeiro. A análise abaixo permanece
> como registro do problema e do porquê da sequência.

Este foi o achado mais consequente da auditoria.

| Fonte | Menu |
|---|---|
| `docs/01-arquitetura-informacao.md` §3 | O Observatório · A Pesquisa · Dados · **Diário de Campo** · PodObservar · **Educação** |
| `src/lib/navegacao.ts` (código) | idem |
| **Direção Visual §8.3 e §29** | Observatório · **Território** · Pesquisa · Dados · PodObservar · **Acervo** |

A diferença não é de rótulo. É de **rota**:

- `Território` e `Acervo` **não existem** como rotas — `src/app/` não tem
  `territorio/` nem `acervo/`;
- `Diário de Campo` (`/campo`) e `Educação` (`/educacao`) existem e sairiam do menu;
- `next.config.ts` tem **`typedRoutes: true`** — um `Link` para rota inexistente
  **reprova em `pnpm tipos`**. Não há atalho: nem `as Route` (anula a checagem) nem
  desligar `typedRoutes` são permitidos.

`AGENTS.md` é inequívoco: *"Alterar os itens 2 e 3 não é atribuição do agente. Se a
tarefa parecer exigir mudança de schema ou de rota, escreva a proposta em
`docs/decisoes/` e devolva a decisão ao humano."* O doc 01 é o item 3.

**Encaminhamento obrigatório antes da fase H1:**

1. abrir **ADR-017 — Menu principal e mapa do site do frontend 1.0**, comparando o
   menu do doc 01 com o da Direção Visual;
2. decidir o destino de `/campo` e `/educacao` — saem do menu mas continuam existindo?
   viram filhos de outra seção? são descontinuados?;
3. definir se `Território` é rota nova ou renomeação de `/mapa` (previsto no doc 01 §3,
   nunca implementado), e se `Acervo` é rota nova ou a face pública de
   `/prestacao-de-contas/anexos`;
4. **atualizar o doc 01 §3** — pela mão do humano — antes de tocar em
   `src/lib/navegacao.ts`.

**Enquanto isso não acontecer, a fase H1 não pode implementar o menu aprovado.** As
fases H0 e H2 (tokens e Hero) **não dependem** desta decisão e podem seguir.

## 8.2 Desktop

Da Direção Visual §8.2 e §13.1:

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Obs] · [Coletivo]   Observatório Território Pesquisa Dados          │
│                      PodObservar Acervo        │ Acessibilidade  ⓟ   │
└──────────────────────────────────────────────────────────────────────┘
                                                  └─ utilidades isoladas
```

- **brand rail à esquerda:** marca do Observatório pequena + micro-identificação do
  Coletivo, separadas por um separador de 1px. Sem co-branding pesado (Direção
  Visual §4.2);
- **menu horizontal minimalista** ao centro/direita, Archivo, sem ícones;
- **utilidades isoladas à direita**, separadas do menu por uma régua vertical:
  `Acessibilidade` e `Prestação de Contas` com **peso visual equivalente** entre si e
  distinto dos itens de menu;
- **hide-on-scroll:** some ao descer, reaparece ao subir.

**Hide-on-scroll — requisitos de acessibilidade que a implementação deve cumprir:**

1. reaparecer **imediatamente** quando qualquer elemento do header recebe foco por
   teclado, mesmo que o scroll esteja descendo;
2. nunca esconder em zoom ≥ 200 % nem quando a altura da viewport for pequena — em
   viewport curta o header escondido é um alvo em movimento (WCAG 2.2, 2.5.8);
3. respeitar `prefers-reduced-motion`: sem ele, transição de ~180 ms; com ele, troca
   instantânea, **sem** animação;
4. não usar `position: fixed` sobre o `main` sem compensar o `scroll-padding-top`, ou
   âncoras internas ficarão sob o header.

Isso é comportamento de rolagem: exige uma ilha cliente, `CabecalhoReativo`, que
**não renderiza nada** e apenas alterna um atributo no header — mesmo padrão já
validado em `MapaInterativo`.

## 8.3 Mobile — comparação das quatro soluções

| | A. `[Menu]` textual (atual) | B. `+` | C. Bottom navigation | D. Barra de utilidades fixa + menu em folha |
|---|---|---|---|---|
| Reconhecimento | alto — palavra explícita | **baixo** — `+` não significa "menu" | alto — padrão de app | alto |
| Alcance com uma mão | ruim — topo da tela | ruim | **ótimo** | **ótimo** |
| Alvo ≥ 44 px | fácil | fácil | fácil | fácil |
| Leitor de tela | ótimo, já implementado | ruim sem rótulo | bom | bom |
| Prestação de Contas visível sem abrir nada | não | não | **sim** | **sim** |
| Acessibilidade visível sem abrir nada | não | não | **sim** | **sim** |
| Custo de JS | baixo (existe) | baixo | médio | médio |
| Ocupa área permanente da tela | não | não | **sim, ~56 px sempre** | sim, ~52 px |
| Conflito com Hero 90–100 svh | não | não | **sim** — come o manifesto | parcial |
| Risco de parecer app genérico | baixo | médio | **alto** | baixo |

**Recomendação: D.**

```
┌─────────────────────────────┐
│ [Obs]·[Col]        ☰ Menu   │  topo: marca + gatilho textual
├─────────────────────────────┤
│                             │
│         conteúdo            │
│                             │
├─────────────────────────────┤
│ ⓐ Acessibilidade │ ⓟ Contas │  barra inferior: SÓ as duas utilidades
└─────────────────────────────┘
```

**Por que D e não C.** A Direção Visual §13.2 exige que Prestação de Contas seja fácil
de localizar e nunca esteja dentro de submenu; §14.2 exige destaque visível para
acessibilidade. Uma bottom navigation completa (C) satisfaz isso, mas para caber seis
itens de menu **mais** duas utilidades em 375 px, ou os alvos encolhem abaixo de 44 px
ou os rótulos viram ícones sem texto — e ícone sem rótulo é justamente o que faz o
site "parecer app genérico", reprovado pela Direção Visual §28.

D resolve a mesma exigência com metade do problema: a barra inferior carrega **apenas
as duas utilidades**, com rótulo de texto, alvo generoso e alcance de polegar; a
navegação de conteúdo fica no gatilho superior, que é o padrão reconhecido.

**Por que não A.** A solução atual (`[Menu]` textual) é boa e acessível, mas deixa
Prestação de Contas e Acessibilidade escondidas atrás de um clique — o oposto do que a
Direção Visual pede para as duas.

**Por que não B.** `+` é ambíguo. Originalidade que custa reconhecimento é
explicitamente desaconselhada pela Direção Visual §13.3.

**Requisitos da folha de menu (D):** `role="dialog"` com `aria-modal`, foco preso
enquanto aberta, `Esc` fecha e devolve o foco ao gatilho, fundo da página inerte,
altura máxima com rolagem interna, alvos ≥ 44×44 px. O `MenuMobile` atual já faz `Esc`
e devolução de foco — **não faz** captura de foco nem `aria-modal`. `NavegacaoMobile`
precisa fazer os dois.

**A barra inferior não pode cobrir conteúdo.** Reservar `padding-bottom` equivalente no
`main` e considerar `env(safe-area-inset-bottom)` em iOS.

`ITEM A VALIDAR` — Direção Visual §30.4 já registra "comportamento mobile final do
menu" como ponto de validação visual.

---

# 9. Acessibilidade

## 9.1 A distinção que organiza tudo

| REQUISITO NATIVO — funciona sem abrir nada | RECURSO EXTRA — vive na Central |
|---|---|
| navegação completa por teclado | escolha de tema claro/escuro/sistema |
| skip link | escala de texto A− / A / A+ |
| foco visível em todo interativo | modo alto contraste |
| hierarquia de headings correta | reduzir movimento (override manual) |
| landmarks semânticos | ouvir esta página |
| contraste ≥ 4,5:1 no texto | mapa de atalhos de teclado |
| não depender só de cor | reportar barreira |
| `prefers-reduced-motion` **automático** | conhecer os recursos |
| `prefers-color-scheme` **automático** | |
| `alt` em toda imagem | |
| zoom 200 % sem perda | |
| alternativa textual do mapa | |
| alvos ≥ 24×24 px (WCAG 2.2 AA) | |

**A Central nunca conserta o site.** Se um recurso da Central for a única forma de
usar algo, isso é defeito estrutural, não configuração.

## 9.2 Central de Acessibilidade — estrutura

Desenho próprio do Observatório. Não copiar o widget do Itaú Cultural (Direção
Visual §14.2) — extrair dele apenas o princípio de **acesso visível e direto**.

```
ACESSIBILIDADE                                     [fechar ✕]

TEMA          ( ) Claro   ( ) Escuro   (•) Sistema
TEXTO         [ A− ]  [ A ]  [ A+ ]          atual: 100%
CONTRASTE     [ ] Alto contraste
MOVIMENTO     [ ] Reduzir animações          sistema: reduzido
LEITURA       ▶ Ouvir esta página            Narração humana
NAVEGAÇÃO     Atalhos e teclado              →
AJUDA         Conheça os recursos            →
              Reportar uma barreira          →
```

Requisitos de implementação:

- **painel `role="dialog"` `aria-modal="true"`**, foco preso, `Esc` fecha, foco volta
  ao gatilho;
- cada grupo é um `fieldset` com `legend`, não uma lista de botões soltos;
- Tema é `radiogroup`; Contraste e Movimento são `checkbox`; Texto é `radiogroup` de
  três valores, não um `+`/`−` sem estado legível;
- **estado atual sempre visível em texto**, não só por cor de botão ativo;
- o gatilho declara `aria-expanded` e `aria-controls`;
- as preferências persistem em `localStorage` com **envoltório `try/catch`**: modo
  privativo e navegador com armazenamento bloqueado devem renderizar corretamente
  sem valor salvo.

## 9.3 Anti-FOUC — o detalhe que decide o dark mode

Preferência persistida + Server Components exigem um script **síncrono no `head`**,
antes da primeira pintura, que leia `localStorage` e carimbe o atributo no `html`.
Sem ele, quem escolheu escuro vê um lampejo claro em toda navegação.

Regras para esse script:

- **inline, síncrono, sem dependência**, na casa das centenas de bytes;
- envolvido em `try/catch` — `localStorage` **lança** em alguns contextos, não apenas
  devolve vazio;
- resolve a ordem: valor salvo → `prefers-color-scheme` → claro;
- é a **única** exceção de script inline do projeto, e precisa estar justificada no PR;
- `AGENTS.md` proíbe "script de terceiro que faça rastreio ou grave cookie" — este é
  script próprio, sem rede e sem cookie, então não conflita. Ainda assim, **registrar
  a exceção explicitamente**.

Sem preferência salva, a primeira visita segue o sistema — exatamente a decisão humana
da Direção Visual §5.4.

## 9.4 Checklist específico da Home Piloto

WCAG 2.2 AA + ABNT NBR 17225:2025 + doc 01 §7.

**Estrutura**
- [ ] um único `h1`, com o nome oficial do Observatório
- [ ] hierarquia sem salto: `h1` → `h2` por seção → `h3` internos
- [ ] landmarks: `banner`, `navigation` (nomeada), `main`, `contentinfo`
- [ ] cada seção com `aria-labelledby` apontando para seu próprio título
- [ ] skip link é o primeiro elemento focável e leva a `#conteudo`
- [ ] `lang="pt-BR"` no `html`

**Teclado**
- [ ] ordem de foco segue a ordem visual em todos os breakpoints
- [ ] nenhuma armadilha de foco
- [ ] mapa continua sendo **uma** parada de Tab (roving tabindex preservado)
- [ ] folha de menu mobile: foco preso, `Esc` fecha, foco devolvido
- [ ] Central de Acessibilidade: foco preso, `Esc` fecha, foco devolvido
- [ ] player de narração operável só por teclado
- [ ] **WCAG 2.2 2.4.11 Foco não obscurecido:** header hide-on-scroll não pode cobrir
      o elemento focado — verificar com Tab após rolagem

**Contraste**
- [ ] título do Hero ≥ 4,5:1 no p95 de luminância (α ≥ 0,50; recomendado 0,60)
- [ ] texto de corpo ≥ 4,5:1 em claro **e** em escuro
- [ ] foco visível ≥ 3:1 contra a superfície adjacente, nos dois temas
- [ ] milho **nunca** como cor de texto sobre pedra (1,71:1 — já documentado)
- [ ] camadas do mapa distinguíveis sem cor (espessura + hachura), preservado no dark

**Alvos e zoom** (WCAG 2.2)
- [ ] alvos ≥ 24×24 px, e ≥ 44×44 px na barra inferior mobile (2.5.8)
- [ ] zoom 200 % sem rolagem horizontal
- [ ] 320 px de largura sem rolagem horizontal (1.4.10) — o teste atual usa 360 px e
      **deve ser endurecido para 320 px**
- [ ] espaçamento de texto customizado sem perda de conteúdo (1.4.12)

**Mídia**
- [ ] `alt` descritivo na fotografia do Hero, informando o que a foto documenta
- [ ] narração com transcrição/texto equivalente vinculado
- [ ] nenhum áudio autoplay

**Movimento**
- [ ] `prefers-reduced-motion` respeitado sem configuração
- [ ] override manual da Central sobrepõe o sistema nos dois sentidos
- [ ] nenhuma animação infinita decorativa

**Sem JavaScript**
- [ ] Home legível e navegável inteira
- [ ] mapa se anuncia `role="img"` e a lista territorial carrega a informação
- [ ] tema segue `prefers-color-scheme` por CSS puro
- [ ] menu mobile: **verificar** — a solução D precisa degradar (ver §31, Q6)

**Automatizado**
- [ ] `pnpm a11y` (Playwright; **não há axe instalado** — as verificações são escritas à mão) sem violação
- [ ] `pnpm verificar` inteiro passa

---

# 10. Território e mapa

## 10.1 Layout da seção 01

```
┌──────────────────────────────────────────────────────────────────┐
│  01 — TERRITÓRIO                                                 │
├────────────────────────────────────┬─────────────────────────────┤
│                                    │  Vale do Rio Real           │
│      ┌──────────────────┐          │                             │
│      │                  │          │  [texto editorial curto]    │
│      │  SERGIPE         │          │  BLOQUEADO — sem fonte      │
│      │  inclinado       │          │                             │
│      │  com espessura   │          │  6 municípios com vínculo   │
│      │                  │          │  declarado:                 │
│      └──────────────────┘          │  · Tobias Barreto           │
│                                    │  · Tomar do Geru            │
│      FONTE / IBGE — MALHAS         │  · Itabaianinha             │
│      MUNICÍPIOS / 75               │  · Cristinápolis            │
│                                    │  · Poço Verde               │
│                                    │  · São Cristóvão (comparação)│
│                                    │                             │
│                                    │  [lista territorial: 75]    │
├────────────────────────────────────┴─────────────────────────────┤
│  ~58 %                              ~42 %                        │
└──────────────────────────────────────────────────────────────────┘
```

- **58/42** em ≥ 1024 px, conforme a tarefa §15;
- **empilhado** abaixo disso: mapa primeiro, painel depois;
- altura do bloco do mapa proporcional ao envelope de Sergipe, **não** fixa em `vh` —
  fixar em `vh` distorce a projeção;
- a definição do Vale (`DEFINICAO_VALE_DO_RIO_REAL`) já existe em `recorte.ts` e é
  texto aprovado — **usar essa, não escrever outra**.

`ITEM A VALIDAR` — Direção Visual §30.7 registra "proporção da seção mapa/texto".

## 10.2 Estado MACRO — pôster cartográfico

A decisão humana (Direção Visual §10.1) é **Sergipe inteiro, inclinado, com sensação
de espessura**, sem globo 3D realista.

**Isso é alcançável dentro da ADR-010, sem MapLibre e sem WebGL.** A técnica proposta
tem duas partes:

**(a) Inclinação — CSS, custo zero em bytes.**
Um invólucro com `transform: perspective(1400px) rotateX(Nº)` sobre o SVG já
renderizado. Não é animação: é um estado estático. Não consome banda, não exige JS,
não altera a geometria, e o hit-testing do navegador continua correto em elementos
transformados. `N` a definir na validação visual; faixa de partida sugerida: 18°–28°.

**(b) Espessura — extrudar apenas o contorno do estado, nunca os 75 municípios.**
Repetir o caminho de Sergipe algumas vezes com deslocamento vertical progressivo e
preenchimento escuro, formando a "parede lateral" sob a face superior. Os 75
municípios permanecem **planos, por cima**, sem duplicação.

Por que assim: duplicar os 75 caminhos para extrudar cada município **dobraria o
HTML do mapa** — de ~44,8 kB para ~90 kB — e sozinho consumiria metade da folga de
performance do Piloto. Extrudar só o contorno do estado custa **um** caminho repetido
8–12 vezes: alguns kB, dentro da reserva de 15 kB da §7.5.

**Dependência:** o contorno externo do estado é `sergipe.geojson`, já declarado em
`src/dados/territorio/fontes.ts` com `origem` preenchida e `obtidoEm: null` — **o
arquivo ainda não foi obtido**. Obtê-lo segue a mesma disciplina dos outros: origem,
data, licença, atribuição e SHA-256 registrados. Enquanto não existir, o pôster
renderiza sem espessura, apenas inclinado. **Nenhuma geometria é inventada.**

**Acessibilidade da inclinação.** A perspectiva reduz a área de acerto e distorce
rótulos. Regras:

- `prefers-reduced-motion` não desativa a inclinação (é estática), mas o **modo alto
  contraste da Central deve aplaná-la** — inclinação prejudica leitura em baixa visão;
- a lista territorial continua sendo a alternativa textual completa, sem inclinação;
- ao receber foco de teclado, o mapa **aplaina** — é a transição macro→micro (§10.3),
  e resolve o problema de acerto para quem navega por teclado.

## 10.3 Estado MICRO — pôster vira ferramenta

Transição disparada por: foco de teclado no mapa, clique/toque em um município, ou
uso da lista.

| Gesto | Estado atual (ADR-010) | Home Piloto |
|---|---|---|
| Tab | entra uma vez, no município ativo | **mantido** + aplaina o pôster |
| ← ↑ → ↓ | move em ordem alfabética | mantido |
| Home / End | primeiro / último | mantido |
| Enter / Espaço | seleciona | mantido |
| Esc | limpa seleção | mantido + volta ao pôster |
| clique / toque | seleciona | mantido + aplaina |
| **zoom** | não existe | **PÓS-PILOTO** |
| **pan** | não existe | **PÓS-PILOTO** |
| **pitch dinâmico** | não existe | **PÓS-PILOTO** |
| **drawer** | não existe | **PÓS-PILOTO** |
| **comparação** | não existe | **PÓS-PILOTO** |

**A transição pôster→ferramenta é a única interatividade nova do Piloto.** Zoom, pan e
drawer ficam para depois porque exigem ou MapLibre (§10.5) ou reimplementação manual
de transformações — trabalho que não é necessário para provar a identidade visual,
que é o objetivo do Piloto.

**Nenhuma coordenada é inventada.** Os quatro pontos de visita continuam com
`coordenadas: null` e permanecem na lista "ainda não posicionados", fora do desenho —
comportamento já implementado e correto.

## 10.4 Mapa acessível — as duas representações

Requisito da tarefa §19 e da Direção Visual §14.4. **Já está implementado e correto:**

1. o **desenho** (`MapaTerritorio` → `MunicipioNoMapa`);
2. a **lista territorial** (`Municipio` + `FichaMunicipio`), que funciona sem JS, sem
   WebGL e por leitor de tela.

A ilha `MapaInterativo` já sincroniza os dois sentidos parcialmente: selecionar no mapa
marca `data-selecionado` no item da lista e o traz para a área visível.

**O que falta para cumprir a §19 integralmente:** selecionar **pela lista** ainda não
seleciona no mapa. Hoje o fluxo é mapa → lista. O Piloto deve fechar o ciclo lista →
mapa, com a mesma ilha e sem novo componente cliente.

`ListaTerritorial` sai de dentro de `MapaTerritorio` como componente próprio, para que
a seção 01 possa posicioná-la no painel de 42 % em vez de abaixo do mapa.

---

## 10.5 Evolução SVG → camada interativa

### Comparação

| Critério | **A. SVG atual aprimorado** | **B. SVG + MapLibre progressivo** | **C. MapLibre principal + SVG fallback** |
|---|---|---|---|
| Peso adicional | ~5–15 kB | +295 kB sob demanda | +295 kB sempre |
| Cabe no orçamento (folga 182 kB) | ✅ sim | ⚠ só se ninguém rolar até lá | ❌ não — estoura 50 % |
| SSR | ✅ nativo | ✅ base SSR | ❌ mapa só no cliente |
| Funciona sem JS | ✅ | ✅ base | ❌ |
| Exige WebGL2 | ✅ não | ⚠ só o upgrade | ❌ sim, sempre |
| Público rural/escolar, aparelho antigo | ✅ | ⚠ | ❌ |
| Acessibilidade | ✅ DOM real, focável | ⚠ dois modos a manter | ❌ canvas opaco |
| GeoJSON oficial | ✅ IBGE em build | ✅ | ✅ |
| Inclinação / pitch | ✅ CSS estático | ✅ pitch real | ✅ |
| Zoom / pan | ❌ escrever à mão | ✅ pronto | ✅ |
| Camadas custom / marcadores | ⚠ manual | ✅ | ✅ |
| SEO | ✅ texto no HTML | ✅ | ❌ |
| Impressão | ✅ SVG imprime | ⚠ | ❌ canvas não imprime |
| Manutenção | ✅ código próprio, pequeno | ❌ **dois mapas para sempre** | ⚠ um mapa + fallback morto |
| Dependências novas | 0 | 17 diretas | 17 diretas |

### Recomendação

**Para a Home Piloto 1.0: A — SVG atual aprimorado. NÃO instalar MapLibre.**

Três razões, em ordem de peso:

1. **Aritmética.** A Home tem 181.866 B de folga. MapLibre pesa 295.215 B. Não cabe —
   e ainda precisa dividir a folga com a fotografia do Hero, que sozinha consome
   ~120 kB no maior breakpoint. Não é preferência arquitetural: é subtração.
2. **O Piloto não precisa dele.** A tarefa §41 é explícita: "O Piloto deve provar a
   identidade visual, não implementar todo o roadmap". O pôster inclinado com
   espessura — que é a assinatura visual pedida — sai de CSS e de um caminho extrudado.
   Zoom e pan não estão entre os objetivos do Piloto.
3. **WebGL2 obrigatório contra o público real.** MapLibre 5+ removeu WebGL 1. O doc 01
   §2 descreve público rural e escolar com aparelho antigo. Um mapa que não abre é pior
   que um mapa sem zoom.

**Para depois do Piloto: B — SVG + MapLibre como melhoria progressiva.**

É a direção que a própria Direção Visual §10.4 propõe, e é a única compatível com o
orçamento *se* o carregamento for sob demanda e explícito. Mas ela **exige medição
nova**, porque a auditoria 10B.3.2 mediu o Cenário B em 311 kB para quem rola até o
mapa — cerca de seis segundos em 3G.

**C está rejeitado** e não deve voltar à mesa sem mudança do orçamento do doc 01 §7:
perde SSR, SEO, impressão, funcionamento sem JS e acessibilidade nativa de uma vez.

### ⚠ EXIGE NOVO ADR E AUTORIZAÇÃO HUMANA

A adoção de **B** substitui a ADR-010, que hoje é a decisão **em vigor** e diz
literalmente *"MapLibre não é usado na Home"*.

Antes de qualquer `pnpm add maplibre-gl`, é obrigatório:

1. **ADR-018 — Evolução cartográfica: SVG como base, MapLibre como melhoria
   progressiva**, referenciando ADR-009 (substituída) e ADR-010 (a substituir
   parcialmente);
2. medir o cenário B de novo, no código real, como a ADR-010 mediu;
3. decidir se o orçamento do doc 01 §7 muda — e, se mudar, **isso é alteração do doc
   01, fora da atribuição do agente**;
4. definir a estratégia de acessibilidade dos dois modos coexistindo;
5. autorização humana explícita registrada.

**A fase H3 deste plano implementa A. B não está autorizado por este documento.**

## 10.6 Drawer territorial — estrutura, PÓS-PILOTO

Não implementado no Piloto. Estrutura registrada para não se perder:

| Campo | Origem obrigatória | Estado hoje |
|---|---|---|
| ID | `codigoIbge` (IBGE) | ✅ existe |
| Território | `relacoesTerritoriais` | ✅ existe |
| Nome | lista oficial IBGE | ✅ existe |
| Coordenadas | conferência em campo | ❌ `null` nos 4 pontos |
| Fotografia | `public/media/territorio/` | ❌ vazio |
| Texto editorial | conteúdo humano aprovado | ❌ não existe |
| Dados | tabela `indicador` (Tarefa 13) | ❌ não existe |
| Acervo relacionado | `vw_anexo_publico` | ✅ 8 itens |

**Nenhum desses valores é inventado.** Campo sem fonte não renderiza — não renderiza
vazio, não renderiza "—", não renderiza placeholder.

Desktop: painel lateral. Mobile: bottom sheet. Ambos `role="dialog"`, foco preso,
`Esc` fecha, foco devolvido.

---

# 11. Pesquisa em campo — seção 02

## 11.1 Objetivo

Provar que os dados vieram de presença física no território. Documental, não
promocional.

## 11.2 Conteúdo real disponível

| Elemento | Fonte | Estado |
|---|---|---|
| Fotografias das visitas I a VII | B01, `Disponível`, Google Drive | ⚠ não espelhado, não em `public/` |
| Evidências por município | `recorte.ts` → `evidenciasDePesquisa` | ✅ **existe, é texto aprovado** |
| Pontos de visita | `pontos.ts` — 4 pontos nomeados | ✅ nome e ID; sem coordenada |
| Entrevistas realizadas | B02–B08, B13, B14 | ⚠ estados mistos |
| Texto metodológico | — | ❌ não existe |
| Cronologia das visitas | — | ⚠ doc 01 cita "7 visitas (I a VII)" |

**O material aproveitável imediatamente é `evidenciasDePesquisa`**, já no código e já
aprovado pelo responsável em 2026-09-03:

```
Tobias Barreto   Entrevista — Secretaria de Cultura
                 Entrevista — Prefeitura
                 Centro Cultural e Museu Borda da Mata
                 Recanto da Serra
Tomar do Geru    Entrevista — Secretaria Municipal de Cultura
São Cristóvão    Entrevistas — Fundação de Cultura e Turismo
```

## 11.3 Estrutura proposta

Uma **ficha de campo por município com pesquisa**, em vez de timeline genérica. A
tarefa §22 proíbe explicitamente criar timeline só porque é visualmente interessante —
e não existe fonte com datas de todas as visitas.

```
02 — PESQUISA EM CAMPO

┌──────────────────────────────────────────────────────────┐
│ [fotografia documental]  │  TOBIAS BARRETO               │
│                          │  LOC / SE · MUN / 2807402     │
│                          │                               │
│                          │  Entrevista — Secretaria de   │
│                          │  Cultura                      │
│                          │  Entrevista — Prefeitura      │
│                          │  Centro Cultural e Museu      │
│                          │  Borda da Mata                │
│                          │  Recanto da Serra             │
└──────────────────────────────────────────────────────────┘
```

**Itabaianinha, Cristinápolis e Poço Verde não aparecem aqui** — `recorte.ts` registra
explicitamente que não há evidência documental de pesquisa de campo neles, e que
"ausência de evidência é registrada como ausência, não preenchida por simetria com os
vizinhos". A seção obedece isso.

**Sem fotografia, a ficha renderiza só o lado direito.** Não usa imagem genérica, não
usa placeholder cinza com ícone, não inventa foto.

---

# 12. Dados — seção 03

## 12.1 ⚠ Não há indicador publicável

| Fonte candidata | Estado | Veredito |
|---|---|---|
| A11 — Anexo Técnico de Indicadores, Etapa 1 | `Disponível`, mas **`RESTRITO`** | ❌ contém arquivos que exigem revisão de privacidade — `06-pessoas-trabalho` e `08-fornecedores` nomeiam pessoas |
| A01 — Painel Vivo de Dados | `Disponível`, fonte Figma | ❌ não espelhado; Figma é link frágil, o oposto do que o site existe para resolver |
| Tabela `indicador` | não existe — Tarefa 13 | ❌ |
| C03 — Relatório de modelagem estatística | `Pendente` | ❌ |

**Conclusão: a seção 03 não pode publicar nenhum número na Home Piloto.**

`testes/a11y/home.spec.ts` hoje **proíbe ativamente** as palavras `indicador`,
`habitantes`, `população`, `comparativo` e `ranking` no `main`. Esse teste está certo
e deve **continuar valendo**.

## 12.2 O que a seção 03 entrega no Piloto

Três opções foram avaliadas:

- **omitir a seção** — foi o que a Tarefa 10A fez, e continua defensável;
- **placeholder com número falso** — proibido por `AGENTS.md`;
- **estrutura visual com estado declarado** — recomendado.

**Recomendação: estrutura com estado declarado.** A Home Piloto precisa validar a
*linguagem visual* dos indicadores (a tarefa §23 pede exatamente isso), e a seção pode
existir dizendo a verdade sobre si mesma:

```
03 — DADOS

Os indicadores da pesquisa ainda não têm versão publicável.
O Anexo Técnico de Indicadores está em revisão de privacidade.

FONTE / A11 — ANEXO TÉCNICO DE INDICADORES, ETAPA 1
ESTADO / RESTRITO — REVISÃO DE PRIVACIDADE PENDENTE
```

Isso não é placeholder: é informação verdadeira e verificável sobre o estado da
pesquisa, no mesmo registro que a Sala do Avaliador já usa.

**Cuidado com o teste.** O texto acima contém a palavra "indicadores", que o teste
atual proíbe no `main`. O teste precisa ser **refinado, não afrouxado**: proibir
*número de indicador não publicado*, não proibir a palavra. A distinção precisa ficar
escrita no teste, como o próprio arquivo já faz ao explicar por que trocou o guarda de
"nomear" para "comparar".

## 12.3 Gramática visual dos indicadores — para quando houver dado

```
[NÚMERO REAL]              Archivo, --text-4xl/5xl, sem separador decorativo
LABEL DO INDICADOR         Archivo, --text-lg

FONTE / …                  IBM Plex Mono, --text-sm
PERÍODO / …
MÉTODO / …
```

Regras: sem linguagem promocional; sem número sem fonte, período e método; **tabela é
protagonista legítima** (Direção Visual §16.4), com linhas de 1px, header preciso,
mono nos metadados, `scroll` interno — **nunca** overflow da página.

**Bibliotecas de visualização — avaliação conceitual apenas. Nada instalado.**

| Biblioteca | Nota conceitual |
|---|---|
| Nenhuma — SVG server-side | ✅ coerente com ADR-010; barras, linhas e áreas são aritmética simples; zero JS; funciona sem JS; imprime |
| Recharts / Victory | ❌ arrastam React no cliente; transformam a seção em Client Component |
| Chart.js | ❌ canvas — opaco a leitor de tela, não imprime, não indexa |
| D3 | ⚠ a ADR-010 já rejeitou por trazer muito mais do que o projeto precisa |
| Observable Plot | ⚠ elegante, mas peso e SSR a medir |

**Recomendação conceitual: SVG server-side**, mesma decisão do mapa, mesmos motivos.
Formalizar só quando houver dado — não antes.

---

# 13. Pessoas — seção 04

## 13.1 ⚠ Bloqueio de consentimento

| Verificação | Resultado |
|---|---|
| Tabela `pessoa` | **0 registros** |
| Tabela `consentimento` | **0 registros** |
| E01 — Termos de consentimento das entrevistas | **`Pendente`**, sem fonte, sem link |
| Fotografias com pessoas no corpus | 6 pastas nominais |
| doc 01 §11 | "Consentimento verificado para cada pessoa identificável publicada" |

**Nenhuma pessoa pode ser publicada na Home Piloto.** Não é limitação técnica: é
requisito legal (LGPD) e de prestação de contas.

Registro auxiliar em `inventario-de-anexos.csv`, item B06: mostra que o modelo de
consentimento já tem granularidade — `verbal_gravado`, `declaracao_responsavel`,
`evidencia_transcricao`, `evidencia_audio` — e que os estados são **por participante**,
não por lote.

## 13.2 Três estados que o componente deve suportar

| Estado | Significado | Comportamento |
|---|---|---|
| **PUBLICÁVEL** | consentimento verificado, revisão de privacidade concluída | retrato + nome + território + trecho |
| **RESTRITO** | existe, mas não pode ser publicado | **não renderiza nada** — nem silhueta, nem "restrito", nem contagem |
| **PENDENTE** | consentimento não verificado ainda | **não renderiza nada** |

**A diferença entre RESTRITO e ausência precisa ser invisível ao público.** Renderizar
"3 entrevistas restritas" revela a existência de material sobre pessoas que não
consentiram em aparecer — vazamento por metadado. Só a Sala do Avaliador expõe estado
documental, e para avaliador, não para o público.

## 13.3 Seção 04 no Piloto

**Recomendação: a seção 04 não é renderizada na Home Piloto.**

Diferente da seção 03 — onde declarar o estado é informação legítima sobre a pesquisa —
aqui declarar o estado **é o próprio vazamento**. A ausência silenciosa é a
implementação correta.

O componente `SecaoPessoas` é escrito, testado com os três estados e **devolve `null`
quando não há pessoa publicável** — mesmo padrão de `CreditosInstitucionais`.

Quando E01 for resolvido e houver pessoa `PUBLICÁVEL`, a seção aparece sem mudança de
código.

---

# 14. PodObservar — seção 05

## 14.1 Conteúdo real

| Item | Estado |
|---|---|
| C04 — PodObservar, 1ª temporada | **`Pendente`** — sem fonte, sem link, sem observações |
| Episódios no banco | não existem |
| Áudios em `public/media/` | não existem |
| Transcrições | não existem |

**Nenhum episódio existe. Nada pode ser inventado** — nem número de episódios, nem
duração, nem participante, nem data.

## 14.2 Seção 05 no Piloto

Diferente de Pessoas, aqui **declarar o estado não vaza nada**: o PodObservar é um
produto anunciado do projeto, previsto no doc 01 §3 e no edital.

**Recomendação: renderizar a seção com estado declarado**, em bloco escuro (mata), com
a estrutura do player já montada e desabilitada:

```
05 — PODOBSERVAR

O podcast do Observatório ainda não tem episódio publicado.

┌─────────────────────────────────────────────┐
│  ▶  ——————————————————————————  --:--       │  player, estado indisponível
│     Nenhum episódio disponível              │
└─────────────────────────────────────────────┘
```

Requisitos do player, para quando houver episódio: áudio, transcrição vinculada,
participantes (sujeitos a consentimento — §13), local/data quando públicos, duração,
contexto editorial.

**`AGENTS.md`: "Renderizar imagem sem `alt` ou áudio sem transcrição vinculada" é
proibido.** O player não pode existir funcionalmente antes da transcrição existir.

---

# 15. Acervo — seção 06

## 15.1 ✅ Esta seção tem conteúdo real

É a **única seção de conteúdo do Piloto com dado publicado de verdade**.

Publicação de 2026-09-08, conforme `ESTADO_ATUAL_PROJETO.md`:

| Verificação | Valor |
|---|---|
| `vw_anexo_publico` | **8** |
| Documentos `PUBLICAVEL` | 2 (A02 + D01) |
| Objetos no bucket público | 8/8, SHA-256 conferido |
| URLs no Custom Domain | 8/8 HTTP 200 |
| A04 | `ESPELHAVEL`, não publicado |
| D01-08 | `MANTER_PRIVADO` |

O conjunto: **A02** (Relatório Técnico — Recanto da Serra, derivado por tarjamento) e
**D01-01..07** (identidade visual — 5 derivados por sanitização de metadados, 2
réplicas byte-idênticas).

## 15.2 Estrutura — ficha, não card

Metáfora: **Arquivo Público + Explorador de Documentos** (Direção Visual §17.1).
Grid de cards estilo e-commerce está proibido.

```
06 — ACERVO                                  ACERVO / 008 ITENS

────────────────────────────────────────────────────────────────
A02        RELATÓRIO TÉCNICO
           Relatório Técnico — Recanto da Serra
           PDF · SHA-256 conferido                      ABRIR →
────────────────────────────────────────────────────────────────
D01-01     IDENTIDADE VISUAL
           …
────────────────────────────────────────────────────────────────

                                          Ver o acervo completo →
```

Colunas: `ID · TIPO · TÍTULO · TERRITÓRIO · ANO · FORMATO · AÇÃO`. **Território e ano
só aparecem quando existem no registro** — `AnexoPublico` tem `dataReferencia: string
| null`, e `null` significa coluna ausente, não "—".

**Origem do dado.** `src/dados/consultas/anexos.ts`, lida em **build time**, nunca em
requisição. A seção é Server Component; `EntradaAcervo` recebe por props.

**Quantidade.** O número "008" sai da consulta, **nunca escrito no código** — regra que
`ChamadaAcervo` já observa hoje: "Sem quantidade de documentos: o número sai do
acervo, nunca do código".

**Prévia, não catálogo.** A Home mostra os primeiros itens e leva ao acervo completo.
Quantos exatamente: `PROPOSTA — A VALIDAR`, sugestão de 3 a 5.

**Preservar as duas saídas atuais**, que hoje vivem em `ChamadaAcervo` e são função
primária do site (doc 01 §0.2): `/anexos.json` (legível por máquina) e a versão
imprimível.

---

# 16. Transparência — seção 07

Entrada objetiva. **A Home não vira Sala do Avaliador** (tarefa §27).

```
07 — TRANSPARÊNCIA

Prestação de Contas
Anexos do projeto com endereço permanente neste domínio,
data de publicação e hash SHA-256.

                                    ABRIR A PRESTAÇÃO DE CONTAS →
```

O texto acima **já existe aprovado** em `src/componentes/home/caminhos.ts` e é a mesma
redação da própria Sala. **Não reescrever.**

A Sala continua funcional, técnica e verificável. Nada dela é redesenhado nesta fase
(Direção Visual §18: "A Sala não será decorada").

Prestação de Contas aparece **três vezes** na Home Piloto, de propósito: utilidade do
header, seção 07, rodapé. É o eixo de transparência do projeto (Direção Visual §13.2).

---

# 17. Coletivo "Tobias, sou Eu!"

## 17.1 A decisão

O Coletivo **idealiza e realiza** o Observatório (Direção Visual §4.2 e §24). Presença
maior que assinatura de rodapé.

## 17.2 Cinco pontos de presença

| # | Onde | Forma | Estado |
|---|---|---|---|
| 1 | **Hero** | linha `Uma iniciativa "Tobias, sou Eu!"` + marca | ⚠ falta versão monocromática |
| 2 | **Header / brand rail** | micro-identificação junto à marca do Observatório | ⚠ idem |
| 3 | **Bloco 00** | seção institucional de origem e idealização | ❌ texto não existe |
| 4 | **Rodapé** | presença institucional completa | ⚠ idem |
| 5 | **Página Sobre/Observatório** | autoria em primeiro plano | fora do Piloto |

## 17.3 O problema cromático e como resolvê-lo

Medições da §4.3:

| | Observatório | Coletivo |
|---|---|---|
| Cor principal | `#026A69` teal | `#9E309E` magenta |
| Acentos | — | `#E7C500`, `#F15A24` |
| Contraste sobre pedra-fundo | 5,68:1 ✓ | 5,51:1 ✓ |
| Contraste sobre mata | 2,23:1 ✗ | 2,30:1 ✗ |

**Em fundo claro as duas marcas convivem** — ambas passam AA sobre pedra-fundo, e a
distância cromática entre teal e magenta é grande o bastante para não confundir.

**Em fundo escuro nenhuma das duas funciona em cor institucional.** Hero, header
sobreposto ao Hero e rodapé são escuros. Solução: **versões monocromáticas claras**,
não recoloração.

O Observatório tem esse ativo em vetor real. **O Coletivo não tem.**

## 17.4 Regra de hierarquia

Da Direção Visual §24, a ordem é: Observatório (produto) → Coletivo (idealização e
realização) → parceiros e fomento.

Traduzido em composição:

- a marca do Observatório é sempre a primeira à esquerda no brand rail;
- a marca do Coletivo vem imediatamente depois, com **altura ótica equivalente**, nunca
  reduzida a selo;
- as marcas de fomento vivem em **área institucional própria** no rodapé, separadas do
  conteúdo — e hoje **bloqueadas por E02**;
- "O coletivo não deve desaparecer atrás das marcas de fomento" (Direção Visual §24):
  na composição do rodapé, o Coletivo fica **acima** do bloco de fomento, não dentro
  dele.

---

# 18. Fotografia

## 18.1 Sistema por contexto

| Contexto | Tratamento | Proporção | Carregamento | Estado |
|---|---|---|---|---|
| **Hero** | overlay mata α 0,60; art direction por breakpoint | 4:3 origem, recortada | `priority`, **não** lazy | ✅ `home.jpg` |
| **Pesquisa** | cor documental, sem overlay; legenda com metadados | 3:2 | lazy | ⚠ B01 não espelhado |
| **Pessoas** | retrato, cor documental, sem estilização | 4:5 | lazy | ❌ bloqueado por E01 |
| **Território** | fotografia do local no drawer | 3:2 | lazy | ❌ não existe |
| **Acervo** | **sem fotografia** — ficha técnica, não vitrine | — | — | ✅ |

## 18.2 Regras

Permitido (Direção Visual §7.3): crop, contraste, exposição, overlay escuro, adaptação
light/dark, art direction por breakpoint.

Proibido: filtro vintage, ruído pesado, cor artificial, efeito cinematográfico que
descaracterize o registro, substituição por imagem gerada, papel rasgado, borda
queimada, textura pesada.

**Preto e branco só com justificativa editorial escrita** (Direção Visual §7.5).
Nunca como estilo universal.

## 18.3 Contrato técnico

- **formato:** AVIF com fallback WebP (doc 01 §7);
- **`alt` obrigatório na tipagem** — `ImagemDeCampo` e `MarcaInstitucional` já exigem;
- **crédito e metadados** quando disponíveis e publicáveis: local, data, contexto,
  autoria, relação com a pesquisa — **nunca inventar ficha de acervo**;
- **`next/image`** entra nesta fase; `CreditosInstitucionais` continua com `img` até
  E02 fornecer as dimensões reais das marcas — a nota no arquivo já explica por quê, e
  ela continua válida;
- **nada entra em `public/media/` sem passar pelas condições do `LEIA-ME.md`.**

---

# 19. Tipografia

## 19.1 O sistema atual está correto e permanece

`src/estilos/tokens.css` já declara os três papéis, e `layout.tsx` já os auto-hospeda
com `next/font`, subset `latin`. **Nenhuma fonte nova. Nenhuma alteração de família.**

| Papel | Família | Uso |
|---|---|---|
| `--font-display` | **Archivo** | títulos, numerais de ficha, navegação, indicadores |
| `--font-leitura` | **Literata** | corpo, narrativa, introduções, depoimentos, legendas longas |
| `--font-mono` | **IBM Plex Mono** | metadados, coordenadas, IDs, estados, fonte, período |

## 19.2 Ajuste de proporção pedido pela Direção Visual §6.2

"Aumentar a presença de Literata em relação à interface atual."

Hoje `body` já usa `--font-leitura`, mas a Home tem pouco texto corrido — o efeito é
que Archivo domina. A correção **não é trocar token**: é dar às seções 00, 01 e 02
parágrafos editoriais reais em Literata, com `--largura-leitura` (68ch) e
`--leading-leitura` (1.65). Isso depende de texto humano aprovado (§26).

## 19.3 Gramática de metadados

Padrão fixado pela Direção Visual §6.3:

```
01 — TERRITÓRIO
LOC / TOBIAS BARRETO
FONTE / IBGE — MALHAS TERRITORIAIS
MUN / 2807402
ESTADO / PUBLICÁVEL
```

`.meta-ficha` já existe em `tokens.css` — mono, `--text-sm`, `tracking-mono`,
uppercase, `--color-texto-suave`. **Reutilizar, não recriar.**

**Regra dura:** todo metadado em mono precisa ser **verdadeiro e rastreável**.
`MUN / 2807402` é código IBGE real de `recorte.ts`. Um `DOC / A02` só aparece se A02
estiver naquela ficha. A Direção Visual §6.3 chama isso de não usar mono como
"fantasia de terminal" — e `AGENTS.md` chama de integridade de pesquisa.

## 19.4 Fonte oficial da marca — NÃO IDENTIFICADA

Investigação conduzida em todos os arquivos de identidade:

| Arquivo | elementos de texto | `font-family` | `@font-face` | Conclusão |
|---|---|---|---|---|
| `logo observatorio.svg` | 0 | 0 | 0 | raster embutido — não há lettering vetorial |
| `icon.svg` | 0 | 0 | 0 | idem |
| `horizontal-monocromatica-escura.svg` | 0 | 0 | 0 | **vetor real, lettering em curvas** |
| `cactus/carcará/igreja.svg` | 0 | 0 | 0 | raster embutido |
| PNGs | — | — | — | raster |

**Nenhum arquivo declara nome de fonte. Nenhum preserva texto editável.**

**Conclusão:** a fonte do lettering **não está confirmada e não é dedutível** dos
arquivos disponíveis. Isso é exatamente o cenário previsto pela Direção Visual §4.1:
*"Não tentar adivinhar a fonte da marca a partir do vetor."*

**Regra operacional:** quando for necessário reproduzir o lettering exato da marca,
**usar o próprio vetor** — `horizontal-monocromatica-escura.svg`, o único vetor real.
Nunca redigitar o nome do Observatório em Archivo e chamar de marca.

**Nenhuma fonte externa é adicionada.** Nenhum nome de fonte é inventado.

---

# 20. Paleta

## 20.1 Tokens atuais — auditoria

| Token | Valor | Veredito |
|---|---|---|
| `--color-mata` | `#12301F` | **MANTER** — temperatura dominante |
| `--color-anil` | `#1F3A5F` | **MANTER** — links, foco em claro |
| `--color-pedra` | `#E7E5DE` | **MANTER** |
| `--color-milho` | `#E8B23A` | **MANTER** — destaque e foco em escuro |
| `--color-barro` | `#8A4B2A` | **MANTER** — acento territorial |
| `--color-carvao` | `#171A17` | **MANTER** |
| `--color-mata-claro` | `#1D4630` | **MANTER** |
| `--color-pedra-fundo` | `#F2F1EC` | **MANTER** |
| `--color-pedra-borda` | `#D3D0C6` | **MANTER** |

**A paleta atual é sólida e a Home Piloto não a substitui.** A tarefa §11 pede
coerência com os tokens existentes, e a Direção Visual §26 proíbe "criar nova paleta
arbitrária". Nada aqui é removido ou reinterpretado.

## 20.2 ⚠ A paleta atual é insuficiente em exatamente um ponto

**O verde-azulado institucional do Observatório não existe nos tokens.**

A Direção Visual §5.1 chama o teal de "assinatura institucional principal" e a tarefa
§11 o lista entre as cores do sistema. As medições da §4.3 confirmam `#026A69` como a
cor dominante das duas marcas oficiais.

`--color-mata` (`#12301F`) é verde escuro, não verde-azulado. Não é substituto.

**Proposta: um token novo, medido, não estimado.**

```
--color-observatorio: #026A69;   /* medido: 87,59% de icon.png,
                                    68,07% de logo-e-texto.png */
```

Contrastes verificados:

| Par | Contraste | WCAG |
|---|---|---|
| `#026A69` sobre `--color-pedra-fundo` | **5,68:1** | ✓ AA texto |
| `#026A69` sobre branco | **6,43:1** | ✓ AA texto |
| branco sobre `#026A69` | **6,43:1** | ✓ AA texto |
| `--color-pedra` sobre `#026A69` | **5,10:1** | ✓ AA texto |
| `#026A69` sobre `--color-mata` | **2,23:1** | ✗ **proibido** |
| `--color-milho` sobre `#026A69` | 3,32:1 | ✓ só UI/texto grande |

**Regra que acompanha o token:** `--color-observatorio` **não pode ser usado sobre
mata nem sobre superfície escura**, exatamente como `--color-destaque` já não pode ser
texto sobre pedra. A nota entra no bloco de contraste verificado do `tokens.css`, no
mesmo formato que já existe lá.

## 20.3 Cores do Coletivo — registrar, não tokenizar

`#9E309E`, `#E7C500`, `#F15A24` foram medidos, mas **não devem virar tokens do
sistema**. São a paleta de outra identidade; promovê-las a token do Observatório
criaria um sistema de duas cabeças.

Elas vivem **dentro do ativo de marca do Coletivo**. Registradas aqui como evidência
para a decisão de composição da §17.

## 20.4 Temperatura por seção

Já tabelada na §6.2. Permitido variar predominância sem criar identidades diferentes
(Direção Visual §5.3). Milho e barro são **acentos controlados**, nunca fundo de
seção. `ITEM A VALIDAR` — Direção Visual §30.8.

## 20.5 Outros eixos de token a ampliar

`tokens.css` cobre cor, tipografia, escala de texto e dois valores de layout. Faltam
quatro eixos que o Piloto vai exercitar:

| Eixo | Estado | Proposta |
|---|---|---|
| **spacing** | ausente — componentes usam utilitários Tailwind soltos | escala de 4px: `--espaco-1` … `--espaco-16`, mais `--espaco-secao` |
| **radii** | `--radius-ficha: 2px` | **suficiente** — fichas de arquivo não têm cantos macios |
| **borders** | espessura escrita à mão | `--borda-fina: 1px`, `--borda-media: 2px` |
| **shadows** | ausente, de propósito | **manter ausente** — sombra colorida é proibida; se precisar de elevação, usar borda |
| **motion** | ausente | §22.2 |
| **z-index** | ausente — `z-100` escrito à mão em `.pular-conteudo` | `--z-conteudo`, `--z-cabecalho`, `--z-barra-mobile`, `--z-painel`, `--z-pular` |
| **breakpoints** | padrão do Tailwind | nomear os três do projeto: 375 / 768 / 1440 |

---

# 21. Dark mode

## 21.1 A decisão

Direção Visual §5.4 e §29: **primeira visita segue `prefers-color-scheme`**; depois, o
usuário pode mudar manualmente e a escolha persiste. Light é a identidade principal.
Dark **não é inversão**.

**Hoje o projeto não tem dark mode nenhum** — busca por `prefers-color-scheme`,
`dark:`, `colorScheme` e `data-theme` em `src/` retorna zero resultados.

## 21.2 Mecânica

Três estados, uma cascata:

```
1. atributo data-tema="claro" | "escuro" no html    → escolha manual, vence tudo
2. @media (prefers-color-scheme: dark)              → sistema, quando não há escolha
3. :root                                            → claro, padrão
```

O script anti-FOUC da §9.3 carimba (1) antes da primeira pintura. **Sem JavaScript,
(2) e (3) continuam funcionando** — o site respeita o sistema mesmo com JS desligado.

Isso segue o mesmo princípio do mapa: o servidor entrega o que é verdade sem JS, e a
ilha melhora depois.

## 21.3 Equivalentes semânticos — medidos

**Não é inversão.** Cada papel ganha um valor próprio, e o fundo escuro é **mata muito
escura**, não preto — coerência com a temperatura dominante.

| Papel | Claro | **Escuro proposto** | Contraste no escuro |
|---|---|---|---|
| `--color-fundo` | `#F2F1EC` | **`#0E1611`** | — |
| `--color-fundo-elevado` | `#FFFFFF` | **`#16211A`** | — |
| `--color-fundo-inverso` | `#12301F` | **`#E7E5DE`** | — |
| `--color-texto` | `#171A17` | **`#E7E5DE`** | **14,59:1** ✓ |
| `--color-texto-suave` | `#4A504A` | **`#A8B0A6`** | **8,26:1** ✓ |
| `--color-texto-inverso` | `#E7E5DE` | **`#0E1611`** | — |
| `--color-link` | `#1F3A5F` | **`#8FB8D6`** | **8,76:1** ✓ |
| `--color-destaque` | `#E8B23A` | `#E8B23A` (mantém) | **9,51:1** ✓ |
| `--color-acento` | `#8A4B2A` | **`#C97B4E`** | **5,63:1** ✓ |
| `--color-observatorio` | `#026A69` | **`#2A9D96`** | **5,57:1** ✓ |
| `--color-borda` | `#D3D0C6` | **`#2C3A30`** | 1,54:1 (decorativa) |
| `--color-borda-forte` | *(novo)* | **`#5A7064`** | **3,45:1** ✓ UI |
| `--color-foco` | `#1F3A5F` | **`#E8B23A`** | **9,51:1** ✓ |

**Por que os originais não servem no escuro** — medido, não suposto:

| Token original sobre `#0E1611` | Contraste |
|---|---|
| `--color-anil` `#1F3A5F` | **1,60:1** ✗ |
| `--color-observatorio` `#026A69` | **2,86:1** ✗ |
| `--color-barro` `#8A4B2A` | **2,73:1** ✗ |

Os três precisam de versão clareada. Milho é o único que atravessa os dois temas sem
mudar.

**Nota sobre `--color-borda`.** No claro, `#D3D0C6` sobre `#F2F1EC` dá **1,36:1** — o
projeto já trata `--color-borda` como borda decorativa, não como fronteira de
componente. O escuro mantém essa paridade em 1,54:1. Para fronteiras que **são** a
única identificação de um controle — campos da Central de Acessibilidade —, entra
`--color-borda-forte`, que passa 3:1 (WCAG 1.4.11). **Ele precisa existir nos dois
temas**, não só no escuro.

**Foco troca de cor por tema.** Anil no claro (9,1:1 sobre pedra, já documentado);
milho no escuro (9,51:1). Milho sobre pedra é **1,71:1** e continua proibido como foco
em superfície clara. O código já faz isso à mão em `Cabecalho`, `MenuMobile` e
`Rodape` com `focus-visible:outline-destaque` — **com o token sensível a tema isso
deixa de ser exceção manual e vira regra do sistema**, e os três overrides podem sair.

## 21.4 O que muda por tema, além de cor

| Elemento | Claro | Escuro |
|---|---|---|
| Overlay do Hero | mata α 0,60 | mata α 0,70 — foto clara demais fica estranha em página escura |
| Camada base do mapa | preenchimento pedra | preenchimento `#16211A`, traço clareado |
| Hachura de pesquisa | mata | pedra |
| Fotografia | sem tratamento | **sem tratamento** — não escurecer foto por tema; é registro documental |
| Marca | versão colorida | versão monocromática clara |

`estilosDoMapa.ts` precisa de equivalentes dark. O CSS é escopado em
`.mapa-territorio` e usa tokens — se os tokens virarem sensíveis a tema, boa parte
resolve sozinha. As exceções são as camadas que hoje referenciam cores brutas.

---

# 22. Motion

## 22.1 Intensidade

Site geral **3–4/10**. Mapa **10/10 em capacidade de interação**, não em animação
autônoma (Direção Visual §12.1).

## 22.2 Tokens propostos

`tokens.css` **não tem nenhum token de motion hoje**. Proposta:

```
--duracao-hover:   150ms     /* faixa aprovada 120–180 */
--duracao-reveal:  240ms     /* faixa aprovada 200–300 */
--duracao-drawer:  240ms     /* faixa aprovada 200–280 */
--duracao-tema:    0ms       /* troca de tema é instantânea — ver abaixo */

--easing-saida:    cubic-bezier(0.4, 0, 1, 1)
--easing-entrada:  cubic-bezier(0, 0, 0.2, 1)
--easing-padrao:   cubic-bezier(0.4, 0, 0.2, 1)
```

Os números da tarefa §31 são orientativos, não regra absoluta. O que decide é o
**easing e o contexto**: 150 ms com `--easing-padrao` num hover de link lê como
resposta; os mesmos 150 ms numa entrada de drawer lê como corte.

**Troca de tema em 0 ms, de propósito.** Animar a transição claro↔escuro faz a página
inteira mudar de cor gradualmente — um efeito que, para quem tem sensibilidade
vestibular ou fotossensibilidade, é pior que o corte. Aqui a ausência de animação é a
escolha acessível.

## 22.3 Onde há movimento no Piloto

| Elemento | Movimento | Duração |
|---|---|---|
| Links e botões | mudança de cor/sublinhado | `--duracao-hover` |
| Municípios do mapa | preenchimento no hover | `--duracao-hover` |
| Header hide-on-scroll | translação vertical | `--duracao-hover` |
| Folha de menu mobile | entrada de baixo | `--duracao-drawer` |
| Central de Acessibilidade | entrada lateral/inferior | `--duracao-drawer` |
| Pôster → ferramenta (aplainar) | perspectiva → 0 | `--duracao-reveal` |
| Reveal de seção | **não implementar no Piloto** | — |

**Reveal de scroll fica PÓS-PILOTO.** A Direção Visual §12.3 o permite sob condições
estritas — conteúdo já ocupa seu espaço, não bloqueia leitura, respeita reduced motion,
sem reflow agressivo. Cumprir as quatro condições custa mais do que entrega num Piloto
cujo objetivo é validar identidade.

## 22.4 Proibido

Da Direção Visual §12 e §23, e da tarefa §31: scroll hijacking, loader cinematográfico,
cursor customizado, parallax pesado, background psicodélico, animação decorativa
infinita, transição de página teatral.

## 22.5 Reduced motion

`tokens.css` já tem o bloco `@media (prefers-reduced-motion: reduce)` zerando
animações e transições globalmente. **Está correto e permanece.**

O que precisa ser acrescentado: o **override manual** da Central deve funcionar nos
dois sentidos — ligar redução mesmo quando o sistema não pede, e (com cautela) permitir
movimento a quem desligou no sistema mas quer ligar no site. O segundo caso exige que a
preferência do site seja explícita, nunca padrão.

**A inclinação do pôster não é movimento** — é um estado estático. Não deve ser
desligada por `prefers-reduced-motion`. **Deve** ser aplanada pelo modo alto contraste,
que é outra preferência, por outro motivo (§10.2).

---

# 23. Mobile

## 23.1 Prioridades

1. velocidade; 2. navegação; 3. legibilidade. Nesta ordem (Direção Visual §21.1).

## 23.2 Os três breakpoints

### 375 px

| Elemento | Comportamento |
|---|---|
| Hero | 90 svh; crop vertical; título `--text-2xl`/`--text-3xl` em 3–4 linhas; autoria abaixo; marca do Coletivo em linha própria |
| Header | marca + `☰ Menu`; **sem** menu horizontal |
| Utilidades | **barra inferior fixa** — Acessibilidade + Prestação de Contas (solução D, §8.3) |
| Mapa | largura total, empilhado acima do painel; inclinação **reduzida ou zero** — em tela estreita ela come área útil sem ganho |
| Lista territorial | uma coluna |
| Acervo | ficha empilha: ID+tipo, título, ação |
| Seções | uma coluna, `padding` lateral 16 px |
| Tabelas | scroll interno, **nunca** overflow da página |

**`svh`, não `vh`.** A barra de endereço do iOS faz `100vh` estourar a tela. `svh` é a
unidade correta, e a Direção Visual §8.1 já a especifica.

### 768 px

Hero em crop 4:5; menu ainda em folha; barra inferior mantida; mapa e painel ainda
empilhados — 58/42 em tablet retrato aperta as duas colunas; lista territorial em duas
colunas.

### 1440 px

Composição completa: header horizontal com utilidades isoladas; Hero com quadro amplo;
seção 01 em 58/42; lista territorial em três colunas; sem barra inferior.

## 23.3 Regressões a proteger

O código atual já resolve dois problemas que o redesenho pode reintroduzir:

1. **Overflow horizontal em 375 px** — foi um dos dois bloqueios do primeiro
   deployment na Vercel (`ESTADO_ATUAL_PROJETO.md`, Prompt 4.8). O teste
   `cabe em 360 px sem rolagem horizontal` existe por causa disso. **Deve ser
   endurecido para 320 px** (WCAG 1.4.10) e rodar também em 1440.
2. **Mapa como uma parada de Tab** — a ilha resolve isso e o comportamento não pode
   regredir ao empilhar o layout.

## 23.4 Peso em mobile

O breakpoint de 375 px é o que o público real usa, em rede fraca. A variante do Hero
servida ali tem teto de **35 kB** (§7.5). O atributo `sizes` precisa estar correto ou o
navegador baixa a variante de desktop no celular — erro comum e caro.

---

# 24. Componentes

## 24.1 Árvore proposta

```
RootLayout                                    Server
├── ScriptTemaInicial                         Server (inline, síncrono, no head)
├── ProvedorPreferencias                      CLIENT  ← contexto tema/texto/contraste/motion
│   ├── PularConteudo                         Server
│   ├── CabecalhoObservatorio                 Server
│   │   ├── MarcaObservatorio                 Server
│   │   ├── AssinaturaColetivo                Server
│   │   ├── MenuPrincipal                     Server   ⚠ BLOQUEADO — §8.1
│   │   ├── AcoesUtilitarias                  Server   Acessibilidade + Prestação de Contas
│   │   ├── CabecalhoReativo                  CLIENT  ← hide-on-scroll; não renderiza nada
│   │   └── NavegacaoMobile                   CLIENT  ← folha de menu
│   ├── BarraUtilidadesMobile                 Server   (visibilidade por CSS)
│   ├── CentralAcessibilidade                 CLIENT  ← painel de preferências
│   │
│   ├── main id="conteudo"
│   │   └── Home                              Server
│   │       ├── HeroManifesto                 Server
│   │       │   ├── FotografiaHero            Server   next/image + art direction
│   │       │   ├── MetadadosHero             Server   mono, verdadeiros
│   │       │   └── AssinaturaColetivo        Server   (reuso)
│   │       ├── PlayerNarracao                CLIENT  ← estado indisponível hoje
│   │       ├── SecaoObservatorio             Server   00 — ❌ texto bloqueado
│   │       ├── SecaoTerritorio               Server   01
│   │       │   ├── TituloSecao               Server
│   │       │   ├── MapaTerritorio            Server
│   │       │   │   ├── MunicipioNoMapa ×75   Server
│   │       │   │   ├── MarcadorNoMapa ×N     Server
│   │       │   │   └── MapaInterativo        CLIENT  ← mantido, ampliado
│   │       │   └── ListaTerritorial          Server   extraída do mapa
│   │       │       └── Municipio ×75         Server
│   │       │           └── FichaMunicipio    Server
│   │       ├── SecaoPesquisaEmCampo          Server   02
│   │       ├── SecaoDados                    Server   03 — estado declarado
│   │       │   └── IndicadorDestacado        Server   (sem dado hoje)
│   │       ├── SecaoPessoas                  Server   04 — devolve null
│   │       ├── SecaoPodcast                  Server   05 — estado declarado
│   │       ├── EntradaAcervo                 Server   06
│   │       │   └── FichaAcervo ×N            Server   dado real de build
│   │       └── EntradaTransparencia          Server   07
│   │
│   └── RodapeInstitucional                   Server
│       ├── AssinaturaColetivo                Server   (reuso, presença completa)
│       └── CreditosInstitucionais            Server   ⚠ bloqueado por E02
│
└── (transversal) EstadoIndisponivel          Server   estado vazio explícito reutilizável
    (transversal) TituloSecao                 Server   "01 — TERRITÓRIO"
```

## 24.2 Ficha por componente

| Componente | S/C | Responsabilidade | Dados recebidos | Estado | Dependências | Acessibilidade |
|---|---|---|---|---|---|---|
| `ScriptTemaInicial` | S | carimba `data-tema` antes da 1ª pintura | — | — | nenhuma | evita FOUC; `try/catch` obrigatório |
| `ProvedorPreferencias` | **C** | contexto tema/texto/contraste/motion; persistência | — | `localStorage` | React context | não renderiza UI própria |
| `PularConteudo` | S | link para `#conteudo` | — | — | `ID_CONTEUDO` | 1º focável |
| `CabecalhoObservatorio` | S | landmark `banner` | itens de menu | — | `navegacao.ts` | header + nav nomeada |
| `MarcaObservatorio` | S | wordmark oficial | variante clara/escura | — | vetor real | nome acessível com o nome oficial |
| `AssinaturaColetivo` | S | identidade do Coletivo | variante, tamanho | — | ⚠ falta mono clara | `alt` obrigatório |
| `MenuPrincipal` | S | 6 destinos | `MENU_PRINCIPAL` | — | `navegacao.ts` | lista semântica; `aria-current` |
| `AcoesUtilitarias` | S | Acessibilidade + Contas | — | — | — | peso equivalente; fora do nav principal |
| `CabecalhoReativo` | **C** | hide-on-scroll | id do header | direção do scroll | — | reaparece ao foco; respeita reduced motion |
| `NavegacaoMobile` | **C** | folha de menu | itens | aberto/fechado | — | dialog + `aria-modal`, **foco preso**, `Esc` |
| `BarraUtilidadesMobile` | S | 2 utilidades fixas | — | — | — | alvos ≥ 44 px; não cobre conteúdo |
| `CentralAcessibilidade` | **C** | painel de preferências | — | via contexto | `ProvedorPreferencias` | dialog, fieldset/legend, estado em texto |
| `HeroManifesto` | S | manifesto da 1ª dobra | metadados verdadeiros | — | — | `h1` único |
| `FotografiaHero` | S | foto + overlay + art direction | src, alt, sizes | — | `next/image` | `alt` descritivo; `priority` |
| `MetadadosHero` | S | linha mono | metadados confirmados | — | — | mono legível; não só cor |
| `PlayerNarracao` | **C** | play/pause/progresso/velocidade | url, duração, transcrição | reprodução | — | teclado; transcrição vinculada; **indisponível hoje** |
| `TituloSecao` | S | `01 — TERRITÓRIO` | número, título | — | — | `h2` + id para `aria-labelledby` |
| `EstadoIndisponivel` | S | ausência declarada | motivo, fonte, estado | — | — | texto real, não ícone |
| `SecaoObservatorio` | S | origem e Coletivo | texto aprovado | — | ❌ bloqueado | `aria-labelledby` |
| `SecaoTerritorio` | S | 58/42 mapa+painel | `DadosDoMapa` | — | `mapa.ts` | `aria-labelledby` |
| `MapaTerritorio` | S | SVG + pôster | `DadosDoMapa` | — | `estilosDoMapa` | `role="img"` sem JS |
| `MunicipioNoMapa` | S | path com `data-codigo` | `MunicipioDoMapa` | — | — | `aria-label` do dado |
| `MarcadorNoMapa` | S | círculo por ponto | ponto posicionado | — | — | só com coordenada confirmada |
| `MapaInterativo` | **C** | listbox, roving tabindex, aplainar | ids | ativo/selecionado | — | **uma** parada de Tab; setas; `Esc` |
| `ListaTerritorial` | S | alternativa textual | municípios, pontos | — | — | **é o caminho principal sem JS** |
| `Municipio` / `FichaMunicipio` | S | entrada da lista | município, pontos | — | — | `data-codigo` sincroniza |
| `MarcadorVisita` | S | ponto sem posição | ponto | — | — | declara a ausência |
| `SecaoPesquisaEmCampo` | S | fichas de campo | evidências de `recorte.ts` | — | — | `aria-labelledby` |
| `SecaoDados` | S | 03 com estado declarado | — | — | — | sem número inventado |
| `IndicadorDestacado` | S | número + metadado + contexto | indicador real | — | ❌ sem dado | número não é só cor |
| `SecaoPessoas` | S | pessoas publicáveis | pessoas + consentimento | — | ❌ bloqueado | **`null` se nenhuma publicável** |
| `SecaoPodcast` | S | 05 com estado declarado | episódios | — | ❌ sem dado | transcrição obrigatória |
| `EntradaAcervo` | S | prévia do acervo | `AnexoPublico[]` | — | `consultas/anexos.ts` | tabela/lista semântica |
| `FichaAcervo` | S | uma linha do acervo | um anexo | — | — | ação com nome acessível |
| `EntradaTransparencia` | S | acesso à Sala | — | — | — | texto já aprovado |
| `RodapeInstitucional` | S | landmark `contentinfo` | links, marcas | — | `navegacao.ts` | footer + nav nomeada |
| `CreditosInstitucionais` | S | marcas de fomento | `MarcaInstitucional[]` | — | ⚠ E02 | `alt` obrigatório na tipagem |

## 24.3 Contagem

| | Quantidade |
|---|---|
| Componentes hoje | 15 |
| **Componentes novos previstos** | **27** |
| dos quais `SUBSTITUIR` — arquivo novo, papel antigo | 3 |
| Componentes mantidos sem mudança | 8 |
| Componentes refatorados | 5 |
| **Client Components ao fim do plano** | **7** |
| dos quais já existem | 2 |
| dos quais são novos | 5 |

---

# 25. Server vs Client

## 25.1 A regra do projeto

`AGENTS.md`: *"Server Components por padrão; `use client` só com justificativa escrita
no PR."* A Direção Visual §22 repete: JS client-side somente onde necessário, mapa como
ilha interativa.

## 25.2 Os sete Client Components e sua justificativa

| # | Componente | Justificativa | Renderiza UI? | Fase |
|---|---|---|---|---|
| 1 | `MapaInterativo` | roving tabindex, setas, seleção — exige eventos do DOM | **não** | existe |
| 2 | `NavegacaoMobile` | abre/fecha, `Esc`, foco preso — exige estado | sim | H1 |
| 3 | `CabecalhoReativo` | direção do scroll — exige listener | **não** | H1 |
| 4 | `ProvedorPreferencias` | lê/grava `localStorage`, provê contexto | **não** | H0 |
| 5 | `CentralAcessibilidade` | painel com estado, foco preso, `Esc` | sim | H4 |
| 6 | `PlayerNarracao` | elemento de áudio, progresso, velocidade | sim | H4 |
| 7 | `PainelTerritorio` (drawer) | seleção + foco preso | sim | **PÓS-PILOTO** |

**Três dos sete não renderizam nada.** Esse é o padrão que a ADR-010 validou e que
mantém o custo em JS proporcional ao comportamento, não ao conteúdo.

## 25.3 O que permanece obrigatoriamente Server

- **toda leitura de dado** — `montarDadosDoMapa`, `consultas/anexos.ts`, `recorte.ts`;
- **todo o conteúdo textual** da Home;
- **os 75 caminhos do SVG** — se virarem cliente, 48 kB de geometria aparecem duas
  vezes no documento (ADR-010);
- **as 75 entradas da lista territorial** — é a alternativa textual, precisa existir
  sem JS;
- **as fichas do acervo** — dado de build, sem interação;
- **o Hero inteiro**, incluindo a fotografia.

## 25.4 Regras de fronteira

1. **Nenhum Client Component consulta banco.** `AGENTS.md` já proíbe query fora de
   `src/dados/consultas/`; a fronteira do cliente reforça.
2. **Client Component é folha, nunca raiz.** Exceção: `ProvedorPreferencias`, que
   envolve a árvore mas recebe `children` do servidor — os filhos **continuam Server
   Components** e não são serializados como payload de cliente.
3. **Ilha que só observa não recebe conteúdo por props.** `CabecalhoReativo` e
   `MapaInterativo` alcançam o DOM por `id`.
4. **Nada de `"use client"` por conveniência.** Se a única razão for um `onClick`,
   avaliar antes se um link, um `details` ou `:target` resolve.

---

# 26. Conteúdo existente e faltante

## 26.1 Matriz

| Seção | Conteúdo existente | Fonte | Estado | Conteúdo faltante | Bloqueia? |
|---|---|---|---|---|---|
| **Hero — foto** | `home.jpg` 4000×3000 | corpus identidade-visual | ✅ existe | derivados otimizados; `alt` escrito por humano | **NÃO** |
| **Hero — título** | nome oficial completo | Direção Visual §8.4 | ✅ aprovado | — | NÃO |
| **Hero — autoria** | `Uma iniciativa "Tobias, sou Eu!"` | Direção Visual §8.4 | ✅ aprovado | — | NÃO |
| **Hero — marca Obs.** | vetor real mono claro | `horizontal-monocromatica-escura.svg` | ✅ existe | — | NÃO |
| **Hero — marca Coletivo** | PNG colorido 1280×1024 | `logo-oficial-tobias-sou-eu.png` | ⚠ parcial | **versão monocromática clara** | **SIM** — Hero/header/rodapé escuros |
| **Hero — metadados** | `LOC / VALE DO RIO REAL — SERGIPE` | `recorte.ts` | ✅ | ano do projeto (ambíguo) | NÃO |
| **Narração Home** | — | — | ❌ | **áudio + transcrição** | NÃO — estado indisponível é legítimo |
| **Navegação** | menu de 6 itens | `navegacao.ts` + doc 01 §3 | ⚠ **conflito** | ADR + atualização do doc 01 | **SIM** — §8.1 |
| **00 — Observatório/Coletivo** | — | — | ❌ | **texto institucional aprovado** | **SIM** — seção não renderiza |
| **01 — geometria** | 75 municípios IBGE | `municipios-sergipe.geojson`, SHA-256 ✅ | ✅ | licença oficial IBGE a confirmar | NÃO |
| **01 — nomes** | 75 nomes | `municipios-sergipe-nomes.json`, SHA-256 ✅ | ✅ | — | NÃO |
| **01 — recorte** | 6 municípios, relações, definição do Vale | `recorte.ts`, aprovado 2026-09-03 | ✅ | — | NÃO |
| **01 — contorno do estado** | declarado em `fontes.ts` | IBGE | ❌ `obtidoEm: null` | **baixar `sergipe.geojson`** — arquivo distinto da malha municipal, que já existe | NÃO — pôster sem espessura |
| **01 — SHA dos nomes** | `municipios-sergipe-nomes.json` | `fontes.ts` | ⚠ **hash declarado não confere** | o valor registrado é o da resposta compacta da API; o arquivo salvo está formatado. Conteúdo íntegro; registro não verificável — ver [H0](./H0_FUNDACAO_VISUAL_TEMA.md) §18.3 | NÃO |
| **01 — coordenadas** | 4 pontos nomeados | `pontos.ts` | ❌ `coordenadas: null` | **conferência em campo** | NÃO — já listados fora do desenho |
| **01 — municípios órfãos** | Serra dos Macacos, Ilha Grande | `pontos.ts` | ❌ `municipioId: null` | vínculo documental | NÃO |
| **01 — texto editorial** | definição do Vale | `recorte.ts` | ✅ parcial | introdução do território | NÃO |
| **02 — evidências** | 6 linhas em 3 municípios | `recorte.ts`, aprovado | ✅ | — | NÃO |
| **02 — fotografias** | B01 visitas I–VII | Google Drive | ⚠ **não espelhado** | espelhamento + `alt` + crédito | NÃO — ficha sem foto |
| **02 — metodologia** | — | — | ❌ | texto aprovado | NÃO |
| **03 — indicadores** | A11 | `formularios/indicadores-observatorio/` | ❌ **RESTRITO** | revisão de privacidade | **SIM** — nenhum número |
| **03 — painel** | A01 Figma | Figma | ❌ não espelhado | espelho estático | **SIM** |
| **03 — tabela `indicador`** | — | Tarefa 13 | ❌ | migração + carga | **SIM** |
| **04 — pessoas** | 0 registros | banco | ❌ | **E01 — termos de consentimento** | **SIM** — seção devolve `null` |
| **04 — retratos** | 6 pastas nominais | `fotos/` | ⚠ existem | consentimento verificado | **SIM** |
| **05 — episódios** | C04 | — | ❌ `Pendente` | áudio + transcrição + ficha | **SIM** — estado declarado |
| **06 — acervo** | **8 arquivos publicados** | `vw_anexo_publico` | ✅ **REAL** | — | **NÃO** |
| **06 — saídas** | `/anexos.json` + imprimível | rotas existentes | ✅ | — | NÃO |
| **07 — transparência** | texto aprovado | `caminhos.ts` | ✅ | — | NÃO |
| **Rodapé — fomento** | E02 | — | ❌ `Pendente` | **manual de aplicação de marcas** | **SIM** — bloco vazio declarado |
| **Rodapé — Coletivo** | PNG colorido | corpus | ⚠ | versão mono clara | **SIM** |
| **Dark mode** | — | — | ❌ | nada externo — decisão de token | NÃO |
| **Central de Acessibilidade** | página stub | `/acessibilidade` | ⚠ | texto de "conhecer recursos"; destino de "reportar barreira" | NÃO, parcial |

## 26.2 Conteúdo que NÃO pode ser inventado — lista fechada

Consolidando `AGENTS.md`, Direção Visual §1.6 e §26, e a tarefa §37:

1. **coordenadas** — sem conferência em campo, não há pin;
2. **indicadores e qualquer número de pesquisa**;
3. **nomes de pessoas** e qualquer dado de participante;
4. **datas** de visita, entrevista ou publicação;
5. **episódios**, duração, participantes, descrição do PodObservar;
6. **texto institucional** sobre PNAB, FUNCAP, Ministério da Cultura, Governo Federal,
   Governo de Sergipe — a §28 da tarefa é explícita, e não há fórmula consolidada no
   repositório: **TEXTO INSTITUCIONAL A VALIDAR**;
7. **ordem e proporção das marcas de fomento** — saem de E02;
8. **geometria territorial** — IBGE ou nada;
9. **relações territoriais** — `recorte.ts` é a fonte, e ausência de evidência é
   registrada como ausência;
10. **fichas de acervo** — metadado de fotografia não se inventa;
11. **IDs, estados documentais, hashes**;
12. **licença** de dado — a do IBGE ainda não foi confirmada;
13. **nome de fonte tipográfica** da marca — não identificada (§19.4);
14. **copy nova de qualquer natureza** sem marcação `PROPOSTA — A VALIDAR`.

---

# 27. Referências

| Referência | O QUE APROVEITAR | O QUE NÃO COPIAR |
|---|---|---|
| **Instagram / identidade do Observatório** | teal `#026A69` medido; relação com mata e território; fotografia documental; títulos fortes; presença institucional das marcas; linhas orgânicas da identidade | o grid de posts como layout de site; a lógica de feed; recorte quadrado como formato padrão |
| **Observatório Itaú Cultural** | acessibilidade como elemento **visível e permanente**; acesso direto a recursos de leitura; clareza de navegação; tratamento institucional que não esconde conteúdo | o widget visualmente; a paleta; o ícone flutuante circular; a estrutura de menu |
| **Painel de Dados / i-nove** | gráficos menos corporativos; visualização com personalidade; composição editorial de indicadores; ilustração como linguagem de apoio | metáforas visuais genéricas — no Observatório, elementos territoriais **verdadeiros**; paleta multicolorida |
| **Linear** | densidade controlada; estados claros; microinterações precisas; sensação de software confiável; teclado como cidadão de primeira classe | a estética SaaS; gradientes; glassmorphism; fundo escuro roxo; tom de marketing de produto |
| **Next.js (site)** | rapidez percebida; navegação fluida; tipografia de documentação; hierarquia entre código e metadado | o visual preto-e-branco de framework; a linguagem de dev-tool |
| **Supabase** | organização de dados na interface; tabelas legíveis; estados de vazio bem resolvidos | verde neon; estética de console; densidade de dashboard |
| **The Pudding** | união entre narrativa editorial e dados; scrollytelling **apenas onde a informação exige**; mapas e gráficos como parte da narrativa; leitura que continua fluida | scrollytelling como padrão da Home; animação como assinatura; formato de matéria única |
| **Referência de mapa inclinado** | ângulo; sensação de espessura; sombra; separação dos municípios; hierarquia de camadas; qualidade de pôster cartográfico | globo 3D realista; estética Google Earth; textura de satélite; ⚠ **o arquivo não está no corpus** (§4.3) |

**Regra transversal:** de nenhuma referência se copia a aparência completa. Extrai-se
o princípio, e o princípio é reimplementado com o vocabulário do Observatório.

---

# 28. Riscos

| # | Risco | Nível | Por quê | Mitigação |
|---|---|---|---|---|
| R01 | **Fotografia do Hero estoura o orçamento** | **ALTO** | 6.858 kB contra 181.866 B de folga; é o LCP | teto de 120 kB (1440) e 35 kB (375); AVIF; `sizes` correto; **medir no build servido antes de fechar H2**; se não couber, decisão volta ao humano |
| R02 | **Conflito do menu bloqueia H1** | **ALTO** | doc 01 §3 ≠ Direção Visual §8.3; `typedRoutes` reprova rota inexistente | ADR-017 + atualização do doc 01 **pela mão do humano** antes de H1; H0 e H2 seguem sem depender disso |
| R03 | **Marca do Coletivo sem versão monocromática** | **ALTO** | 2,30:1 sobre mata; afeta Hero, header e rodapé — os três lugares escuros | solicitar o ativo; enquanto não houver, **não** recolorir a marca — reposicionar a assinatura para superfície clara |
| R04 | **Conteúdo não publicável esvazia a Home** | **ALTO** | 4 das 8 seções sem dado real — 00, 03, 04 e 05 | estados declarados onde não vaza (03, 05); `null` onde vaza (04); o Piloto valida **linguagem visual**, não completude |
| R05 | **Consentimento — publicar pessoa sem E01** | **ALTO** | LGPD + doc 01 §11; risco jurídico, não estético | `SecaoPessoas` devolve `null`; três estados testados; nenhuma foto em `public/media/pessoas/` |
| R06 | **Excesso de Client Components** | **MÉDIO** | de 2 para 6 no Piloto; JS já é 142 kB | três das ilhas não renderizam nada; medir o chunk de cada uma como a ADR-010 mediu (965 B) |
| R07 | **`next/image` entra sem precedente** | **MÉDIO** | não é usado em lugar nenhum; muda o pipeline de build e o deploy Vercel | introduzir **só** no Hero, na fase H2, isolado; medir antes e depois |
| R08 | **Dark mode duplica a superfície de contraste** | **MÉDIO** | todo par cor/fundo precisa passar duas vezes | tabela medida da §21.3 antes de escrever CSS; teste de contraste nos dois temas no `pnpm a11y` |
| R09 | **FOUC de tema** | **MÉDIO** | Server Components + preferência persistida | script inline síncrono com `try/catch`; exceção justificada no PR |
| R10 | **Espessura do pôster dobra o HTML** | **MÉDIO** | extrudar 75 municípios levaria de 44,8 kB para ~90 kB | extrudar **só** o contorno do estado; reserva de 15 kB; medir |
| R11 | **Inclinação prejudica leitura e acerto** | **MÉDIO** | perspectiva distorce e reduz área de acerto | aplainar ao foco de teclado; aplainar em alto contraste; inclinação reduzida ou zero em 375 px; lista territorial intacta |
| R12 | **Testes existentes quebram em massa** | **MÉDIO** | `home.spec.ts` e `home.test.ts` afirmam a estrutura da 10A | **cada fase atualiza seus testes na mesma entrega**; refinar o guarda de "indicador" sem afrouxá-lo |
| R13 | **Conflito SVG/MapLibre reaberto por pressão visual** | **MÉDIO** | ADR-010 diz "MapLibre não é usado na Home"; a Direção Visual §10.4 propõe reintroduzi-lo | §10.5 fecha: A no Piloto; B exige ADR-018 + nova medição + autorização |
| R14 | **Acessibilidade de WebGL** | **BAIXO** *(hoje)* | vira ALTO se B for adotado sem plano | não adotar B no Piloto; se adotar, o plano de dois modos é pré-requisito da ADR |
| R15 | **Animação degrada Core Web Vitals** | **BAIXO** | escala 3–4/10; sem reveal no Piloto | tokens de duração; sem biblioteca de motion; reduced motion já global |
| R16 | **Literata variável ainda não otimizada** | **BAIXO** | pendência aberta na ADR-010; 108.972 B em fontes | não abrir nesta fase; se o orçamento apertar por R01, é a primeira alavanca |
| R17 | **Manutenção — 27 componentes novos** | **BAIXO** | superfície cresce ~2,8× | faseamento com critério de aceite por fase; `EstadoIndisponivel` e `TituloSecao` reduzem repetição |
| R18 | **Prazo** | **MÉDIO** | 8 fases, cada uma com testes e medição, em projeto com prestação de contas | H0–H2 entregam a validação de identidade; H3–H7 são incrementais e cada uma é entregável isolada |
| R19 | **Licença do IBGE não confirmada** | **MÉDIO** | pendência aberta desde a ADR-010; o mapa ganha protagonismo no Piloto | confirmar antes de ampliar o destaque do mapa; a atribuição já é exibida |
| R20 | **E02 bloqueia o rodapé indefinidamente** | **MÉDIO** | crédito de fomento errado é causa recorrente de ressalva | manter o bloco vazio **declarado**, como já está; não estimar ordem nem proporção |

---

# 29. Fases

> **⚠ NUMERAÇÃO SUPERADA — decisão humana de 2026-09-10.**
>
> A lista de fases abaixo é a do planejamento original e **não é mais a
> sequência vigente**. Ela chamava o pôster cartográfico de H3 e a Central de
> Acessibilidade de H4; a execução seguiu outra ordem, e a divergência já
> causou confusão de nome. A sequência vigente está na §32.10 e é esta:
>
> | Fase | Assunto |
> |---|---|
> | H0 | Fundação visual |
> | H1 | Hero |
> | H2 | Território |
> | H3 | Pesquisa em Campo |
> | H4 | Dados / Indicadores |
> | H5 | Pessoas / Vozes |
> | H6 | PodObservar, Acervo e Transparência |
> | H7 | Acessibilidade, movimento, performance e polimento final |
>
> O conteúdo das fases abaixo continua válido como especificação de objetivo,
> arquivos, critério de aceite e risco. **Só o número mudou de dono.** Nada foi
> apagado, e o histórico permanece legível.
>
> A Central de Acessibilidade **não deixa de existir**: ela sai da condição de
> fase própria e passa a ser camada transversal do frontend, com fechamento e
> polimento na H7.

Adaptadas ao código real. Cada fase é entregável isolada, com `pnpm verificar` verde.

## FASE H0 — Fundação de tokens e tema — ✅ IMPLEMENTADA

> Concluída em 2026-09-09. Registro completo em
> [`H0_FUNDACAO_VISUAL_TEMA.md`](./H0_FUNDACAO_VISUAL_TEMA.md).
>
> Entregue sem nenhum Client Component novo (seguem 2), sem dependência nova e com
> **+0 B de JavaScript**; o CSS cresceu 356 B comprimidos. 97 testes novos.
>
> Três desvios do previsto, todos para melhor:
> **(a)** o `ProvedorPreferencias` **não foi criado** — sem interface de troca de tema
> nesta fase, ele não teria o que prover, e a cascata de CSS mais um script de 148 B
> resolvem o caso inteiro, inclusive sem JavaScript;
> **(b)** os testes de contraste pegaram dois defeitos na primeira paleta escura — a
> faixa do cabeçalho invertendo e o texto sobre marcador de milho —, ambos corrigidos
> antes da entrega;
> **(c)** o CSS do mapa precisou passar a usar tokens invariantes de tema, para que a
> H0 **não** alterasse o mapa. Zero mudança visual no tema claro.

**Objetivo.** Ampliar `tokens.css` com teal institucional, equivalentes dark, spacing,
motion, z-index e breakpoints; instalar o mecanismo de tema. Nada visual muda ainda.

**Arquivos.** `src/estilos/tokens.css`; `src/app/layout.tsx`;
`src/componentes/preferencias/ProvedorPreferencias.tsx` (novo, **C**);
`src/componentes/preferencias/ScriptTemaInicial.tsx` (novo); `testes/tokens.test.ts`;
`testes/a11y/tema.spec.ts`.

**Critério de aceite.** `--color-observatorio` presente com nota de contraste; todos os
papéis com equivalente dark medido; `prefers-color-scheme` respeitado **sem JS**;
`data-tema` sobrepõe o sistema; sem FOUC; a Home continua idêntica em claro.

**Testes.** Contraste dos pares da §21.3 nos dois temas; troca de tema sem recarregar;
`localStorage` indisponível não quebra a página.

**Risco.** R08, R09. **Rollback.** Reverter o commit — nenhum componente depende ainda.

## FASE H1 — Cabeçalho, navegação e rodapé

> **Atualização de 2026-09-09.** O Hero e a casca do cabeçalho foram
> **prototipados** em `/dev/hero`, em duas variantes, para decisão humana —
> registro em [`H1_HERO_MANIFESTO_PROTOTIPO.md`](./H1_HERO_MANIFESTO_PROTOTIPO.md).
> **Nada foi aplicado à Home**, e o menu do site continua o do doc 01: as rotas
> `/territorio` e `/acervo` ainda não existem, e a ADR-017 proíbe rota falsa.

**⚠ BLOQUEADA por R02.** Só inicia depois da ADR-017 e da atualização do doc 01 §3.

**Objetivo.** Brand rail, menu, utilidades isoladas, hide-on-scroll, navegação mobile
(solução D), rodapé institucional com presença do Coletivo.

**Arquivos.** `src/lib/navegacao.ts` (**após** doc 01); `Cabecalho.tsx` →
`CabecalhoObservatorio.tsx`; `MarcaObservatorio.tsx`, `AssinaturaColetivo.tsx`,
`MenuPrincipal.tsx`, `AcoesUtilitarias.tsx`, `CabecalhoReativo.tsx` (**C**),
`NavegacaoMobile.tsx` (**C**), `BarraUtilidadesMobile.tsx`; `Rodape.tsx` →
`RodapeInstitucional.tsx`; `testes/a11y/navegacao.spec.ts`; `testes/navegacao.test.ts`.

**Critério de aceite.** Menu conforme doc 01 atualizado; Acessibilidade e Prestação de
Contas isoladas e de peso equivalente; hide-on-scroll reaparece ao foco e não obscurece
o foco (WCAG 2.4.11); folha mobile com foco preso e `Esc`; barra inferior não cobre
conteúdo; Coletivo presente no rodapé acima do bloco de fomento; **sem JS o menu
continua utilizável** (Q6).

**Risco.** R02, R03, R06. **Rollback.** Componentes novos em arquivos novos; reverter
restaura `Cabecalho`/`Rodape`.

## FASE H2 — Hero Manifesto

**Objetivo.** A primeira dobra completa. É a fase que **prova ou reprova** a direção
visual.

**Arquivos.** `HeroManifesto.tsx`, `FotografiaHero.tsx`, `MetadadosHero.tsx` (novos);
`src/app/page.tsx`; `AberturaObservatorio.tsx` (removido); `public/media/` (derivados
do Hero); `testes/a11y/hero.spec.ts`; `testes/a11y/home.spec.ts` (atualizado).

**Critério de aceite.** 90–100 svh; overlay α = 0,60 com contraste ≥ 4,5:1 medido;
título e autoria exatamente como aprovados; marca do Coletivo presente e perceptível;
art direction distinta em 375/768/1440; **Home total < 500 kB no build servido**; LCP
é a fotografia, com `priority`; `alt` descritivo real; sem rolagem horizontal em 320 px.

**Testes.** Contraste do `h1` sobre a foto; `h1` único com o nome oficial; presença da
autoria; três variantes de imagem; **medição de peso registrada no PR**, como a ADR-010.

**Risco.** R01, R03, R07. **Rollback.** Reverter restaura `AberturaObservatorio`.

## FASE H3 — Território: pôster cartográfico

**Objetivo.** Layout 58/42; inclinação; espessura do contorno; transição
pôster→ferramenta; ciclo lista→mapa.

**Arquivos.** `SecaoMapa.tsx` → `SecaoTerritorio.tsx`; `MapaTerritorio.tsx`;
`ListaTerritorial.tsx` (novo); `estilosDoMapa.ts`; `MapaInterativo.tsx`;
`src/dados/territorio/fontes.ts` + `sergipe.geojson` (se obtido);
`testes/a11y/mapa.spec.ts`; `testes/territorio.test.ts`.

**Critério de aceite.** 58/42 em ≥ 1024 px, empilhado abaixo; inclinação estática sem
JS; espessura só do contorno do estado; **mapa continua uma parada de Tab**; aplaina ao
foco; **selecionar na lista seleciona no mapa**; sem JS a lista carrega tudo; camadas
distinguíveis sem cor nos dois temas; HTML do mapa cresce **≤ 15 kB**.

**Risco.** R10, R11, R13, R19. **Rollback.** `estilosDoMapa.ts` isolado; reverter
devolve o mapa plano.

## FASE H4 — Central de Acessibilidade e narração

**Objetivo.** Central funcional mínima; player de narração com estado indisponível.

**Arquivos.** `CentralAcessibilidade.tsx` (**C**), `PlayerNarracao.tsx` (**C**),
`EstadoIndisponivel.tsx` (novos); `ProvedorPreferencias.tsx`; `tokens.css` (escala de
texto e alto contraste); `src/app/acessibilidade/page.tsx`;
`testes/a11y/central-acessibilidade.spec.ts`.

**Critério de aceite.** Tema/texto/contraste/movimento operantes e persistidos; painel
com foco preso e `Esc`; estado atual legível **em texto**; A− / A / A+ sem quebrar
layout até 200 %; alto contraste aplaina o pôster; **o site continua correto sem abrir
a Central**; player anuncia indisponibilidade sem inventar arquivo.

**Risco.** R06, R08. **Rollback.** Central e player em arquivos próprios.

## FASE H5 — Seções editoriais

**⚠ PARCIALMENTE BLOQUEADA** — o bloco 00 depende de texto humano aprovado.

**Objetivo.** Bloco 00 (estrutura pronta, conteúdo bloqueado) e seção 02 com as
evidências reais de `recorte.ts`.

**Arquivos.** `SecaoObservatorio.tsx`, `SecaoPesquisaEmCampo.tsx`, `TituloSecao.tsx`
(novos); `src/app/page.tsx`; `testes/a11y/secoes.spec.ts`.

**Critério de aceite.** Numeração `00 —` / `02 —` em mono; evidências exatamente como em
`recorte.ts`, sem reescrita; **Itabaianinha, Cristinápolis e Poço Verde ausentes da
seção 02**; ficha sem fotografia renderiza sem placeholder; bloco 00 devolve `null` sem
texto aprovado.

**Risco.** R04, R12. **Rollback.** Remover as seções de `page.tsx`.

## FASE H6 — Acervo e Transparência

**Objetivo.** A seção com dado real: 8 anexos publicados. Mais a entrada da Sala.

**Arquivos.** `ChamadaAcervo.tsx` → `EntradaAcervo.tsx`; `FichaAcervo.tsx`,
`EntradaTransparencia.tsx` (novos); `src/app/page.tsx`;
`testes/a11y/acervo-home.spec.ts`; `testes/home.test.ts`.

**Critério de aceite.** Fichas em linha, **não** cards; contagem vinda da consulta,
nunca do código; ID, tipo, título, formato e ação por ficha; campo `null` **não
renderiza**; `/anexos.json` e imprimível preservados; sem `DATABASE_URL` a seção
renderiza estado vazio explícito; **A04 e D01-08 ausentes**.

**Risco.** R12. **Rollback.** Reverter restaura `ChamadaAcervo`.

## FASE H7 — Estados declarados e refinamento

**Objetivo.** Seções 03, 04 e 05 com o comportamento correto de ausência; ajuste final
de motion, dark, mobile e performance.

**Arquivos.** `SecaoDados.tsx`, `IndicadorDestacado.tsx`, `SecaoPessoas.tsx`,
`SecaoPodcast.tsx` (novos); `src/app/page.tsx`; `tokens.css`;
`testes/a11y/estados-vazios.spec.ts`; `testes/pessoas.test.ts`.

**Critério de aceite.** 03 declara o estado sem número; **04 devolve `null` e não
revela existência de material restrito**; 05 declara a ausência de episódio; os três
estados de pessoa cobertos por teste; **medição final de peso < 500 kB**; `pnpm a11y`
sem violação em claro e escuro, em 320/375/768/1440.

**Risco.** R04, R05, R12, R18. **Rollback.** Cada seção é removível de `page.tsx`.

## PÓS-PILOTO — explicitamente fora

| Item | Por quê |
|---|---|
| MapLibre / zoom / pan / pitch dinâmico | ADR-018 + medição + autorização (§10.5) |
| Drawer territorial | depende de coordenadas, fotografias e texto inexistentes |
| Thumbnails fotográficas em pins | Direção Visual §10.7 restringe; e não há foto |
| Scrollytelling | Direção Visual §12.3; custo alto, ganho nulo no Piloto |
| Reveal de scroll | idem |
| Áudio de narração completo | arquivo não existe |
| Gráficos de indicadores | não há dado publicável |
| Redesenho da Sala do Avaliador | Direção Visual §18 — rigor, não ornamentação |
| Demais páginas | Direção Visual §27, Fase 6 |

**Nada disso é dívida escondida.** Está listado, datado e justificado.

---

# 30. Critérios de aceite

## 30.1 Identidade — o teste da Direção Visual §28

Alguém sem explicação externa deve conseguir dizer:

> "Isto é uma plataforma de pesquisa e cultura do Vale do Rio Real. Parece
> tecnologicamente séria, mas as pessoas e o território continuam vivos aqui."

**Reprova imediatamente se** parecer startup, template, portal institucional antigo ou
colagem escolar; se esconder pessoas atrás de gráficos; se inventar dado; se sacrificar
velocidade por animação; se perder acessibilidade; se usar cultura como ornamento; ou
se transformar o mapa em efeito visual sem utilidade.

## 30.2 Técnicos

- [ ] `pnpm verificar` verde — tipos + lint + teste + a11y + pendências
- [ ] **Home < 500 kB transferidos**, medido no build servido, no pior breakpoint
- [ ] Lighthouse ≥ 90 em Performance, Acessibilidade, Boas Práticas e SEO *(depende de
      `@lhci/cli`, hoje não instalado — pendência aberta desde a ADR-010)*
- [ ] LCP < 2,5 s em 3G simulado
- [ ] zero `any`, zero `@ts-ignore`, zero regra de lint desabilitada
- [ ] nenhuma cor, fonte ou espaçamento fora de `tokens.css`
- [ ] nenhuma query fora de `src/dados/consultas/`
- [ ] nenhum dado buscado em tempo de requisição
- [ ] toda ilha cliente com justificativa escrita no PR

## 30.3 Acessibilidade

Checklist completo na §9.4. Portões duros:

- [ ] `pnpm a11y` sem violação, **em claro e em escuro**
- [ ] 320 px sem rolagem horizontal
- [ ] zoom 200 % sem perda
- [ ] Home inteira navegável só por teclado
- [ ] Home inteira legível sem JavaScript
- [ ] contraste ≥ 4,5:1 em todo texto, nos dois temas

## 30.4 Integridade documental — os portões inegociáveis

- [ ] **nenhum número de pesquisa** na Home
- [ ] **nenhuma pessoa identificável** sem consentimento verificado
- [ ] **nenhuma coordenada** sem conferência
- [ ] **nenhum episódio** de podcast
- [ ] **nenhum texto institucional** sobre fomento sem fonte documental
- [ ] **nenhuma marca de fomento** antes de E02
- [ ] **A04 e D01-08 ausentes** de qualquer saída pública
- [ ] `home.jpg` é fotografia real, não substituída por imagem gerada
- [ ] toda imagem com `alt`; todo áudio com transcrição vinculada
- [ ] ausência sempre declarada ou silenciosa — **nunca** preenchida

---

# 31. Questões ainda abertas

| # | Questão | Bloqueia | Quem decide |
|---|---|---|---|
| ~~**Q1**~~ | ✅ **RESOLVIDA em 2026-09-09** — menu alvo aprovado e registrado na [ADR-017](../decisoes/ADR-017-navegacao-alvo-do-frontend.md). Permanece aberto apenas **onde** `/territorio` e `/acervo` vivem: rotas novas ou reaproveitamento de `/mapa` e `/prestacao-de-contas/anexos`. | H1 | humano |
| **Q2** | **Ordem da Home:** o bloco `00 — Observatório e Coletivo` é aceito entre o Hero e o Território? | H5 | humano |
| ~~**Q3**~~ | ✅ **RESOLVIDA em 2026-09-09** — a ausência não é bloqueio. Em composição escura, usa-se a marca oficial **colorida sobre superfície neutra/clara de apoio**; proibido redesenhar, recolorir, vetorizar ou inventar versão branca. Uma versão monocromática oficial, se fornecida, substitui a solução. | — | decidido |
| ~~**Q4**~~ | ✅ **RESOLVIDA na H1** — o overlay chapado deu lugar a **véu uniforme + gradiente**, que a instrução autoriza e que preserva melhor a fotografia. Contraste medido no pixel pintado: **mínimo 6,26:1**, bem acima do piso. | — | resolvido |
| ~~**Q5**~~ | ✅ **RESOLVIDA na H1** — recorte automático não serve: são duas **composições** distintas, não dois tamanhos. Os derivados são nomeados e servidos por `<picture>` com `media`. Em 375 não cabem pessoas e placas juntas; a escolha preservou as placas. Ver H1 §3.4. | — | resolvido |
| **Q6** | **Menu mobile sem JavaScript:** a solução D usa folha com estado. Sem JS, o gatilho não abre. Aceita-se `details`/`:target` como base progressiva, ou a navegação sem JS fica só no rodapé? Isso toca "funcionar sem JavaScript nas páginas de leitura" (doc 01 §7). | **H1** | humano |
| **Q7** | **Seção 03:** declarar o estado dos indicadores é aceitável, ou a seção deve ser omitida como na 10A? | H7 | humano |
| **Q8** | **`sergipe.geojson`:** autoriza-se baixar o contorno do estado do IBGE, com a mesma disciplina de procedência? Auditado na H0: a **malha municipal existe e está íntegra** (75 municípios, SHA confere); o que falta é só o **contorno externo do estado**, arquivo distinto. | H3 | humano |
| **Q9** | **Licença do IBGE:** pendência aberta desde a ADR-010. O mapa ganha protagonismo — confirmar antes de ampliar o destaque? | H3 | humano |
| **Q10** | **Ângulo do pôster:** faixa sugerida 18°–28°. Qual valor? | H3 | humano — Direção Visual §30.10 |
| **Q11** | **Quantidade de fichas de acervo na Home:** 3, 5 ou outro? | H6 | humano |
| **Q12** | **Texto institucional de fomento:** não há fórmula consolidada no repositório. **TEXTO INSTITUCIONAL A VALIDAR.** | rodapé | humano |
| **Q13** | **Escala do título do Hero:** `--text-4xl` ou `--text-5xl` no desktop; onde quebra a linha? | H2 | humano — Direção Visual §30.2 |
| **Q14** | **`@lhci/cli`:** Lighthouse continua não medido; a documentação proíbe rodá-lo até o item 26 do backlog. Antecipar para o Piloto? | H7 | humano |
| **Q15** | **Espessura de linhas topográficas:** a Direção Visual §30.6 registra como item de validação. Entram no Piloto ou ficam PÓS-PILOTO? | H3 | humano |
| **Q16** | **Narração humana:** confirma-se que o áudio da Home não existe e o componente entrega estado indisponível? | H4 | humano |

---

# 32. Recomendação de implementação

## 32.1 Sequência

**Começar por H0 — Fundação de tokens e tema.**

Quatro razões:

1. **Não depende de nenhuma questão aberta.** Q1 a Q16 não a bloqueiam. É a única fase
   que pode começar hoje.
2. **É pré-requisito de tudo.** Hero, header, mapa e Central consomem os tokens de tema.
   Fazê-la depois significa reescrever cada um.
3. **Risco baixo e rollback trivial.** Nada visual muda; a Home continua idêntica em
   claro. Um `git revert` desfaz.
4. **Dá a medida real do custo do dark mode** antes de comprometer o orçamento com a
   fotografia — informação de que a fase H2 vai precisar.

**Sequência recomendada:**

```
H0  ──► H2 ──► H3 ──► H4 ──► H5 ──► H6 ──► H7
     └► H1 (assim que Q1 e Q3 forem resolvidas)
```

**H1 sai da ordem numérica de propósito.** Ela está bloqueada por Q1 (menu) e Q3 (marca
do Coletivo). Esperar por ela paralisa o Piloto inteiro. H2 (Hero) só depende de Q3 para
a assinatura do Coletivo — e essa parte pode ser a última coisa da fase, com o restante
do Hero validado antes.

## 32.2 Antes de escrever a primeira linha

1. **Responder Q1 e Q3.** São os dois bloqueios de caminho crítico.
2. **Abrir ADR-017** (menu e mapa do site) — proposta escrita pelo agente,
   **decisão e alteração do doc 01 pela mão do humano**.
3. **Confirmar Q4, Q8, Q9** — respectivamente overlay, contorno do estado e licença
   do IBGE.
4. **Criar `docs/tarefas/11-home-piloto-h0.md`** com a lista fechada de arquivos
   permitidos. `AGENTS.md`: *"Cada arquivo em `docs/tarefas/` lista os arquivos
   permitidos"*, e essa restrição é o principal controle contra mudança colateral.

## 32.3 Disciplina por fase

- uma fase, um PR; acima de ~400 linhas, fatiar;
- **teste escrito junto com a funcionalidade**, não depois;
- `pnpm verificar` antes de abrir PR — se falhar, não abre;
- **medição de peso registrada no PR** de H2 e H3, no formato da ADR-010;
- ilha cliente nova exige justificativa escrita e o tamanho do chunk medido;
- **nenhuma fase inventa conteúdo** para preencher o que planejou.

## 32.4 O que este plano não autoriza

Nenhuma implementação. Nenhuma instalação. Nenhuma alteração de banco, R2, Vercel ou
DNS. Nenhum deploy. Nenhum push. Nenhuma alteração da
[Direção Visual](./DIRECAO_VISUAL_FRONTEND_1_0.md).

A próxima ação correta é **humana**: responder Q1 e Q3, e autorizar H0.

## 32.5 Atualização H1/H2 — integração local autorizada

> **Atualização de 2026-09-09.** O trecho acima registra o estado anterior às
> decisões humanas posteriores. H0 foi concluída; Q1, Q3, Q4 e Q5 foram
> resolvidas; o **Hero B revisado** foi escolhido e sua integração local na
> Home foi autorizada expressamente.

H1/H2 estão implementadas localmente na extensão estrita autorizada:

- Hero B revisado substitui a abertura antiga;
- cabeçalho aprovado substitui o legado somente na Home;
- apenas as quatro rotas reais aparecem como links;
- `Território` e `Acervo` permanecem ausentes da Home enquanto não têm rota;
- Central mínima e CTA real foram preservadas;
- conteúdo abaixo do Hero não foi redesenhado;
- `/dev/hero` permanece laboratório, fora do sitemap e 404 em produção.

Registro técnico e medições:
[`H1_INTEGRACAO_HERO_HOME.md`](./H1_INTEGRACAO_HERO_HOME.md).

O referencial de 500 kB segue excedido e documentado. Por decisão da tarefa,
a fotografia aprovada não foi degradada para atingir o número. A implementação
continua **local, não publicada**, sem push ou alteração de infraestrutura.

## 32.6 Atualização H2 — Território em protótipo

> **Atualização de 2026-09-09.** A numeração operacional mais recente chama a
> fase cartográfica de **H2 — Território**; ela corresponde ao pôster
> cartográfico anteriormente planejado como H3. O Hero aprovado não foi
> reaberto.

Estado: **EM PROTÓTIPO**, exclusivamente em `/dev/territorio`, com 404 em
produção. Dois presets compartilham a mesma malha oficial, projeção, paleta e
interação: A com profundidade mínima e B com profundidade moderada. O
responsável escolheu **B**; a H2.0.1 reduziu em cerca de 20% sua espessura,
deslocamento e peso de sombra, preservando o ângulo moderado.

A Home continua com a seção cartográfica anterior, sem substituição ou mudança
de conteúdo. Registro técnico, medições e capturas:
[`H2_TERRITORIO_PROTOTIPO.md`](./H2_TERRITORIO_PROTOTIPO.md).

Nenhuma dependência, coordenada, rota pública, banco ou infraestrutura foi
criada. Não houve deploy nem push. A integração H2.1 só pode começar após a
aprovação explícita da copy proposta. A coluna editorial permanece dívida
visual registrada para a integração H2.1; não foi redesenhada nesta fase.

## 32.7 Atualização H2.1 — Território integrado na Home

> **Atualização de 2026-09-10.** O responsável aprovou o Preset B refinado e
> autorizou sua integração real local.

Estado: **IMPLEMENTADA LOCALMENTE, NÃO DEPLOYADA**. A Home agora segue Hero,
01 — Território, caminhos prioritários e acervo. O SVG server-side, os 75
municípios, Vale, comparação, hachuras, teclado, lista e painel foram
preservados; nenhum pin ou coordenada foi criado.

A coluna editorial foi integrada à superfície da seção, sem fundo ou sombra de
card. O índice completo permanece acessível no HTML e inicia recolhido. A copy
institucional proposta não foi publicada. Registro técnico, medição e capturas:
[H2_INTEGRACAO_TERRITORIO_HOME.md](./H2_INTEGRACAO_TERRITORIO_HOME.md).

Nenhuma dependência, MapLibre, Leaflet, rota pública, banco ou infraestrutura
foi criada. Não houve deploy nem push.

## 32.8 Atualização H3 — Pesquisa em Campo em protótipo

Em 2026-09-10, a fase chamada **H3 — Pesquisa em Campo** na sequência atual
entrou em **EM PROTÓTIPO**, exclusivamente em `/dev/pesquisa`, com 404 em
produção. Esta H3 sucede o Território atual (H2/H2.1); não confundir com a
numeração histórica deste plano, que chamava o pôster cartográfico de H3.

O corpus relevante foi auditado com regra de privacidade conservadora: 56
fotografias candidatas, 15 APTAS após inspeção visual sem pessoa identificável,
41 PENDENTES e 0 NÃO USAR. Somente três derivados WebP sem EXIF/XMP/GPS foram
versionados, totalizando 242.766 B. `B01` continua RESTRITO como conjunto e
nenhum consentimento foi presumido.

Os presets **A — Documental aberto** e **B — Caderno técnico** usam o mesmo
conteúdo. A recomendação técnica é A, mas a escolha e a copy continuam sob
decisão humana. A Home não foi alterada: seu cenário 1440 permanece em
aproximadamente 692.435 B e recebe 0 B da H3 nesta fase. Não houve deploy,
push ou mudança de infraestrutura. Registro completo:
[H3_PESQUISA_CAMPO_PROTOTIPO.md](./H3_PESQUISA_CAMPO_PROTOTIPO.md).
## 32.9 Atualização H3.1 — Pesquisa em Campo integrada na Home

> **Atualização de 2026-09-10.** O responsável escolheu o **Preset A —
> Documental aberto**, aprovou os três títulos da seção, recusou a frase de
> abertura do protótipo e autorizou a integração local.

Estado: **IMPLEMENTADA LOCALMENTE, NÃO DEPLOYADA**. A Home agora segue Hero,
01 — Território, 02 — Pesquisa em Campo, caminhos prioritários e acervo. A
seção é Server Component puro e não acrescenta ilha nenhuma; laboratório e Home
compartilham a implementação, e a entrada pública fixa a composição A e remove
todo rótulo de desenvolvimento — inclusive do CSS embutido.

A frase recusada saiu. No lugar entrou uma abertura curta cujas quatro
afirmações estão sustentadas pelo corpus e que não depende do número de
fotografias publicadas. O bloco "Método · síntese transversal" permanece e
**continua aguardando aprovação humana**: ele estava marcado como pendente na
tabela de copy da H3 e não foi decidido nesta rodada.

Nenhum dos três títulos de fotografia é topônimo. "Igrejinha" era nome de
arquivo do corpus e virou "Fachada de igreja" na interface, para não promover
legenda editorial a nome de lugar; o nome original continua registrado na
procedência. Os outros dois já eram descrição e foram mantidos.

B01 segue RESTRITO e não aparece na Home: nem identificador, nem título
interno, nem URL, nem arquivo. A04 continua fora do lote público, e o HTML
servido não o menciona. Os três derivados foram revalidados antes da
integração: hash confere, e não há EXIF, XMP, GPS ou vestígio de dispositivo.

Medição em 1440 px, transferência inicial: **659.053 B antes, 797.392 B
depois**. As três fotografias custam 128.920 B e, apesar de `lazy`, entram no
carregamento inicial por limiar do navegador — medição registrada, sem correção
possível em HTML. Corrigir o `sizes` para o slot real economizou 41.783 B.
Registro completo: [H3_INTEGRACAO_PESQUISA_HOME.md](./H3_INTEGRACAO_PESQUISA_HOME.md).

Nenhuma dependência, MapLibre, rota pública, banco ou infraestrutura foi criada.
Não houve deploy nem push. H4 não foi iniciada.
## 32.10 Sequência vigente das fases — decisão humana de 2026-09-10

A numeração do planejamento original divergiu da execução. A decisão humana
encerra a ambiguidade e fixa a sequência abaixo como **vigente**:

| Fase | Assunto | Estado |
|---|---|---|
| H0 | Fundação visual | implementada |
| H1 | Hero | implementada localmente |
| H2 | Território | implementada localmente |
| H3 | Pesquisa em Campo | implementada localmente, encerrada na H3.2 |
| H4 | Dados / Indicadores | não iniciada |
| H5 | Pessoas / Vozes | não iniciada |
| H6 | PodObservar, Acervo e Transparência | não iniciada |
| H7 | Acessibilidade, movimento, performance e polimento final | não iniciada |

**H4 é Dados / Indicadores.** A Central de Acessibilidade, que a numeração
antiga chamava de H4, passa a ser tratada como camada transversal do frontend:
ela já existe e funciona na Home, e seu fechamento acontece na H7. O aviso no
topo da §29 aponta para cá, e nenhuma fase antiga foi removida do documento.

## 32.11 Atualização H3.2 — acabamento editorial da Pesquisa em Campo

> **Atualização de 2026-09-10.** A composição do Preset A foi revisada
> visualmente e **aprovada**. Esta rodada não redesenhou nada: mexeu só em copy
> e investigou o comportamento do cabeçalho.

**Cabeçalho.** O cabeçalho que aparecia sobre a fotografia nas capturas é
**artefato de screenshot**, não defeito. Ele é `fixed` no topo, e captura
full-page ou de elemento o congela na posição em que estava na viewport, no
meio da imagem final. Medido em navegador real em 1440, 375 e 320 px, na carga,
rolando para baixo, rolando para cima, com foco por teclado e com o painel de
acessibilidade aberto: rolando para baixo ele recolhe e sai da viewport; ao
reaparecer não sobrepõe a seção; nenhum focável fora do cabeçalho fica
obscurecido por ele. **Nenhuma linha do cabeçalho foi alterada.**

**Copy.** A introdução perdeu a linguagem de gate de privacidade. O bloco de
leitura ficou editorial e a ausência de data migrou para a ficha, como campo. O
bloco de método foi aprovado e reescrito em registro menos defensivo. Os três
títulos de fotografia continuam como estavam, e continuam sendo legenda
descritiva, nunca topônimo.

**Performance.** Nada foi alterado. A dívida permanece registrada: cerca de
797 kB em 1440 px no cenário medido, contra o referencial de 500 kB. A
auditoria de performance e Lighthouse acontece na H7.

Registro completo: [H3_INTEGRACAO_PESQUISA_HOME.md](./H3_INTEGRACAO_PESQUISA_HOME.md).
Sem deploy, push ou mudança de infraestrutura. H4 não foi iniciada.
## 32.12 Atualização H4.0 — Dados e indicadores em protótipo

Em 2026-09-10 a fase **H4 — Dados / Indicadores** entrou em **EM PROTÓTIPO**,
exclusivamente em `/dev/dados`, com 404 em produção. A Home não foi alterada.

A rodada começou pela auditoria, não pelo desenho. Foram auditados 21 arquivos
candidatos e 20 abas de planilha. Dos 43 indicadores candidatos, **29 são
APTOS, 11 são PENDENTES e 3 são NÃO PUBLICAR** — dois deles porque o gênero foi
inferido pelo prenome e a própria fonte manda validar antes de publicar, e um
porque o numerador está zerado por ausência de valor declarado.

A unidade documental de origem continua **RESTRITA**: ela sustenta a agregação
internamente, e nem seu identificador, nem seu título interno, nem o nome do
arquivo ou da aba chegam ao HTML. Dois testes vigiam esse limite. Nenhuma linha
individual foi copiada, e não há dado pessoal em nada derivado.

O protótipo publica **oito indicadores**, uma série mensal de seis meses e um
ranking de dezesseis atividades, com base, período, recorte, regra de cálculo e
regra de arredondamento declarados. O dataset é `const` TypeScript com 12.526 B
mais 3.413 B de formatação determinística; `Intl.NumberFormat` não é usado
porque sua saída depende do ICU do runtime.

Dois presets com o mesmo dataset: **A — Declaração editorial** e **B — Painel
de pesquisa**. Recomendação técnica: **A**, que conversa melhor com a H3 e
mantém a ficha como elemento assinatura. A escolha é humana.

Um gráfico em SVG no servidor — dot plot de receita e despesa por mês — e um
ranking em tabela com barra em CSS. **Nenhuma biblioteca de gráficos**, nenhum
Client Component novo, zero JavaScript acrescentado, nenhuma fotografia.
Lighthouse continua indisponível e a dívida fica para a H7.

Registro completo: [H4_DADOS_INDICADORES_PROTOTIPO.md](./H4_DADOS_INDICADORES_PROTOTIPO.md).
Sem banco, deploy, push ou mudança de infraestrutura. A H4.1 depende de decisão
humana entre A e B.
## 32.13 Atualização H3.5 — Sistema gráfico e motion transversal em protótipo

Em 2026-09-11 a fase **H3.5 — sistema gráfico e motion transversal** entrou em
**EM PROTÓTIPO**, exclusivamente em `/dev/linguagem-visual`, com 404 em
produção. A Home não foi alterada, e a H4.0 não foi tocada.

A H3.5 foi executada **depois** da H4.0, e não antes. A H4.0 rodou fora de
ordem, e a decisão do responsável foi preservá-la por inteiro. Conceitualmente
a H3.5 continua sendo a camada anterior: é dela que a H4.5 herdará o tratamento
visual dos indicadores.

A rodada começou pela auditoria dos grafismos da identidade, que nunca tinham
sido medidos como candidatos a uso real. A medição **confirma o Achado Crítico
1 do §4.3** deste plano, arquivo por arquivo e hash por hash: cinco dos seis
"SVG" são PNG em base64 dentro de invólucro SVG. Não escalam, não são
recoloráveis por token, e dois deles custam 704 KB cada.

Um único derivado entrou no bundle: `media/grafismos/carcara-identidade-368.webp`,
29.954 B, rasterizado no tamanho intrínseco declarado pelo próprio arquivo —
sem recorte, recoloração ou redesenho. Cacto e igreja ficaram de fora por falta
de conteúdo que os convoque; a Direção Visual §11 condiciona o uso à função
editorial.

Os papéis transversais — três superfícies de capítulo, uma linha, respiro em
`clamp()` e teto de tamanho para o grafismo — vivem sob `.linguagem-visual` e
não alcançam nenhum consumidor de H1 a H4.0. Dois presets comparam o mesmo
conteúdo: **A — Contido** e **B — Vivo**. A alternância usa `:has()` sobre
rádio e funciona sem JavaScript; a única ilha cliente acrescenta a entrada de
240 ms do preset B, e o conteúdo nasce visível sem ela.

Duas decisões ficam com o humano. O **carcará** entra como assinatura da
identidade, e não como fauna avistada: não há registro de avistamento no
recorte, e a Direção Visual §11 condiciona o uso de fauna a contexto real. E o
preset **B propõe intensidade 5/10**, acima dos 3–4/10 da Direção Visual §12.1;
adotá-lo é revisar a direção.

Registro completo: [H3_5_SISTEMA_GRAFICO_PROTOTIPO.md](./H3_5_SISTEMA_GRAFICO_PROTOTIPO.md).
Sem banco, deploy, push ou mudança de infraestrutura. A H4.5 não foi iniciada.
## 32.14 Atualização H3.5.1 — Consolidação do sistema gráfico vivo

Em 2026-09-11 o laboratório `/dev/linguagem-visual` passou de exploração a
sistema. A Home não foi alterada, e a H4.0 não foi tocada.

Duas decisões humanas chegaram fechadas e foram executadas. O **carcará está
aprovado como grafismo da identidade**, explicitamente não documental: seu uso
não constitui evidência de ocorrência da espécie no território pesquisado. E a
**intensidade de movimento da Direção Visual §12.1 passou de 3–4/10 para
4–5/10**, com o preset B adotado como direção. As duas alterações estão
registradas na Direção Visual §11.1, §12.1 e §31.1.

O alvo agora é **B refinado**, e não o B da H3.5. O carcará perdeu **27,8%** de
largura em telas grandes — de 144 px para 104 px — e 26,7% no celular. Ele
continua claramente visível e mede menos de um quarto da largura da fotografia
da mesma página; há teste que trava as duas pontas dessa relação.

A H3.5.1 formaliza uma **gramática de grafismos** em quatro famílias —
identidade, cartográfico, documental e de transição — com regra de frequência
por família. A identidade é a única com teto: **um carcará em escala editorial
por página, e só em passagem entre capítulos**. É o que separa assinatura de
mascote. O laboratório ganhou uma segunda passagem, `CAMPO → LEITURA`, feita só
com grafismo cartográfico, que prova que a continuidade não depende do animal.

O vazio entre seções foi resolvido sem card, sombra, canto arredondado ou
textura falsa: um fio único de 1 px desce a coluna inteira do artigo e as
passagens o engrossam. A página lê como sistema editorial contínuo.

Também entra um **guia de densidade visual** em três faixas, para impedir que
fases futuras apliquem o mesmo tratamento a tudo. A gramática e o guia vivem em
`src/componentes/prototipo/linguagem/gramatica.ts`, em forma executável, e são
verificados por teste.

Microinterações com propriedade declarada — `transition: all` é proibido e há
teste varrendo a página. Scroll reveal em 240 ms e 10 px, numa única ilha
cliente, com o conteúdo nascendo visível. **Zero JavaScript acrescentado** e
nenhuma dependência nova: a varredura dos 17 `chunks` do build de produção não
encontra nada do sistema gráfico.

Registro completo: [H3_5_1_CONSOLIDACAO_SISTEMA_GRAFICO.md](./H3_5_1_CONSOLIDACAO_SISTEMA_GRAFICO.md).
Sem banco, deploy, push ou mudança de infraestrutura. A H4.5 não foi iniciada.
## 32.15 Atualização H4.5 — Dados vivos

Em 2026-09-12 a seção de Dados ganhou uma composição dentro do sistema gráfico
consolidado na H3.5.1, em `/dev/dados-vivos`, com 404 em produção. A Home não
foi alterada. A **H4.0 não foi tocada**: `/dev/dados` continua exatamente como
o commit `979ecb3` a deixou, e é isso que permite comparar composição sem
comparar números.

A hierarquia de autoridade ficou declarada: **H4.0 é a autoridade factual**,
**H3.5.1 é a autoridade visual**, e a H4.5 é o encontro das duas. Nenhum valor,
cálculo, base, recorte ou arredondamento mudou; o dataset é o mesmo arquivo de
12.526 bytes. As duas rotas leem o mesmo módulo, então divergir de número é
impossível por construção, e um teste confere que os oito valores formatados
aparecem nas duas.

O que mudou é composição. Período e recorte, que são constantes do dataset,
subiram uma vez para uma ficha de contexto da seção em vez de se repetirem em
cada indicador. O número protagonista ganhou uma amarra de hairline no lugar da
caixa que um cartão desenharia. Os sete indicadores secundários deixaram a
grade de células com borda e viraram **faixa de registros**: cada valor pende
de um eixo com seu próprio tique, como marca numa régua cartográfica.

O dot plot mensal foi preservado na lógica e refinado no desenho: tiques curtos
no lugar de linhas de grade, conector mais fino, e cada mês virou registro
endereçável. Passar o mouse sobre um mês atenua os demais e **acende a linha
correspondente da tabela** — ligação feita com `:has()` e `data-mes`, doze
regras geradas no servidor, zero JavaScript. Atenuar não é esconder: nenhuma
informação existe só no gráfico, e o caminho de teclado continua sendo a
tabela, que tem todos os valores exatos.

O ranking entrou com **limiar declarado**: atividades registradas em dez ou
mais dos quarenta dias, oito das dezesseis, com o critério na legenda e o total
dito no texto. O limiar não corta um empate, e um teste conserva essa folga.

Uma assinatura de carcará na página, na passagem de entrada `CAMPO → MEDIDA`. A
passagem de saída usa só grafismo cartográfico. Nenhum carcará no meio dos
dados.

Reveal reutiliza a mesma ilha cliente da H3.5.1, generalizada para aceitar
outra raiz. **Zero JavaScript acrescentado**, nenhuma dependência nova, nenhuma
biblioteca de gráfico ou de animação: a rota nova carrega exatamente os mesmos
552.767 bytes de JavaScript compartilhado que a original.

Registro completo: [H4_5_DADOS_VIVOS.md](./H4_5_DADOS_VIVOS.md).
Sem banco, deploy, push ou mudança de infraestrutura. A H5 não foi iniciada e a
H4 continua fora da Home.
## 32.16 Atualização H4.5.1 — Refino editorial da seção de dados

Em 2026-09-12 a composição de Dados foi calibrada para reduzir os últimos
resíduos de aparência de painel. Não houve conceito novo, reconstrução nem
alteração de dado: valores, cálculos, bases, recortes, arredondamentos e
classificação de publicação continuam os da H4.0, e a rota `/dev/dados`
continua intacta.

**O ranking de atividades saiu da composição candidata à Home.** Ele não foi
apagado nem alterado: continua inteiro no laboratório, depois da marca de fim
da área candidata, num bloco de material reservado para a futura página de
dados. A separação estabelece os dois papéis que o projeto vinha precisando
distinguir — a Home interpreta e convida, a página de dados aprofunda e
consulta. Com isso o limiar editorial de dez dias também deixou de aparecer na
candidata, e nenhum limiar novo foi inventado para substituí-lo.

**Seleção passou a significar ênfase, e não apagamento.** No gráfico mensal, a
atenuação dos meses não escolhidos subiu de 0,3 para 0,6 e passou a alcançar só
as marcas: o rótulo do mês, que é texto, continua em opacidade cheia, porque
contraste de texto não pode depender de onde está o ponteiro. A dominância do
mês selecionado vem de somar ênfases — conector mais grosso, mais escuro,
marcas em opacidade cheia.

**A passagem de saída perdeu a afirmação sobre pessoas.** "Por trás de cada
contratação registrada existe alguém" sugeria que 84 contratações são 84
pessoas, e não são: a mesma pessoa pode aparecer em dias diferentes, e a
contagem de pessoas distintas continua pendente na fonte. A nova copy,
`Medida → Conjunto completo`, explica por que o detalhamento não está ali sem
prometer navegação para uma página que ainda é stub.

**A cruz de registro foi removida**, sem substituto: o fio cartográfico já faz
a ligação, e trocar um ornamento por outro não é refino.

**O carcará ficou ancorado na grade.** Mesmo tamanho, um por página, mesma
legenda — mas a legenda virou a régua em que ele se apoia, com um fio que
atravessa a ponte e a assinatura. Ele deixou de parecer adesivo no canto.

**Os indicadores secundários ganharam duas variantes**, completa e reduzida,
com alternância sem JavaScript. A reduzida é ensaio de composição e não escolha
editorial: mostra os quatro primeiros do dataset, em ordem de arquivo, só para
medir quanta faixa a Home aguenta. A ressalva vive no cabeçalho do laboratório,
fora da pré-visualização. **Qual indicador merece a Home continua sendo decisão
humana, e ela segue aberta.**

A área candidata deixou de se explicar: controles, ressalvas e vocabulário de
protótipo saíram de dentro dela. Quem olha a pré-visualização vê o que o leitor
veria.

Zero dependência nova, zero Client Component novo, zero JavaScript acrescentado
e a mesma mídia. A composição candidata perdeu 51 nós de DOM, quase 19%.

Registro completo: [H4_5_1_REFINO_DADOS_HOME.md](./H4_5_1_REFINO_DADOS_HOME.md).
Sem banco, deploy, push ou mudança de infraestrutura. A H4 continua fora da
Home e a H5 não foi iniciada.
