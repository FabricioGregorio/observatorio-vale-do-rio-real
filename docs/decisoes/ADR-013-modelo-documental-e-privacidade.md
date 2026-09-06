# ADR-013 — Modelo documental, natureza do item e revisão de privacidade

## Status

Aceita

## Data

2026-09-06

## Contexto

O modelo do banco tinha três lacunas que impediam a Prestação de Contas de
dizer a verdade sobre o próprio acervo.

**1. `exigido_pelo_edital` é booleano, e booleano perde informação.** Com dois
valores só, `D01` e `D02` — itens do inventário original que o edital não
exige — ficavam indistinguíveis de `B13`, `B14` e `A11`, que são material
descoberto na pesquisa. Os dois grupos são `false`, e o significado é
diferente: o primeiro sempre esteve fora do escopo, o segundo enriquece a
comprovação sem ser exigência da FUNCAP. Sem essa distinção, qualquer contagem
de "quantos itens faltam" fica ambígua.

**2. Não havia estado documental.** `status_publicacao` — `rascunho`,
`em_revisao`, `publicado`, `arquivado` — é fluxo editorial. Ele não expressa
`RESTRITO` (íntegro, necessário à conferência, sem acesso público) nem
`IMPEDIDO` (há problema objetivo) nem `ESPELHAVEL` (existe, falta subir). O
plano de execução §4 define cinco estados; o banco não representava nenhum.

**3. A `vw_anexo_publico` autorizava publicação por `status = 'publicado'`
sozinho.** Um documento marcado como publicado aparecia como anexo público sem
que ninguém tivesse revisado privacidade. O acervo tem áudio de entrevista,
transcrição com fala atribuída nominalmente e planilha com nome de responsável
de preenchimento — a revisão não é formalidade.

Faltava ainda representar **original ↔ derivado**. `A05` é derivável de `A02`,
`A06` de `A03`, e o relatório de Borda da Mata já tem um derivado de
transcrição. Sem o vínculo, um derivado poderia ser confundido com o original,
ou substituí-lo.

## Decisão

Migração **0004_modelo_documental**, aditiva. Nada foi removido, nenhum tipo de
coluna alterado, nenhuma migração anterior tocada.

### Quatro enums novos

| Enum | Valores |
|---|---|
| `natureza_documento` | `item_exigido`, `evidencia_complementar`, `item_nao_exigido` |
| `estado_documental` | `PUBLICAVEL`, `RESTRITO`, `ESPELHAVEL`, `IMPEDIDO`, `PENDENTE` |
| `revisao_privacidade` | `pendente`, `concluida`, `bloqueada` |
| `metodo_derivacao` | `transcricao_leitura_visual`, `ocr_estatistico`, `redacao_versao_publica`, `extracao_secao`, `conversao_formato` |

`bloqueada` existe porque veto e pendência não são a mesma coisa: um item
vetado não está esperando revisão, ele foi reprovado.

`metodo_derivacao` separa **transcrição assistida por leitura visual** de **OCR
estatístico**. São técnicas diferentes, com fontes de erro diferentes, e o
derivado do relatório de Borda da Mata foi produzido pela primeira. Registrar
"OCR" ali seria falso, e o enum torna a confusão impossível de gravar.

### Estado e revisão são eixos independentes

`revisao_privacidade` **não** é um estado documental. Um item pode estar
`ESPELHAVEL` com revisão pendente, ou `RESTRITO` com revisão concluída. As duas
condições são verificadas separadamente, e publicar exige as duas.

Consequência prática: `CANDIDATO_A_PUBLICAVEL`, que era linguagem de auditoria,
deixa de precisar existir como estado. O caso se escreve
`estado = ESPELHAVEL` + `revisao_privacidade = pendente`.

### Fail-closed no banco, não na aplicação

```sql
CHECK (estado_documental <> 'PUBLICAVEL' OR revisao_privacidade = 'concluida')
```

A regra sai da disciplina de quem escreve código e passa a ser impossível de
violar. Gravar `PUBLICAVEL` sem revisão concluída falha com SQLSTATE 23514.

