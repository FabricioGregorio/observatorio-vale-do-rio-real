# H1 — HERO MANIFESTO
## Protótipo visual controlado, para decisão humana

**Versão:** 1.0
**Data:** 09/09/2026
**Status:** PROTÓTIPO EM AVALIAÇÃO — **nenhuma variante foi aplicada à Home**
**Rota:** `/dev/hero` — desenvolvimento apenas, 404 em produção

**Fonte de verdade visual:** [`DIRECAO_VISUAL_FRONTEND_1_0.md`](./DIRECAO_VISUAL_FRONTEND_1_0.md),
não alterada nesta rodada.

---

# 1. O que esta rodada é

Duas variantes reais do Hero, construídas com os assets reais, medidas nos dois
temas e em quatro larguras. A Home pública **continua exatamente como estava**.

A escolha entre A e B é humana. Este documento entrega o material para decidir:
o que cada variante faz, o que custou, o que foi medido e o que ficou pendente.

---

# 2. Baseline e gates

| | Antes | Depois |
|---|---|---|
| Commit | `5717f33` | esta entrega |
| `pnpm tipos` | limpo | limpo |
| `pnpm lint` | 4 warnings | **4 warnings** |
| `pnpm teste` | 351 + 3 pulados | **374 + 3 pulados** |
| `pnpm a11y` | 99 | **143** |
| `pnpm build` | 19 rotas estáticas | 20 rotas estáticas |
| Client Components | 2 | **4** |
| Dependências | — | **nenhuma nova** |

Os 4 warnings continuam sendo os mesmos `!important` do bloco de
`prefers-reduced-motion`, e um teste trava esse número.

---

# 3. A fotografia

## 3.1 Procedência

| | |
|---|---|
| Arquivo | `identidade-visual/elementos visuais e graficos/home.jpg` |
| Origem | corpus local, **fora do repositório** |
| Bytes | 7.190.837 (6,86 MB) |
| SHA-256 | `37cf8d2ee72d41756b41f1b027ca241c4cbc17d9a654addc2d9f5412fd7ca866` |
| Gravada como | 4000x3000 |
| `Orientation` no EXIF | **6** — girar 90 graus no sentido horário |
| **Dimensões reais** | **3000x4000, retrato** |

## 3.2 A fotografia é retrato, não paisagem

O `PLANO_HOME_PILOTO_1_0.md` §7.2 e §7.4 a descrevem como "4000x3000, 4:3
paisagem". **Está errado**, e o erro veio de ler as dimensões do arquivo sem
aplicar a orientação do EXIF.

A consequência prática inverte a dificuldade prevista: o plano supunha que o
desktop seria o caso fácil e o mobile o difícil. É o contrário — o mobile
recebe o formato nativo, e é o **desktop** que precisa extrair uma faixa
horizontal de uma origem vertical.

A correção está registrada no plano.

## 3.3 O EXIF traz GPS

Auditoria do original:

| Metadado | Presente |
|---|---|
| **GPS — latitude, longitude, altitude** | **sim** |
| Marca e modelo do aparelho | sim |
| Versão de firmware | sim |
| Data e hora de captura | sim |
| Miniatura embutida | sim, segmento de ~60 kB |
| Bloco XMP | sim |

**Nada disso chega ao site.** Os derivados nascem de pixels desenhados num
`canvas`; nenhum metadado é copiado. `testes/hero-derivados.test.ts` confere
arquivo por arquivo, tanto pelos blocos do formato quanto por varredura
textual.

**As coordenadas não foram registradas em lugar nenhum**, e este documento não
as reproduz.

### Um achado que não é de design

O original carrega a coordenada de onde a fotografia foi feita, e a data
2026-04-05 — dentro do período de campo do projeto.

`src/dados/territorio/pontos.ts` mantém `coordenadas: null` nos quatro pontos
de visita, com a regra de que coordenada vem de conferência em campo ou de
documento do projeto.

