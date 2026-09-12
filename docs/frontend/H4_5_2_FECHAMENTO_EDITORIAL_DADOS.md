# H4.5.2 — Fechamento editorial da seção “Dados vivos”

**Data:** 2026-09-12

**Estado:** EM PROTÓTIPO — `/dev/dados-vivos`, 404 em produção

**Home:** não alterada; esta fase **não é integração**

**Antecedente:** H4.5.1

**Baseline Git autorizada:** `d3f3ef5f8180da095997ac494775ffa7e8637960`, com diff local provisório auditado e preservado

## 1. Objetivo e limites

A H4.5.2 fecha as decisões editoriais que a H4.5.1 deixou abertas. A arquitetura
visual aprovada foi preservada: número protagonista, faixa sem cartões, série
mensal, tabela textual, realce, carcará, fios, temas, movimento reduzido e
Server Components continuam os mesmos.

Esta fase não integra a H4 na Home, não altera H1, H2 ou H3, não toca na H4.0,
não muda infraestrutura e não publica nada. A próxima mudança de produto é uma
tarefa separada de integração.

## 2. Seleção dos quatro indicadores de apoio

A candidata à Home passa de sete para quatro indicadores secundários, nesta
ordem:

| Ordem | ID | Rótulo na candidata | Valor auditado |
|---:|---|---|---:|
| 1 | H4-003 | Despesa total registrada | R$ 18.762,52 |
| 2 | H4-004 | Receita registrada | R$ 15.700,00 |
| 3 | H4-005 | Participação do trabalho na despesa | 40,6% |
| 4 | H4-008 | Localidades de origem registradas | 12 |

A sequência conta: volume financeiro → receita → participação do trabalho →
origem territorial documentada. A redução é hierarquia editorial da Home, não
juízo de validade sobre o conjunto.

Os três indicadores reservados ao conjunto completo são:

- H4-002 — Valor movimentado por dia de funcionamento — R$ 469,06;
- H4-006 — Registros de funcionamento coletados — 40;
- H4-007 — Contratações de trabalho registradas — 84.

Eles continuam no dataset auditado, na H4.0 e no material do laboratório
reservado à futura página de Dados. Nenhum indicador foi apagado ou invalidado.

## 3. Revisão de “Localidades alcançadas”

O rótulo final é **“Localidades de origem registradas”**.

A evidência é a regra do próprio H4-008, preservada no dataset factual:
“Contagem distinta de localidades de origem declaradas pelos trabalhadores
contratados.” A auditoria H4.0 registra a mesma operação como contagem distinta
de localidades de origem. “Alcançadas” poderia sugerir impacto ou alcance
territorial que a base não mede.

O título original do dataset não foi reescrito, porque a H4.0 permanece como
registro factual intacto. A precisão editorial vive somente na seleção da
candidata, em `selecaoEditorial.ts`, com justificativa explícita.

Os nomes apresentados na composição resumida são rótulos editoriais de
interface. O dataset auditado da H4.0 permanece canônico e não foi reescrito.
Os IDs H4-003, H4-004, H4-005 e H4-008 continuam resolvendo valores, unidades,
bases e regras diretamente nesse dataset; a seleção não duplica números.

## 4. Copy final das passagens

### Entrada

- Rótulo: **Campo → Medida**
- Antes: “O que a pesquisa observou em campo volta aqui como quantidade declarada.”
- Final: **“Os registros da pesquisa também permitem uma leitura quantitativa do território.”**

“Registros da pesquisa” corresponde ao corpus de registros diários que sustenta
os agregados. “Território” não amplia o recorte: a própria seção declara os dois
equipamentos de Tobias Barreto e o período medido.

### Saída

- Rótulo: **Medida → Conjunto completo**
- Antes: “O detalhamento por atividade pertence ao conjunto completo do levantamento, e não a esta leitura.”
- Final: **“Esta leitura apresenta um recorte. O levantamento completo preserva o detalhamento das atividades registradas.”**

O conjunto auditado contém a aba e o ranking das atividades registradas. A copy
não cria link para `/dados`, porque a rota pública ainda não cumpre essa
promessa.

## 5. Ranking e limiar

O ranking de atividades permanece fora da candidata à Home e continua inteiro
no conjunto completo, reservado à futura página de Dados. O limiar de dez dias
não aparece na candidata e nenhum novo limiar editorial foi criado.

## 6. Preservações verificadas

- H4.0 intacta em `/dev/dados`;
- protagonista preservado em 93,4%, com base, cálculo e limite;
- seis meses e todos os valores da tabela preservados;
- carcará preservado uma vez, somente na passagem de entrada;
- gráfico, escala, conectores e realce preservados;
- nenhum número, fórmula ou valor bruto alterado;
- nenhum Client Component, JavaScript ou dependência acrescentado;
- Home, H1, H2 e H3 sem integração da H4.

## 7. Diff herdado

A continuidade começou com alterações locais autorizadas como baseline
provisória. O diff foi auditado antes de novas edições: todos os arquivos e
mudanças pertenciam à H4.5.2; não havia segredo, artefato transitório, mudança
numérica, fórmula, infraestrutura, dependência ou `"use client"` novo. Nada foi
descartado, restaurado, resetado ou escondido em stash.

Na primeira retomada, a inspeção visual revelou uma divergência que a auditoria
inicial não havia percebido: H4-003 e H4-004 ainda exibiam os títulos canônicos
“Despesa total no período” e “Receita registrada no período”. A correção foi
autorizada e ficou somente na camada editorial: os rótulos passaram a “Despesa
total registrada” e “Receita registrada”. O dataset permaneceu intacto.

## 8. Próximos passos

A H4.5.2 encerra a seleção e as duas copies. A H4 fica pronta para uma tarefa
separada de integração na Home, sem iniciá-la aqui.

Continuam humanas e fora desta fase: aprovação do título editorial “Onde o
recurso circula”, definição da citação pública definitiva para a fonte restrita
e autorização da integração H4.1. O ranking e os três indicadores reservados
pertencem à futura página de Dados.

## 9. Verificação final

| Gate | Resultado |
|---|---|
| `pnpm tipos` | passa |
| `pnpm lint` | passa, com os quatro avisos históricos de `!important` em `tokens.css` |
| `pnpm teste` | 516 passam, 3 pulados |
| `pnpm a11y` | 262 passam |
| `pnpm verificar` | passa |
| `pnpm build` | passa; 25 páginas estáticas |
| `pnpm pendencias` | não atestado: `DATABASE_URL` ausente; nada consultado |

As capturas reais foram salvas fora do Git em `h4-5-2-capturas/`, no diretório
de visualizações da sessão. O conjunto contém 1440 claro/escuro, 768, 375
claro/escuro, 320, zoom 200% e recortes da faixa, do protagonista, do gráfico e
das duas passagens.
