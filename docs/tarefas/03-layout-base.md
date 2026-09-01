# TAREFA 03 — Layout base, navegação e créditos de fomento

**Fase:** 1 · **Depende de:** 02 · **Estimativa de diff:** médio

## Objetivo

Esqueleto acessível de todas as páginas: cabeçalho, navegação, rodapé com créditos
obrigatórios do edital e tratamento de erro.

## Contexto obrigatório

- `docs/01-arquitetura-informacao.md`, seções 3 e 7
- `docs/03-guia-implementacao.md`, seção 3

## Arquivos permitidos

```
src/app/layout.tsx  src/app/error.tsx  src/app/not-found.tsx
src/componentes/layout/*  src/lib/navegacao.ts  public/marcas/*
src/app/<rota>/page.tsx  (stubs mínimos, ver seção de typedRoutes)
```

## Critérios de aceite

- [ ] Menu principal com exatamente seis itens: O Observatório · A Pesquisa · Dados ·
      Diário de Campo · PodObservar · Educação
- [ ] Rodapé com Prestação de Contas, Imprensa, Acessibilidade, Privacidade, Contato
      e o bloco de créditos de fomento (PNAB / Lei Aldir Blanc, Ministério da Cultura,
      Governo Federal, Governo de Sergipe, FUNCAP)
- [ ] Link "Pular para o conteúdo" como primeiro elemento focável
- [ ] `<html lang="pt-BR">`; um único `<h1>` por página; `<main id="conteudo">`
- [ ] Menu mobile operável por teclado, com `Esc` fechando e foco retornando ao gatilho
- [ ] `not-found.tsx` oferece caminho para a Sala do Avaliador e para a busca
- [ ] Marcas em SVG, com proporções conforme o manual do edital

## Como verificar

```bash
pnpm a11y && pnpm verificar
```

Se o manual de aplicação de marcas ainda não estiver disponível, **parar e perguntar** —
não estimar proporção nem ordem das marcas.

## Rotas inexistentes e `typedRoutes` — decidido em 2026-09-01

O `next.config.ts` tem `typedRoutes: true`. A documentação do Next instalado diz que
ele gera as tipagens de rota a partir das rotas **existentes**, e que strings literais de
`href` são validadas. O cabeçalho tem seis destinos e o rodapé cinco; hoje só existe
`/`. Sem tratamento, os onze `<Link>` reprovam em `pnpm tipos`.

**Decisão: criar stubs mínimos** para as rotas que ainda não existem.

- **Proibido** `as Route` — anularia a proteção que o `typedRoutes` existe para dar, e
  fica a um passo do `@ts-ignore` que o AGENTS.md proíbe.
- **Proibido** desligar `typedRoutes`.
- O stub tem apenas **estrutura técnica**: um `<h1>` e um estado vazio explícito.
  **Nenhum conteúdo institucional inventado** — nada de texto de apresentação, missão,
  descrição de seção ou dado de pesquisa. Conteúdo ausente é ausência declarada, nunca
  placeholder plausível (AGENTS.md).

Rotas que recebem stub: `/observatorio`, `/pesquisa`, `/dados`, `/campo`,
`/podobservar`, `/educacao`, `/prestacao-de-contas`, `/imprensa`,
`/acessibilidade`, `/privacidade`, `/contato`.

O stub de `/prestacao-de-contas` é substituído pela Tarefa 08.

## Fatiamento decidido em 2026-08-31

O manual de aplicação de marcas do edital — item **E02** do inventário, status
`Pendente`, sem link — não existe ainda. A tarefa **não fica parada por causa dele**.

**Nesta fatia entra tudo o que não depende do manual:** cabeçalho, navegação, rodapé,
skip link, menu mobile operável por teclado, `error.tsx`, `not-found.tsx`,
acessibilidade e responsividade.

**Fica explicitamente pendente, e não é implementado:**

- `public/marcas/*` — os SVG das marcas;
- o bloco de créditos de fomento no rodapé (PNAB / Lei Aldir Blanc, Ministério da
  Cultura, Governo Federal, Governo de Sergipe, FUNCAP).

**Não inventar logo, proporção, ordem nem texto de crédito.** O rodapé reserva o espaço
do bloco com um comentário apontando para esta pendência; nada de placeholder visual que
possa ser confundido com a marca real. Num edital, crédito de fomento errado é causa
recorrente de ressalva.

A pendência se encerra quando o E02 for obtido e o inventário atualizado por decisão
humana.

## Fora de escopo

Conteúdo das páginas internas.
