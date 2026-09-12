# H4.5 — Dados vivos: o sistema gráfico aplicado aos indicadores

**Data:** 2026-09-12

**Estado:** EM PROTÓTIPO — `/dev/dados-vivos`, 404 em produção

**Home:** não alterada

**H4.0:** não alterada; continua intacta em `/dev/dados`

**Baseline:** `35c9464` — style: consolida sistema grafico vivo

## 0. Cronologia e autoridade

A H4.0 foi prototipada **antes** da H3.5 e da H3.5.1, por ordem operacional. A
H3.5 e a H3.5.1 consolidaram a linguagem depois. A H4.5 é o encontro das duas,
e o encontro tem uma hierarquia declarada:

- **H4.0 é a autoridade factual.** Valores, bases, períodos, recortes, regras
  de cálculo, arredondamentos e classificação de publicação vêm dela.
- **H3.5.1 é a autoridade visual.** Gramática de grafismos, guia de densidade,
  linha de continuidade, passagens e disciplina de movimento vêm dela.
- **H4.5 é composição.** Nada aqui é dado novo.

A pergunta desta fase era: **o sistema gráfico vivo funciona também quando o
conteúdo principal são números?**

## 1. Onde a H4.5 vive, e por quê

Numa rota nova, `/dev/dados-vivos`. A H4.0 **não foi editada**: `/dev/dados`
continua exatamente como o commit `979ecb3` a deixou, com seus dois presets.

A alternativa seria acrescentar um terceiro preset dentro da rota original, e
isso teria custado a edição de arquivos da H4.0 — justamente o que esta fase
não pode fazer. Com duas rotas, a comparação é controlada sem tocar em nada:
as duas leem o **mesmo módulo de dados**, então divergir de número é impossível
por construção, e um teste confere que os oito valores formatados aparecem nas
duas composições.

O laboratório novo aponta para o original por um link; o original não sabe que
o novo existe. A dependência é de mão única, e um teste confere que nenhum
arquivo da H4.0 menciona a H4.5.

## 2. O que não mudou

Nenhum valor, nenhum cálculo, nenhuma base, nenhum recorte, nenhum
arredondamento, nenhuma regra de formatação. O dataset continua sendo o mesmo
arquivo de 12.526 bytes, sem uma linha alterada.

Os oito indicadores são os mesmos:

| Indicador | Valor exibido |
|---|---|
| Retenção municipal da despesa | 93,4% |
| Valor movimentado por dia de funcionamento | R$ 469,06 |
| Despesa total no período | R$ 18.762,52 |
| Receita registrada no período | R$ 15.700,00 |
| Participação do trabalho na despesa | 40,6% |
| Registros de funcionamento coletados | 40 |
| Contratações de trabalho registradas | 84 |
| Localidades alcançadas pela renda do trabalho | 12 |

Nenhuma fonte restrita chegou ao HTML: identificador documental, código na
fonte, nome de aba e nome de arquivo continuam vivendo só em `procedencia`, que
não é renderizada. Os testes de integridade da H4.0 continuam valendo, e a H4.5
acrescentou os seus.

## 3. Estrutura narrativa

A seção lê como investigação, e não como painel:

```
passagem CAMPO → MEDIDA          (com assinatura de identidade)
03 — Dados
  abertura editorial + ficha de contexto
  93,4%  ·  leitura do dado + ficha do indicador
  demais indicadores: faixa de registros
  série mensal: gráfico + tabela
  atividades acionadas: recorte editorial
passagem MEDIDA → PESSOAS        (sem assinatura)
```

O fio único de continuidade da H3.5.1 desce a coluna inteira do artigo e as
passagens o engrossam. A página não é uma pilha de blocos: ela entra vindo do
campo e sai indo para as pessoas.

### 3.1 Ficha de contexto, uma vez

Período, recorte e fonte pública são **constantes do dataset**: valem para os
oito indicadores. A H4.0 os repetia em cada ficha. Aqui eles sobem uma vez para
a abertura da seção, e cada indicador fica com o que só ele tem — base e regra
de cálculo.

Não é economia de espaço, é precisão: repetir sete vezes a mesma data sugere
que ela poderia ser diferente em cada linha, e ela não pode.

## 4. O número protagonista

`93,4%` continua governando a composição. O que ganhou:

