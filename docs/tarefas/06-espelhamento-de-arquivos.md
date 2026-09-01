# TAREFA 06 — Script de espelhamento e hash

**Fase:** 1 · **Depende de:** 05 · **Estimativa de diff:** médio

## Objetivo

Tirar cada anexo da dependência do Google Drive e do Figma, dando a ele URL própria,
permanente e verificável.

## Contexto obrigatório

- `docs/01-arquitetura-informacao.md`, seções 0 e 6
- `docs/02-arquitetura-banco.md`, seção 5
- `docs/03-guia-implementacao.md`, seções 6 e 13
- `docs/decisoes/ADR-003-storage-documentos.md`
- `docs/decisoes/ADR-006-storage-provider.md`
- `docs/decisoes/ADR-007-provisionamento-roles.md`
- `inventario-de-anexos.xlsx` (fonte da lista de arquivos)

## Arquivos permitidos

```
scripts/espelhar-anexos.ts  scripts/gerar-hashes.ts  src/lib/storage.ts
```

## Políticas operacionais — decididas em 2026-08-30

A auditoria de consistência desta tarefa encontrou 20 lacunas operacionais sem
sustentação documental. As decisões abaixo as fecham. São regras desta tarefa, não
decisões arquiteturais: nenhuma ADR foi criada nem alterada por causa delas.

### Ordem da operação

```
origem → download para arquivo temporário → validação de conclusão → SHA-256
       → upload ao R2 → persistência dos metadados no PostgreSQL → registro de espelhamento
```

### Hash

- SHA-256 é calculado sobre os **bytes finais do arquivo efetivamente baixado e
  armazenado**.
- O cálculo acontece **antes do upload definitivo ao R2**.

### Download e arquivos parciais

- Todo arquivo é baixado primeiro para um **arquivo temporário**.
- O temporário só é considerado válido depois de o download concluir sem erro **e** o
  SHA-256 ser calculado.
- Arquivo parcialmente baixado **nunca** é publicado nem enviado ao R2.
- Falha de download **exclui o temporário**.

### Timeout e retentativa

- Timeout padrão de **60 segundos por arquivo**.
- Máximo de **3 tentativas por arquivo**, com backoff entre elas.
- Erro claramente não-retentável não é repetido.
- Nada além disso. Não implementar lógica sofisticada de retry.

### Paralelismo

- A primeira implementação é **sequencial**. Sem concorrência.
- A prioridade é determinismo, auditabilidade e simplicidade — não throughput.

### Falha individual

- Falha de um item **não interrompe o lote**. O item entra no relatório de falhas e o
  processamento continua.

### Idempotência

- Mesmo item, mesma versão e mesmo SHA-256 já registrados ⇒ execução é **no-op**.
- Não baixar novamente sem necessidade.

### Conteúdo duplicado

- **Sem deduplicação global** nesta primeira versão.
- Dois itens distintos podem ter o mesmo SHA-256; cada um mantém seu próprio registro
  em `arquivo`. O schema já permite: `idx_arquivo_sha256` é índice comum, não único.

### Mesma chave de storage com conteúdo diferente

- **Nunca sobrescrever silenciosamente** um objeto existente cujo SHA-256 seja
  diferente.
- É tratado como **conflito de versão/conteúdo**, com **falha explícita**, até que uma
  nova versão seja determinada.

### R2

- A Tarefa 06 **nunca apaga objeto** do R2 automaticamente.
- Sem lifecycle e sem limpeza automática nesta tarefa.

### Falha de persistência após o upload

- Se o upload ao R2 tiver sucesso e a escrita no PostgreSQL falhar, o objeto **não é
  apagado** automaticamente.
- A falha é registrada para **reconciliação posterior**.
- Não simular transação distribuída.

### `mime_type` e `tipo_midia`

- `mime_type`: preferir o `Content-Type` informado pela origem; extensão do arquivo
  como *fallback*.
- O resultado é validado contra os tipos aceitos pelo projeto.
- `tipo_midia` é derivado de forma **determinística** do MIME/extensão, usando somente
  os valores já existentes no enum `tipo_midia` (doc 02 §3).