**Se o GPS de uma fotografia constitui documentação de um ponto de pesquisa é
decisão humana, não do agente.** O achado fica registrado; nada foi alterado.

## 3.4 Os recortes

Coordenadas obtidas por inspeção visual com grade sobre a imagem orientada, não
por estimativa:

```
pessoas ....... x  330-1050   y 1500-2850   (três, todas de costas)
placas ........ x 1650-3000   y 1550-2500
caminho ....... x  950-1500   y 1900-2400
copa e céu .... y 0-1700
grama ......... y 2400-4000
```

**Desktop** — recorte `x 0, y 1250, 3000x1950`. Mantém pessoas e placas juntas,
com faixa de grama embaixo para o texto. É o que a Direção Visual §7.4 pede
para telas largas.

**Mobile** — recorte `x 895, y 0, 2105x3990`.

O mobile **não consegue manter as duas coisas**, e vale registrar por quê: o
conteúdo útil ocupa 2670 px de largura, e uma janela 1:1.9 tirada de uma origem
de 4000 px de altura tem no máximo 2105 px. Não existe deslocamento que
preserve a borda esquerda das pessoas e a borda direita das placas ao mesmo
tempo.

A escolha preserva **as placas inteiras** — elas carregam a linguagem local
e são o elemento insubstituível da cena. As figuras entram pela borda esquerda.
Cortar as placas no meio das palavras seria pior.

## 3.5 Transformações aplicadas

Só o que é permitido: **orientação, recorte, redimensionamento, compressão,
conversão de formato e remoção de metadado**.

Nada de acrescentar ou remover pessoas, alterar cenário, reconstruir céu, mexer
em placas, aplicar filtro ou gerar pixel por IA. A fidelidade documental está
preservada.

## 3.6 Derivados

| Arquivo | Dimensões | Bytes | SHA-256 (16) |
|---|---|---|---|
| `hero-observatorio-desktop-1440.webp` | 1440x936 | 291.126 | `ffd76a44a03c63ab` |
| `hero-observatorio-mobile-540.webp` | 540x1024 | 182.298 | `0ed8f04252058b71` |

Procedência completa em `src/dados/hero/derivados.ts`. Reprodutível por
`pnpm derivar-hero`.

**O original não entrou no Git**, e um teste garante que nenhum arquivo acima
de 1 MB exista em `public/`.

---

# 4. A ferramenta de imagem

O projeto não tem `sharp`, `jimp` nem qualquer biblioteca de imagem. A máquina
não tem ImageMagick, `cwebp`, `avifenc` nem `ffmpeg`. A instrução da H1 §5 é
explícita: parar antes de instalar dependência nova, não usar serviço externo.

**Nada foi instalado.** O que existe e foi usado é o **Chromium do Playwright**,
já presente como dependência de desenvolvimento: ele traz codificador WebP, e
um `canvas` faz recorte e redimensionamento no mesmo passo. Local, sem rede.

O codificador do `System.Drawing` foi medido primeiro e descartado — 4:4:4 sem
controle de subamostragem, produzindo 283 kB para 1440x936 em qualidade 45, com
perda visível.

**`sharp` é dependência opcional do próprio Next** e não está instalada. Sem
ela, a otimização de imagem do `next/image` não roda; a documentação do Next
recomenda `unoptimized` para quem já otimiza por fora, que é o nosso caso.

**AVIF não é possível localmente:** o Chromium decodifica AVIF, mas não
codifica. Fica pendente.

---

# 5. Por que `<picture>` e não `next/image`

O Hero precisa de **art direction**: composição horizontal no desktop,
composição vertical no mobile — dois recortes diferentes da mesma fotografia,
não a mesma imagem em dois tamanhos.

`next/image` faz troca por densidade e largura. Quem faz troca por
**composição** é `<picture>` com `media`, que é o elemento que o HTML tem para
isso. Somado à ausência de `sharp`, a escolha é direta.

