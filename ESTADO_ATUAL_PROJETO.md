# Estado atual do projeto

**Referência operacional canônica.** Responde a uma pergunta só: **onde o
projeto está agora?**

Como o projeto deve ser conduzido é assunto de
[`PLANO_EXECUCAO_OBSERVATORIO.md`](./PLANO_EXECUCAO_OBSERVATORIO.md).

**Data:** 2026-09-08

---

## Repositório

| | |
|---|---|
| Branch | `feat/home-indicadores` |
| Checkpoint pré-publicação | `11c309943094534ad0af424fccc7e916195cc39a` — *feat: define cache da primeira publicacao* |
| Upstream | **nenhum.** `feat/home-indicadores` não tem upstream configurado; `git rev-parse --abbrev-ref @{u}` responde *no upstream configured*. `main` e `feat/bootstrap` têm; esta branch nunca teve |
| Push nesta rodada | nenhum; a branch nunca foi enviada ao remoto |

> **Correção de 2026-09-08.** Até o Prompt 4.7 este documento registrava, aqui e
> no fecho de várias seções de prompt, um upstream `feat/home-indicadores →
> origin/main`. Isso nunca foi verdade: o que existe na configuração é
> `branch.feat/home-indicadores.vscode-merge-base = origin/main`, que é base de
> comparação do editor, não upstream. As seções históricas abaixo preservam o
> texto original; onde elas afirmam upstream mantido ou preservado, leia
> **nenhum upstream**.

## Infraestrutura

| | |
|---|---|
| Prompt 1 | **concluído** |
| PostgreSQL | 18.6 |
| Migrations aplicadas | `0001`–`0007` — a última é `0007_publicacao_multiarquivo`, aplicada no Prompt 3.8 |
| Roles | `app_observatorio` (leitura), `manutencao_observatorio` (DML sem DDL), role real das migrations (DDL) |
| Isolamento provado | 15/15 conformes; operações negadas falharam com SQLSTATE 42501 pelo privilégio esperado |
| Sequences | não aplicáveis ao schema — chaves em UUID |
| R2 | buckets público e privado validados; GET anônimo no privado negado |
| Manifesto de Evidências | existe, em `src/lib/manifesto-evidencias.ts` |
| ZIP público | gate canônico `PUBLICAVEL` + `revisao_privacidade = concluida`; não gera pacote vazio |
| Banco | `documento` = **33**; `arquivo` = **18**; `documento_arquivo` = **18**; `pessoa` = **0**; `consentimento` = **0** |
| Primeira publicação | **8 objetos**: A02=1 e D01=7; `vw_anexo_publico`=8; A04 e D01-08 fora |
| Domínio público | `https://acervo.observatoriotobiassoueu.com.br` |
| Cache público | `public, max-age=86400`, sem `immutable` |

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

## Prompt 3.3 — checkpoint pós-carga e modelo de storage

Executado em **2026-09-06**. **Nenhum upload ocorreu.**

| | |
|---|---|
| Segundo checkpoint | `4a4c3ae` — *feat: registra carga documental canonica* |
| Migrations aplicadas | `0001`–`0006` |
| `documento` | **33** — intacto |
| `arquivo` / `documento_arquivo` | **0 / 0** |
| `pessoa` / `consentimento` | 0 / 0 |
| `vw_anexo_publico` | **0** |

### Migração 0006 — o modelo não representava arquivo privado

Auditoria antes do primeiro upload encontrou dois impedimentos:

1. **`arquivo.url_publica` era `NOT NULL UNIQUE`**, e não havia `bucket` nem
   `visibilidade`. Registrar objeto privado exigiria inventar URL ou usar o
   endpoint S3 como se fosse URL pública.
2. **`espelhar-anexos.ts` mirava o bucket público** e gravava
   `urlPublica(chave)` — espelhar qualquer item, inclusive `RESTRITO`, o
   colocaria publicamente acessível.

A 0006 acrescentou `bucket` (NOT NULL, sem default), `visibilidade`
(`privado`/`publico`, default `privado`) e tornou `url_publica` anulável, com
o CHECK `(visibilidade = 'publico') = (url_publica IS NOT NULL)`. A
`vw_anexo_publico` passou a exigir visibilidade pública e URL presente. O
script foi corrigido para o bucket privado. `ADR-015` registra.

Validada 8/8 contra o banco com rollback, incluindo o caso mais adverso —
documento `PUBLICAVEL`, revisão concluída, arquivo espelhado e principal, só
que privado: **a view devolve zero**. O caso de controle com arquivo público
devolve um, provando que o zero vem da visibilidade.

### Dry-run do espelhamento

