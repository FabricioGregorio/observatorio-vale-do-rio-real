# ADR-010 — Mapa territorial em SVG renderizado no servidor

## Status

Aceita

## Data

2026-09-03

## Contexto

A ADR-009 escolheu MapLibre GL JS. A auditoria 10B.3.2 mediu o custo e a
projeção ficou **acima do orçamento** de peso da Home, que o doc 01 §7 fixa em
500 kB transferidos, com Lighthouse ≥ 90 em 3G simulado.

Os números que motivaram a revisão:

| | Comprimido |
|---|---|
| Home antes do mapa | 378.412 B |
| MapLibre na thread principal (`.mjs` + `shared` + CSS) | 289.272 B |
| MapLibre, incluindo o worker | 295.215 B |

A biblioteca sozinha consumiria mais da metade do orçamento inteiro, além de
exigir WebGL2 — removido o suporte a WebGL 1 na versão 5 — e de desenhar num
`<canvas>` opaco para leitor de tela, num projeto cujo público é rural e
escolar, com aparelho antigo.

A auditoria comparou três cenários e mediu o terceiro gerando a marcação a
partir da malha real: 75 caminhos, uma casa decimal, **16.529 B comprimidos**.
Dezessete vezes mais leve que a biblioteca, sem JavaScript e sem WebGL.

O responsável pelo projeto aprovou o Cenário C em 2026-09-03.

## Decisão

O mapa territorial da Home é **SVG renderizado no servidor**, a partir do
GeoJSON oficial do IBGE. **MapLibre não é usado na Home.**

### O que o mapa preserva

- os 75 municípios de Sergipe, com fronteira municipal individual;
- cada município como objeto identificável e interativo, com código próprio,
  geometria própria e id de destino próprio;
- destaque dos municípios do Vale do Rio Real;
- as relações territoriais em canais visuais independentes, prontas para
  receber camadas novas;
- marcadores para pontos de visita, quando houver coordenada aprovada;
- acessibilidade por teclado, com foco visível;
- nome acessível por município;
- funcionamento sem JavaScript;
- funcionamento sem WebGL;
- nenhuma dependência de tiles, mapas ou serviço externo.

### Arquitetura

Nenhum arquivo concentra tudo, e `page.tsx` não tem lógica de mapa.

| Camada | Arquivo | Papel |
|---|---|---|
| validação | `src/dados/territorio/validacao.ts` | esquemas Zod e leitura da malha e dos nomes |
| projeção | `src/dados/territorio/projecao.ts` | funções puras: envelope, escala, caminho `d` |
| transformação | `src/dados/territorio/mapa.ts` | cruza malha, nomes e recorte em `MunicipioDoMapa` |
| identificação | `src/componentes/mapa/identificacao.ts` | id de destino e nome acessível, num lugar só |
| estilo | `src/componentes/mapa/estilosDoMapa.ts` | CSS escopado e classes por relação |
| desenho | `src/componentes/mapa/MapaTerritorio.tsx` | SVG e alternativa textual |
| município | `src/componentes/mapa/MunicipioNoMapa.tsx` | um `<path>` com `data-codigo` e nome acessível |
| marcador | `src/componentes/mapa/MarcadorNoMapa.tsx` | um `<circle>` por ponto posicionado |
| lista | `src/componentes/mapa/Municipio.tsx` | entrada da alternativa textual |
| ficha | `src/componentes/mapa/FichaMunicipio.tsx` | relações, evidências e pontos |
| interação | `src/componentes/mapa/MapaInterativo.tsx` | ilha cliente: roving tabindex, setas, seleção |
| integração | `src/componentes/home/SecaoMapa.tsx` | lê os dados e entrega por props |

Todos são Server Components, **exceto** `MapaInterativo`, que é a única ilha
cliente do mapa e **não renderiza nada** — só comportamento. A Home continua
Server Component.

A ilha alcança o SVG pelo `id`, em vez de recebê-lo como `children`. Receber
por `children` pareceria mais idiomático, mas serializaria os 75 caminhos
também no payload RSC: os mesmos ~48 kB de geometria apareceriam duas vezes no
documento. Assim o custo em JavaScript é só o da própria função.

Nenhum nome ou código de município é escrito em mais de um lugar: geometria vem
da malha, nome vem da lista oficial, relações vêm de `recorte.ts`, e `mapa.ts`
apenas cruza pelos códigos.

### Semântica e interação

Revisado na rodada de refinamento de 2026-09-03.