- **amarra**: uma hairline que liga o número à sua própria explicação, no lugar
  da caixa que um cartão desenharia;
- **leitura ao lado, com régua na cor da marca**, no mesmo recurso que a H3.5.1
  usa para separar leitura de registro;
- **ficha reduzida ao que é próprio dele**: base, cálculo e limite. O limite
  é a nota metodológica, e ela aparece com esse rótulo porque é isso que ela é.

O que não entrou, por proibição explícita e por direção: cartão com sombra,
donut, gauge, velocímetro, selo de indicador, gradiente e ícone financeiro. O
tamanho continua sendo o único recurso de ênfase, dimensionado em `cqi` para
sobreviver ao zoom de 200%.

## 5. Indicadores secundários: faixa de registros

Das quatro abordagens propostas, a escolhida foi a **faixa de registros**
(opção 1), e a escolha foi visual, não teórica: a grade de células com borda da
H4.0 é a forma que todo painel administrativo usa, e ela diz "ferramenta de
consulta" antes de dizer qualquer número.

Na faixa, cada indicador **pende de um eixo** com seu próprio tique, como marca
numa régua cartográfica. Não há moldura: o tique marca sem cercar.

O eixo é a borda superior de cada registro, e não um elemento único acima da
lista. Essa foi uma correção feita na inspeção visual: com um eixo só, a
segunda fileira da grade flutuava sem régua, e a metáfora se quebrava na
primeira quebra de linha.

Campo sem valor na fonte não vira linha. Quatro dos sete secundários não têm
base própria, e a linha de base simplesmente não aparece neles — regra que a
própria H4.0 já aplicava, e que aqui evita sete repetições de "sem base".

## 6. Série mensal

### 6.1 O que foi preservado

A forma e a lógica. A pergunta continua sendo **a distância entre receita e
despesa**, e dois pontos ligados desenham a diferença diretamente. Continua
sendo dot plot, continua sendo SVG montado no servidor, continua sem biblioteca
e sem JavaScript de gráfico. A escala, o teto e os valores são os mesmos.

### 6.2 O que foi refinado

- **eixo com tiques curtos** em vez de linhas de grade inteiras, que competiam
  com o dado. Cinco tiques, três rotulados;
- **conector mais fino** em repouso, 1,25 contra 1,5;
- **cada mês virou um registro endereçável**, com `data-mes` no grupo do
  desenho e na linha da tabela.

### 6.3 A microinteração

Passar o mouse sobre um mês — no desenho — atenua os demais para 30% de
opacidade, engrossa o conector daquele mês e **acende a linha correspondente da
tabela**, onde o valor exato já está. A ligação é feita com `:has()` e
`data-mes`: seis meses, doze regras de CSS geradas no servidor, **zero
JavaScript**.

O reforço do valor é a linha da tabela, e não um rótulo dentro do desenho. Essa
decisão veio da inspeção visual: um rótulo no SVG exigia margem direita de
150 unidades, empurrava os pontos para dentro e criava uma segunda cópia do
número para manter em sincronia. O texto chegou a existir, foi visto vazando
para fora do container, e saiu.

**Atenuar não é esconder.** Os demais meses continuam legíveis, no DOM e na
tabela. Nenhuma informação existe só no gráfico, e um teste confere isso.

### 6.4 Teclado

O desenho **não** recebe parada de teclado. `role="img"` torna o interior do
SVG presentacional: um `tabindex` ali criaria um ponto de foco que anuncia o
mesmo título e a mesma descrição que a tecnologia assistiva já lê, e que não
opera nada — além de reprovar na regra `noNoninteractiveTabindex`, que não foi
desabilitada.

O caminho de teclado para o mês a mês é a **tabela**: ela carrega todos os
valores, tem `caption` e `th` com `scope`, e está sempre no DOM. É a
"alternativa acessível equivalente" que a especificação desta fase admite, e
ela é melhor que a alternativa: dá o valor exato, que o desenho não dá.

### 6.5 Entrada

O conector desenha primeiro, por `stroke-dashoffset` com `pathLength="1"`, e os
pontos chegam depois dele.

| | |
|---|---|
| conector | 200 ms |
| atraso dos pontos | 100 ms |
| pontos | 160 ms |
| total perceptível | **360 ms** |

Dentro do teto de 400 ms. Uma repetição, sem laço. Com movimento reduzido, o
estado final é imediato e nada fica invisível.