[`docs/carga/DRY_RUN_ESPELHAMENTO_2026-09-06.md`](./docs/carga/DRY_RUN_ESPELHAMENTO_2026-09-06.md):
**10 objetos privados propostos**, 0 públicos. A02 (1 arquivo), A04 (1) e D01
(8, é conjunto). Nenhum pode ir ao bucket público hoje — os três estão com
revisão pendente.

### `vw_pendencia_publicacao` = 0 está correto

Investigado: as três ramificações exigem `status = 'publicado'` ou
`estado_documental = 'PUBLICAVEL'`, e nenhum dos 33 satisfaz. A view detecta
**anomalia entre candidatos à publicação**, não "trabalho restante". O nome
engana; proposta de renomeação registrada na `ADR-015`, sem migração.

## Prompt 3.4.1 — executor concluído; parada antes do upload

Registro da etapa anterior. A autorização e execução posteriores estão no Prompt 3.4.2 abaixo.

**Pronto tecnicamente para o lote fechado de dez objetos privados.**
Resta somente autorização humana para os dez uploads, incluindo confirmação
administrativa de r2.dev desativado e inexistência de custom domain público.
Essa configuração não foi inventada nem atestada pelo executor.

Registro vigente:
[`DRY_RUN_FINAL_PRIVADO_2026-09-07.md`](./docs/carga/DRY_RUN_FINAL_PRIVADO_2026-09-07.md).
A [verificação anterior](./docs/carga/VERIFICACAO_PRE_UPLOAD_2026-09-07.md)
permanece como histórico; seus bloqueios foram tratados no Prompt 3.4.1.

- Executor `scripts/espelhar-anexos.ts`: modo padrão seguro, `--dry-run` e
  execução real somente com `--executar`.
- Dry-run real do executor: **10 operações; A02=1; A04=1; D01=8**;
  50.896.322 bytes, dez chaves ausentes e zero colisões.
- Fonte canônica atual: **10/10 hashes conferidos; zero divergências**.
  D01 registra `hash_historico_anterior = nao_disponivel`; os hashes completos
  atuais foram adotados conforme instrução humana, sem inventar histórico.
- D01: oito vínculos neutros `principal=false`, permitidos pelo schema.
- Colisão protegida por leitura autenticada e PUT condicional; GET remoto com
  novo SHA-256/bytes antes de INSERT atômico de arquivo e vínculo.
- Compensação só de criação própria; ausência confirmada; COMMIT incerto
  reconciliado em conexão independente antes de qualquer exclusão.
- Credencial exclusiva do executor: `DATABASE_URL_MANUTENCAO`.
- Gates: tipos e lint passaram (quatro avisos CSS preexistentes);
  **234 testes passaram e três de upload real foram omitidos**.
- Checkpoint reúne toda a implementação pré-upload desde `97bc88c` em um
  único commit. `ARCHITECTURE.md` permanece intacto, fora do escopo e do commit.
- **Nenhum upload, publicação, build ou push.** `documento=33`;
  `arquivo=documento_arquivo=pessoa=consentimento=PUBLICAVEL=vw_anexo_publico=0`.
- Upstream preservado: **feat/home-indicadores → origin/main**; pendência de
  segurança a resolver separadamente antes de qualquer push.

A carga de `pessoa` e `consentimento` (11 participantes) segue não autorizada.


## Prompt 3.4.2 — primeiro espelhamento privado concluído

Executado em **2026-09-07**, a partir do checkpoint pré-upload `4b6411e`.
Autorização humana explícita para somente A02=1, A04=1 e D01=8.
O responsável confirmou manualmente **r2.dev desativado**, **nenhum Custom
Domain** no bucket privado e credenciais R2 conferidas em `.env.local`.
Essa confirmação administrativa é humana, não uma conclusão da API S3.

### Execução e invariantes

Comandos executados na raiz do repositório:

```sh
node --import tsx scripts/espelhar-anexos.ts --dry-run
node --import tsx scripts/espelhar-anexos.ts --executar
```

O dry-run imediatamente anterior confirmou exatamente **10 objetos**,
A02/A04/D01=1/1/8, dez chaves ausentes e hashes canônicos íntegros.
O executor do checkpoint foi utilizado sem alteração.

| Verificação | Resultado |
|---|---|
| Uploads tentados / concluídos | **10 / 10** |
| SHA-256 remoto e bytes conferidos antes da persistência | **10/10** |
| Volume total | **50.896.322 bytes** |
| Colisões iguais / diferentes | **0 / 0** |
| Falhas de upload ou persistência | **0** |
| Compensações / objetos órfãos | **0 / 0** |
| documento / arquivo / documento_arquivo | **33 / 10 / 10** |
| pessoa / consentimento | **0 / 0** |
| Bucket dos dez arquivos | **observatorio-privado** |
| Visibilidade dos dez arquivos | **privado** |
| url_publica dos dez arquivos | **NULL** |
| PUBLICAVEL / vw_anexo_publico | **0 / 0** |
| Revisões de privacidade | **33 pendente**, sem alteração |
| D01 | **8 vínculos, todos principal=false**, versão 1 |
| A02 / A04 | **1 vínculo principal cada**, versão 1 |
| Objetos enviados ao bucket público | **0; bucket público intocado** |

