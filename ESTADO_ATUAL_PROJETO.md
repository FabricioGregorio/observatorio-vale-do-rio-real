# Estado atual do projeto

**Referência operacional canônica.** Responde a uma pergunta só: **onde o
projeto está agora?**

Como o projeto deve ser conduzido é assunto de
[`PLANO_EXECUCAO_OBSERVATORIO.md`](./PLANO_EXECUCAO_OBSERVATORIO.md).

**Data:** 2026-09-06

---

## Repositório

| | |
|---|---|
| Branch | `feat/home-indicadores` |
| HEAD | `38f3e1427ebd6ef5a66ba1d8ba2e94399ed7689a` |
| Working tree | sujo, sem commit — alterações desta consolidação e de etapas anteriores |

## Infraestrutura

| | |
|---|---|
| Prompt 1 | **concluído** |
| PostgreSQL | 18.6 |
| Migrations aplicadas | `0001_fundacao`, `0002_nucleo_prestacao_contas`, `0003_gate_pendencias` |
| Roles | `app_observatorio` (leitura), `manutencao_observatorio` (DML sem DDL), role real das migrations (DDL) |
| Isolamento provado | 15/15 conformes; operações negadas falharam com SQLSTATE 42501 pelo privilégio esperado |
| Sequences | não aplicáveis ao schema — chaves em UUID |
| R2 | buckets público e privado validados; GET anônimo no privado negado |
| Manifesto de Evidências | existe, em `src/lib/manifesto-evidencias.ts` |
| ZIP público | gate canônico `PUBLICAVEL` + `revisao_privacidade = concluida`; não gera pacote vazio |
| Banco | `documento`, `arquivo`, `documento_arquivo` e `consentimento` com **zero linhas** |

## Fonte canônica

| | |
|---|---|
| Configuração | `OBSERVATORIO_FONTES_DIR`, em `.env.local` |
| Localização | fora do repositório; não rastreada pelo Git |
| Originais | **138 arquivos**, 608.281.472 bytes |
| Hashes alterados desde a movimentação | **0** |
| Derivados | 1 — transcrição por leitura visual de A03, com hash próprio |

## Prompt 2.2 — CONCLUÍDO COM PENDÊNCIAS REGISTRADAS

Etapa de auditoria e reconciliação encerrada. **Pendência registrada não é
falha da auditoria.**

Registros: [`docs/auditorias/`](./docs/auditorias/) — a auditoria de 72
arquivos permanece como snapshot anterior; a de 138 retrata a fonte canônica
posterior.

### Reconciliado

| Item | Situação |
|---|---|
| Entrevistas | 8 reconciliadas, com `nome_declarado` e `nome_exibicao` separados |
| Consentimentos | **7 de 8** documentalmente localizados na transcrição |
| A02 / A03 / A04 | reconciliados; arquivos e hashes distintos, conteúdo conferido nos três |
| A05 | derivável de A02 |
| A06 | derivável de A03 |
| A09 / A10 | instrumento reconstituível dos cabeçalhos das planilhas |
| Marcas | 34 ativos classificados; **PNAB localizada** (`marcas-09` a `marcas-14`) |

### Pendências registradas

| Pendência | Situação |
|---|---|
| **Áudio da entrevista 08** | consentimento pendente de comprovação no áudio. Sem `ffmpeg` no ambiente; intervalo a conferir: **01:00 a 06:00** |
| **E02 — manual de marcas** | `PENDENTE`. Os ativos existem, as regras de ordem e proporção não |
| **B09 a B12** | `fonte_nao_localizada = true` |
| **Relatório de Objeto** | fonte não localizada no corpus atual |
| **Nomes de trabalhadores em A03** | dois nomes divergentes entre resumo e detalhamento, não resolvido |
| **Créditos das fotos de terceiros** | dois arquivos com autoria de terceiro no nome |

## Inventário canônico — reconciliação aplicada em 2026-09-06

Aplicada em `inventario-de-anexos.xlsx`. **Nada foi gravado no PostgreSQL:** as
quatro tabelas seguem com zero linhas.

| | |
|---|---|
| Linhas de dados | 30 → **33** |
| **Itens obrigatórios** | **28, inalterado** |
| Não obrigatórios | 5 — `D01`, `D02` (já eram) e os três novos |
| Códigos duplicados | 0 |
| Itens `PUBLICAVEL` | **0** |
| URL permanente preenchida | **0** — nada espelhado |
| Hashes registrados | 3, todos conferidos contra o original local |

### Criados como evidência complementar — `obrigatorio = false`

