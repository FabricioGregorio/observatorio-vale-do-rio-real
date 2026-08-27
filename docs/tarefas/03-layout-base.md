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

## Fora de escopo

Conteúdo das páginas internas.
