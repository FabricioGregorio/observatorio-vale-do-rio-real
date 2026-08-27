# TAREFA 08 — Gate de pendências no CI

**Fase:** 1 · **Depende de:** 05 · **Estimativa de diff:** pequeno

## Objetivo

Impedir tecnicamente que o site publique um anexo obrigatório sem espelho local ou um
áudio sem consentimento registrado.

## Contexto obrigatório

- `docs/02-arquitetura-banco.md`, seção 13
- `docs/03-guia-implementacao.md`, seção 6

## Arquivos permitidos

```
db/migrations/0003_*.sql  scripts/verificar-pendencias.ts
package.json (script pendencias)  .github/workflows/ci.yml
```

## Critérios de aceite

- [ ] View `vw_pendencia_publicacao` criada conforme o documento, com os dois ramos do `UNION ALL`
- [ ] Script sai com código 1 e imprime tabela legível se houver qualquer linha
- [ ] Sai com código 0 e mensagem clara quando estiver limpa
- [ ] Roda no CI antes do deploy e bloqueia o merge
- [ ] Teste de integração cria um documento pendente e prova que o script falha

## Como verificar

```bash
pnpm pendencias                 # esperado: limpo
pnpm teste testes/pendencias    # esperado: verde
```

## Fora de escopo

Corrigir as pendências encontradas. O gate apenas denuncia.
