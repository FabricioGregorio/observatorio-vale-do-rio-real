# ADR-012 — Separação entre buckets público e privado

## Status

Aceita

## Data

2026-09-04

## Decisão

O storage do projeto terá dois buckets independentes:

- público: `STORAGE_PUBLIC_ENDPOINT`, `STORAGE_PUBLIC_BUCKET`,
  `STORAGE_PUBLIC_ACCESS_KEY`, `STORAGE_PUBLIC_SECRET` e `STORAGE_PUBLIC_URL`;
- privado: `STORAGE_PRIVATE_ENDPOINT`, `STORAGE_PRIVATE_BUCKET`,
  `STORAGE_PRIVATE_ACCESS_KEY` e `STORAGE_PRIVATE_SECRET`.

O bucket privado não possui URL pública. O código separado e o teste operacional
usam exclusivamente as variáveis `STORAGE_PRIVATE_*`; nenhum valor, endpoint ou
objeto fictício é criado.

Esta decisão complementa e detalha a ADR-006, que permanece válida quanto ao uso da
API S3-compatível e à escolha do Cloudflare R2. Os nomes genéricos de `STORAGE_*`
da ADR-006 são históricos; as variáveis canônicas atuais são as listadas acima.