**Município não é link.** Não existe página territorial aprovada, e usar `<a>`
com âncora da própria página só para tornar o polígono clicável seria semântica
de link emprestada: o elemento não navega para lugar nenhum. Quando houver
página de município, `MunicipioNoMapa` vira `<a>` de verdade — é uma linha.

Enquanto isso, o município é **opção de uma `listbox`**, que é a semântica de
"escolher um de um conjunto". O papel é atribuído pela ilha cliente depois da
montagem; o HTML do servidor traz apenas polígonos com `data-codigo` e
`aria-label`.

**Sem JavaScript**, o SVG se anuncia como `role="img"` e não carrega `tabindex`
nem `role="option"`. Não promete navegação que não pode cumprir. A informação
inteira está na lista territorial, que vem pronta do servidor.

**Com JavaScript**, a ilha `MapaInterativo` promove o SVG a `listbox` e aplica
**roving tabindex**:

| Gesto | Efeito |
|---|---|
| Tab | entra no mapa **uma** vez, no município ativo |
| Tab de novo | sai do mapa |
| ← ↑ / → ↓ | move entre municípios, em ordem alfabética |
| Home / End | primeiro e último |
| Enter / Espaço | seleciona |
| Esc | limpa a seleção |
| clique e toque | selecionam pelo mesmo caminho |

A ordem de navegação é alfabética, e não a ordem em que a malha veio: o SVG e a
lista percorrem a mesma sequência, e "próximo" precisa significar algo para
quem usa teclado.

Selecionar realça a entrada daquele município na lista e a traz para a área
visível, com `block: "nearest"` e sem animação.

### Estados, distinguíveis por espessura

A espessura do traço cresce de forma monotônica, então os estados se separam
mesmo sem depender de cor:

| Estado | Traço |
|---|---|
| base | 0,5 |
| Vale do Rio Real | 1,2 |
| foco | 2,4, em milho |
| selecionado | 3,5, em mata |

`hover` muda o preenchimento. `cursor: pointer` só aparece quando a ilha marcou
o SVG como interativo — sem JavaScript, o cursor não promete clique.

### Camadas visuais

Mapeamento aprovado pelo responsável. Todos os valores saem de tokens já
existentes; nenhuma cor nova.

| Camada | Canal |
|---|---|
| base | preenchimento pedra, traço texto-suave |
| Vale do Rio Real | preenchimento milho, traço mata |
| pesquisa de campo | hachura diagonal em mata, sobreposta |
| comparação | traço tracejado em anil |

Os três canais são independentes, então Tobias Barreto lê como Vale *e*
pesquisa, e São Cristóvão como pesquisa *e* comparação, sem preenchimento de
Vale. Nenhuma camada depende só de cor (WCAG 1.4.1).

A fronteira da camada base era `--color-borda` a 0,6 e ficava quase invisível
sobre pedra. Passou a `--color-texto-suave` a 0,5: **mais escura e mais fina**.
A fronteira dos 75 municípios ficou perceptível, e a base continua sem disputar
atenção com o Vale, cujo traço é mais que o dobro da espessura e em mata.
Nenhuma cor nova — `--color-texto-suave` já existia em `tokens.css`.

## Resultado medido

Medido no build de produção servido, em 2026-09-03:

| Item | Antes, sem mapa | Depois, com mapa |
|---|---|---|
| Documento HTML | 4.357 B | 49.149 B |
| Fontes | 203.108 B | 108.972 B |
| JavaScript | 140.755 B | 140.760 B |
| CSS | 4.985 B | 5.013 B |
| Prefetch de rotas | 28.691 B | 12.178 B |
| **Total transferido** | **378.412 B** | **316.072 B** |

A Home ficou **62.340 B mais leve com o mapa do que estava sem ele**, em 63%
do orçamento de 500 kB. O mapa custou 44.792 B comprimidos no HTML — mais que
os 16.529 B projetados para os caminhos, porque a alternativa textual dos 75
municípios também está ali. As reduções de fonte e de prefetch, aplicadas na
mesma rodada, pagaram a diferença com folga.

### Depois do refinamento de interação

| Item | Sem a ilha | Com a ilha |
|---|---|---|
| Documento HTML | 49.149 B | 49.967 B |
| JavaScript | 140.760 B | 142.004 B |
| CSS | 5.013 B | 5.013 B |
| Fontes | 108.972 B | 108.972 B |
| Prefetch de rotas | 12.178 B | 12.178 B |
| **Total transferido** | **316.072 B** | **318.134 B** |

