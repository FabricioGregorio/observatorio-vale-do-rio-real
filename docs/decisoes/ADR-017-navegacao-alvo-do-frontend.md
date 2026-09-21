# ADR-017 — Navegação alvo do frontend 1.0

## Status

Aceita

## Data

2026-09-09

## Contexto

O `docs/01-arquitetura-informacao.md` §3 fixou, em 2025, um menu principal de seis
itens:

```
O Observatório · A Pesquisa · Dados · Diário de Campo · PodObservar · Educação
```

Ele está implementado em `src/lib/navegacao.ts` e coberto por teste.

A **Direção Visual Frontend 1.0** (`docs/frontend/DIRECAO_VISUAL_FRONTEND_1_0.md`
§8.3 e §29) aprovou um menu diferente:

```
Observatório · Território · Pesquisa · Dados · PodObservar · Acervo
```

O `PLANO_HOME_PILOTO_1_0.md` §8.1 registrou a divergência como bloqueio e devolveu a
decisão ao humano, porque alterar o doc 01 não é atribuição do agente (`AGENTS.md`,
hierarquia de fontes de verdade).

**O responsável pelo projeto decidiu, em 2026-09-09, que o menu da Direção Visual é o
alvo.** A decisão é posterior ao doc 01 e o supera nesse ponto. Esta ADR registra o
alvo, a diferença e — o que mais importa na prática — **como chegar lá sem produzir
link quebrado**.

### A restrição técnica que governa a transição

`next.config.ts` declara `typedRoutes: true`. Um `<Link href="/territorio">` para uma
rota que não existe **reprova em `pnpm tipos`**. As saídas conhecidas são todas
proibidas pelo `AGENTS.md`: `as Route` anula a checagem, e desligar `typedRoutes`
remove a garantia do projeto inteiro.

Hoje, em `src/app/`:

| Item do menu alvo | Rota | Existe? |
|---|---|---|
| Observatório | `/observatorio` | ✅ |
| Território | `/territorio` | ❌ **não existe** |
| Pesquisa | `/pesquisa` | ✅ |
| Dados | `/dados` | ✅ |
| PodObservar | `/podobservar` | ✅ |
| Acervo | `/acervo` | ❌ **não existe** |

Também existem hoje `/campo` (Diário de Campo) e `/educacao`, que saem do menu
principal mas **continuam existindo como rotas**.

## Decisão

### 1. Menu principal alvo

```
Observatório · Território · Pesquisa · Dados · PodObservar · Acervo
```

Seis itens — o teto cognitivo que o doc 01 §3 fixou continua valendo. O que muda é a
composição, não o tamanho.

**Acessibilidade** e **Prestação de Contas** permanecem utilidades isoladas, fora do
menu principal e com peso visual próprio (Direção Visual §8.3 e §13.2).

### 2. Diferença em relação à arquitetura anterior

| Antes (doc 01 §3) | Depois | Natureza da mudança |
|---|---|---|
| O Observatório | Observatório | rótulo encurtado |
| A Pesquisa | Pesquisa | rótulo encurtado |
| Dados | Dados | sem mudança |
| **Diário de Campo** | **Território** | item substituído |
| PodObservar | PodObservar | sem mudança |
| **Educação** | **Acervo** | item substituído |

`Diário de Campo` e `Educação` **não são descontinuados**. Eles saem do menu
principal; suas rotas continuam existindo e continuam alcançáveis. Onde exatamente
passam a ser referenciados é decisão de conteúdo das fases seguintes, não desta ADR.

### 3. Estratégia incremental — nenhuma rota falsa

A regra é única e não admite exceção:

> **Um item só entra no menu depois que a rota dele existe e entrega conteúdo real.**

Consequência direta para a fase H0: **nada de navegação muda agora**.
`src/lib/navegacao.ts` permanece exatamente como está, e o menu renderizado continua
sendo o do doc 01. A H0 é fundação de tokens e tema; ela não toca em navegação.

Ordem de adoção:

| Etapa | Pré-requisito | O que acontece |
|---|---|---|
| **H0** | — | nada muda na navegação |
| **H1** | rotas `/territorio` e `/acervo` criadas | menu passa ao alvo, `navegacao.ts` e doc 01 atualizados na mesma entrega |
| — | — | `/campo` e `/educacao` deixam o menu, continuam existindo |

**Criar a rota não é criar conteúdo inventado.** Uma rota nova entra como as outras
entraram na Tarefa 03: título e **estado vazio explícito**, sem texto institucional
aproximado. É o padrão que `/dados`, `/podobservar` e `/acessibilidade` já seguem.

### 4. Rotas ainda inexistentes

`/territorio` e `/acervo` precisam ser criadas antes da H1. Duas perguntas de conteúdo
ficam abertas e **não são decididas aqui**:

