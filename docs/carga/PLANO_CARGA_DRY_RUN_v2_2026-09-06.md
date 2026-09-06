# Plano de carga — DRY-RUN v2

**Data:** 2026-09-06 · **Etapa:** Prompt 3.1 · **Status:** nada gravado

Substitui o `PLANO_CARGA_DRY_RUN_2026-09-06.md`, que tinha três itens
bloqueados por falta de decisão. Os três foram decididos.

Fonte: `inventario-de-anexos.csv`, derivado deterministicamente de
`inventario-de-anexos.xlsx` por `scripts/derivar-inventario.py`. O CSV não é
fonte de verdade.

Migrations aplicadas: **0001–0005**. Tabelas documentais: **zero linhas**.

---

# Bloco A — carga documental

| Operação | Documentos |
|---|---:|
| INSERT | 33 |
| UPDATE | 0 |
| SEM ALTERACAO | 0 |
| BLOQUEADO | 0 |
| **total** | **33** |

| Natureza | Itens |
|---|---:|
| `item_exigido` | 28 |
| `evidencia_complementar` | 3 |
| `item_nao_exigido` | 2 |

## Os três itens antes bloqueados

### A01 → `IMPEDIDO`

IMPEDIDO. O entregável é painel interativo no Figma; o acesso anônimo devolve HTTP 403 e não há cópia local canônica nem arquivo para hash. `impedimento = recurso_externo_inacessivel` fica em `observacao`, porque o modelo não tem campo próprio e criar um para um item não seria mínimo. Reavaliável se aparecer exportação válida.

### D02 → `PENDENTE`

PENDENTE, natureza `item_nao_exigido`. O perfil do Instagram existe e abre, mas não há evidência estática versionada preservada pelo Observatório. URL viva não substitui arquivo preservado, e não se inventa hash para página web. Evidência futura pode ser snapshot, PDF ou captura institucional — não produzida aqui.

### E01 → `PENDENTE`

PENDENTE, e continua item exigido. O consentimento usado em campo foi verbal gravado, com evidência em áudio e transcrição; **não existe termo separado assinado no corpus**, e o artefato consolidado de evidências ainda não foi produzido. Quando for, deve se chamar "Registro das evidências de consentimento verbal" — nunca "Termo de consentimento assinado", que seria falso.

## Todos os 33 documentos

| Código | Natureza | Obrig. | Estado | Revisão | derivado_de | Método |
|---|---|---|---|---|---|---|
| A01 | `item_exigido` | sim | `IMPEDIDO` | `pendente` | — | — |
| A02 | `item_exigido` | sim | `ESPELHAVEL` | `pendente` | — | — |
| A03 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — |
| A04 | `item_exigido` | sim | `ESPELHAVEL` | `pendente` | — | — |
| A05 | `item_exigido` | sim | `PENDENTE` | `pendente` | A02 | extracao_secao |
| A06 | `item_exigido` | sim | `PENDENTE` | `pendente` | A03 | extracao_secao |
| A07 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| A08 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| A09 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| A10 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| B01 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — |
| B02 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — |
| B03 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — |
| B04 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — |
| B05 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — |
| B06 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — |
| B07 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| B08 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — |
| B09 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| B10 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| B11 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| B12 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| C01 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| C02 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| C03 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| C04 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| D01 | `item_nao_exigido` | não | `ESPELHAVEL` | `pendente` | — | — |
| D02 | `item_nao_exigido` | não | `PENDENTE` | `pendente` | — | — |
| E01 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| E02 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — |
| B13 | `evidencia_complementar` | não | `RESTRITO` | `pendente` | — | — |
| B14 | `evidencia_complementar` | não | `RESTRITO` | `pendente` | — | — |
| A11 | `evidencia_complementar` | não | `RESTRITO` | `pendente` | — | — |

### Distribuição de estado