- Não determinou um tipo válido ⇒ o item **falha com erro explícito**. Não inventar
  valor novo de enum, e **nunca** usar `outro` como fallback automático.

**Mapeamento implementado** (`src/lib/espelhamento.ts`):

| MIME | `tipo_midia` |
|---|---|
| `application/pdf` | `pdf` |
| `audio/*` | `audio` |
| `image/*` | `imagem` |
| `video/*` | `video` |
| `xlsx`, `xls`, `ods` | `planilha` |
| `pptx`, `ppt`, `odp` | `apresentacao` |
| `text/csv`, `text/tab-separated-values`, `application/json` | `dataset` |
| qualquer outro | falha explícita |

**Decisão semântica de `planilha` × `dataset` — tomada em 2026-08-31.**

O enum `tipo_midia` do doc 02 §3 traz os dois valores lado a lado sem descrever
nenhum deles. Nenhum documento do projeto — doc 01, doc 02, doc 03, schema ou ADR —
definia a diferença. **Esta é uma decisão nova, tomada agora, e não o registro de algo
que já estivesse documentado.**

O critério é a natureza do arquivo, não o programa que o abre:

- **`dataset`** — formato de intercâmbio de dados abertos, legível por máquina:
  `text/csv`, `text/tab-separated-values`, `application/json`.
