# TAREFA 07 — Sala do Avaliador

**Fase:** 1 · **Depende de:** 03, 05, 06 · **Estimativa de diff:** médio

## Objetivo

A página mais importante do site: tudo que a FUNCAP precisa, em um lugar, sem login e
sem link quebrado.

## Contexto obrigatório

- `docs/01-arquitetura-informacao.md`, seção 4
- `docs/02-arquitetura-banco.md`, seção 13

## Arquivos permitidos

```
src/app/prestacao-de-contas/page.tsx
src/app/prestacao-de-contas/imprimir/page.tsx
src/componentes/acervo/TabelaAnexos.tsx
src/dados/consultas/anexos.ts
src/app/api/anexos/route.ts
```

## Critérios de aceite

- [ ] Tabela com item do edital, descrição, formato, link permanente, link de origem,
      data de publicação e SHA-256, alimentada por `vw_anexo_publico`
- [ ] Tabela real (`<table>` com `<caption>` e `<th scope>`), navegável por leitor de tela;
      em telas estreitas vira lista de fichas sem perder a semântica
- [ ] SHA-256 truncado na exibição, com valor integral copiável
- [ ] Botão "Baixar tudo (.zip)" gerado em build, não sob demanda
- [ ] Versão imprimível em `/prestacao-de-contas/imprimir`, com folha de estilo de impressão
- [ ] `/anexos.json` servindo o mesmo conjunto, com `Content-Type: application/json`
- [ ] Página gerada estaticamente; nenhuma consulta em tempo de requisição
- [ ] Estado vazio explícito quando não houver anexo publicado — nunca linha de exemplo

## Como verificar

```bash
pnpm build && pnpm a11y
curl -s localhost:3000/anexos.json | head
```

## Fora de escopo

Página de metas (tarefa 13) e busca (tarefa 24).