| Estado | Itens |
|---|---:|
| `PUBLICAVEL` | 0 |
| `RESTRITO` | 11 |
| `ESPELHAVEL` | 3 |
| `IMPEDIDO` | 1 |
| `PENDENTE` | 18 |

## Arquivos

Nenhuma linha de `arquivo` é criada: `url_publica` é `NOT NULL UNIQUE` e não
há URL própria antes do espelhamento. Os hashes abaixo são dos originais
locais e ficam em `observacao` até o espelhamento acontecer.

| Código | Fonte local | Papel | SHA-256 |
|---|---|---|---|
| A02 | `relatorios/relatorio-tecnico-recanto-da-serra.pdf` | original | `18b7bbb11b61…` |
| A03 | `relatorios/relatorio-tecnico-borda-da-mata.pdf` | original | `6dfef47006ed…` |
| A03 | `derivados/a03-borda-da-mata-ocr.md` | derivado — transcricao_leitura_visual | `502d9bf14334…` |
| A04 | `relatorios/relatorio-tecnico-serra-dos-macacos.pdf` | original | `7e966429d1fc…` |

---

# Bloco B — carga de consentimentos

**Consentimento é por participante, não por entrevista.** Oito entrevistas
produzem **onze participantes**: as entrevistas 02, 04 e 07 têm dois cada.

| | |
|---|---:|
| Participantes que exigem representação | **11** |
| Com evidência verificável na transcrição | **10** |
| Com data comprovada pelo documento | **5** |
| Sem data, com `data_incerta = true` | **6** |

| Entr. | Item | Participante | Evidência | Data | Origem da data |
|---|---|---|---|---|---|
| 01 | B02 | Josenilson Bispo dos Santos | `localizada` | 2026-03-27 | cabeçalho da transcrição |
| 02 | B03 | Oviêdo Abreu de Santana | `localizada` | — | sem data no documento |
| 02 | B03 | Luzineide Maria de Jesus | `localizada` | — | sem data no documento |
| 03 | B05 | Paola Rodrigues de Santana | `localizada` | — | sem data no documento |
| 04 | B14 | Márcio André Soares Ramos | `localizada` | 2026-04-06 | cabeçalho da transcrição |
| 04 | B14 | Ian Victor Batista de Araújo | `localizada` | 2026-04-06 | cabeçalho da transcrição |
| 05 | B04 | Pedro Corrêa de Menezes | `localizada` | 2026-04-05 | falada na gravação |
| 06 | B08 | Dilson de Jesus Santos | `localizada` | 2026-06-10 | cabeçalho da transcrição |
| 07 | B13 | Laerte Santos Aguiar | `localizada` | — | sem data no documento |
| 07 | B13 | Mateus Cardoso Rita | `localizada` | — | sem data no documento |
| 08 | B06 | Maria Madalena Santos | `nao_localizada` | — | sem data; resposta ao pedido não registrada |

Nenhuma data foi inventada. As entrevistas 02 e 03 têm indício de data no
nome do arquivo de áudio — `28-03` e `06-04` — mas **indício não é prova** e
não vira `concedido_em`. Entram como `data_incerta = true`.

Achado novo: a entrevista 06 declara **10 de junho de 2026** no cabeçalho, e
o inventário não tinha data para B08. Fica registrada porque é o documento
que a afirma.

## O schema 0005 representa todos os onze casos

| Fato real | Como fica representado |
|---|---|
| Consentimento verbal, gravado | `modalidade = verbal_gravado` |
| Não existe termo assinado | `termo_id IS NULL`, garantido por CHECK |
| Evidência localizada na transcrição | `evidencia = localizada` |
| Evidência não localizada (entrevista 08) | `evidencia = nao_localizada` |
| Data conhecida | `concedido_em`, `data_incerta = false` |
| Data desconhecida | `concedido_em IS NULL`, `data_incerta = true` |
| Uma gravação sustenta dois participantes | duas linhas, mesmo `evidencia_documento_id` |

Validado contra o banco, em transação desfeita: **7/7 conformes**, incluindo
a recusa de data nula sem declaração de incerteza e a de termo assinado sem
arquivo.

