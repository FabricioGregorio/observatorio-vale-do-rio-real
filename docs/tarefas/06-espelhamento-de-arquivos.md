# TAREFA 06 — Script de espelhamento e hash

**Fase:** 1 · **Depende de:** 05 · **Estimativa de diff:** médio

## Objetivo

Tirar cada anexo da dependência do Google Drive e do Figma, dando a ele URL própria,
permanente e verificável.

## Contexto obrigatório

- `docs/01-arquitetura-informacao.md`, seções 0 e 6
- `docs/02-arquitetura-banco.md`, seção 5
- `inventario-de-anexos.xlsx` (fonte da lista de arquivos)

## Arquivos permitidos

```
scripts/espelhar-anexos.ts  scripts/gerar-hashes.ts  src/lib/storage.ts
```

## Critérios de aceite

- [ ] Lê o inventário exportado em CSV e processa item a item
- [ ] Faz upload ao storage com chave estável `arquivos/<categoria>/<slug>-v<n>.<ext>`
- [ ] Calcula SHA-256 do conteúdo e grava em `arquivo.sha256`
- [ ] Preenche `origem_url`, `origem_sistema` e `espelhado_em`
- [ ] Idempotente: rodar duas vezes não duplica nem re-sobe arquivo com hash igual
- [ ] Item inacessível é registrado em relatório de falhas e **não** interrompe o lote
- [ ] Nenhum arquivo é renomeado de forma a perder a correspondência com o inventário

## Como verificar

```bash
pnpm tsx scripts/espelhar-anexos.ts --dry-run
pnpm tsx scripts/espelhar-anexos.ts
```

Conferir no PR: total de itens do inventário, espelhados, falhos e o motivo de cada falha.

## Fora de escopo

Interface. Corrigir metadado errado no inventário — isso é decisão humana.