## 7. Tabela mensal

Preservada e tratada como **registro técnico de apoio**: ela vem depois do
desenho, com legenda em mono, alinhamento numérico à direita, `tabular-nums`,
fios finos e realce de linha em hover. Não está escondida, não depende de
JavaScript e não é condicional no servidor — um teste lê o código-fonte para
garantir que ela não ganhou um `?` na frente.

## 8. Ranking de atividades

Recorte editorial com **limiar declarado**: atividades registradas em **10 ou
mais** dos 40 dias de funcionamento. Oito das dezesseis.

O critério é derivável por quem lê: o número está na legenda da tabela, cada
linha mostra os dias, e o texto diz quantas atividades ficaram de fora e para
onde elas vão. Nenhuma atividade some sem ser contada.

"As oito primeiras" teria sido escolher um número porque ele cabe. O limiar não
cai em cima de um empate — a oitava tem dez dias, a nona tem oito — e um teste
conserva essa folga, porque limiar que separa dois valores iguais deixa de ser
critério e vira sorteio.

O ranking completo continua reservado para a futura página de dados. O recorte
está marcado como **proposta** na própria página.

## 9. Carcará

Uma assinatura na página, na **passagem de entrada** `CAMPO → MEDIDA` — o
momento em que a fotografia do campo vira quantidade declarada. A passagem de
saída, `MEDIDA → PESSOAS`, usa só grafismo cartográfico: fio e cruz de registro.

Isso respeita a regra de frequência da H3.5.1 e prova de novo que a
continuidade entre capítulos não depende do animal. Nenhum carcará no meio dos
dados.

Ele entra decorativo, com `alt=""`, `aria-hidden="true"` e `pointer-events:
none`, acompanhado da legenda "Carcará · grafismo da identidade". Um teste trava
a ausência de qualquer formulação que sugira avistamento, espécie encontrada ou
fauna do território.

## 10. Passagem H3 → H4

Texto proposto: **`Campo → Medida`**, com a ponte "O que a pesquisa observou em
campo volta aqui como quantidade declarada".

Ele comunica os três tempos pedidos — observação, sistematização, indicador —
sem banner e sem hero intermediário. É proposta editorial, como o título da
seção, e não foi promovido a definitivo.

## 11. Cor

Paleta inalterada, usada por semântica:

| Papel | Cor | Onde |
|---|---|---|
| eixo principal, série de receita | marca (teal) | pontos de receita, tiques, réguas, regras de leitura |
| segunda série | acento (barro) | losangos de despesa, barra de receita direta |
| superfície editorial | pedra | fundo da seção e realce de linha |

Cor nunca é o único canal: receita e despesa se distinguem por **forma** —
círculo e losango — antes de se distinguirem por cor, a legenda nomeia as duas
em texto, e o ranking escreve "receita direta" ou "receita indireta" ao lado de
cada atividade. Nada de arco-íris, nada de terceira cor decorativa.

## 12. Dark mode

Avaliado elemento a elemento, e não por inversão de fundo. O número monumental,
os fios, o eixo, os pontos, a tabela, a legenda, as fichas, o realce de hover, a
assinatura e as duas passagens foram conferidos nos dois temas.

As superfícies e os fios saem de `color-mix()` sobre papéis semânticos, então
acompanham o tema sem uma segunda tabela de valores. O resultado no escuro é
sóbrio: teal e barro sobre carvão, sem brilho e sem saturação de painel. Não
virou dashboard neon.

## 13. Densidade

O guia da H3.5.1 aplicado:

| Faixa | Onde, nesta seção |
|---|---|
| baixa | abertura editorial e leitura do dado |
| média | faixa de registros, tabela, ranking |
| alta | passagens de entrada e saída, número protagonista, série mensal |

A página alterna: abertura, impacto, explicação, densidade de dados, respiro,
continuação. Ela não é uniformemente intensa, e é essa alternância que separa
seção editorial de painel.

## 14. Movimento e microinterações

Reveal reutiliza **a mesma ilha cliente da H3.5.1**, que foi generalizada para
aceitar outra raiz e outro escopo. Os padrões preservam o comportamento do
laboratório de linguagem, e os testes daquela fase passaram sem alteração.
Nenhuma segunda infraestrutura, nenhuma ilha nova, nenhuma biblioteca.

