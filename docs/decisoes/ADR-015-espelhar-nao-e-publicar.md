# ADR-015 — Espelhar não é publicar: arquivo privado no modelo

## Status

Aceita

## Data

2026-09-06

## Contexto

Depois da primeira carga documental, três documentos ficaram `ESPELHAVEL`:
`A02`, `A04` e `D01`. O passo natural seria espelhar os binários. Ao auditar o
modelo antes do primeiro upload, apareceram **dois** impedimentos, e nenhum
deles era teórico.

### 1. A tabela `arquivo` não representava arquivo privado

O schema tinha `chave_storage`, `sha256`, `bytes`, `mime_type`, `tipo_midia`,
`origem_url`, `origem_sistema` e `espelhado_em`. Faltavam três coisas:

| Faltava | Consequência |
|---|---|
| **bucket** | com dois buckets, `chave_storage` sozinha é ambígua: a mesma chave pode existir no privado e no público |
| **visibilidade** | não havia como afirmar que um objeto é privado, nem como o SQL do gate distinguir |
| **`url_publica` anulável** | era `NOT NULL UNIQUE` — **toda** linha de `arquivo` precisava afirmar uma URL pública |

O terceiro é o grave. Para registrar um objeto privado, seria necessário
inventar uma URL, ou usar o endpoint S3 como se fosse URL pública. As duas
coisas são falsidade em prova documental, e a segunda é pior: transformaria o
endpoint autenticado em promessa de acesso.

### 2. O script de espelhamento mirava o bucket público

`scripts/espelhar-anexos.ts` usava `enviarObjeto` — cliente do bucket
**público** — e gravava `urlPublica(chave)`. Ou seja: espelhar qualquer item,
inclusive `RESTRITO`, colocaria o binário no bucket público com URL pública.

Isso não era um bug latente: era o comportamento programado. O script foi
escrito antes de os estados documentais existirem, quando "espelhar" e
"publicar" eram a mesma operação.

## Decisão

### A distinção é normativa

```text
ESPELHAVEL  ≠  PUBLICAVEL

ESPELHAVEL  = o binário pode ser copiado para storage controlado
PUBLICAVEL  = o binário pode ser exposto publicamente
```

Um documento com `estado_documental = ESPELHAVEL` e
`revisao_privacidade = pendente` **não pode ganhar acesso público**. O destino
padrão antes da aprovação é o bucket privado.

Somente `estado_documental = PUBLICAVEL` **e**
`revisao_privacidade = concluida` podem resultar em objeto acessível
publicamente.

### Migração 0006, aditiva

| Mudança | Por quê |
|---|---|
| `bucket text NOT NULL`, sem default | o bucket é declarado, nunca presumido; `chave_storage` sozinha é ambígua |
| `visibilidade` (`privado`, `publico`), default `privado` | nada nasce público |
| `url_publica` aceita `NULL` | objeto privado não tem URL pública, e inventar uma é fabricar prova |

Mais dois CHECKs:

```sql
-- visibilidade e URL são um só fato, escrito como igualdade para que
-- nenhum dos dois lados possa divergir em silêncio
CHECK ((visibilidade = 'publico') = (url_publica IS NOT NULL))

CHECK (length(btrim(bucket)) > 0)
```

O `UNIQUE` de `url_publica` permanece: no PostgreSQL, `UNIQUE` aceita vários
`NULL`, então muitos objetos privados coexistem sem colidir.

### `vw_anexo_publico` ficou mais estrita

A 0004 já exigia estado `PUBLICAVEL`, revisão concluída, `status = 'publicado'`
e arquivo espelhado. Com `url_publica` anulável isso deixou de bastar: um
arquivo privado vinculado a um documento publicável emitiria
`link_permanente` nulo. A view passou a exigir também:

```sql
AND a.visibilidade = 'publico'
AND a.url_publica IS NOT NULL
```

Provado contra o banco, em transação desfeita, no caso mais adverso possível —
documento `PUBLICAVEL`, revisão `concluida`, `status = 'publicado'`, arquivo
espelhado e vinculado como principal, só que privado: **a view devolve zero
linhas**. E o mesmo caso com arquivo público devolve uma, o que prova que o
zero vem da visibilidade e não de a view estar quebrada.