Cada objeto foi baixado por acesso autenticado e teve SHA-256 e tamanho
recalculados antes dos INSERTs atômicos de arquivo/vínculo. ETag não foi usado
como prova de integridade. Chaves e hashes correspondem ao
[dry-run aprovado](./docs/carga/DRY_RUN_FINAL_PRIVADO_2026-09-07.md).

### Não exposição e Manifesto

GET sem credenciais, cookies ou assinatura nas dez chaves pelo endpoint S3:
**10 respostas HTTP 400; nenhum conteúdo entregue**. Nenhum acesso anônimo
foi encontrado nesse endpoint. Ausência de r2.dev e custom domains foi
confirmada pelo responsável, como registrado acima; não foram habilitados,
criados ou modificados domínios, URLs públicas, presigned URLs ou ACLs.

Manifesto derivado dos 33 documentos e vínculos atuais, validado pelo contrato
Zod e filtrado pelo gate canônico, **somente em memória**: representação pública
`[]`, zero anexos públicos e zero chaves privadas. Nenhum arquivo de Manifesto
ou ZIP foi gravado ou enviado.

### Idempotência e encerramento

O dry-run pós-carga reconheceu **10/10 como `ja_espelhado`**, com nova leitura
autenticada e conferência dos hashes/bytes: **zero uploads necessários, zero
INSERTs duplicados, zero sobrescritas**. Código de saída 0.

Ocorrência de verificação: a primeira tentativa desse dry-run ficou vários
minutos sem progresso e foi encerrada após identificação do processo de
leitura. A causa não foi determinada. A repetição do mesmo comando concluiu
em aproximadamente nove segundos. **Nenhum upload real foi repetido** e não
houve falha de upload, persistência ou compensação.

Pools encerrados em `finally`, clientes S3 destruídos após uso e processos
da rodada concluídos; o processo da tentativa interrompida também foi
encerrado. **Processos/conexões locais pendentes desta execução: 0.**

### Gates e próximo passo

`pnpm tipos` e `pnpm lint` passaram; o lint mantém quatro avisos CSS
preexistentes. `pnpm teste`: **234 aprovados, 3 omitidos, zero falhas**.
Os três testes que criam objetos reais permaneceram desativados com
`TESTE_R2_ESCRITA=proibida`; a autorização cobre apenas os dez objetos do lote.

O teste de invariantes da carga, antes fixado em zero arquivos, foi atualizado
para exigir os dez registros autorizados e conferir chaves, hashes,
visibilidade, bucket, URL nula e papéis. Justificativa do arquivo adicional:
a nova carga autorizada exige que o gate valide o estado pós-espelhamento.
Nenhuma asserção de privacidade foi removida.

**Próximo passo registrado naquela etapa:** iniciar a revisão de privacidade.
Esse passo foi posteriormente concluído nos Prompts 3.5.1 e 3.6, conforme a
seção seguinte.
Nenhuma carga de pessoa/consentimento, publicação, build, ZIP, commit ou push
foi realizada nesta rodada. `ARCHITECTURE.md` permanece intacto e fora do
escopo. Upstream mantido: `feat/home-indicadores → origin/main`.

---

## Prompt 3.6 — revisão registrada e derivados públicos seguros produzidos

Concluído em **2026-09-07**, após o checkpoint exclusivo do relatório de
privacidade `8283d8b`. O checkpoint não foi enviado ao remoto.

- `documento.revisao_privacidade = concluida` para A02, A04 e D01, em uma
  transação de exatamente três linhas; os três estados documentais continuam
  `ESPELHAVEL`.
- Seis derivados locais foram produzidos fora do Git em
  `OBSERVATORIO_FONTES_DIR/derivados-publicos/`: A02 e D01-01, D01-02,
  D01-03, D01-05 e D01-07.
- A02 teve a seção nominal da página 7 removida de forma irrecuperável no
  derivado; as outras 13 páginas preservam a camada textual.
- Os cinco derivados D01 receberam apenas saneamento de metadados. Os PNGs
  preservam exatamente os pixels; o PDF preserva páginas e conteúdo visual.
- Manifesto local estruturado:
  `derivados-publicos/manifesto-derivados-2026-09-07.json`, com proveniência,
  método, MIME, bytes e hashes de origem e saída.
- D01-04 e D01-06 foram confirmados como candidatos sem transformação. A04 e
  D01-08 não receberam derivados e continuam sujeitos a decisão humana.