Medido: **apenas um arquivo de fotografia é baixado por breakpoint** — um teste
garante isso.

`CreditosInstitucionais` já abre precedente para `<img>` no projeto, pelo mesmo
tipo de razão.

---

# 6. Texto alternativo

> Caminho de terra entre vegetação, com placas de madeira pintadas à mão
> trazendo expressões locais de acolhida e um pedido de cuidado com a natureza.
> Três pessoas caminham de costas, seguindo o caminho.

Decisões que ele carrega:

- **não identifica ninguém** — as três figuras aparecem de costas, e E01
  (termos de consentimento) continua pendente;
- **não afirma o local** — a fotografia veio da pasta de identidade visual sem
  ficha documental, e nenhum documento do projeto a associa a um município ou
  equipamento. Escrever "Recanto da Serra" seria inventar procedência;
- **não começa com "imagem de"**;
- **`alt=""` foi considerado e descartado** — a fotografia não é decorativa: as
  placas carregam a linguagem do território, que é conteúdo, e nenhum texto
  vizinho do Hero a descreve.

---

# 7. As marcas

## 7.1 Observatório — cópia literal

`horizontal-monocromatica-escura.svg`, o único vetor de verdade da identidade:
13 caminhos, sem imagem embutida.

**Nenhuma transformação.** Copiado byte por byte para `public/media/logos/`.
31.520 B, SHA-256 `8bda07efbe684aaa`.

O lettering está convertido em curvas, e a fonte oficial não está identificada
em nenhum arquivo (H0 §13). Reproduzi-lo com Archivo seria inventar a marca.

### Achado — a marca não foi feita para ficar sobre fotografia

O arquivo é um **painel preto 16:9** com a marca em branco no meio. Ele traz o
próprio fundo, e não existe versão com fundo transparente na identidade.

Sobre a fotografia, o resultado é inevitavelmente um **retângulo preto**. Isso
não é defeito do protótipo: é propriedade do asset disponível, e a instrução
§14 proíbe alterá-lo.

Três saídas, todas humanas:

1. pedir uma versão com fundo transparente;
2. aceitar a placa preta como recurso deliberado de composição;
3. usar a marca só sobre superfícies sólidas — cabeçalho, rodapé — e nunca
   sobre a fotografia.

**Nada foi decidido.** As duas variantes usam o asset como ele é.

## 7.2 Coletivo "Tobias, sou Eu!" — só redimensionamento

`logo-oficial-tobias-sou-eu.png`, 1280x1024, redimensionado para 640x512 e
convertido para WebP. 35.934 B, SHA-256 `813561906f5654cf`.

**Nenhuma cor trocada, nada redesenhado, nada recortado.** A faixa transparente
da borda esquerda do original foi preservada.

### Isto revisa a decisão da H0 §7

A H0 concluiu que a marca do Coletivo precisaria de "superfície neutra/clara de
apoio" sobre o Hero escuro, porque `#9E309E` sobre mata dá 2,30:1.

**A inspeção do arquivo mostrou que a premissa estava incompleta.** A marca não
é um lettering magenta sobre fundo transparente: é um **painel magenta opaco**
com o lettering em amarelo e um retrato estilizado ao centro. Ela traz o próprio
fundo.

Ou seja: **ela já é a superfície de apoio.** O contraste do lettering acontece
dentro do painel, e o painel se destaca da fotografia por ser opaco e de matiz
completamente distinto. Nenhuma placa adicional é necessária — e acrescentar uma
faria a marca parecer selo de patrocinador, que é o que a instrução §12 proíbe.

O número 2,30:1 continua correto e continua relevante: ele proíbe usar a **cor**
magenta como texto sobre escuro. Ele não se aplica a um painel opaco.

---

# 8. As duas variantes