| Código | Item | Estado preliminar |
|---|---|---|
| `B13` | Entrevista — Laerte Santos Aguiar, Sec. Mun. de Cultura de Tomar do Geru | `RESTRITO` |
| `B14` | Entrevista — Márcio André, Diretor de Turismo de São Cristóvão | `RESTRITO` |
| `A11` | Anexo Técnico de Indicadores — Etapa 1 de Levantamento | `RESTRITO` |

Nenhum dos três foi exigido pela FUNCAP, e nenhum entra no denominador dos 28.
`A11` não substitui `A01`, que continua sendo o painel interativo no Figma.
`B13` não substitui `B07`.

### Corrigidos

- **`B06`** → Maria Madalena Santos (Dona Madá), Ilha Grande. Saíram do campo
  ativo a data `11/04/2026` e a classificação `liderança`, ambas sem fonte;
  ficaram registradas em Observações como valores retirados e o motivo.
- **`A05`** → `derivavel_de = A02`; **`A06`** → `derivavel_de = A03`. Os dois
  permanecem `Pendente`, e não `ESPELHAVEL`, porque o artefato derivado ainda
  não existe.
- **`A02`, `A03`, `A04`** → SHA-256 do original local registrado, com nota de
  que é hash de original e não de objeto espelhado. O derivado de `A03` está
  descrito como **transcrição assistida por leitura visual**, não como OCR
  estatístico.
- **`A09`, `A10`** → `instrumento_original_separado = nao_localizado`,
  `fonte_das_perguntas = cabecalhos_das_planilhas`.
- **`B07`** → intacto como previsão de Itabaianinha não realizada, agora com a
  razão registrada.

### Mudança estrutural mínima que foi necessária

As fórmulas da aba Resumo estavam fixas em `2:31`. Estendidas para `2:34`, sem
o que três linhas novas entrariam sem aparecer em nenhum total. **Nenhuma
coluna foi criada:** a coluna `Exigido pelo edital` (Sim/Não) já é o campo
`obrigatorio`. A aba Legenda não foi tocada.

## Prompt 3 — modelo documental formalizado em 2026-09-06

Migração **0004_modelo_documental** aplicada. `ADR-013` registra a decisão.
**A carga documental NÃO foi executada:** `documento`, `arquivo`,
`documento_arquivo` e `consentimento` seguem com zero linhas.

| | |
|---|---|
| Migrations aplicadas | `0001`–`0004` |
| Enums novos | `natureza_documento`, `estado_documental`, `revisao_privacidade`, `metodo_derivacao` |
| Colunas novas | 6 em `documento`, 3 em `arquivo` |
| CHECKs de integridade | 7, validados 9/9 contra o banco com rollback |
| Views | `vw_anexo_publico` e `vw_pendencia_publicacao` substituídas por `CREATE OR REPLACE` |
| Coluna `Natureza` no inventário | 28 `item_exigido`, 3 `evidencia_complementar`, 2 `item_nao_exigido` |

O gate público deixou de ser autorizado por `status = 'publicado'` sozinho:
exige `estado_documental = 'PUBLICAVEL'` **e**
`revisao_privacidade = 'concluida'` **e** arquivo espelhado. O CHECK
`documento_publicavel_exige_revisao` torna a combinação inconsistente
impossível de gravar.

### Dry-run da carga

Plano em [`docs/carga/PLANO_CARGA_DRY_RUN_2026-09-06.md`](./docs/carga/PLANO_CARGA_DRY_RUN_2026-09-06.md):
**30 INSERT, 3 BLOQUEADOS, 0 PUBLICAVEL**, 14/14 validações conformes.

## Prompt 3.1 — bloqueios resolvidos em 2026-09-06

Migração **0005_consentimento_verbal** aplicada. `0004` congelada e imutável;
`0001`–`0005` não serão editadas. **Carga documental não executada:** as
tabelas seguem com zero linhas.

### Os três itens decididos

| Item | Estado | Base |
|---|---|---|
| **A01** | `IMPEDIDO` | Figma devolve 403, sem cópia local, sem arquivo para hash |
| **D02** | `PENDENTE` | perfil vivo do Instagram; não há evidência estática preservada |
| **E01** | `PENDENTE` | segue exigido; consentimento é verbal gravado e não existe termo assinado no corpus |

### Consentimento é por participante

Oito entrevistas produzem **onze participantes** — as entrevistas 02, 04 e 07
têm dois cada. Placar: **11 participantes**, **10 com evidência verificável**,
**5 com data comprovada pelo próprio documento**.

Achado novo: a entrevista 06 declara **10 de junho de 2026** no cabeçalho, data
que o inventário não tinha para B08. As datas de 02 e 03 existem só no nome do
arquivo de áudio — indício, não prova, e por isso entram como `data_incerta`.

