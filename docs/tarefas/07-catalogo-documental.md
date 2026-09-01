# TAREFA 07 — Catálogo documental

**Fase:** 1 · **Depende de:** 05, 06 · **Estimativa de diff:** médio

## Objetivo

Transformar o inventário versionado no catálogo documental do PostgreSQL: cada item do
inventário vira uma linha de `documento`, ligada aos seus binários por
`documento_arquivo`.

## Por que esta tarefa existe

`vw_anexo_publico` — que alimenta a Sala do Avaliador e o `/anexos.json` — faz
`documento JOIN documento_arquivo JOIN arquivo`. A Tarefa 05 criou as três tabelas e a
Tarefa 06 popula apenas `arquivo`. Sem esta tarefa, a view retorna vazio e a Sala do
Avaliador renderiza estado vazio permanente.

A aba Legenda do `inventario-de-anexos.xlsx` já declara a intenção: *"Esta planilha é a
fonte da tarefa 06 (espelhamento) e do seed das tabelas `documento` e `arquivo`."* Até
2026-08-30 nenhuma tarefa era responsável por isso.

## Contexto obrigatório

- `docs/01-arquitetura-informacao.md`, seções 4 e 6
- `docs/02-arquitetura-banco.md`, seções 1, 5 e 13
- `docs/03-guia-implementacao.md`, seções 2, 6 e 13
- `docs/decisoes/ADR-003-storage-documentos.md`
- `docs/tarefas/06-espelhamento-de-arquivos.md`
- `inventario-de-anexos.xlsx` — fonte da lista

## Arquivos permitidos

```
scripts/catalogar-documentos.ts  testes/catalogo.test.ts
```

## Fonte: o que o inventário tem

Aba `Inventário`, 30 itens, 15 colunas. Correspondência com `documento` (doc 02 §5):

| Coluna do inventário | Destino | Observação |
|---|---|---|
| `Item` | `documento.titulo` | direto |
| `Slug proposto` | `documento.slug` | **preenchida em 14 das 30 linhas** |
| `Tipo (enum)` | `documento.tipo` | usa 11 valores, todos válidos em `tipo_documento` |
| `Exigido pelo edital` | `documento.exigido_pelo_edital` | `Sim` = 28 itens, `Não` = 2 |
| `ID` (`A01`, `B03`…) | `documento.ordem_anexo` | sequência 1…30 pela ordem dos IDs |
| `Categoria` | **não é coluna de `documento`** | governa a chave de storage, e é por ela que o vínculo é encontrado |
| `Status` | **não mapear** para `documento.status` | vocabulários distintos, ver abaixo |

Colunas de `documento` que o inventário **não** tem: `resumo`, `autoria`,
`data_referencia`, `equipamento_id`, `municipio_id`. Ficam `NULL`. O AGENTS.md é
explícito: conteúdo ausente é `null` com estado vazio, **jamais** um placeholder
plausível.

`licenca` usa o `DEFAULT 'CC BY-SA 4.0'` do schema.

### O `Status` do inventário não é o `status_publicacao`

São dois vocabulários diferentes e **não devem ser conflatados**:

- inventário: `Disponível` (10), `Pendente` (13), `A confirmar` (5), `A corrigir` (2) —
  descrevem se o arquivo *existe e está acessível*;
- banco: `rascunho`, `em_revisao`, `publicado`, `arquivado` — descrevem o *ciclo de
  publicação no site*.

Todo `documento` nasce em `rascunho` (o `DEFAULT` do schema). Publicar é decisão humana
posterior, e o `CHECK publicado_exige_data` já impede publicar sem `publicado_em`.

## Regra de slug

`documento.slug` é `citext NOT NULL UNIQUE` — não aceita nulo. A coluna `Slug proposto`
do inventário está preenchida em 14 das 30 linhas. Para as outras 16 vale esta regra,
fechada em 2026-08-31:

> **Quando `Slug proposto` estiver vazio, o slug é derivado do campo `Item` por
> normalização determinística:** minúsculas · remoção de acentos (NFD, descartando os
> diacríticos combinantes) · substituição de cada sequência de caracteres **fora de
> `[a-z0-9]`** por um único hífen · remoção de hífens nas extremidades.

O conjunto de caracteres aceitos é **ASCII**, não "alfanumérico Unicode". A diferença é
material: em `PodObservar — 1ª temporada`, a regra ASCII produz
`podobservar-1-temporada`, enquanto uma regra Unicode preservaria o `ª`
(`podobservar-1ª-temporada`) e violaria o padrão de URL do doc 01 §6.

Verificado antes de formalizar, sobre os 30 itens do inventário:

- os 16 slugs derivados são **todos** conformes ao doc 01 §6 (minúsculas, sem acento,
  hífen como separador);
- **nenhuma colisão** entre os 30 slugs — 14 da planilha mais 16 derivados;
- **nenhum** dos 16 produz data no slug, respeitando o "sem data no caminho" do doc 01 §6.

**Ressalva:** cinco itens que **já têm** `Slug proposto` trazem data no campo `Item`
(as entrevistas B02–B06, do tipo `Entrevista — Nome (27/03/2026)`), e a planilha já as
removeu à mão no slug. Se um item novo com data no título aparecer **sem** slug
proposto, esta regra produziria a data no slug e contrariaria o doc 01 §6. Nesse caso a
regra não se aplica sozinha e o slug precisa ser preenchido na planilha.

A regra vale para `documento.slug`. A Tarefa 06 usa o mesmo slug na chave de storage.

## Versionamento

A primeira catalogação usa `documento_arquivo.versao = 1`, coerente com o
`DEFAULT 1` do schema e com a chave `-v1` gravada pela Tarefa 06.

Versões posteriores são **novos** registros em `arquivo` vinculados ao **mesmo**
`documento`, com `versao` incrementada. Esta tarefa é a dona desse incremento — a
Tarefa 06 não consulta `documento_arquivo`.

Um arquivo de versão anterior nunca é sobrescrito silenciosamente por conteúdo
diferente. O `ON DELETE RESTRICT` de `documento_arquivo.arquivo_id` e o soft delete do
doc 02 §1 sustentam isso no schema.

> **Observação sobre a identidade usada pela Tarefa 06.** A primeira versão do
> espelhamento identifica um arquivo pela combinação **`origem_url` + slug do documento
> + `v1`**: se já existe linha em `arquivo` com aquela `origem_url` e chave de storage
> começando em `arquivos/<categoria>/<slug>-v1.`, a execução é no-op e nada é baixado.
> Isso é suficiente para a primeira ingestão e **não** cobre o caso de a mesma URL passar
> a servir conteúdo diferente — nesse cenário a Tarefa 06 continua vendo um no-op.
> Detectar essa mudança e promovê-la a uma nova versão é responsabilidade **desta**
> tarefa, junto com o incremento de `documento_arquivo.versao`. A Tarefa 06 não
> implementa versionamento automático, por decisão.

## Critérios de aceite

- [ ] Processa os 30 itens do inventário, sem pular nenhum
- [ ] Cria uma linha de `documento` por item, com `titulo`, `slug`, `tipo` e
      `exigido_pelo_edital` vindos do inventário
- [ ] `documento.tipo` usa apenas valores existentes no enum `tipo_documento`; item que
      não couber em nenhum usa `outro`, como manda a aba Legenda
- [ ] Todo `documento` nasce em `status = 'rascunho'`, com `publicado_em` nulo
- [ ] Colunas sem fonte no inventário ficam `NULL` — nenhum dado inventado
- [ ] Define `ordem_anexo` de 1 a 30 pela ordem dos `ID` do inventário
- [ ] Cria `documento_arquivo` ligando cada documento aos arquivos cuja `chave_storage`
      comece em `arquivos/<categoria>/<slug>-v1.`, com `versao = 1`
- [ ] Marca `principal = true` em exatamente um arquivo por documento vinculado, pelo
      desempate de `chave_storage` crescente — o índice parcial único
      `idx_doc_arquivo_principal` garante a unicidade no banco