Tudo é idêntico entre elas: mesma fotografia, mesmos recortes, mesmos tokens,
mesmo overlay, mesmo cabeçalho, mesma hierarquia institucional, mesma autoria.
**A única diferença é quem carrega visualmente o nome do Observatório.** É o que
torna a comparação honesta.

## Hero A — wordmark oficial

A marca oficial é o elemento visual principal. Nada é recriado com fonte: o
lettering vem do próprio vetor.

O `h1` existe no DOM com o nome por extenso, escondido visualmente. **Nome de
instituição não pode depender de imagem carregar** — nem para leitor de tela,
nem para indexação.

## Hero B — tipografia editorial

O nome é construído em **Archivo**, e a marca oficial aparece pequena, **acima**
do título, como assinatura de abertura.

Ela vem antes e não depois de propósito: depois do título ela repetiria a
informação que o leitor acabou de receber, uma embaixo da outra.

Não finge que Archivo é a fonte da logo — são declaradamente coisas diferentes,
e é justamente essa diferença que está em avaliação.

---

# 9. Composição

**Altura:** 92 svh. `svh`, não `vh`: a barra de endereço do iOS faz `100vh`
estourar a tela.

**Fotografia:** full bleed, `object-fit: cover`.

**Overlay — dois estratos, não uma cor chapada.** A instrução §13 autoriza
gradiente quando ele preserva melhor a fotografia, e é o caso:

| Estrato | Função |
|---|---|
| véu uniforme | garante o piso de contraste em qualquer ponto do quadro |
| gradiente de baixo para cima | adensa só onde o texto se assenta |

Escurecer o quadro inteiro por igual apagaria a fotografia, que é documento. Com
o gradiente, a copa, o céu e as placas continuam legíveis como fotografia.

Valores em `tokens.css`, sensíveis a tema: no escuro o Hero adensa um pouco,
porque uma fotografia clara demais no topo de uma página escura destoa da
própria página.

**Posicionamento:** conteúdo no eixo inferior-esquerdo, com o lado direito
livre. Sem título centralizado, sem par de botões grandes, sem gradiente
corporativo.

**Metadado:** `SERGIPE / BRASIL`, em IBM Plex Mono. Só isso.

Sustentado por `src/dados/territorio/recorte.ts`. **Não há data, não há
coordenada e não há contagem** — nada disso está confirmado para esta
fotografia, e metadado inventado num site de prestação de contas é afirmação
falsa.

---

# 10. Contraste medido

Medido sobre **o pixel realmente pintado** — a fotografia com as duas camadas de
overlay compostas por cima —, no pior caso entre nove pontos de cada elemento.
Não sobre os tokens.

| Tema | Largura | Metadado A | Autoria A | Metadado B | Título B | Autoria B |
|---|---|---|---|---|---|---|
| claro | 1440 | 6,57:1 | 12,95:1 | 6,36:1 | 12,84:1 | 12,95:1 |
| claro | 375 | 6,26:1 | 13,05:1 | 9,04:1 | 13,00:1 | 13,05:1 |
| escuro | 1440 | 10,57:1 | 13,87:1 | 10,39:1 | 13,82:1 | 13,87:1 |
| escuro | 375 | 10,31:1 | 13,92:1 | 12,66:1 | 13,90:1 | 13,92:1 |

**Mínimo: 6,26:1.** O piso da WCAG AA para texto normal é 4,5:1.

Os números saem de um teste que roda a cada `pnpm a11y`, não de medição manual
copiada para cá.

---

# 11. Cabeçalho

Sobreposto à fotografia, sem faixa própria. Marca pequena à esquerda, menu
horizontal, utilidades isoladas à direita por uma régua vertical.

## Menu — itens com e sem destino

| Item | Rota | Estado |
|---|---|---|
| Observatório | `/observatorio` | link real |
| **Território** | — | **demonstração** |
| Pesquisa | `/pesquisa` | link real |
| Dados | `/dados` | link real |
| PodObservar | `/podobservar` | link real |
| **Acervo** | — | **demonstração** |

