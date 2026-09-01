# TAREFA 05 — Migração 0002: núcleo da prestação de contas

**Fase:** 1 · **Depende de:** 04 · **Estimativa de diff:** médio

## Objetivo

O núcleo da prestação de contas no banco: separação entre obra intelectual e binário,
com as entidades de apoio de que `documento` depende.

> **Correção de escopo — 2026-08-30.** A redação original desta tarefa pedia apenas
> `arquivo`, `documento`, `documento_arquivo` e a view. Isso é impossível de executar:
> `documento` declara `equipamento_id REFERENCES equipamento(id)` e
> `municipio_id REFERENCES municipio(id)`, e a §16 colocava essas tabelas na etapa
> seguinte. A migração 0002 passa a cobrir o grafo completo de dependências, na ordem
> topológica corrigida na §16. **Nenhuma definição do doc 02 foi alterada** — nenhuma
> coluna, tipo, constraint, índice, FK ou default. Apenas a ordem e o recorte da tarefa.

## Contexto obrigatório

- `docs/02-arquitetura-banco.md`, seções 1, 5, 6.1, 6.2, 6.3, 13 e 16
- `docs/decisoes/ADR-003-storage-documentos.md`
- `docs/decisoes/ADR-006-storage-provider.md`

## Arquivos permitidos

```
db/schema.ts  db/migrations/0002_*.sql  db/migrations/meta/
src/dados/consultas/anexos.ts
```

## Ordem obrigatória da migração

Cada item depende apenas do que vem antes:

```
arquivo → municipio → pessoa → equipamento → consentimento
        → documento → documento_arquivo → view e triggers
```

## Critérios de aceite

- [ ] `arquivo` idêntica ao doc 02 §5, incluindo `sha256 char(64)`, `origem_url`,
      `origem_sistema`, `espelhado_em` e `CHECK (bytes > 0)`
- [ ] `municipio` idêntica ao doc 02 §6.1, incluindo `uf char(2) DEFAULT 'SE'` e
      `codigo_ibge char(7) UNIQUE`
- [ ] `pessoa` idêntica ao doc 02 §6.3, incluindo `foto_id` → `arquivo`
      `ON DELETE SET NULL` e `contato_email citext`
- [ ] `equipamento` idêntica ao doc 02 §6.2, incluindo `numeric(9,6)` nas coordenadas
      e `CHECK coordenadas_completas`
- [ ] `consentimento` idêntica ao doc 02 §6.3, incluindo `UNIQUE (pessoa_id, tipo)`
- [ ] `documento` idêntica ao doc 02 §5, incluindo `licenca DEFAULT 'CC BY-SA 4.0'`,
      `autoria text[]` e as duas FKs `ON DELETE SET NULL`
- [ ] `documento_arquivo` idêntica ao doc 02 §5, com PK composta,
      `ON DELETE CASCADE` para `documento` e `ON DELETE RESTRICT` para `arquivo`
- [ ] Coluna gerada `busca tsvector` usando `sem_acento`, com índice GIN
- [ ] `CHECK publicado_exige_data` implementado
- [ ] Índice parcial único garantindo no máximo um arquivo principal por documento
- [ ] Índice parcial de anexos exigidos pelo edital
- [ ] View `vw_anexo_publico` conforme a seção 13
- [ ] Trigger `trg_atualizado_em` em toda tabela com `atualizado_em` (§1, §4),
      reusando a função `set_atualizado_em()` criada pela migração 0001
- [ ] `slug` e `contato_email` em `citext`, e não em `text` (§1)
- [ ] Constraint alguma foi simplificada, removida ou "adaptada"
- [ ] A migração 0001 permanece intacta, conferida por SHA-256

## Como verificar

```bash
pnpm verificar
pnpm migrar && pnpm tipos
psql "$DATABASE_URL" -c "\d+ documento"
```

Comparar a saída de `\d+` linha a linha com as seções 5, 6.1, 6.2 e 6.3 do documento de
banco e colar a comparação no PR.

## Fora de escopo

Interface. Esta tarefa é só banco.

`vw_pendencia_publicacao` e `mv_busca` (§13) **não** entram nesta migração: dependem de
`entrevista` e `episodio`, que a §16 só cria na etapa 3. `visita`, `midia` e as demais
tabelas das §§6.4 em diante também ficam fora.