**A navegação por teclado do mapa custou 1.244 B comprimidos de JavaScript.** O
chunk da ilha tem 2.341 B brutos e **965 B comprimidos**; o resto são cabeçalhos
de resposta e a referência de cliente. O HTML subiu 818 B por causa dos
`data-codigo` e dos ids.

A Home está em **318 kB de 500**, 64% do orçamento.

Dados (`.geojson`/`.json`) transferidos: **zero**. A malha é lida em tempo de
build; o navegador nunca a busca.

## Alternativas consideradas

- **MapLibre GL JS** — ADR-009. Traria camadas, zoom e hit-testing prontos, ao
  custo de 295 kB, WebGL2 obrigatório e canvas inacessível.
- **MapLibre sob demanda** — Cenário B da auditoria. Manteria a primeira carga
  em 224 kB, mas quem rolasse até o mapa pagaria 311 kB, algo como seis
  segundos em 3G, e o requisito de WebGL2 permaneceria.
- **D3 + SVG** — era a decisão de 10B.0 v1.2 §5. O Cenário C é essa direção sem
  a dependência: a projeção que o projeto precisa são vinte linhas de aritmética
  em `projecao.ts`, e D3 traria muito mais do que isso.

## Consequências

Benefícios:

- 17 vezes mais leve que a biblioteca, e a Home caiu de peso mesmo ganhando o
  mapa;
- zero JavaScript e zero WebGL: funciona em aparelho antigo, com JS desligado e
  por leitor de tela;
- nenhuma dependência nova, e uma removida;
- acessibilidade nativa: link de SVG é focável, e o nome acessível vem do dado.

Limitações, todas registradas:

- **sem zoom e sem deslocamento.** O mapa é uma prancha do estado, não um
  navegador geográfico;
- **projeção fixa**, escolhida em build. Equirretangular com correção de
  meridiano, adequada para um estado e imprópria para medir área ou distância;
- **os caminhos entram no HTML**, não num chunk adiado: pesam na primeira carga
  — o que, medido, saiu bem mais barato que a alternativa;
- ~~75 paradas de tabulação~~ **resolvido** no refinamento: o mapa é uma parada
  de Tab, com setas navegando por dentro;
- **a navegação por setas exige JavaScript.** Sem ele o mapa é ilustração e a
  lista territorial carrega tudo — o que é a decisão, não um acidente;
- interação mais rica — animar câmera, agrupar marcadores — exigiria escrever o
  que a biblioteca traria pronto.

## Impacto em dependências

**`maplibre-gl` foi removido nesta rodada**, e a remoção não foi silenciosa.
Antes de remover foi verificado: nenhum import em `src/`, `testes/`, `scripts/`
ou `db/`; ausência em todos os chunks do build; presença apenas em
`package.json` e no lockfile. `pnpm remove maplibre-gl` retirou 23 pacotes, e
`next` permaneceu em 16.3.4.

`zod` 4.5.4 permanece: é o que valida a malha e os nomes.

## Contratos removidos

Quatro tipos ficaram órfãos e foram removidos de
`src/dados/territorio/tipos.ts`, com nota no próprio arquivo:

- `Municipio` e `InformacoesMunicipio`, substituídos por `MunicipioDoMapa`;
- `FeatureGeoJson` e `ColecaoDeFeatures`, substituídos pelos esquemas Zod de
  `validacao.ts`.

Foram removidos, e não mantidos "para depois", porque duas definições da mesma
entidade divergem — é a lição que o doc 03 §4 registra.

## Substitui

**ADR-009**, quanto à biblioteca do mapa da Home. O histórico dela permanece
intacto: a decisão foi tomada com a informação disponível, e a medição que a
revisou só existiu porque a própria ADR-009 exigiu medir antes de implementar.

Continuam valendo, vindas da ADR-009: alternativa textual como caminho
principal, nenhuma fonte externa, toque além de hover,
`prefers-reduced-motion` respeitado, e geometria oficial ou nenhuma.

## Pendências

- **licença oficial do IBGE**, a confirmar antes da disponibilização pública
  dos dados. Não assumir licença;
- **coordenadas dos quatro pontos de visita**, sem as quais nenhum marcador é
  desenhado;
- **município de Serra dos Macacos e de Ilha Grande**;
- **Literata variável → estática**, ainda não aplicada: exige levantar todos os
  pesos em uso, medir e verificar identidade visual;
- **Lighthouse** continua não medido: `@lhci/cli` não está instalado e a
  documentação do projeto proíbe rodá-lo até o item 26 do backlog.