`/territorio` e `/acervo` não existem. **Nenhuma rota foi criada, nenhuma página
"em breve", nenhum link quebrado** — a ADR-017 proíbe, e `typedRoutes` reprovaria.

Os dois itens aparecem como **texto**, com `data-demonstracao`, e nunca como
link: link que não navega é pior que ausência, e leitor de tela anunciaria um
destino inexistente. Dois testes garantem isso.

**Isto não pode chegar à Home nessa forma.** Quando as rotas existirem, os itens
ganham `href` e a distinção some.

## Hide-on-scroll

Recolhe ao descer, volta ao subir. Quatro travas, todas testadas:

1. **foco dentro do cabeçalho** — reaparece na hora e não some. WCAG 2.2 —
   2.4.11: quem navega por teclado não persegue alvo em movimento;
2. **painel de acessibilidade aberto** — o cabeçalho fica. Esconder um `dialog`
   aberto o desconectaria do gatilho;
3. **janela curta** — abaixo de 480 px de altura, ou com zoom alto, a área útil
   é pequena demais para um elemento que entra e sai;
4. **`prefers-reduced-motion`** — a troca continua, sem transição. O que sai é a
   animação, não o comportamento.

`translateY` sobre elemento `fixed`: não há deslocamento de layout.

## Prestação de Contas

CTA institucional, com preenchimento sólido — a única ação com esse peso. Aponta
para `/prestacao-de-contas`, que existe; um teste clica e confirma que a página
responde. **A Sala não foi tocada.**

---

# 12. Central de Acessibilidade

Versão **mínima funcional**, não a Central definitiva da H4.

## Só mostra o que existe

A instrução §18 é categórica: nada de controle falso. A H0 implementou tema e
movimento. Escala de texto, alto contraste e narração **não existem** — e por
isso não aparecem.

Um painel com `A+`, `A−` e "alto contraste" inertes seria pior que um painel
pequeno: prometeria recurso que não chega, justamente a quem mais depende dele.
Um teste falha se qualquer um deles aparecer.

| Grupo | O que faz |
|---|---|
| **Tema** | Sistema · Claro · Escuro — troca de verdade e persiste |
| **Movimento** | **relata** o que o sistema pede; não oferece override |

O grupo de movimento relata em vez de ajustar porque a H0 fez
`prefers-reduced-motion` valer sozinho, sem configuração. Um controle ali daria
a impressão de que é preciso ligá-lo para funcionar. Quando o override manual
existir, o grupo vira ajuste.

## Acessibilidade do painel

`role="dialog"` com `aria-modal`, rótulo por `aria-labelledby`, foco inicial no
primeiro controle, **foco preso** enquanto aberto, `Esc` fecha e devolve o foco
ao gatilho. `aria-expanded` no gatilho.

**Sem biblioteca.** O ciclo de `Tab` são dez linhas.

O estado do tema aparece **em texto** ("Em uso: Escuro"), não só pela cor do
botão ativo: depender de cor sozinha reprova em WCAG 1.4.1.

---

# 13. Server vs Client

| | Antes | Depois |
|---|---|---|
| Client Components | 2 | **4** |

Os dois novos, ambos folhas:

| Componente | Justificativa | Renderiza UI? |
|---|---|---|
| `CabecalhoReativo` | direção de rolagem é evento do navegador | **não** |
| `CentralAcessibilidade` | painel com estado, foco preso, armazenamento | sim |

**O Hero inteiro é Server Component.** Fotografia, título, marcas, autoria e
metadado: nada ali precisa de JavaScript.

`CabecalhoReativo` segue o padrão que a ADR-010 validou em `MapaInterativo` —
encontra o elemento pelo `id` e alterna um atributo; quem esconde e mostra é o
CSS.