```sql
CHECK ((natureza = 'item_exigido') = exigido_pelo_edital)
```

`exigido_pelo_edital` **continua existindo** — a ADR não o remove. A natureza
acrescenta a distinção que o booleano perdia, e o CHECK garante que os dois
nunca divirjam.

### Derivação em dois níveis

`documento.derivado_de_id` para documento derivado de documento — `A05` de
`A02`. `arquivo.derivado_de_id` para binário derivado de binário — a
transcrição do PDF de imagem. Ambos com `derivacao_metodo` e `derivacao_em`, e
ambos protegidos por:

- `num_nonnulls(derivado_de_id, derivacao_metodo) <> 1` — derivado sem método
  declarado não é rastreável, e método sem pai não significa nada;
- `derivado_de_id <> id` — nada deriva de si mesmo;
- `ON DELETE RESTRICT` — apagar um original que tem derivado é ato deliberado,
  nunca cascata.

O original nunca é substituído: o derivado é linha nova, com hash próprio.

### Defaults conservadores

| Coluna | Default | Por quê |
|---|---|---|
| `natureza` | `item_nao_exigido` | linha nova não infla o denominador dos 28 itens exigidos |
| `estado_documental` | `PENDENTE` | nada nasce publicável |
| `revisao_privacidade` | `pendente` | nada nasce revisado |

Um `INSERT` que esqueça os três campos produz um documento invisível ao
público. É o desfecho certo para o esquecimento.

### As duas views

`vw_anexo_publico` foi substituída por `CREATE OR REPLACE`, preservando as 14
colunas originais em nome, tipo e ordem, e acrescentando cinco ao fim —
`natureza`, `obrigatorio`, `estado_documental`, `revisao_privacidade`,
`derivado_de_slug`. O gate público passou a exigir, ao mesmo tempo:

```sql
estado_documental = 'PUBLICAVEL'
AND revisao_privacidade = 'concluida'
AND status = 'publicado'
AND arquivado_em IS NULL
AND espelhado_em IS NOT NULL
```

`status = 'publicado'` continua sendo exigido, como fluxo editorial, mas **já
não autoriza nada por conta própria**.

`vw_pendencia_publicacao` ganhou dois ramos, com o ramo original da 0003
reproduzido literalmente. Os novos denunciam estado `PUBLICAVEL` sem arquivo
espelhado e divergência entre `status` e `estado_documental`. A forma do
resultado — `slug, titulo, pendencia` — é contrato e não mudou.

## Consequências

`catalogar-documentos.ts` passou a declarar `natureza`, derivada da coluna
`Natureza` do inventário e validada contra `Exigido pelo edital`. Sem isso o
script violaria o CHECK de coerência em todo item exigido — o que de fato
aconteceu, e foi como a constraint se provou útil antes de qualquer carga.

O contrato do Manifesto ganhou `natureza`, `obrigatorio`,
`derivado_de_documento` e `derivacao_metodo`, e `podePublicar` passou a exigir
`natureza` não nula: item sem classificação não publica.

O gate automatizado **pode vetar, nunca aprovar sozinho**. A aprovação vem da
revisão humana registrada em `revisao_privacidade`, e nenhum regex substitui
isso.

Custo: três campos a mais para manter coerentes em cada carga, e um enum de
método que precisa ser escolhido com honestidade. O ganho é que a regra mais
importante do projeto — não publicar o que não foi revisado — deixou de
depender de ninguém se lembrar dela.

## Alternativas rejeitadas

**Só `obrigatorio boolean`.** Rejeitada: perde a diferença entre `D01`/`D02` e
`B13`/`B14`/`A11`, que é exatamente a informação que o edital torna relevante.

**`CANDIDATO_A_PUBLICAVEL` como sexto estado.** Rejeitada: é o mesmo que
`ESPELHAVEL` com revisão pendente. Um estado que duplica a combinação de dois
campos convida a divergência entre eles.