- `/territorio` é rota nova ou assume o lugar de `/mapa`, previsto no doc 01 §3 e nunca
  implementado?
- `/acervo` é rota nova ou a face pública de `/prestacao-de-contas/anexos`?

Qualquer das respostas é compatível com esta ADR. O que ela fixa é o **menu alvo** e a
**regra de não criar link quebrado**.

## Alternativas consideradas

- **Manter o menu do doc 01.** Contraria uma decisão humana explícita e posterior.
  Descartada.
- **Trocar o menu agora, na H0, com `as Route` nos dois itens sem rota.** Anularia a
  checagem de rotas do projeto inteiro para ganhar aparência antes de conteúdo, e
  entregaria dois links que levam a 404. Proibida pelo `AGENTS.md`.
- **Trocar o menu agora criando as duas rotas junto.** Tecnicamente possível, mas
  transforma a H0 — que é fundação de tokens e tema — em tarefa de navegação. Contraria
  o faseamento aprovado e o princípio de diff pequeno.
- **Menu com item desabilitado, sem link.** Um item de menu que não navega é ruído: o
  usuário tenta, nada acontece, e leitor de tela anuncia um destino que não existe.

## Consequências

Benefícios:

- a divergência entre o doc 01 e a Direção Visual deixa de ser um bloqueio silencioso
  e passa a ter alvo e sequência escritos;
- `typedRoutes` continua ligado, e continua sendo a rede que impede link quebrado;
- nenhuma rota falsa é criada para acomodar aparência.

Custos:

- o menu do site continua sendo o antigo até a H1, o que é uma inconsistência
  **visível e temporária** entre o site e a Direção Visual;
- `docs/01-arquitetura-informacao.md` §3 fica com um apontamento para esta ADR até que
  a H1 o atualize de fato. Duas versões da mesma decisão coexistem por um intervalo, e
  é justamente por isso que o apontamento é obrigatório: sem ele, a versão errada é
  obedecida sem ninguém perceber (doc 03 §4).

## Impacto técnico

Arquivos afetados **quando a H1 for executada**, não agora:

- `src/lib/navegacao.ts` — a lista de seis itens;
- `src/app/territorio/page.tsx` e `src/app/acervo/page.tsx` — rotas novas;
- `docs/01-arquitetura-informacao.md` §3 — mapa do site e menu;
- `testes/home.test.ts` — a igualdade entre rótulos de menu e de caminhos;
- `testes/a11y/titulos.spec.ts` — títulos únicos por rota.

Nesta rodada (H0) o único efeito é documental: o doc 01 §3 recebe o apontamento para
esta ADR.

## Relação com outras decisões

Não substitui nenhuma ADR. Supera `docs/01-arquitetura-informacao.md` §3 quanto à
**composição** do menu principal, preservando o teto de seis itens que aquele
documento fixou.

## Emenda — 2026-09-15

Por decisão humana posterior, a composição e o teto acima ficam superados, sem
apagar o histórico da transição anterior. A navegação principal candidata passa
de seis para **sete itens**, exatamente nesta ordem:

```
O Observatório · A Pesquisa · Território · Dados · Diário de Campo · PodObservar · Acervo
```

- `Território` e `Acervo` entram como itens principais somente junto de suas
  rotas públicas reais;
- `Diário de Campo` permanece no menu;
- `Educação` sai apenas do menu principal; `/educacao` não é apagada;
- rótulos, ordem e quantidade não podem ser reorganizados por preferência
  técnica ou alfabética;
- Prestação de Contas e Acessibilidade continuam como utilidades fora do menu
  principal.

A implementação permanece condicionada à validação do cabeçalho em 320, 375,
768, 900, 1024, 1280 e 1440 px, a 200% de zoom e por teclado. Se os sete itens
não couberem sem sobreposição, overflow, abreviação ou redução artificial da
fonte, a integração deve parar para nova decisão humana.

## Emenda — 2026-09-21

Por decisão humana, o **PodObservar** passa a item de primeiro nível da
navegação larga, à direita de "O Observatório" e à esquerda de "A Pesquisa", e
deixa o painel "Conteúdos". Ordem visível no cabeçalho largo:

```
O Observatório · PodObservar · A Pesquisa · Território · Dados · Conteúdos
```

O painel "Conteúdos" passa a conter só `Diário de Campo` e `Acervo`. O menu de
telas estreitas segue a mesma ordem lógica. O PodObservar tem uma única entrada
de navegação, e é ele — não "Conteúdos" — que marca a página atual em
`/podobservar` e nas páginas de episódio.

Para caber sem sobreposição, o espaço entre links e o respiro lateral de cada
link encolheram (`--topo-espaco-nav`, `--topo-padding-link`); corpo, peso e
fonte do texto não mudaram. Validado em 320, 375, 768, 900, 1024, 1280 e
1440 px e a 200% de zoom.
