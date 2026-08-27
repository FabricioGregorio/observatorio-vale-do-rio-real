# TAREFA 02 — Tokens, tipografia e página de referência visual

**Fase:** 1 · **Depende de:** 01 · **Estimativa de diff:** pequeno

## Objetivo

Sistema visual carregado e demonstrável, servindo de referência para todas as telas seguintes.

## Contexto obrigatório

- `docs/03-guia-implementacao.md`, seção 3
- `src/estilos/tokens.css` (já existe — **não reescrever a paleta**)

## Arquivos permitidos

```
src/estilos/tokens.css  (apenas acréscimos, nunca troca de valores)
src/app/layout.tsx
src/app/dev/estilos/page.tsx
```

## Critérios de aceite

- [ ] Archivo, Literata e IBM Plex Mono carregadas via `next/font` com `display: swap`
      e subconjunto `latin-ext` (diacríticos do português)
- [ ] `/dev/estilos` mostra paleta, escala tipográfica, estados de foco, `.meta-ficha`
      e `.numeral-ficha`
- [ ] A página exibe a razão de contraste calculada de cada par de cores em uso
- [ ] `--color-destaque` não aparece como cor de texto sobre fundo claro em lugar nenhum
- [ ] `/dev/estilos` é excluída do sitemap e marcada `noindex`

## Como verificar

```bash
pnpm dev   # abrir /dev/estilos, navegar só por Tab e conferir o foco em cada elemento
pnpm verificar
```

## Fora de escopo

Cabeçalho, rodapé e qualquer página pública.