A **0005** passou a representar todos os onze casos sem inventar nada:
`concedido_em` aceita `NULL` mas exige `data_incerta = true`; `modalidade` e
`evidencia` são declarados; `evidencia_documento_id` permite que uma gravação
sustente o consentimento de dois participantes. **`pessoa_id` continua
`NOT NULL`** — consentimento é de pessoa, e relaxar isso deixaria o modelo
fingir que "a entrevista consentiu". Validada 7/7 contra o banco, com rollback.

### XLSX → CSV resolvido

`scripts/derivar-inventario.py`, stdlib apenas, determinístico, com validação
de 33 linhas e 28/3/2 e **detecção de stale** por SHA-256 em sidecar. Os dois
scripts de carga abortam se o CSV estiver desatualizado. O CSV está no
`.gitignore`: é derivado, não fonte. `ADR-014` registra a decisão.

**Exportação manual eliminada.** Comandos: `pnpm derivar-inventario` e
`pnpm conferir-inventario`.

### Privacidade da tabela `pessoa`

Verificado: nenhuma view depende de `consentimento` (`pg_depend` = 0), nenhuma
view referencia `pessoa`, e o Manifesto deriva de `vw_anexo_publico`, que não
tem coluna de pessoa. `pessoa.exibir_no_site` tem default `false`. Mínimo
proposto para as onze linhas: `nome` e `tipo`, nada mais.

### Dry-run v2

[`docs/carga/PLANO_CARGA_DRY_RUN_v2_2026-09-06.md`](./docs/carga/PLANO_CARGA_DRY_RUN_v2_2026-09-06.md):
**bloco A com 33 de 33 documentos, zero bloqueados, zero PUBLICAVEL**; bloco B
com 11 participantes representáveis. 14/14 validações conformes.

Estados: 1 `IMPEDIDO` · 11 `RESTRITO` · 3 `ESPELHAVEL` · 18 `PENDENTE` ·
**0 `PUBLICAVEL`**.

## Prompt 3.2 — checkpoint e primeira carga documental

Executado em **2026-09-06**.

### Checkpoint Git

| | |
|---|---|
| Commit | `8d8621e` — *feat: formaliza modelo documental e inventario canonico* |
| Branch | `feat/home-indicadores` |
| Escopo | 55 caminhos: Prompts 1 a 3.1 |
| Fora do commit | `ARCHITECTURE.md`, criado em sessão anterior e fora do escopo 2.3–3.1 |
| Push | **não** |

### Primeira carga documental — CONCLUÍDA

Executada com `DATABASE_URL_MANUTENCAO`, em transação, com **31 invariantes
conferidas dentro da transação** e novamente após o COMMIT.

| | |
|---|---|
| Migrations aplicadas | `0001`–`0005` |
| `documento` antes | 0 |
| `documento` depois | **33** |
| Natureza | 28 `item_exigido` · 3 `evidencia_complementar` · 2 `item_nao_exigido` |
| Estado | 1 `IMPEDIDO` · 11 `RESTRITO` · 3 `ESPELHAVEL` · 18 `PENDENTE` · **0 `PUBLICAVEL`** |
| Revisão de privacidade | 33 `pendente` |
| `vw_anexo_publico` | **0** |
| `vw_pendencia_publicacao` | 0 |
| `arquivo` / `documento_arquivo` | **0 / 0** |
| `pessoa` / `consentimento` | **0 / 0** |

Derivações persistidas: `A05 ← A02` e `A06 ← A03`, ambas `extracao_secao`.

`arquivo` ficou em zero **por decisão**: `url_publica` é `NOT NULL UNIQUE` e não
existe URL própria antes do espelhamento. Inventar uma seria fabricar prova.

Idempotência conferida: o segundo dry-run propõe **0 INSERT** e reconhece os 33
existentes.

Manifesto gerado em memória: **nenhum item elegível ao público**. Nenhum
upload, nenhuma URL pública, nenhum ZIP.

### Onde a classificação vive

`src/dados/classificacao-documental.ts`, versionado. O `Status` da planilha tem
outro vocabulário e o mapeamento não é 1 para 1 — `B02` e `A02` são ambos
`Disponível` e recebem estados diferentes. O carregador não infere estado: item
sem classificação aprovada faz o script falhar.

## Próxima tarefa autorizada

Duas frentes, na sua ordem de preferência:

1. **Carga de `pessoa` e `consentimento`** (bloco B) — 11 participantes, 10 com
   evidência verificável, 5 com data comprovada. Depende da sua autorização
   para criar as 11 linhas de `pessoa` com `nome` e `tipo`.
2. **Espelhamento** — subir os originais ao R2 e criar `arquivo` com hash e URL
   permanente, o que destrava `A02`, `A04` e `D01` de `ESPELHAVEL`.

---

Histórico detalhado das etapas: [`docs/historico/estados/`](./docs/historico/estados/).
Não é leitura obrigatória.
