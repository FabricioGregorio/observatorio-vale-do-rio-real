# TAREFA 12 — Home: integrar Dados vivos / "Onde o recurso circula" (H4.1)

**Fase:** Home · **Depende de:** 10, 11 · **Estimativa de diff:** pequeno

## Objetivo

Integrar à Home a composição candidata já aprovada na H4.5.2, hoje existente
somente em `/dev/dados-vivos`, **sem reabrir decisão editorial, sem recalcular
número e sem alterar o dataset factual da H4.0**.

Esta tarefa é integração, não exploração. Nenhuma decisão visual ou editorial
nova é tomada aqui.

## Baseline Git

| | |
|---|---|
| Branch | `feat/home-indicadores` |
| HEAD observado no planejamento | `f5da7c66a8191e0d56f20e9683262369640886ed` |
| Working tree | limpo, exceto `docs/handoff/` não rastreado e preexistente |

O bloqueio técnico anterior foi removido pela Tarefa 11: a migração `0008`
alinhou `vw_pendencia_publicacao` ao modelo multiarquivo e o gate real está
verde.

## Contexto obrigatório

- `docs/frontend/H4_5_2_FECHAMENTO_EDITORIAL_DADOS.md` — **autoridade editorial
  desta seção**. Fecha título, seleção de indicadores, copies e ranking.
- `docs/frontend/H4_DADOS_INDICADORES_PROTOTIPO.md` — **autoridade factual**
  (H4.0): valores, bases, períodos, recortes, regras e arredondamentos.
- `docs/frontend/H3_5_1_CONSOLIDACAO_SISTEMA_GRAFICO.md` — **autoridade
  visual**: as quatro famílias de grafismo, densidade, movimento e o teto de
  uma assinatura de identidade por página.
- `docs/frontend/PLANO_HOME_PILOTO_1_0.md` §6.1 e §6.2 — ordem canônica das
  seções da Home e a temperatura da seção `03 — Dados`.
- `docs/frontend/H3_INTEGRACAO_PESQUISA_HOME.md` — **precedente direto**: é
  exatamente este o padrão de integração a repetir.
- `docs/frontend/DIRECAO_VISUAL_FRONTEND_1_0.md` — §9 (ordem), §11.1 (carcará),
  §12.1 (movimento 4–5/10).

Não é necessário reabrir H4.5, H4.5.1, auditorias antigas, `docs/historico/`,
ADRs de banco, migrations nem scripts de publicação.

## Estado atual verificado no repositório

### O que existe na Home hoje

`src/app/page.tsx` renderiza, nesta ordem: `CabecalhoPrototipo` →
`HeroManifesto` (H1) → `SecaoMapa` (H2) → `PesquisaEmCampo` (H3) →
`CaminhosPrioritarios` + `ChamadaAcervo`.

A Home **não carrega** hoje a gramática da H3.5.1: `CSS_DA_LINGUAGEM` e
`RevelacaoVisual` só aparecem em `src/app/dev/linguagem-visual/page.tsx` e
`src/app/dev/dados-vivos/page.tsx`, e nenhum componente da Home usa classe
`lv-*` ou `data-preset="B"`.

### O que existe somente em DEV

`src/app/dev/dados-vivos/page.tsx` já separa com clareza o que é laboratório do
que é candidato:

| Bloco | Natureza |
|---|---|
| `<DadosVivos />` | **composição aprovada** — é o que vai para a Home |
| `.lv-abertura`, `.lv-controles`, `CentralAcessibilidade`, ressalvas | casca de DEV |
| `.dv-preview__marca` ("Início/Fim da composição candidata") | casca de DEV |
| `.dv-laboratorio` com `FaixaDeRegistros` reservados e `RankingEditorial` | material reservado — **permanece só no laboratório** |

### O que será reutilizado, e não recriado

`DadosVivos` é Server Component, sem `"use client"`, e já resolve tudo a partir
do dataset. **Ele é reaproveitado como está**, com uma única mudança de
comportamento: ganhar um parâmetro `contexto`, como
`PesquisaEmCampoPrototipo` já faz. Não pode existir uma segunda implementação
da seção para a Home.

## Decisões fechadas — não reabrir