## Por que o bloco B não é inserível agora

Estruturalmente ele está pronto. Faltam duas coisas, nesta ordem:

1. **Os documentos precisam existir primeiro.** `evidencia_documento_id`
   aponta para a entrevista, e `documento` tem zero linhas. O bloco B vem
   depois do bloco A.
2. **Onze linhas em `pessoa`.** `consentimento.pessoa_id` é `NOT NULL`, e é
   correto que seja: consentimento é de pessoa. Criar as onze é decisão sua,
   e a análise de privacidade está na seção seguinte.

Registros inseríveis hoje: **0 de 11**. Bloqueados por
dependência, não por dado faltando.

## Análise de privacidade da tabela `pessoa`

| Pergunta | Resposta verificada |
|---|---|
| Foi projetada para participantes de entrevista? | **Sim.** `tipo_pessoa` tem `ator_chave`, `agente_publico` e `lideranca_comunitaria` |
| Guardar esses nomes é coerente com o modelo? | **Sim**, e é o único jeito de o consentimento ser por pessoa |
| Alguma view expõe `pessoa` ou `consentimento`? | **Nenhuma.** Conferido em `pg_depend`: zero views dependem de `consentimento`; nenhuma migração referencia `pessoa` em `SELECT` de view |
| Risco de vazar por Manifesto/API? | **Não hoje.** O Manifesto deriva de `vw_anexo_publico`, que não tem coluna de pessoa. `/anexos.json` serve o mesmo conjunto |
| Proteção no próprio schema | `pessoa.exibir_no_site` tem default `false`; `contato_email` é marcado "interno, nunca renderizado" |

Mínimo de dado pessoal proposto para as onze linhas: **`nome` e `tipo`**.
Sem `bio_curta`, sem `foto_id`, sem `contato_email`, sem `cargo` além do que
a transcrição já declara publicamente, e `exibir_no_site = false`.

---

# Validações (§16)

| Verificação | Resultado | Valor |
|---|---|---|
| total de documentos = 33 | OK | 33 |
| item_exigido = 28 | OK | 28 |
| evidencia_complementar = 3 | OK | 3 |
| item_nao_exigido = 2 | OK | 2 |
| PUBLICAVEL = 0 | OK | 0 |
| duplicados = 0 | OK | 0 |
| A01 = IMPEDIDO | OK | IMPEDIDO |
| D02 = PENDENTE | OK | PENDENTE |
| E01 = PENDENTE | OK | PENDENTE |
| E01 continua exigido | OK | sim |
| D02 continua item_nao_exigido | OK | item_nao_exigido |
| B07 continua PENDENTE e exigido | OK | PENDENTE / exigido |
| nenhuma data de consentimento inventada | OK | 5 com data, 6 com data_incerta |
| nenhum BLOQUEADO restante no bloco A | OK | 0 |

**14/14 conformes.**

## Gate público (§13)

Nenhum destes chega ao público, e por mais de um motivo cada:

| Item | Estado | Por que não publica |
|---|---|---|
| A01 | `IMPEDIDO` | estado não é `PUBLICAVEL`; sem arquivo, sem URL, sem hash |
| D02 | `PENDENTE` | idem |
| E01 | `PENDENTE` | idem |
| os 8 `RESTRITO` | `RESTRITO` | estado não é `PUBLICAVEL` |
| todos os 33 | revisão `pendente` | o gate exige `concluida` |

O CHECK `documento_publicavel_exige_revisao` torna `PUBLICAVEL` sem revisão
impossível de gravar, e a `vw_anexo_publico` da 0004 já não aceita
`status = 'publicado'` como autorização isolada.

# Regra de parada

Nada gravado. O **bloco A está íntegro e pronto para autorização**. O bloco
B está estruturalmente resolvido e sequenciado depois de A, dependendo ainda
da sua decisão sobre criar as onze linhas de `pessoa`.