- [ ] Item sem arquivo espelhado gera `documento` **sem** `documento_arquivo`, e aparece
      no relatório como pendência — nunca uma URL inventada
- [ ] Idempotente: rodar duas vezes não duplica documento nem vínculo
- [ ] Usa `DATABASE_URL` via `src/dados/cliente.ts`; não executa DDL
- [ ] Nunca sobrescreve silenciosamente um vínculo existente incompatível
- [ ] Relatório separa: catalogados, no-op, sem arquivo espelhado e erros

## Decisões fechadas em 2026-08-31

### `ordem_anexo`

Sequência natural do inventário, a partir da ordem dos `ID`:
`A01`…`A10`, `B01`…`B12`, `C01`…`C04`, `D01`…`D02`, `E01`…`E02` → **1…30**.

A ordenação é por prefixo de letra e depois pelo número, o que a torna estável
independentemente da ordem das linhas na planilha.

### Vínculo documento ↔ arquivo

**A correspondência é feita pela `chave_storage` do arquivo**, no formato que a
Tarefa 06 grava:

```
arquivos/<categoria>/<slug>-v1.<ext>
```

Categoria e slug saem das mesmas regras já formalizadas nas Tarefas 06 e 07. Como a
extensão só é conhecida no momento do espelhamento, a busca usa o prefixo
`arquivos/<categoria>/<slug>-v1.` — determinístico, porque o literal `-v1.` ancora o
fim do slug e impede que um slug mais curto capture outro mais longo.

**`origem_url` não é usada como chave**, e a razão é factual: três URLs do inventário
são compartilhadas por vários itens — A02/A03/A04 apontam para o mesmo Google Docs,
A09/A10 para o mesmo formulário e B02–B06 para a mesma pasta do Drive. Casar por URL
produziria vínculos cruzados.

Nenhum outro mecanismo de correspondência, e nenhum match aproximado.

### `principal`

Documento com mais de um arquivo tem **exatamente um** vínculo `principal = true`; os
demais ficam `false`. O índice parcial único `idx_doc_arquivo_principal` garante isso
no banco.

Documento **sem** arquivo correspondente **não recebe vínculo** — nem com `principal`
falso.

> Como `ordem_anexo` é atributo do documento e não do arquivo, ela não ordena os
> arquivos **dentro** de um mesmo documento. O desempate usado é a `chave_storage` em
> ordem crescente, que é única e total. Na prática o caso é raro: fixados categoria,
> slug e `v1`, só varia a extensão.

### A09 / A10

Catalogar exatamente os **30 itens existentes**. Não criar documentos adicionais.

Os dois documentos por formulário que o doc 01 §6 sugere — modelo e resultados
anonimizados — só existirão depois de o inventário ser atualizado por decisão humana.

### `Observações`

Não mapear para `documento.resumo`. O campo é ignorado nesta tarefa.

### Qualidade do inventário

O inventário não é corrigido automaticamente. Não se inventa URL, fonte, metadado nem
arquivo ausente. Item que não puder ser vinculado é registrado como **sem arquivo
espelhado**, e o processamento continua.

### Provisionamento de roles

Não bloqueia a implementação. O script usa `DATABASE_URL` via `src/dados/cliente.ts`.
Executar contra o Neon é etapa separada, quando os roles existirem.

## Como verificar

```bash
pnpm tsx scripts/catalogar-documentos.ts --dry-run
pnpm tsx scripts/catalogar-documentos.ts
pnpm verificar
```

Conferir no PR: total de itens, documentos criados, vínculos criados e a lista de
pendências, item a item.

## Fora de escopo

Interface. Espelhamento de arquivos — isso é a Tarefa 06. Publicar documento: mudar
`status` para `publicado` é ato humano, não do script.

Corrigir metadado do inventário. Criar `equipamento` ou `municipio` para preencher
`documento.equipamento_id` / `documento.municipio_id` — as tabelas existem desde a
migração 0002, mas povoá-las é outra tarefa.