| Item | Decisão |
|---|---|
| Título | **"Onde o recurso circula"** — aprovado pelo responsável em 12/09/2026 |
| Protagonista | **H4-001**, resolvido por `porId("H4-001")`, exibido por `exibirIndicador()` |
| Apoio, nesta ordem | **H4-003**, **H4-004**, **H4-005**, **H4-008** — `APOIO_DA_HOME` |
| Fora da Home | **H4-002**, **H4-006**, **H4-007** — `RESERVADOS_AO_CONJUNTO` |
| Entrada | rótulo `Campo → Medida`; "Os registros da pesquisa também permitem uma leitura quantitativa do território" |
| Saída | rótulo `Medida → Conjunto completo`; "Esta leitura apresenta um recorte. O levantamento completo preserva o detalhamento das atividades registradas" |
| Ranking | **fora da Home**, sem substituto, sem top-3, sem resumo compacto |
| Link para `/dados` | **não existe** — a saída permanece textual enquanto a rota não cumprir a promessa |
| Gramática visual | herdada da H3.5.1; **nenhuma linguagem nova** |
| Carcará | **um só**, na passagem de entrada, como já está |

Copy, ordem e rótulos não são reescritos nesta tarefa.

## A. Onde H4 entra na Home

O `PLANO_HOME_PILOTO_1_0.md` §6.1 fixa a ordem canônica: `01 — Território`,
`02 — Pesquisa em campo`, **`03 — Dados`**, `04 — Pessoas`… O componente já
rotula a seção como `03 — Dados`, coerente com `01 — Território` e
`02 — Pesquisa em Campo` usados nos laboratórios correspondentes.

**Ponto de inserção:** em `src/app/page.tsx`, **depois** de `<PesquisaEmCampo />`
e **antes** do bloco `CaminhosPrioritarios` + `ChamadaAcervo`. Nenhum capítulo é
reordenado.

## B. O que precisa ser extraído — e só isso

Três separações mínimas, todas com precedente na H3:

1. **`contexto` em `DadosVivos`.** Assinatura análoga à de
   `PesquisaEmCampoPrototipo`: `contexto: "prototipo" | "home"`, default
   `"prototipo"`. No contexto `home`, o rótulo `Título editorial · proposta`
   **não é renderizado** — ele é vocabulário de laboratório e a aprovação do
   título em 12/09/2026 o tornou obsoleto.

2. **Divisão do CSS.** `CSS_DOS_DADOS_VIVOS` mistura hoje regras da composição
   com regras exclusivas do laboratório. Separar, como
   `estilosDaPesquisa.ts` já faz com `CSS_DA_PESQUISA` /
   `CSS_DO_LABORATORIO_DA_PESQUISA`. Ficam do lado do laboratório, no mínimo:
   `.dv-proposta`, `.dv-preview`, `.dv-preview__marca`, `.dv-laboratorio` (e
   descendentes), `.dv-reservados` e
   `.dv-faixa[data-variante="reservados"] .dv-faixa__lista`.

   **Isto não é preferência de organização.** `testes/a11y/home.spec.ts:273`
   já afirma que o conteúdo servido da Home não pode casar com
   `/proposta|somente DEV/i` — "nem como classe morta no CSS embutido". A regra
   `.dv-proposta` está em `estilos.ts:78`: enviá-la à Home **quebra um teste
   que já existe**.

3. **Entrega do CSS e da ilha de revelação à Home.** A composição depende de
   `CSS_DA_LINGUAGEM` (famílias `lv-g-*`, `lv-fio`, `lv-ponte`, `lv-origem`,
   `lv-revelar`) e da parte pública de `CSS_DOS_DADOS_VIVOS`. Os tokens
   `--lv-*` e `--largura-conteudo` **já estão em `src/estilos/tokens.css`** e
   não precisam de nada. A implementação decide se injeta `CSS_DA_LINGUAGEM`
   inteiro ou apenas as famílias usadas — e **mede a diferença**.

   A raiz precisa carregar a classe `dados-vivos`: as regras de revelação e de
   movimento reduzido são escopadas em `.dados-vivos .lv-revelar…`. O `article`
   conserva `data-preset="H4.5"`, que é o que mantém as regras
   `[data-preset="B"]` da H3.5.1 fora desta composição.

   `RevelacaoVisual` **não precisa de alteração**: já aceita `raiz` e `escopo`
   por propriedade. Na Home, usar `escopo=""` e a `raiz` da seção, como o
   laboratório faz.

4. **Entrada pública.** Um componente fino em `src/componentes/dados/`,
   no molde de `src/componentes/pesquisa/PesquisaEmCampo.tsx` (14 linhas), que
   fixa `contexto="home"`. A Home importa a entrada pública, nunca o
   componente de laboratório.

Nada além disso é refatorado. `FaixaDeRegistros`, `SerieViva`,
`selecaoEditorial.ts`, `RankingEditorial` e `RevelacaoVisual` ficam como estão.

## C. Fonte dos dados

Fluxo real, verificado, que a implementação deve preservar sem desvio:

```
src/dados/indicadores/derivados.ts     INDICADORES, CONTEXTO_DOS_DADOS, SERIE_MENSAL
        ↓                               (autoridade factual H4.0)
selecaoEditorial.ts                     APOIO_DA_HOME → REGISTROS_DE_APOIO, por porId()
        ↓                               (autoridade editorial H4.5.2)
DadosVivos.tsx                          porId("H4-001"), exibirIndicador(), CONTEXTO_DOS_DADOS.*
        ↓                               (composição H3.5.1)
src/app/page.tsx                        Home
```

**Nenhum número é duplicado, e nenhum valor pode entrar literal no JSX.** Todo
valor, unidade, base, período, recorte e regra continua resolvendo do dataset.
Alterar qualquer número é outra tarefa, com auditoria própria.

## Arquivos permitidos

```
src/app/page.tsx                                        inserir a seção; atualizar o docstring
src/componentes/dados/SecaoDados.tsx                    NOVO — entrada pública, fixa contexto="home"
src/componentes/prototipo/dadosvivos/DadosVivos.tsx     prop `contexto`; rótulo condicional; injeção de CSS
src/componentes/prototipo/dadosvivos/estilos.ts         divisão CSS público / CSS de laboratório
src/app/dev/dados-vivos/page.tsx                        só o necessário para o laboratório seguir idêntico
testes/home.test.ts                                     fiação da seção
testes/a11y/home.spec.ts                                comportamento na Home
testes/dados-vivos.test.ts                              tornar as asserções de rótulo sensíveis ao contexto
testes/a11y/dados-vivos.spec.ts                         idem, na rota de laboratório
```

O docstring de `src/app/page.tsx` afirma hoje que "o painel de indicadores
segue igualmente ausente — a tabela `indicador` só chega na Tarefa 13". Isso
ficou superado: a H4.0 produziu agregado em TypeScript e **nenhuma tabela
`indicador` é criada por esta tarefa**. O texto precisa dizer o que passa a ser
verdade, sem prometer persistência que não existe.

## Arquivos proibidos

H4.1 **não toca**: banco, migrations, `db/`, `scripts/`, gate de pendências,
ADR-016, `docs/decisoes/`, `docs/02-arquitetura-banco.md`, dataset factual
(`src/dados/indicadores/`), `src/estilos/tokens.css`, `src/componentes/prototipo/dados/`
(H4.0, que segue intacta em `/dev/dados`), `src/componentes/prototipo/linguagem/`,
`src/componentes/hero/`, `src/componentes/territorio/`,
`src/componentes/pesquisa/`, `.github/`, documentação histórica, storage/R2,
Vercel e DNS. Nenhuma dependência é instalada.

## Critérios de aceite

### Conteúdo e dados

- [ ] A Home mostra o título **"Onde o recurso circula"**, o protagonista
      H4-001 e exatamente **quatro** indicadores de apoio, na ordem H4-003,
      H4-004, H4-005, H4-008
- [ ] H4-002, H4-006 e H4-007 **não aparecem** na Home
- [ ] Ranking, limiar de dias e qualquer resumo compacto **não aparecem** na Home
- [ ] Copies de entrada e saída idênticas às aprovadas, sem link para `/dados`
- [ ] Nenhum valor literal no JSX: todo número resolve do dataset
- [ ] Nenhum identificador de fonte restrita, nome de aba, código interno ou
      dado pessoal no HTML servido
- [ ] Um único carcará na Home inteira, na passagem de entrada

### Laboratório preservado

- [ ] `/dev/dados-vivos` continua 404 em produção e renderiza o mesmo conteúdo
      de antes, incluindo o material reservado e o rótulo de proposta
- [ ] `/dev/dados` (H4.0) permanece **sem uma linha alterada**

### Sem vocabulário de desenvolvimento

- [ ] O conteúdo servido da Home não casa com `/proposta|somente DEV/i` —
      **nem no texto, nem no CSS embutido** (`testes/a11y/home.spec.ts:273`)

### Responsividade, tema e movimento

- [ ] Sem transbordo horizontal em **320 px, 375 px, 768 px e 1440 px**, medido
      por `documentElement.scrollWidth` contra `clientWidth`, como os testes
      existentes de viewport já fazem
- [ ] A seção não fica duplamente restringida: `.dados-vivos` já define
      `max-width: var(--largura-conteudo)`
- [ ] Contraste AA nos temas **claro e escuro**
- [ ] Com `prefers-reduced-motion: reduce`, nada anima, nada se desloca e nada
      some
- [ ] Com JavaScript desabilitado a seção continua legível e completa: as
      regras de revelação só se aplicam sob `[data-revelado]`

### Acessibilidade e semântica

- [ ] Um `h1` só na Home; a seção entra como `h2` com `aria-labelledby`, e os
      títulos internos descem a partir dele, sem salto de nível