**Reaproveitar `status_publicacao` para os cinco estados.** Rejeitada:
misturaria fluxo editorial com classificação documental. `rascunho` e
`RESTRITO` respondem a perguntas diferentes.

**Deixar o fail-closed só na aplicação.** Rejeitada: o Manifesto já tinha
`podePublicar` fail-closed, e a view ainda publicava por `status` sozinho. Duas
regras para a mesma decisão, e a mais frouxa é a que vale. Com o CHECK, o banco
recusa o estado inconsistente.

## Fontes

- `PLANO_EXECUCAO_OBSERVATORIO.md` §4 e §5 — estados e revisão de privacidade;
- ADR-011 — credencial de manutenção, usada por qualquer carga documental;
- ADR-012 — buckets público e privado;
- `docs/02-arquitetura-banco.md` §13 — views de anexo e de pendência;
- `docs/03-guia-implementacao.md` §6.2 — SQL bruto em migração para o que o
  Drizzle não expressa;
- `docs/auditorias/AUDITORIA_FONTES_CANONICAS_2026-09-05.md` — os fatos que o
  modelo precisa representar.

---

## Adendo — migração 0005: consentimento verbal (2026-09-06)

O primeiro dry-run mostrou que o modelo de consentimento não representava o
acervo sem inventar informação. Três lacunas, todas concretas:

1. **`concedido_em` era `date NOT NULL`**, e em quatro das oito entrevistas a
   data não é declarada em nenhum arquivo. `NOT NULL` obrigava a inventá-la.
2. **Não havia como registrar a modalidade.** `tipo_consentimento` diz *o que*
   foi consentido — uso de imagem, de áudio. Não diz *como*. No campo o
   consentimento foi **verbal e gravado**, e não existe termo assinado no
   corpus.
3. **Não havia como registrar o estado da evidência** nem o vínculo com a
   gravação que a sustenta.

### O que a 0005 faz

| Mudança | Por quê |
|---|---|
| `concedido_em` aceita `NULL` | a data não é conhecida em 6 dos 11 participantes |
| `data_incerta boolean NOT NULL DEFAULT false` | data ausente passa a ser **afirmação**, não vazio silencioso |
| `modalidade` (`verbal_gravado`, `termo_assinado`, `eletronico`), `NOT NULL` **sem default** | a modalidade é declarada, nunca presumida |
| `evidencia` (`localizada`, `nao_localizada`, `pendente_verificacao`), default conservador | `nao_localizada` significa "não encontrada nesta verificação", não "não existiu" |
| `evidencia_documento_id` → `documento` | a gravação que sustenta o consentimento; várias pessoas apontam para o mesmo documento |

E quatro CHECKs:

```sql
concedido_em IS NOT NULL OR data_incerta          -- lacuna declarada
NOT (concedido_em IS NOT NULL AND data_incerta)   -- sem contradição
modalidade <> 'verbal_gravado' OR termo_id IS NULL
modalidade <> 'termo_assinado' OR termo_id IS NOT NULL
```

Os dois últimos são simétricos e impedem a mesma classe de falsidade:
consentimento verbal não pode apontar para um termo, e termo assinado não pode
ser afirmado sem o arquivo.

### O que a 0005 **não** faz

**`pessoa_id` continua `NOT NULL`.** Consentimento é de pessoa, não de
entrevista — e é justamente isso que o dry-run revelou: oito entrevistas
produzem **onze participantes**, porque as entrevistas 02, 04 e 07 têm dois
cada. Relaxar `pessoa_id` deixaria o modelo fingir que "a entrevista
consentiu". A integridade útil foi preservada; só o que obrigava a inventar
foi relaxado.

Nenhuma view referencia `consentimento` nem `pessoa` — conferido em
`pg_depend` antes de escrever a migração. Nenhuma view pública foi alterada, e
**nenhum dado nominal de consentimento tem caminho para o público**.

Validada contra o banco em transação desfeita: **7/7 conformes**, incluindo a
recusa de data nula sem declaração de incerteza e a prova de que uma mesma
evidência sustenta o consentimento de dois participantes.