- **`planilha`** — arquivo de planilha de escritório, com formatação e fórmulas:
  `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
  `application/vnd.oasis.opendocument.spreadsheet`.

A classificação continua determinística e `outro` segue sem uso como fallback
automático: MIME fora das duas listas e das demais regras falha explicitamente.

### `origem_sistema`

Vocabulário canônico decidido em 2026-08-31, cobrindo as seis fontes que o inventário
usa. A coluna permanece `text` — sem enum e sem migração por causa disso.

| `Fonte atual` no inventário | `origem_sistema` |
|---|---|
| Google Drive | `google_drive` |
| Google Docs | `google_docs` |
| Google Forms | `google_forms` |
| Figma | `figma` |
| Arquivo local | `upload` |
| Instagram | `instagram` |

Fonte fora dessa lista é **pendência de origem**, não valor inventado.

### Inventário

- `inventario-de-anexos.xlsx` continua sendo a **fonte versionada** da lista.
- Qualquer CSV usado pelo script é **artefato intermediário de processamento**, não
  fonte de verdade.
- O CSV não entra no Git sem decisão explícita.

### Figma

- Item cuja origem seja Figma **não** é tratado como download automático: o doc 01 §6
  já o define como captura estática em PDF/PNG, que é ato humano.
- Não implementar integração com a API do Figma nesta tarefa.

### Itens sem link

- Item com `[Inserir link aqui]` ou equivalente **não é falha de rede**. É **pendência
  de origem/documentação** e aparece em categoria separada do relatório.
- No inventário atual isso corresponde aos itens de status `Pendente`, e também às
  linhas cuja coluna `Link atual` está vazia.

### Categoria, slug e versão da chave de storage

Chave: `arquivos/<categoria>/<slug>-v<n>.<ext>`

- **`<categoria>`** usa o vocabulário fechado da coluna `Categoria` do inventário,
  normalizado para minúsculas e hífen. São cinco, e cobrem os 30 itens:

  ```
  analise-de-dados   comprovacao-de-campo   conformidade
  produto-final      publicidade
  ```

  `tipo_documento` **não** é usado como categoria de storage. O valor `relatorios`,
  que aparecia nos exemplos antigos, está descontinuado.
  Exemplo válido: `arquivos/analise-de-dados/relatorio-tecnico-recanto-da-serra-v1.pdf`

- **`<slug>`** vem da coluna `Slug proposto` do inventário, já normalizada. Para os 16
  itens em que essa coluna está vazia, vale a regra de derivação determinística a partir
  do campo `Item`, formalizada na **Tarefa 07 § Regra de slug**. Na prática esses 16
  itens não chegam a ser espelhados por esta tarefa: todos estão sem `Link atual`, e
  entram no relatório como pendência de origem.

- **`<n>`** é **sempre `1`** nesta tarefa. A primeira ingestão assume `v1`, coerente com
  o `DEFAULT 1` de `documento_arquivo.versao`.
  A versão pertence semanticamente ao vínculo `documento_arquivo.versao`, mas **a
  Tarefa 06 não consulta essa tabela** — nem precisa, porque toda primeira ingestão é
  v1. Versões posteriores são responsabilidade da Tarefa 07.
  Não criar contador de versão próprio do storage, nem qualquer outro mecanismo de
  versionamento.

### Credencial de banco

- O script **não** executa DDL. Usa `DATABASE_URL` (role da aplicação), importando
  **`src/dados/cliente.ts`** — o cliente que já existe.
- **Não** usar `DATABASE_URL_MIGRACAO`.
- Não criar uma terceira credencial nem um novo módulo de cliente.
- O doc 03 §2 e o AGENTS.md foram corrigidos para deixar claro que a regra de acesso ao
  banco governa o caminho de renderização, não scripts de manutenção.

### Relatório de execução

Separa, no mínimo, estas categorias:

1. sucesso
2. já espelhado / no-op
3. falha de download
4. origem sem link
5. erro de validação
6. conflito de hash/conteúdo
7. erro de R2
8. erro de PostgreSQL

## Critérios de aceite

- [ ] Lê o inventário exportado em CSV e processa item a item, **sequencialmente**
- [ ] Faz upload ao storage com chave estável `arquivos/<categoria>/<slug>-v<n>.<ext>`
- [ ] Calcula SHA-256 do conteúdo baixado, antes do upload, e grava em `arquivo.sha256`
- [ ] Preenche `origem_url`, `origem_sistema` e `espelhado_em`
- [ ] Deriva `mime_type` e `tipo_midia` conforme a política acima, falhando explicitamente
      quando não for possível determinar
- [ ] Baixa para temporário e descarta o temporário em caso de falha
- [ ] Respeita timeout de 60 s e no máximo 3 tentativas com backoff
- [ ] Idempotente: mesmo item, mesma versão e mesmo SHA-256 ⇒ no-op
- [ ] Conflito de conteúdo na mesma chave falha explicitamente, sem sobrescrever
- [ ] Nunca apaga objeto do R2
- [ ] Item inacessível é registrado em relatório de falhas e **não** interrompe o lote
- [ ] Relatório separa as oito categorias definidas acima
- [ ] Nenhum arquivo é renomeado de forma a perder a correspondência com o inventário

## Decisões documentais pendentes

Fechadas em 2026-08-30: vocabulário de `<categoria>`, significado de `v<n>`, credencial
e módulo cliente. Estão registradas nas políticas operacionais acima.
Fechadas em 2026-08-31: a regra de slug para os itens sem `Slug proposto` (Tarefa 07),
a semântica de `planilha` × `dataset` no mapeamento de `tipo_midia`, e o vocabulário
de `origem_sistema`.

Permanecem em aberto:

1. **Permissões do role da aplicação.** A ADR-007 prevê `SELECT/INSERT/UPDATE/DELETE`
   por `ALTER DEFAULT PRIVILEGES`, mas os roles ainda não foram provisionados em
   ambiente algum. Sem isso, `DATABASE_URL` não tem como escrever em `arquivo`.
2. **Qualidade do inventário.** Em 15 das 30 linhas a coluna `Fonte atual` contém um
   número em vez do nome da fonte, e `Link atual` está vazia. Corrigir metadado do
   inventário é decisão humana e está fora do escopo desta tarefa.

## Como verificar

```bash
pnpm tsx scripts/espelhar-anexos.ts --dry-run
pnpm tsx scripts/espelhar-anexos.ts
```

Conferir no PR: total de itens do inventário, espelhados, falhos e o motivo de cada falha,
separados pelas oito categorias do relatório.

## Fora de escopo

Interface. Corrigir metadado errado no inventário — isso é decisão humana.

**Criar ou popular `documento` e `documento_arquivo`.** Esta tarefa é responsável apenas
pelo espelhamento e pela tabela `arquivo`. Os vínculos entre documento, arquivo e versão
— incluindo versões posteriores à v1 — são da **Tarefa 07 — Catálogo documental**, que
roda depois desta e antes da Sala do Avaliador.