- [ ] A tabela de valores exatos da série continua **sempre no DOM**, em
      qualquer largura, e é o caminho de teclado
- [ ] O realce por mês continua sem JavaScript e atenuar não esconde
- [ ] Foco visível preservado; nenhuma informação depende só de cor ou hover

### Performance

- [ ] Peso da Home **medido antes e depois**, pelo mesmo método, e registrado
- [ ] Nenhuma dependência nova; nenhuma biblioteca de gráfico
- [ ] Qualquer aumento de JavaScript de cliente é declarado e justificado
- [ ] O CSS acrescentado é medido em bytes e registrado

### Sem regressão

- [ ] H1, H2 e H3 inalterados na Home — nenhuma classe `lv-*` passa a atingi-los
- [ ] A suíte inteira passa, e nenhum teste existente é enfraquecido para
      acomodar a mudança

## Como verificar

```bash
pnpm teste testes/home.test.ts testes/dados-vivos.test.ts
pnpm a11y
pnpm build
pnpm verificar
```

**Ressalva conhecida, já registrada na Tarefa 11:** o subpasso `pendencias` de
`pnpm verificar` não carrega `.env.local` e declara "DATABASE_URL ausente...
este resultado não atesta nada". Isso é dívida do gate, **não falha de
frontend**, e não deve ser confundido com problema desta tarefa. H4.1 não toca
banco: não há por que consultar o gate aqui.

A medição de peso não tem comando de projeto — as fases anteriores mediram à
mão sobre o artefato de `pnpm build`. Usar o mesmo método antes e depois, e
declarar qual foi.

## Performance — baseline registrado

Os números abaixo vêm da documentação das fases anteriores e **não foram
remedidos na rodada de planejamento**:

| | |
|---|---|
| Referência operacional | **500 kB** |
| Home após H3, 1440 px | ~**797.392 B** — já acima da referência |
| Home após H3, 375 px | ~**609.512 B** |
| Contribuição atual da H4 | **0 B** — não integrada |

O laboratório não acrescentou dependência nem JavaScript próprio. Não há
biblioteca de gráfico no `package.json`: a série é SVG no servidor e o realce
por mês é `:has()` com `data-mes`.

**O critério não é ficar abaixo do orçamento** — o baseline já está acima.
O critério é: **H4.1 não pode piorar silenciosamente a dívida; todo aumento
precisa ser medido e justificado.** Não declarar conformidade por estimativa.

Risco específico a medir: `RevelacaoVisual` seria a primeira ilha cliente desse
tipo na Home, e `CSS_DA_LINGUAGEM` tem ~9,5 kB dos quais a Home usaria uma
fração.

## Acessibilidade — o que já existe e deve ser preservado

Não inventar requisito: o laboratório já prova estes mecanismos, e eles devem
chegar à Home sem perda — tabela de valores exatos sempre no DOM como caminho
de teclado; realce por mês sem JavaScript, atenuando sem esconder; rótulo do
mês em opacidade cheia, porque contraste de texto não pode depender do
ponteiro; conteúdo visível sem a ilha cliente; bloco de `prefers-reduced-motion`
já escrito para `.dados-vivos`; tokens de tema já globais.

## Ampliação de escopo — 2026-09-12

Durante a implementação, dois testes preexistentes **fora da lista acima** se
revelaram codificando explicitamente o estado anterior à H4.1:

- `testes/a11y/dados-prototipo.spec.ts` — "a Home continua sem a seção de
  dados";
- `testes/a11y/linguagem-visual.spec.ts` — "a Home não recebe nada do
  laboratório", provado por proibição global da gramática na página.

As duas proposições eram verdadeiras enquanto H3.5.1 e H4 viviam só em
laboratório, e a integração autorizada as invalida por definição. A
implementação parou antes de tocá-los e devolveu a decisão ao responsável.

**Instrução humana desta data** autorizou atualizar os dois arquivos
**exclusivamente** para substituir as invariantes históricas por invariantes de
integração controlada e de escopo da gramática — nada foi removido, e o
contrato novo é mais forte que o anterior: a gramática pode existir na Home,
mas confinada a `#secao-dados-home`, com H1–H3 provadamente livres dela e a
casca do laboratório fora da página.

## Regra de parada

Parar e devolver ao humano se a integração exigir alterar o dataset factual,
inventar ou recalcular indicador, reabrir copy aprovada, instalar biblioteca de
gráfico, transformar `DadosVivos` em Client Component, criar rota nova, alterar
estruturalmente H1–H3, mudar tokens globais, alterar a arquitetura de
informação, criar link para uma `/dados` que ainda não cumpre a promessa, ou
tocar infraestrutura.
