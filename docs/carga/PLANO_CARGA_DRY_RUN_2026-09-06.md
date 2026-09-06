> **SUPERADO por [`PLANO_CARGA_DRY_RUN_v2_2026-09-06.md`](./PLANO_CARGA_DRY_RUN_v2_2026-09-06.md).**
>
> Este plano tinha **3 itens bloqueados** por falta de decisão — A01, D02 e
> E01 — e o bloco de consentimentos indiviso do documental. Os três foram
> decididos no Prompt 3.1 e o v2 separa os dois blocos.
>
> Preservado como registro do estado anterior. Não usar para autorizar carga.

---

# Plano de carga documental — DRY-RUN

**Data:** 2026-09-06 · **Etapa:** Prompt 3, §16 · **Status:** nada gravado

Gerado a partir do `inventario-de-anexos.xlsx` reconciliado e da auditoria
canônica. A gravação depende de aprovação humana e usará exclusivamente
`DATABASE_URL_MANUTENCAO`.

Estado do banco no momento deste plano: `documento`, `arquivo`,
`documento_arquivo` e `consentimento` com **zero linhas**.

---

## Resumo

| Operação | Documentos |
|---|---:|
| INSERT | 30 |
| UPDATE | 0 |
| SEM ALTERACAO | 0 |
| BLOQUEADO | 3 |
| **total no inventário** | **33** |

| Natureza | Itens |
|---|---:|
| `item_exigido` | 28 |
| `evidencia_complementar` | 3 |
| `item_nao_exigido` | 2 |

## INSERT — documentos

| Código | Natureza | Obrig. | Estado | Revisão | derivado_de | Método | SHA-256 |
|---|---|---|---|---|---|---|---|
| A02 | `item_exigido` | sim | `ESPELHAVEL` | `pendente` | — | — | `18b7bbb11b61…` |
| A03 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — | `6dfef47006ed…` |
| A04 | `item_exigido` | sim | `ESPELHAVEL` | `pendente` | — | — | `7e966429d1fc…` |
| A05 | `item_exigido` | sim | `PENDENTE` | `pendente` | A02 | extracao_secao | — |
| A06 | `item_exigido` | sim | `PENDENTE` | `pendente` | A03 | extracao_secao | — |
| A07 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| A08 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| A09 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| A10 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| B01 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — | — |
| B02 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — | — |
| B03 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — | — |
| B04 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — | — |
| B05 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — | — |
| B06 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — | — |
| B07 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| B08 | `item_exigido` | sim | `RESTRITO` | `pendente` | — | — | — |
| B09 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| B10 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| B11 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| B12 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| C01 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| C02 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| C03 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| C04 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| D01 | `item_nao_exigido` | não | `ESPELHAVEL` | `pendente` | — | — | — |
| E02 | `item_exigido` | sim | `PENDENTE` | `pendente` | — | — | — |
| B13 | `evidencia_complementar` | não | `RESTRITO` | `pendente` | — | — | — |
| B14 | `evidencia_complementar` | não | `RESTRITO` | `pendente` | — | — | — |
| A11 | `evidencia_complementar` | não | `RESTRITO` | `pendente` | — | — | — |

## BLOQUEADO — precisam de decisão antes da carga

### A01 — Painel Vivo de Dados

`natureza = item_exigido` · exigido pelo edital: sim

Painel Vivo de Dados. A origem é um quadro do Figma que devolve HTTP 403 anônimo e não há arquivo local. `IMPEDIDO` (problema objetivo de acesso) e `PENDENTE` (não localizado) são ambos defensáveis, e a escolha muda o que a página diz ao avaliador.

### D02 — Instagram @obs_tobiassoueu

`natureza = item_nao_exigido` · exigido pelo edital: não

Instagram @obs_tobiassoueu. É um perfil que abre publicamente, não um documento com arquivo e hash. Não há o que espelhar. `PENDENTE` sugere falta de produção, o que é falso; `PUBLICAVEL` é proibido. Precisa de decisão sobre como um item sem binário é representado.

### E01 — Termos de consentimento das entrevistas

`natureza = item_exigido` · exigido pelo edital: sim

Termos de consentimento das entrevistas. O item foi concebido como termo separado, e a decisão do Prompt 2.2.1 é que o consentimento é verbal gravado e não deve existir termo separado. O item continua exigido pelo edital. Manter `PENDENTE` afirma que falta produzir algo que se decidiu não produzir; `IMPEDIDO` afirma um problema que não existe.

## Arquivos relacionados

Nenhum upload nesta rodada. As linhas de `arquivo` só podem ser criadas
depois do espelhamento, porque `url_publica` é `NOT NULL UNIQUE` e não há
URL própria ainda. **Este plano não cria linha em `arquivo`.**