- Integridade final dos originais: **10/10 hashes coincidentes**.
- Validação dos derivados: metadados removidos, hashes novos, conteúdo e
  dimensões preservados conforme o tipo; inspeção visual dos PDFs concluída.
- Nenhum registro de `arquivo` ou `documento_arquivo` foi criado para os
  derivados; nenhum upload ao R2, publicação, `PUBLICAVEL`, pessoa,
  consentimento, build ou push.
- Banco após a operação: `documento=33`, `arquivo=10`,
  `documento_arquivo=10`, `PUBLICAVEL=0`, `vw_anexo_publico=0`.
- Gates: tipos e lint passaram (quatro avisos CSS preexistentes); 234 testes
  passaram e três foram omitidos. Build não executado.

O conjunto seguro está preparado para uma decisão humana posterior de
publicação. A operação atual não concede nem presume essa autorização.

---

## Prompt 3.7 — auditoria de prontidão da primeira publicação

Auditado em **2026-09-07**, sem upload, publicação, migration ou alteração
persistente no banco. O checkpoint documental pós-derivados é `b73f8e1`.

Resultado: **não pronto para autorização**. O banco aceita objetos públicos e
privados com o mesmo SHA-256 quando usam chaves diferentes, mas o caminho
público atual não representa o lote D01=7: `vw_anexo_publico` lê somente o
vínculo principal, e existe no máximo um principal por documento. Além disso,
o adaptador do Manifesto substitui natureza, estado e revisão existentes por
`null`, fazendo Sala, `/anexos.json` e ZIP falharem fechados com zero itens.

O teste em transação desfeita confirmou: D01 retorna 0 com sete vínculos não
principais e 1 com um principal; A02 retorna somente o derivado e exclui o
original privado no SQL. Estado real após rollback: `arquivo=10`,
`documento_arquivo=10`, `PUBLICAVEL=0`, `vw_anexo_publico=0`.

Dry-run público: oito candidatos exatos, A02=1 e D01=7, com oito chaves
inexistentes no bucket público. `STORAGE_PUBLIC_URL` aponta para `r2.dev`, não
para domínio próprio, e bloqueia produção. Relatório em
`docs/auditorias/AUDITORIA_PRONTIDAO_PRIMEIRA_PUBLICACAO_2026-09-07.md`;
proposta de correção, ainda não aprovada, na ADR-016.

Gates: tipos e lint passaram (quatro avisos CSS preexistentes); 234 testes
passaram e três foram omitidos. O build não foi executado.

---

## Prompt 3.8 — arquitetura multiarquivo corrigida, sem publicação

Concluído em **2026-09-07**. A auditoria foi preservada primeiro no checkpoint
`865e24d`. Em seguida, a decisão da ADR-016 foi aceita e implementada pela
migration oficial 0007, aplicada com a credencial exclusiva de migração.

- `arquivo` permanece um objeto físico armazenado; a identidade de localização
  agora é `UNIQUE(bucket, chave_storage)`, e `sha256` continua não único.
- Proveniência física distingue `derivado_de_id` de `replica_de_id`, com FK,
  checks de não autorreferência e exclusividade entre as relações.
- `metodo_derivacao` passou a representar `tarjamento_privacidade` e
  `sanitizacao_metadados`; réplica byte-identical não é derivação.
- `vw_anexo_publico` mantém todos os gates canônicos, publica cada vínculo
  válido e expõe `principal` como informação, sem usá-lo como filtro.
- O Manifesto usa natureza, estado e revisão reais da view e representa uma
  entrada por objeto físico público. Sala do Avaliador, `/anexos.json` e ZIP
  preservam todos os arquivos de um documento; o ZIP usa uma pasta por slug
  para evitar colisão de nomes.
- Teste transacional com rollback: D01=7 públicos e D01-08=0, tanto com zero
  principais quanto com um principal; A02=1 derivado e original privado=0.
  No cenário integrado, view, Manifesto, `/anexos.json`, Sala e ZIP usam os
  mesmos 8 arquivos; A04=0.
- Testes de integridade confirmaram: mesmo SHA em objetos privado e público é
  permitido; mesma chave em buckets diferentes é permitida; o mesmo par
  `(bucket, chave_storage)` é recusado.
- Estado real pós-migration e pós-rollback: `documento=33`, `arquivo=10`,
  `documento_arquivo=10`, `PUBLICAVEL=0` e `vw_anexo_publico=0`.
- Dry-run público revalidado somente com oito `HeadObject`: A02=1, D01=7,
  objetos existentes/colisões=0. Nenhum `PutObject` foi executado.
- Gates: tipos e lint passaram; o lint conserva quatro avisos CSS preexistentes.
  **236 testes passaram e três foram omitidos**.
- Nenhum upload, publicação, A04, D01-08, pessoa/consentimento, build, mudança
  em `.env.local` ou push ocorreu. `ARCHITECTURE.md` segue intacto e fora.