### Ciclo de vida

```text
original local (observatorio-fontes, fora do Git)
      │  hash conferido
      ▼
espelhamento PRIVADO ──► arquivo(bucket=privado, url_publica=NULL)
      │
      ▼
revisão de privacidade humana
      │
      ├─ aprovado sem redação ──► promoção ao bucket público
      │                            arquivo público, URL real
      │
      └─ exige redação ─────────► DERIVADO público, arquivo novo
                                   ORIGINAL permanece privado
                                   hashes distintos, derivado_de registrado
```

O original privado **não é movido automaticamente** para o público. Quando
houver redação, original e derivado coexistem, com hashes distintos.

### O script foi corrigido

`espelhar-anexos.ts` passou a usar `enviarObjetoPrivado`, a registrar
`bucket = observatorio-privado`, `visibilidade = privado` e
`url_publica = NULL`. `storage-privado.ts` ganhou `bucketPrivado()`, porque o
banco precisa dizer em qual bucket o objeto está.

## Consequências

O banco não pode mais afirmar que existe objeto público onde não existe. E o
espelhamento deixou de ser um caminho para publicação acidental: para um
binário chegar ao público é preciso, agora, atravessar o gate documental **e**
mudar a visibilidade do arquivo — duas decisões, ambas explícitas.

Custo: dois campos a mais por arquivo e um passo de promoção que antes não
existia. Em troca, a operação mais perigosa do projeto — publicar áudio de
entrevista ou relatório com nome de trabalhador — passou de "um script de
espelhamento faz isso sozinho" para "impossível sem duas aprovações
registradas".

## Nota sobre `vw_pendencia_publicacao`

Com 33 documentos persistidos, essa view devolve **zero**. Foi investigado, e
**zero está correto** — mas o nome engana, e isso merece registro.

As três ramificações da view exigem `status = 'publicado'` ou
`estado_documental = 'PUBLICAVEL'`. Os 33 documentos estão em `rascunho` e
nenhum é `PUBLICAVEL`, então nenhuma ramificação encontra linha.

**O que a view significa:** *"itens que se pretende publicar e que têm
impedimento objetivo"* — anexo obrigatório publicado sem arquivo espelhado,
estado publicável sem espelho, ou divergência entre `status` e
`estado_documental`. É um detector de **anomalia entre candidatos à
publicação**.

**O que ela não significa:** "itens que ainda faltam publicar". Se fosse isso,
o número seria 32 ou 33.

O nome sugere a segunda leitura. Proposta, **sem migração nesta rodada**:
renomear para algo como `vw_impedimento_publicacao`, ou manter o nome e fixar a
semântica na documentação do doc 02 §13. A decisão é humana, e renomear afeta
`scripts/verificar-pendencias.ts`, o gate do CI e o `package.json`.

## Alternativas rejeitadas

**Deduzir visibilidade do nome do bucket.** Rejeitada: o nome do bucket vem de
variável de ambiente e pode mudar; o SQL do gate não pode depender disso.

**Só tornar `url_publica` anulável, sem `bucket` nem `visibilidade`.**
Rejeitada: `url_publica IS NULL` diria "não tem URL", não "é privado", e não
diria onde o objeto está. Um objeto público cuja URL ainda não foi gerada
ficaria indistinguível de um privado.

**Duas tabelas, `arquivo_privado` e `arquivo_publico`.** Rejeitada: duplicaria
hash, MIME, bytes e proveniência, e a relação original ↔ derivado teria de
atravessar as duas.

**Espelhar direto no bucket público e restringir só na view.** Rejeitada: o
binário estaria publicamente acessível por URL, independentemente do que a
view mostrasse. O controle tem de estar no storage, não só na consulta.

## Fontes

- `PLANO_EXECUCAO_OBSERVATORIO.md` §4 e §12 — estados e evidência restrita fora
  do pacote público;
- ADR-012 — dois buckets, o privado sem URL pública;
- ADR-013 — modelo documental, estados e revisão de privacidade;
- `docs/carga/DRY_RUN_ESPELHAMENTO_2026-09-06.md` — os dez objetos privados
  propostos;
- `docs/02-arquitetura-banco.md` §13 — as duas views.