---

# 14. Movimento

Nenhuma animação de entrada. O conteúdo existe imediatamente — um teste confirma
que o Hero não tem animação em execução.

Sem loader, sem texto letra por letra, sem parallax, sem zoom automático, sem
vídeo de fundo, sem ornamento.

O único movimento é o recolhimento do cabeçalho, em `--duracao-hover` (150 ms),
que a H0 zera sob `prefers-reduced-motion`.

---

# 15. Peso — o bloqueio da rodada

## Bytes transferidos, medidos

| Largura | Fotografia | Marca Observatório | Marca Coletivo | Total de mídia |
|---|---|---|---|---|
| 1440 | 291.126 | 31.520 | 35.934 | **358.580 B** |
| 768 | 182.298 | 31.520 | 35.934 | **249.752 B** |
| 375 | 182.298 | 31.520 | 35.934 | **249.752 B** |

## O orçamento não fecha

O doc 01 §7 fixa **Home abaixo de 500 kB**. A base medida na H0 — fontes 109 kB,
JS 142 kB, CSS 5 kB — soma cerca de 256 kB.

| Largura | Base | Mídia | Total | Orçamento |
|---|---|---|---|---|
| 1440 | ~256 kB | 359 kB | **~615 kB** | **estoura 23%** |
| 375 | ~256 kB | 250 kB | **~506 kB** | **estoura 1%** |

**Esta fotografia é o pior caso possível para compressão**: folhagem e grama de
alta frequência ocupam quase todo o quadro. A varredura de qualidade mostrou uma
curva quase plana — mesmo em qualidade 0,4 o desktop 1440 pesa 239 kB, já com
perda visível.

O teto de 120 kB que o `PLANO_HOME_PILOTO_1_0.md` §7.5 estimou **não é
alcançável** para esta fotografia com nenhum codificador disponível aqui. A
estimativa foi feita antes de medir.

## Caminhos, todos humanos

1. **AVIF** — tipicamente 30–50% menor que WebP em fotografia. Exige
   codificador que a máquina não tem;
2. **reduzir o peso das fontes** — a ADR-010 já registra a pendência de trocar
   Literata variável por estática. Valeria dezenas de kB;
3. **rever o orçamento do doc 01 §7** — alteração do doc 01, fora da atribuição
   do agente;
4. **servir o Hero menor em telas largas**, aceitando alguma suavidade;
5. **recorte com menos folhagem** — comprime melhor, mas perde o território.

**Nenhum caminho foi tomado.** A decisão precede aplicar qualquer variante à
Home.

**A marca do Observatório também pesa:** 31,5 kB de SVG carregados em todo
breakpoint, para um logotipo. Vale pedir uma versão otimizada.

---

# 16. Comparação A × B

| Critério | Hero A — wordmark | Hero B — tipografia |
|---|---|---|
| **Identidade própria** | máxima: é a marca oficial, sem intermediação | alta, mas construída — a voz é do sistema tipográfico |
| **Proximidade com a marca existente** | **total** — o lettering é o do vetor | média: a marca assina, o nome é Archivo |
| **Legibilidade** | depende do tamanho da imagem; o lettering interno é fino | **superior** — texto real, escala com o usuário, respeita zoom |
| **Responsividade** | rígida: a marca é um bloco de proporção fixa | **superior** — reflui em 2, 3 ou 4 linhas conforme a largura |
| **Impacto** | forte e imediato, mas o retângulo preto compete com a fotografia | forte e integrado: o título respira sobre a paisagem |
| **Humanidade** | menor — a placa preta cobre parte da cena e das pessoas | **maior** — a fotografia fica mais exposta |
| **Tecnologia** | neutra | **maior** — texto real é o que o sistema tipográfico aprovado promete |
| **Risco de parecer corporativo** | médio: placa retangular sobre foto lembra selo | baixo |
| **Manutenção** | frágil: qualquer troca do asset muda a composição | **estável** — só texto e tokens |
| **Acessibilidade** | o `h1` existe, mas o nome visível é imagem; zoom não o amplia como texto | **superior** — o nome visível **é** o `h1`: amplia com o zoom, seleciona, traduz |
| **Peso** | 31,5 kB de SVG como elemento principal | os mesmos 31,5 kB, em papel menor |