O bloqueio externo permanece: `STORAGE_PUBLIC_URL` ainda usa `r2.dev`. A
arquitetura está pronta para o lote, mas publicação real continua proibida até
o responsável aprovar e configurar o domínio público final de produção.

---

## Decisões humanas de 2026-09-08 — A04 e D01-08

O responsável resolveu as duas decisões que permaneciam abertas na revisão de
privacidade, sem autorizar publicação nesta rodada.

### A04

O nome institucional citado pode permanecer na versão pública. Não deve ser
tarjado e não justifica, isoladamente, a criação de derivado. A revisão de
privacidade continua `concluida`. A04 pode ser avaliado futuramente como
candidato a publicação se não houver outro bloqueio documental; nesta rodada
permanece `ESPELHAVEL`, em rascunho, com seu único arquivo privado e sem URL
pública.

### D01-08

`identidade-visual/observatorio/primeiro-post-observatorio.pdf` é referência
visual interna/material de inspiração usado no desenvolvimento do site. Não foi
fornecido para integrar o acervo público. A decisão definitiva para o fluxo
atual é `MANTER_PRIVADO`: sem derivado público, Manifesto, `/anexos.json`, ZIP,
Sala do Avaliador ou futuros dry-runs de publicação.

Os achados visuais da inspeção permanecem como registro factual, mas a presença
de pessoas ou menor aparente deixa de ser o motivo principal da exclusão. O
motivo principal é a função documental interna, fora do conjunto destinado à
publicação.

### Auditoria da área de identidade visual

Foram conferidos os oito arquivos da pasta de identidade visual e o registro
anterior de inspeção direta. O único candidato a referência interna/material de
trabalho é D01-08. Os outros sete são logomarcas ou variações gráficas do
coletivo e do Observatório; nenhum outro aparentou exercer a função de material
interno. Essa conferência não altera estado, natureza nem autorização de
publicação de qualquer arquivo.

O lote público conceitual permanece **A02=1 + D01-01..07=7, total=8**.
D01-08=0. Nenhum registro de banco ou arquivo de origem foi alterado; nenhum
upload, publicação, pessoa/consentimento, build ou push foi executado.

---

## Prompt 3.10 — primeira publicação pública concluída

Executado em **2026-09-08**, a partir do checkpoint pré-publicação
`11c309943094534ad0af424fccc7e916195cc39a`, com autorização humana explícita
para somente A02 e D01-01..07.

- O dry-run imediatamente anterior confirmou **8 objetos ausentes**, sem
  colisões: A02=1, D01=7, A04=0 e D01-08=0.
- Foram feitos **8/8 uploads** no bucket `observatorio-publico`, sem ACL
  manual, com MIME real e `Cache-Control: public, max-age=86400`.
- Os oito objetos foram baixados por acesso autenticado antes da persistência:
  SHA-256, bytes, MIME e Cache-Control conferiram em **8/8**.
- Uma única transação inseriu oito registros em `arquivo`, oito vínculos em
  `documento_arquivo` e, por exigência do contrato vigente da view, promoveu
  A02 e D01 para `PUBLICAVEL`, `revisao_privacidade=concluida`,
  `status=publicado` e `publicado_em` preenchido. Nenhum outro documento foi
  promovido.
- Estado confirmado após o COMMIT: `documento=33`, `arquivo=18`,
  `documento_arquivo=18`, `PUBLICAVEL=2`, `vw_anexo_publico=8`,
  `pessoa=0` e `consentimento=0`.
- Proveniência: A02 é derivado por `tarjamento_privacidade`; D01-01, 02, 03,
  05 e 07 são derivados por `sanitizacao_metadados`; D01-04 e D01-06 são
  réplicas byte-identical.
- As oito URLs no Custom Domain responderam HTTP 200 e conferiram SHA-256,
  bytes, MIME e Cache-Control. Não há URL `r2.dev` nem endpoint S3 nas saídas.
- Manifesto real, `/anexos.json`, Sala do Avaliador e conjunto lógico do ZIP
  contêm os mesmos **8 arquivos**. O ZIP foi produzido somente em memória para
  validação e **não foi enviado**.
- A02 original continua privado. A04 permanece `ESPELHAVEL`. D01-08 permanece
  privado como referência visual interna. Nenhum dos três aparece em
  Manifesto, JSON, Sala ou conjunto lógico do ZIP.
- O dry-run posterior reconheceu 8/8 objetos e registros como idênticos:
  zero `PutObject`, zero INSERT, zero promoção e zero sobrescrita.
- Não houve falha, compensação ou objeto público órfão. Não houve build,
  deploy, carga de pessoa/consentimento ou push.

