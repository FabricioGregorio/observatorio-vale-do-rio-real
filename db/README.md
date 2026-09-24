# Histórico de migrações

Estas doze migrações registram como o banco PostgreSQL do projeto foi
construído, entre a fundação e o tripwire do PodObservar. Elas são **história,
não sistema**.

O banco foi removido em 24/09/2026: não existe mais cliente, schema, consulta,
credencial, dependência npm nem comando que as execute. `pnpm install`,
`pnpm tipos`, `pnpm lint`, `pnpm teste`, `pnpm dev` e `pnpm build` funcionam
sem nada disto — e a guarda de `testes/guarda-banco.test.ts` falha se alguma
dessas peças voltar.

Ficaram aqui porque apagá-las apagaria o registro de como o acervo chegou à
forma que hoje está em `src/dados/publicado/`. Ler é útil; executar não é
possível, e não deve voltar a ser.