## Recomendação técnica

**Hero B**, com uma ressalva.

A razão decisiva é acessibilidade somada a responsividade: na variante B o nome
visível **é** o `h1`. Ele amplia com o zoom do navegador, reflui em qualquer
largura, pode ser selecionado, traduzido e lido sem depender de imagem. Na
variante A o nome visível é um raster de proporção fixa, e o `h1` correto existe
apenas escondido — funciona, mas duplica a informação em dois canais que podem
divergir.

A ressalva: **a variante A só tem essa desvantagem porque a marca disponível não
foi feita para ficar sobre fotografia.** Com uma versão de fundo transparente, A
mudaria de figura, e a comparação mereceria ser refeita.

**A escolha é humana.** Esta é uma recomendação técnica, não uma decisão.

---

# 17. Inspeção visual

O que a instrução §32 manda procurar, e o que foi encontrado:

| Item | Achado |
|---|---|
| texto sobre rosto | **não** — as três pessoas estão de costas, sem rosto visível |
| texto sobre pessoa | **sim, no desktop** — o bloco de texto cobre parte do corpo da figura de branco. Legível (12,8:1), mas registrado |
| **texto sobre placa** | **sim, no mobile** — o título cobre parte das placas centrais. É o conflito inevitável descrito na §3.4 |
| crop que elimina contexto | **sim, no mobile** — as figuras entram cortadas pela borda esquerda. Escolha registrada e justificada |
| marca pequena demais | não — a do cabeçalho é discreta mas legível |
| marca gigante demais | **corrigido durante a rodada** — a primeira versão de A ocupava metade do quadro e cobria as pessoas |
| aparência SaaS | não |
| excesso de pill | não — nenhum elemento arredondado além do raio de ficha de 2 px |
| glassmorphism | não |
| blur exagerado | não — nenhum blur |
| glow artificial | não |
| excesso de mono | não — uma linha de metadado |
| overlay pesado demais | não — a fotografia continua reconhecível nos dois temas |
| fotografia irreconhecível | não |
| **retângulo preto da marca** | **sim** — inerente ao asset; ver §7.1 |

---

# 18. Testes

**63 testes novos.**

| Arquivo | Testes | O que protege |
|---|---|---|
| `testes/a11y/hero-prototipo.spec.ts` | 43 | `h1` por extenso nas duas variantes; `alt` que não identifica nem localiza; LCP sem `lazy`; art direction por breakpoint; **um só arquivo baixado**; contraste do pixel pintado nos dois temas e duas larguras; menu sem link falso; painel com foco preso e `Esc`; quatro travas do hide-on-scroll; 320/375/768/1440 sem transbordo; zoom 200%; reduced motion; isolamento da rota |
| `testes/hero-derivados.test.ts` | 12 | ausência de EXIF, XMP e GPS; nenhum original bruto em `public/`; teto de bytes; derivados declarados |
| `testes/rota-hero-prototipo.test.ts` | 8 | 404 em produção; contrato do menu alvo |

Mais testes atualizados em `testes/territorio.test.ts`: o que exigia `public/`
vazia passou a exigir **procedência declarada** para toda mídia — a regra que
sempre importou.

**`pnpm a11y` roda Playwright, sem axe.** Não há `@axe-core` no projeto; as
verificações são explícitas e escritas à mão.

---

# 19. Isolamento da rota