| Alvo | Resposta | Propriedades animadas |
|---|---|---|
| Link | cor, sublinhado, marcador | `color`, `text-underline-offset`, `transform` |
| Linha de ficha | borda esquerda na marca, fundo com tinta | `border-left-color`, `background-color` |
| Mês do gráfico | atenuação dos demais, conector mais grosso | `opacity`, `stroke-width` |
| Linha da tabela | fundo com tinta | `background-color` |
| Blocos | entrada única de 240 ms | `transform`, `opacity` |
| Conector e pontos | entrada de 360 ms no total | `stroke-dashoffset`, `opacity` |

`transition: all` não existe aqui. Nenhum laço, nenhum parallax, nenhum cursor
customizado, nenhum contador rolando.

## 15. Performance

| Medida | H4.0 | H4.5 |
|---|---:|---:|
| Dataset | 12.526 B | 12.526 B, o mesmo arquivo |
| CSS da composição | 9.197 B | 11.839 B da camada nova, mais 9.372 B herdados da H3.5.1 |
| Ilhas cliente acrescentadas | 0 | **0** |
| Arquivos com `"use client"` no repositório | 7 | 7 |
| JavaScript estático da rota | 552.767 B | **552.767 B**, o mesmo |
| Dependências novas | 0 | **0** |
| Nós de DOM da rota | 532 | 379 |
| Nós dentro de SVG | 82 | 60 |

A rota nova carrega exatamente o mesmo JavaScript compartilhado que a original.
**Zero bytes acrescentados** não é estimativa: uma varredura nos `chunks`
estáticos do build de produção não encontra `CSS_DOS_DADOS_VIVOS`,
`dv-registro-indicador`, `REALCE_POR_MES`, `LIMIAR_DE_DIAS` nem
`ATIVIDADES_ACIMA`. A composição, a gramática, o limiar do ranking e as doze
regras de realce são todos de servidor.

A comparação de DOM não é inteiramente justa: a rota da H4.0 renderiza **dois**
presets, e a da H4.5 renderiza um. Ainda assim ela mostra que a composição nova
não inflou a árvore.

A Home não foi degradada porque não foi tocada.

## 16. Acessibilidade

Conferido em 320, 375, 768 e 1440 px, nos dois temas:

- **sem transbordo horizontal** em nenhuma combinação, e com zoom de 200% a
  720 px;
- **o número e a tabela existem em toda largura** — o teste de viewport confere
  os dois em cada combinação;
- **gráfico com alternativa textual real**: `role="img"`, `<title>` e `<desc>`
  com conteúdo, não `aria-label="gráfico"`. A descrição diz o que é cada marca e
  aponta a tabela;
- **abaixo de 40rem de container o desenho some** e a tabela fica sozinha, como
  na H4.0: texto de 12 unidades num `viewBox` de 720 fica ilegível antes disso;
- **teclado**: o primeiro Tab mostra foco visível, o link para a rota original
  tem contorno de 3 px, e a tabela é o caminho para o mês a mês;
- **decorativos**: assinatura, fios e cruz de registro com `aria-hidden="true"`
  e `pointer-events: none`;
- **nada depende de cor** nem de hover;
- **movimento reduzido**: nada anima, nada fica invisível, nenhum bloco perde
  conteúdo.

## 17. Mobile

Recomposição, não miniaturização. A ordem no celular é a ordem de prioridade
pedida:

1. número protagonista;
2. definição — o que o número mede e o que não mede;
3. base e metodologia;
4. indicadores secundários, em coluna única com seus tiques;
5. gráfico — ausente abaixo de 40rem, por ilegibilidade;
6. tabela, com todos os valores.

O fio de continuidade é suprimido abaixo de 768 px, por falta de margem para
ele existir sem disputar com o texto. A régua da leitura do protagonista vira
borda superior em vez de lateral. As fichas passam a uma coluna.

## 18. Comparação H4.0 A × H4.5

