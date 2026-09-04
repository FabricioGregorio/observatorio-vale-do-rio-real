# TAREFA 10 — Home v1 com painel de indicadores

**Fase:** 1 · **Depende de:** 03, 08 · **Estimativa de diff:** médio

## Objetivo

Porta de entrada que apresenta o Observatório e leva cada público ao seu destino em no
máximo dois cliques.

## Contexto obrigatório

- `docs/01-arquitetura-informacao.md`, seções 1, 2 e 8 (sugestão 3)
- `docs/03-guia-implementacao.md`, seção 3

## Arquivos permitidos

```
src/app/page.tsx  src/componentes/home/*
src/dados/consultas/indicadores.ts  content/paginas/home.mdx
```

## Decisões de preparação — 2026-09-02

- A Tarefa 10 adapta `src/app/page.tsx`. A migração da rota principal para um grupo
  `(site)` fica reservada a uma tarefa estrutural futura; `typedRoutes` permanece como
  está.
- `src/dados/consultas/indicadores.ts` não será criado antes da tabela `indicador`. Até
  a Tarefa 13, a seção de indicadores permanece ausente, sem números provisórios.
- `content/paginas/home.mdx` continua sendo o formato editorial previsto, mas
  `@next/mdx` não será instalado nesta preparação. Antes da implementação, é preciso
  confirmar se a Fase 2 já chegou ou aprovar outro formato de consumo.
- O texto institucional permanece bloqueado até ser fornecido pelo responsável do
  projeto ou haver autorização explícita para criar somente a estrutura sem conteúdo
  final.
- O comparativo entre municípios permanece pendente: não há fonte oficial aprovada
  para os dados comparativos, portanto a tabela não será implementada.
- Nenhum componente da Home será iniciado antes da aprovação desta preparação.

## Critérios de aceite

- [ ] Apresentação do Observatório e do Coletivo "Tobias, sou Eu!", com o comparativo
      entre Tobias Barreto, Itabaianinha e São Cristóvão
- [ ] Painel de indicadores lido da tabela `indicador` — nenhum número escrito no código
- [ ] Enquanto a tabela `indicador` não existir (tarefa 13), a seção não é renderizada;
      não usar número provisório
- [ ] Caminhos visíveis para Sala do Avaliador, PodObservar e A Pesquisa
- [ ] Abertura fiel à direção "arquivo vivo": sem número gigante com rótulo pequeno sobre
      gradiente, sem carrossel de logos, sem hero genérico
- [ ] Texto da home em `content/paginas/home.mdx`, escrito ou revisado por pessoa
- [ ] Lighthouse ≥ 90 nas quatro categorias, medido em 3G simulado

## Como verificar

```bash
pnpm build && pnpm a11y
```

> **Lighthouse CI: requisito mantido, temporariamente indisponível.** O critério de aceite
> acima continua valendo — o gate não foi cancelado nem rebaixado. Mas **não execute
> `pnpm exec lhci autorun`** até a implementação do item 26 do backlog (doc 03 §10,
> Fase 4): o pacote `@lhci/cli` não está instalado e o comando falha com
> `Command "lhci" not found`. Até lá, verifique com `pnpm build && pnpm a11y`. Contexto
> completo e o que falta além da dependência: `docs/divida-documental.md` §4.

## Fora de escopo

Mapa, podcast, glossário e qualquer página interna.