| Verificação | Resultado |
|---|---|
| 404 em produção | guarda testado, mesmo padrão de `/dev/estilos` |
| `sitemap.xml` | allowlist explícita — `/dev/` não está lá |
| `robots.txt` | `Disallow: /dev/` |
| Link público | nenhum |
| Home pública | **inalterada** — um teste confirma que o protótipo não aparece nela |

A página esconde o cabeçalho e o rodapé do site por CSS enquanto está
renderizada. No App Router um layout aninhado não remove o que o layout de cima
colocou, e sem isso a comparação ficaria irreconhecível com dois cabeçalhos
empilhados. A regra só existe nesta página, e esta página some em produção.

---

# 20. Pendência do SHA — resolvida

A H0 registrou que o SHA-256 de `municipios-sergipe-nomes.json` não conferia com
o arquivo. O modelo de `fontes.ts` comportou os dois conceitos sem mudança
estrutural, então foi corrigido:

| Campo | Significado |
|---|---|
| `sha256DaResposta` | hash do que a fonte devolveu pela rede — prova **procedência** |
| `sha256DoArquivo` | hash do arquivo como está versionado — prova **integridade** |

Os dois divergem para a lista de nomes, e divergem legitimamente: a API responde
JSON compacto e o arquivo foi salvo com indentação. Um teste confirma que
reserializar compacto reproduz exatamente o hash da resposta — a divergência é
de formatação, não de conteúdo.

**Nenhum dado geográfico foi tocado.** O que mudou foi o registro, que era
inconferível e agora é conferido a cada `pnpm teste`, para os dois arquivos.

---

# 21. Screenshots

Capturas reais do navegador, geradas por `pnpm screenshots-hero`. **Não
versionadas** — servem à decisão desta rodada.

Diretório do scratchpad da sessão, subpasta `screenshots-hero`:

| Arquivo | Variante | Largura | Tema |
|---|---|---|---|
| `hero-a-1440-light.png` | A | 1440 | claro |
| `hero-a-1440-dark.png` | A | 1440 | escuro |
| `hero-a-375-light.png` | A | 375 | claro |
| `hero-a-375-dark.png` | A | 375 | escuro |
| `hero-b-1440-light.png` | B | 1440 | claro |
| `hero-b-1440-dark.png` | B | 1440 | escuro |
| `hero-b-375-light.png` | B | 375 | claro |
| `hero-b-375-dark.png` | B | 375 | escuro |
| `hero-a-768-light.png` | A | 768 | claro |
| `hero-b-768-light.png` | B | 768 | claro |
| `hero-a-320-light.png` | A | 320 | claro |
| `hero-b-320-light.png` | B | 320 | claro |

O caminho completo está no relatório final da rodada.

---

# 22. Bloqueios antes de aplicar à Home

| # | Bloqueio | Quem decide |
|---|---|---|
| 1 | **Escolher A ou B** | humano |
| 2 | **Orçamento de peso** — a mídia estoura os 500 kB em 1440 | humano |
| 3 | **Codificador AVIF**, ou outra saída para o peso | humano |
| 4 | **Rotas `/territorio` e `/acervo`** — sem elas o menu não pode ir à Home | humano + implementação |
| 5 | **Marca do Observatório com fundo transparente** — desejável; muda a avaliação de A | humano / identidade |
| 6 | **SVG da marca com 31,5 kB** — pedir versão otimizada | humano / identidade |
| 7 | **Consentimento (E01)** — a fotografia mostra pessoas de costas; publicar exige a decisão registrada | humano |
| 8 | **GPS do original** — se constitui documentação de ponto de pesquisa | humano |

Nada disso impediu o protótipo. Todos impedem a aplicação à Home.

---

# 23. O que esta rodada não fez

Não alterou a Home, o mapa, o rodapé, a Sala do Avaliador nem a Direção Visual.
Não criou rota pública. Não instalou dependência. Não tocou em banco, R2, Vercel
ou DNS. Não fez deploy nem push. Não alterou nenhum asset oficial de marca.