| Código | Fonte local | Papel | SHA-256 |
|---|---|---|---|
| A02 | `relatorios/relatorio-tecnico-recanto-da-serra.pdf` | original | `18b7bbb11b61…` |
| A03 | `relatorios/relatorio-tecnico-borda-da-mata.pdf` | original | `6dfef47006ed…` |
| A03 | `derivados/a03-borda-da-mata-ocr.md` | derivado: transcricao_leitura_visual | `502d9bf14334…` |
| A04 | `relatorios/relatorio-tecnico-serra-dos-macacos.pdf` | original | `7e966429d1fc…` |
| A09 | `formularios/formulario-de-funcionamento-pedro-e-oviedo.xlsx` | fonte das perguntas | — |
| A10 | `formularios/formulario-recanto-da-serra-respostas.xlsx` | fonte das perguntas | — |
| A10 | `formularios/formulario-borda-da-mata-respostas.xlsx` | fonte das perguntas | — |
| B01 | `fotos/ (56 arquivos em 8 pastas)` | conjunto | — |
| B02 | `entrevistas/01-josenilson-bispo/ (áudio + transcrição)` | conjunto | — |
| B03 | `entrevistas/02-oviedo-e-neide-abreu/` | conjunto | — |
| B04 | `entrevistas/05-pedro-menezes/` | conjunto | — |
| B05 | `entrevistas/03-fundacao-cultura-sao-cristovao/` | conjunto | — |
| B06 | `entrevistas/08-dona-mada/` | conjunto | — |
| B08 | `entrevistas/06-dilson-de-agripino/` | conjunto | — |
| D01 | `identidade-visual/ (8 arquivos)` | conjunto | — |
| E02 | `marcas/ (34 ativos) — arte, não o manual` | conjunto | — |
| B13 | `entrevistas/07-laerte-aguiar/` | conjunto | — |
| B14 | `entrevistas/04-diretor-turismo-sao-cristovao/` | conjunto | — |
| A11 | `formularios/indicadores-observatorio/ (18 arquivos)` | conjunto | — |

## Consentimentos

| Item | Entrevista | Tipo | Evidência na transcrição | Data confirmada |
|---|---|---|---|---|
| B02 | 01 | `verbal_gravado` | `localizada` | 27/03/2026 |
| B03 | 02 | `verbal_gravado` | `localizada` | 28/03/2026 |
| B05 | 03 | `verbal_gravado` | `localizada` | 06/04/2026 |
| B14 | 04 | `verbal_gravado` | `localizada` | 06/04/2026 |
| B04 | 05 | `verbal_gravado` | `localizada` | 05/04/2026 |
| B08 | 06 | `verbal_gravado` | `localizada` | **não confirmada** |
| B13 | 07 | `verbal_gravado` | `localizada` | **não confirmada** |
| B06 | 08 | `verbal_gravado` | `nao_localizada` | **não confirmada** |

### Consentimento não pode ser carregado nesta rodada

Dois impedimentos de schema, nenhum deles contornável sem inventar fato:

1. **`consentimento.pessoa_id` é `NOT NULL`** e `pessoa` tem zero linhas.
   Carregar consentimento exige antes criar as pessoas — dado pessoal de
   entrevistado, que é decisão à parte e não foi pedida nesta rodada.
2. **`consentimento.concedido_em` é `date NOT NULL`** e a data está
   confirmada em apenas **5 das 8** entrevistas. Para 06, 07 e 08 não há
   data em nenhum arquivo do acervo. Preencher exigiria inventar.

Os fatos ficam registrados aqui e em `observacao` do documento; a tabela
`consentimento` permanece vazia. **Isso não afeta o gate público**: áudio e
transcrição estão em `RESTRITO` por estado, não por falta de consentimento.

## Validação do dry-run (§17)

| Verificação | Resultado | Valor |
|---|---|---|
| códigos duplicados = 0 | OK | 0 |
| 28 item_exigido | OK | 28 |
| 3 evidencia_complementar | OK | 3 |
| 2 item_nao_exigido | OK | 2 |
| nenhum PUBLICAVEL | OK | 0 |
| B07 continua PENDENTE | OK | PENDENTE |
| B07 segue exigido pelo edital | OK | True |
| B13 não substitui B07 | OK | B13=RESTRITO complementar, B07=PENDENTE exigido |
| A11 não substitui A01 | OK | A01 permanece item_exigido; A11 é complementar |
| nenhum URL inventado | OK | 0 linhas de arquivo criadas |
| nenhum DOI inventado | OK | campo não preenchido em nenhum item |
| nenhum hash inventado | OK | 3 hashes, todos conferidos contra o original local |
| nenhum original substituído por derivado | OK | A02 e A03 permanecem; A05 e A06 apontam para eles por derivado_de |
| nenhum RESTRITO elegível ao ZIP público | OK | o gate exige PUBLICAVEL + revisão concluída; ninguém satisfaz |

**14/14 conformes.**

## Regra de parada

Nada foi gravado. A carga real depende de:

1. decisão sobre os três itens BLOQUEADOS;
2. decisão sobre a derivação XLSX → CSV (§3), para que a carga não use
   fonte divergente;
3. autorização explícita para escrever, com `DATABASE_URL_MANUTENCAO`.