Registro operacional completo:
[`docs/carga/PRIMEIRA_PUBLICACAO_PUBLICA_2026-09-08.md`](./docs/carga/PRIMEIRA_PUBLICACAO_PUBLICA_2026-09-08.md).

---

Histórico detalhado das etapas: [`docs/historico/estados/`](./docs/historico/estados/).
Não é leitura obrigatória.

---

## Prompt 4.3 — primeiro build controlado e metadados de produção

Executado em **2026-09-08**, a partir do checkpoint `aa0c354`, sem deploy,
publicação de ZIP, upload, alteração de banco/R2/DNS ou push.

- Provider decidido pelo responsável: **Vercel**. A configuração do projeto e
  do domínio no provider ainda não foi executada.
- Origem canônica do site: `https://observatoriotobiassoueu.com.br`, fornecida
  server-side por `SITE_URL`. O acervo permanece separado em
  `https://acervo.observatoriotobiassoueu.com.br`.
- `metadataBase`, canonical e Open Graph usam a origem canônica por uma única
  função. `sitemap.xml` lista doze páginas públicas; `robots.txt` referencia o
  sitemap e exclui `/dev/`.
- Decisão de `www`: futuramente
  `https://www.observatoriotobiassoueu.com.br` terá redirect permanente para o
  domínio canônico sem `www`, configurado no provider; nenhum redirect ou DNS
  foi alterado nesta rodada.
- `DATABASE_URL` passou a ser obrigatória em produção. Ausência falha antes de
  gerar Sala, Manifesto e `/anexos.json` vazios; development e test preservam o
  comportamento local sem banco. Credenciais de manutenção e migração não são
  usadas pelo build.
- O único `pnpm build` autorizado executou somente `next build` e passou no
  Next.js 16.3.4. O contador de geração concluiu 19/19; a tabela final listou
  18 rotas estáticas: as 15 rotas conhecidas, `_not-found`, `robots.txt` e
  `sitemap.xml`.
- Smoke do artefato: Home e Sala responderam 200; `/anexos.json` retornou 8;
  `/dev/estilos` retornou 404 em produção; canonical e Open Graph foram
  conferidos nas páginas públicas.
- Estado antes e depois: `documento=33`, `arquivo=18`,
  `documento_arquivo=18`, `vw_anexo_publico=8`. O bucket público permaneceu
  com oito objetos e a mesma impressão digital; ZIP ausente.
- O build não informou se `next/font/google` fez download. A telemetria do
  Next.js estava **habilitada** e não foi alterada.
- Quatro credenciais de storage apareceram somente no cache local efêmero do
  Turbopack, não em output de servidor/cliente. Os caches foram removidos e a
  varredura final de 1.078 arquivos encontrou zero valor secreto. Credenciais
  R2 não devem ser configuradas no ambiente de build da Vercel.
- Gates pós-build: tipos e lint passaram, com os quatro warnings CSS
  preexistentes; **252 testes passaram e três foram omitidos**; acessibilidade
  passou em **46/46**.
- Processo temporário do smoke encerrado; porta 3000 sem listener.

Próximo passo: configurar o projeto e as variáveis mínimas na Vercel, fechar o
domínio/redirect e publicar o ZIP em autorização separada antes do deploy.

---

## Prompt 4.6 — auditoria remota final da Vercel

Auditoria somente leitura concluída em **2026-09-08**, com Vercel CLI
`59.11.7`, sem deployment, build remoto, push, conexão Git, domínio, DNS, ZIP,
banco, R2 ou migration.

- Projeto remoto: `observatorio-vale-rio-real`, no team
  `fabricios-projects-e8743b90` (`Fabrício's projects`).
- O diretório local está vinculado ao projeto correto por
  `.vercel/project.json`; `.vercel/` está ignorado e não foi versionado.
- Deployments: **0**.
- Git remoto: **desconectado**; nenhuma integração foi criada.
- Custom Domains: **0**; apex, `www` e DNS continuam intocados. O subdomínio
  `acervo` permanece no R2.
- Production contém somente `DATABASE_URL` como Secret/Hidden e `SITE_URL` e
  `STORAGE_PUBLIC_URL` como Config. Preview e Development remoto estão vazios.
- Nenhuma credencial de manutenção, migration, storage público operacional,
  storage privado ou fonte canônica foi encontrada na Vercel.
- Os valores públicos informados pelo responsável permanecem
  `https://observatoriotobiassoueu.com.br` e
  `https://acervo.observatoriotobiassoueu.com.br`. A CLI confirmou nome, tipo e
  ambiente, mas não revelou o texto aberto; nenhum `env pull` foi usado.
- Build remoto configurado como Next.js, raiz `.`, `pnpm build`, Install e
  Output defaults e Node `24.x`.
- Zero Deploy Hooks, cron jobs, integrações Marketplace e Vercel Blob stores
  conectados ao projeto.