| Pergunta | Resposta |
|---|---|
| ficou mais vivo? | sim: passagens, fio de continuidade, entrada do gráfico e realce de mês deram resposta onde antes havia página estática |
| ficou menos SaaS? | sim: a grade de células com borda saiu e virou faixa pendurada num eixo; não há cartão, sombra, pílula, ícone nem moldura |
| aumentou clareza? | sim em dois pontos: período e recorte deixaram de se repetir sete vezes, e o realce liga desenho e tabela |
| piorou leitura? | não que se tenha medido; o teste de transbordo e o de legibilidade do gráfico cobrem as quatro larguras |
| números continuam protagonistas? | sim: o 93,4% é o maior elemento da página, e os grafismos são todos hairline |
| o sistema gráfico compete com o conteúdo? | não: nenhum grafismo tem cor cheia, e o único elemento figurativo está fora da área de dados |
| há enfeite sem função? | a cruz de registro da passagem de saída é o candidato mais fraco: ela marca o encontro entre capítulos e não carrega informação. Fica registrada como ponto a revisar |

## 19. Testes

| Gate | Resultado |
|---|---|
| `pnpm tipos` | passa |
| `pnpm lint` | passa, com os mesmos 4 avisos de prioridade forçada já conhecidos |
| `pnpm teste` | 478 passam, 3 pulados |
| `pnpm a11y` | 256 passam |
| `pnpm build` | passa; 25 rotas estáticas |
| `pnpm pendencias` | **não atestado** — sem `DATABASE_URL` nesta máquina, nada foi consultado |
| Lighthouse | **não executado** — continua indisponível no ambiente, e nada foi instalado para simular |

Testes novos desta fase, em `testes/dados-vivos.test.ts` e
`testes/a11y/dados-vivos.spec.ts`:

- guarda de produção nas duas pontas;
- cada um dos oito indicadores aparece com o mesmo valor formatado na H4.5 e na
  H4.0;
- base, período, recorte e regra não foram reescritos;
- tabela e gráfico descrevem a mesma série, com um grupo e uma linha por mês;
- a tabela não é condicional no servidor;
- nenhum identificador da fonte restrita e nenhum dado pessoal no HTML;
- o título editorial continua marcado como proposta;
- o limiar do ranking seleciona o que promete, não corta empate e não some com
  atividade sem contá-la;
- as quatro famílias de grafismo aparecem, e a assinatura aparece uma vez, na
  passagem de entrada;
- o carcará não é apresentado como dado territorial;
- nenhum arquivo da H4.0 menciona a H4.5, e a composição original continua
  renderizando como antes;
- nenhum número escrito à mão no JSX;
- quatro larguras por dois temas, sem transbordo, com número e tabela presentes;
- gráfico visível só onde seu texto é legível;
- alternativa textual real, sem elemento focável dentro do desenho;
- realce liga desenho e tabela sem esconder dado;
- teclado, foco e decorativos sem interceptação;
- zoom de 200%;
- entrada curta, única, sem laço, terminando opaca;
- movimento reduzido sem animação e sem sumiço;
- sem recurso externo, fora do sitemap, bloqueada no robots;
- a Home e a H4.0 continuam como estavam.

## 20. Inspeção visual

Capturas de página inteira **e de viewport**, porque o cabeçalho é fixo:

- H4.5 em 1440 claro, 1440 escuro, 768 claro, 375 claro, 375 escuro e 320
  claro;
- H4.0 A em 1440 claro, para comparação;
- gráfico em estado normal e em estado selecionado;
- passagem `CAMPO → MEDIDA` isolada;
- página inteira com movimento reduzido.

Os PNGs ficam fora do repositório. A prova versionada são os testes.

## 21. Riscos e pendências

1. **A escolha entre A e B da H4.0 continua aberta**, e agora há um terceiro
   material na mesa. A H4.5 não decide integração: ela mostra como a seção se
   parece dentro da linguagem.
2. **Título editorial** — "Onde o recurso circula" continua proposta.
3. **Texto da passagem** — "Campo → Medida" continua proposta.
4. **Recorte do ranking** — o limiar de dez dias é derivável, mas o número dez
   é escolha editorial e está marcado como proposta.
5. **Citação pública da fonte** — segue pendente da H4.0: como um número de
   prestação de contas cita um conjunto documental que continua restrito.
6. **Conciliação do público** e **autorremuneração do gestor** — continuam
   travando cinco e dois indicadores candidatos, respectivamente.
7. **Cruz de registro da passagem de saída** — o grafismo mais frágil da
   composição, registrado em §18 como ponto a revisar.
8. **Lighthouse** — continua exigido e não executável; a dívida segue para a H7.
9. **Orçamento de peso da Home** — a Home já está acima do referencial de
   500 kB, e a H4 ainda não entrou nela.
