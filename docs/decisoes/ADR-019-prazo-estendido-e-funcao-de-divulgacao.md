# ADR-019 — Prazo estendido e retomada da função de divulgação

## Status

Aceita

## Data

2026-09-17

## Contexto

O `docs/01-arquitetura-informacao.md` §0 abre com a leitura estratégica que
condiciona, pelo próprio texto, **todas as decisões de arquitetura** do
documento. A primeira das três observações diz:

> O cronograma do projeto já se encerrou. [...] Portanto o site **não é mais uma
> peça de divulgação em curso: é o repositório permanente e a prova documental do
> objeto executado**. Isso muda a prioridade: durabilidade e rastreabilidade dos
> links vêm antes de qualquer sofisticação visual.

Essa frase não é descritiva: ela é a justificativa explícita para subordinar
tudo que seja apresentação à rastreabilidade. Os objetivos O3 (PodObservar),
O4 (jovens do Ensino Médio) e O5 (devolver conhecimento ao território) — todos
de divulgação — ficaram, na prática, atrás de O1 e O2.

O `PLANO_EXECUCAO_OBSERVATORIO.md` §1, por sua vez, fixou duas datas:

| Data | O que era |
|---|---|
| 14/09/2026 | congelamento interno do site |
| 22/09/2026 | envio do pacote à FUNCAP |

O prazo de 14/09 existia para criar uma semana de folga entre o site pronto e o
envio oficial.

**O responsável pelo projeto informou, em 2026-09-17, que o prazo do site foi
estendido até 22/09/2026, e que o site é sim peça de divulgação da pesquisa, do
Observatório e do podcast produzido.**

A instrução é direta, do responsável humano, nesta sessão: é o item 1 da
hierarquia de fontes de verdade do `AGENTS.md`, e supera os documentos 01 e 03
nos pontos tratados aqui. Alterar o doc 01 não é atribuição do agente, e por
isso a mudança é registrada nesta ADR, no formato que o `AGENTS.md` determina.

## Decisão

### 1. O site tem duas funções, não uma

O site é, ao mesmo tempo:

- **repositório permanente e prova documental** do objeto executado — inalterado;
- **peça de divulgação** da pesquisa, do Observatório e do PodObservar.

A segunda função foi retomada; a primeira não foi rebaixada. Onde o doc 01 §0.1
afirma que a divulgação deixou de existir, vale esta ADR.

### 2. O que a hierarquia entre elas passa a ser

`durabilidade e rastreabilidade > sofisticação visual` deixa de ser regra geral e
passa a valer apenas onde houver **conflito real** entre as duas. Na ausência de
conflito, divulgação é objetivo de primeira ordem.

Nada nesta ADR autoriza flexibilizar:

- o fail-closed do plano §4 — nenhum item se torna `PUBLICAVEL` por omissão;
- a proibição de dado fictício do `AGENTS.md`;
- a exigência de transcrição vinculada a todo áudio;
- a estabilidade das URLs do acervo.

**Divulgação não é licença para preencher lacuna com conteúdo plausível.** Uma
seção sem fonte continua entrando como estado vazio explícito, ainda que isso
seja visualmente pior numa peça de divulgação.

### 3. Datas

| Data | O que é | Natureza |
|---|---|---|
| ~~14/09/2026~~ | ~~congelamento interno do site~~ | **superado por esta ADR** |
| **22/09/2026** | prazo do site **e** envio do pacote à FUNCAP | entrega oficial |

A folga de uma semana entre site pronto e envio deixou de existir: as duas datas
convergiram. Isso é um custo, e está registrado como tal abaixo.

### 4. Consequências de prioridade

Sobem de peso, por serem os objetivos de divulgação do doc 01 §1:

- **O3 — PodObservar.** `/podobservar` é hoje um stub de rota. A Home declara
  3 episódios publicados no Spotify e no YouTube, com título, duração, URL e
  transcrição `null` em `src/componentes/home/conteudo.ts`. É o produto mais
  divulgável do projeto e o mais incompleto no site.
- **O4 — trilha educativa** e **O5 — devolução ao território**.
- **Peso da Home.** O desvio registrado no `ESTADO_ATUAL_PROJETO.md` — 881.195 B
  contra a meta de 500 KB do doc 01 §7, dos quais 553.838 B são imagem — deixa de
  ser dívida tolerável. Numa peça de divulgação, a Home é a primeira tela de quem
  chega para conhecer a pesquisa, e quem chega por rádio ou escola chega em rede
  móvel.

### 5. O que esta ADR não decide

- Não decide o conteúdo editorial de nenhuma seção.
- Não altera o menu principal, que continua governado pela ADR-017 e sua emenda.
- Não reabre classificação documental: a decisão de 2026-09-16 sobre publicação
  do acervo permanece como está.

## Alternativas consideradas

- **Editar `docs/01-arquitetura-informacao.md` §0 diretamente.** Proibido pelo
  `AGENTS.md`: alterar os documentos 01 e 02 não é atribuição do agente, e o
  mecanismo previsto é exatamente a proposta em `docs/decisoes/`.
- **Corrigir só a tabela de datas do plano.** Deixaria o doc 01 §0.1 afirmando
  que o site não é peça de divulgação — a premissa que governa todo o resto do
  documento. É o pior dos dois mundos: prazo novo, prioridade velha.
- **Tratar a mudança como decisão apenas de conteúdo, sem registro.** O doc 03 §4
  já documenta o modo de falha: a versão errada é obedecida sem ninguém perceber.
  Um agente lendo o doc 01 §0 amanhã concluiria, corretamente pelo texto vigente,
  que divulgação não é prioridade.

## Consequências

Benefícios:

- os objetivos O3, O4 e O5 deixam de estar subordinados por uma premissa vencida;
- a meta de peso do doc 01 §7 recupera a força que sempre teve no papel;
- o prazo real do site passa a estar escrito onde os agentes leem.

Custos:

- **não há mais folga entre o site pronto e o envio à FUNCAP.** Qualquer atraso
  no site passa a ser atraso na entrega oficial, sem colchão;
- restam 5 dias corridos entre esta decisão e 22/09;
- o doc 01 §0.1 e §7 ficam com apontamento para esta ADR até que uma entrega os
  atualize de fato. Duas versões da mesma premissa coexistem por um intervalo, e
  é por isso que o apontamento é obrigatório;
- a divulgação amplia a superfície de conteúdo faltante que fica **visível ao
  público**, em vez de apenas registrada como pendência interna.

## Impacto técnico

Documental nesta rodada:

- `PLANO_EXECUCAO_OBSERVATORIO.md` §1 — tabela de datas;
- `ESTADO_ATUAL_PROJETO.md` — registro da decisão;
- `docs/01-arquitetura-informacao.md` §0 e §7 — apontamento para esta ADR.

Nas entregas seguintes, por prioridade:

- `src/app/podobservar/page.tsx` — hoje stub de rota;
- `src/componentes/home/conteudo.ts` — `PODOBSERVAR`, hoje com quatro campos `null`
  por episódio;
- imagens da Home, para a meta de 500 KB.

## Relação com outras decisões

Não substitui nenhuma ADR. Supera `docs/01-arquitetura-informacao.md` §0.1 quanto
à função do site, e `PLANO_EXECUCAO_OBSERVATORIO.md` §1 quanto ao prazo interno de
14/09/2026. Preserva integralmente o plano §4 (fail-closed), o plano §6
(consentimento) e as regras de integridade do `AGENTS.md`.