- O repositório fixa pnpm `11.25.0`, lockfile `9.0` e não possui `engines`.
  Compatibilidade remota: **`INDETERMINADO_ATÉ_DEPLOY`**.

Próximo passo: publicar o ZIP em autorização operacional separada e, depois,
solicitar autorização específica para o primeiro deployment manual/controlado,
sem Git conectado. O smoke ocorrerá primeiro na URL `*.vercel.app`; domínio e
DNS permanecem etapa posterior.

---

## Prompt 4.7 — primeiro deployment controlado na Vercel

Executado em **2026-09-08**, uma única vez, a partir do checkpoint
`7dea44bada6a7c7d9f4b59c067fb9cdde452c6a9`, sem push, integração Git, domínio
customizado, DNS, migration, escrita no banco ou alteração no R2.

- Deployment Production `dpl_8f6opr5pwpnqgDcFEJWzVzEyHWu6`: **READY**.
- URL imutável gerada:
  `https://observatorio-vale-rio-real-75v7er8wc.vercel.app`. Ela responde 302
  para o SSO da Vercel por proteção da URL de deployment.
- Alias público atribuído pela própria Vercel:
  `https://observatorio-vale-rio-real.vercel.app`. Foi nele que os smoke tests
  públicos foram executados. Isso não configura Custom Domain; o total de
  Custom Domains continua zero.
- Build remoto: Node `24.x`, pnpm `11.25.0`, instalação concluída, `pnpm build`
  e `next build` concluídos; 19 páginas estáticas geradas. O único warning
  relevante foi o aviso já conhecido do driver PostgreSQL sobre a futura
  mudança semântica de `sslmode`; nenhum erro de build ocorreu.
- Smoke HTTP: Home, Sala, `/anexos.json`, `robots.txt`, `sitemap.xml` e versão
  imprimível responderam 200; `/dev/estilos` respondeu 404.
- `/anexos.json` contém 8 arquivos: A02=1, D01-01..07=7, A04=0 e D01-08=0.
  Os 8/8 links do acervo responderam 200 no host
  `acervo.observatoriotobiassoueu.com.br`.
- Canonical, Open Graph e sitemap mantêm intencionalmente
  `https://observatoriotobiassoueu.com.br`, sem substituição por `vercel.app`.
- Varredura de HTML, nove bundles JavaScript, responses, logs e source maps
  encontrou zero segredo, URL de banco, path local, storage privado, endpoint
  S3, `r2.dev` ou dado `RESTRITO`. Nenhum source map público foi encontrado.
- Antes e depois do deployment, o banco permaneceu em `documento=33`,
  `arquivo=18`, `documento_arquivo=18` e `vw_anexo_publico=8`.
- Os fingerprints dos buckets permaneceram idênticos: público com 8 objetos e
  privado com 10; nenhum objeto novo/alterado e nenhum ZIP.
- Gates locais pós-deploy: tipos e lint passaram (quatro warnings CSS
  preexistentes), 252 testes passaram com 3 omitidos e acessibilidade passou
  em 46/46.

O deployment está tecnicamente íntegro, mas **não está aprovado para associação
do domínio principal**. O smoke encontrou dois bloqueios funcionais que exigem
correção e uma nova autorização de deployment:

1. a Sala oferece `Baixar tudo (.zip)`, mas o endereço responde 404 porque o
   ZIP permanece corretamente não publicado nesta rodada;
2. a tabela da Sala e a versão imprimível alargam o documento para 629 px em
   viewport de 375 px. Em 768 px e 1440 px não há overflow.

O Caderno de Estudos continua documentalmente `PENDENTE`; nenhum conteúdo ou
prazo foi inventado. O estado não é contradito na saída pública, embora a Sala
com anexos não apresente uma linha específica sobre o Caderno.

Registro completo:
[`docs/deploy/PRIMEIRO_DEPLOY_VERCEL_2026-09-08.md`](./docs/deploy/PRIMEIRO_DEPLOY_VERCEL_2026-09-08.md).

---

## Prompt 4.8 — os dois bloqueios do primeiro deployment, corrigidos localmente

Executado em **2026-09-08**, a partir do checkpoint
`3e7f62fd5fff0cd5a8dc2cb0b7d835903b1dbe87`, **sem segundo deployment**, sem
publicação de ZIP, upload no R2, escrita no banco, migration, DNS, domínio,
integração GitHub ou push.

### Bloqueio 1 — CTA do ZIP

A causa não era o ZIP: era o critério do botão. `urlDoZipDeAnexos()` montava a
URL a partir de `STORAGE_PUBLIC_URL` e a Sala exibia o link sempre que houvesse
anexos. Com o Custom Domain configurado e oito anexos publicados, as duas
condições estavam satisfeitas — e o objeto nunca havia sido enviado. Uma
`ListObjectsV2` somente leitura no bucket público confirmou: **8 objetos,
nenhum `anexos.zip`**.

A função passou a exigir também `ZIP_ANEXOS_PUBLICADO=true`, declaração
explícita de publicação já consumada. Fail-closed: ausente, vazia ou com
qualquer outro valor significa não publicado. Nenhuma consulta remota ao R2 é
feita para renderizar a página. Sem o pacote, **o item some da Sala** — nem
link, nem aviso. `pnpm publicar-zip` passou a lembrar, ao final, que o botão só
aparece depois da variável.

Os oito anexos individuais são independentes disso e não mudaram.

### Bloqueio 2 — overflow horizontal em 375 px

A tabela **não** era a culpada. Ela mede 621 px e sempre foi corretamente
clipada pelo contêiner com `overflow-x: auto`.

O que escapava eram os oito `<code class="sr-only">` que guardam o SHA-256
integral. `sr-only` é `position: absolute`, e não havia ancestral posicionado:
o bloco container deles era o `<html>`, não o contêiner de rolagem — e um
contêiner de rolagem só clipa descendentes para os quais ele participa do bloco
container. Cada um ficava na coluna do hash, com borda direita em **629 px**,
exatamente o `scrollWidth` medido no smoke de produção.

Correção: `position: relative` no contêiner, que passa a ser o bloco container
desses elementos e a clipá-los. Uma classe. Nenhuma coluna escondida, nenhuma
informação truncada, nenhum `overflow-x: hidden` global.

O contêiner virou `<section>` com nome acessível, e a folha de impressão da
versão imprimível solta o clipe horizontal — no papel não há rolagem, e sem
isso as colunas da direita não sairiam impressas.

### Medições

| Rota | 375 px antes | 375 px depois | 768 px | 1440 px |
|---|---|---|---|---|
| `/prestacao-de-contas` | 629 | **375** | 753/753 | 1425/1425 |
| `/prestacao-de-contas/imprimir` | 629 | **375** | 753/753 | 1425/1425 |
| `/` (controle) | 375 | 375 | — | 1425/1425 |

`documentElement.scrollWidth` contra `documentElement.clientWidth`. Sob emulação
móvel `innerWidth` reporta o conteúdo, não a viewport de layout; a medida
confiável é `clientWidth`. O contêiner da tabela conserva `scrollWidth` 621 e
`clientWidth` 343: **a rolagem é dele, não da página**.

### Verificações desta rodada

- Build local: `pnpm build` executado **uma vez**, 19/19 páginas estáticas, 18
  rotas, mesmo conjunto do Prompt 4.7. Único aviso é o já conhecido do driver
  PostgreSQL sobre `sslmode`.
- Smoke do artefato de produção: Home, Sala, imprimível, `robots.txt` e
  `sitemap.xml` em 200; `/dev/estilos` em **404**; `/anexos.json` com **8**.
- O HTML da Sala tem **zero** ocorrências de `anexos.zip` e de `Baixar tudo`.
- Banco antes e depois, por `DATABASE_URL` somente leitura, role
  `app_observatorio`: `documento=33`, `arquivo=18`, `documento_arquivo=18`,
  `vw_anexo_publico=8` — sendo `identidade-visual`=7 e
  `relatorio-tecnico-recanto-da-serra`=1 —, `PUBLICAVEL=2`, `pessoa=0`,
  `consentimento=0`. Nenhuma escrita.
- A04 (`relatorio-tecnico-serra-dos-macacos`) segue `ESPELHAVEL`, revisão
  concluída, `status=rascunho`, fora da publicação. D01-08 segue privado.
- Bucket público: impressão digital idêntica antes e depois — **8 objetos, sem
  ZIP**. Bucket privado não foi tocado.
- Gates: tipos e lint passaram, mantendo os quatro warnings CSS preexistentes;
  **256 testes passaram e 3 foram omitidos**; acessibilidade passou em
  **54/54**.

Ressalva registrada: numa das catorze execuções da suíte, um teste falhou uma
única vez e o nome não foi capturado. Treze execuções seguintes passaram, assim
como seis execuções dirigidas ao arquivo que mais depende de subprocesso e de
arquivo compartilhado. **A falha não foi reproduzida e sua causa não foi
determinada.**

`pnpm pendencias` não atesta nada nesta máquina: ele roda sem `.env.local` e
declara `DATABASE_URL ausente`. Isso é comportamento próprio do script, não
resultado da verificação.

### O que continua pendente

- **ZIP não publicado.** Continua sendo operação separada, com autorização
  própria. A correção deste prompt não a antecipa nem a dispensa.
- **Segundo deployment não executado.** Os dois bloqueios estão corrigidos e
  verificados localmente; a promoção ao domínio institucional segue dependendo
  de nova autorização humana.
