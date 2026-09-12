# H4.0 — Dados e indicadores: auditoria e protótipo

**Data:** 2026-09-10

**Estado:** EM PROTÓTIPO — `/dev/dados`, 404 em produção

**Home:** não alterada

**Baseline:** c2c0afc — refactor: refina narrativa da pesquisa em campo

> **Nota cronológica de 2026-09-12.** Esta fase foi prototipada **antes** da
> H3.5 e da H3.5.1, que consolidaram a linguagem visual depois dela. A H4.5
> aplica aquela linguagem a estes mesmos indicadores, numa rota própria, e
> **não alterou nenhum arquivo desta fase**: `/dev/dados` continua exatamente
> como este documento descreve. A auditoria, os valores e a classificação de
> publicação registrados aqui continuam sendo a autoridade factual. Ver
> [H4_5_DADOS_VIVOS.md](./H4_5_DADOS_VIVOS.md).

## 1. O que esta fase respondeu primeiro

Antes de desenhar qualquer gráfico: **quais números o Observatório pode
afirmar publicamente, de onde eles saem e o que exatamente representam.**

A resposta curta é que existe material sólido, e que ele não é uniforme. A
mesma unidade documental reúne agregados publicáveis, agregados com pendência
metodológica aberta e abas que nomeiam pessoas. Separar as três coisas foi o
trabalho desta rodada.

Nenhum campo ausente foi preenchido por inferência. Nenhum número foi criado.

## 2. Fontes auditadas

Corpus externo, apontado por `OBSERVATORIO_FONTES_DIR`. O caminho absoluto não
é registrado aqui nem chega ao código. Nenhum original foi copiado para o
repositório.

**21 arquivos candidatos**: 1 planilha de indicadores, 17 PDFs que a renderizam
e 3 planilhas de respostas de formulário.

| Arquivo | Tipo | Bytes | SHA-256 | Função aparente | Publicabilidade | PII |
|---|---|---:|---|---|---|---|
| `anexo-indicadores-…-final.xlsx` | XLSX | 530.387 | `10143117a960f3a07a84d3f798029d1490399b90b6276e42763d6c5f7b52c7b1` | fonte consolidada dos indicadores | conjunto RESTRITO | sim, em abas próprias |
| `00-capa.pdf` | PDF | 114.854 | `c7bf054f79faabe5a7bf30337a10a3548bd8a787ac003b33a5094f0451c80bfb` | identificação do anexo | RESTRITO com o conjunto | sim |
| `01-sumario.pdf` | PDF | 104.911 | `9abde76705a04434767346f463f22ae63c9a94b463d0f94db9cca043be313efb` | sumário | RESTRITO com o conjunto | não |
| `02-painel-executivo.pdf` | PDF | 111.426 | `fe093922ee93f8d12d5473a5dba04840d2d894a825931d30c04cde9fef8354a8` | renderização dos agregados | RESTRITO com o conjunto | não |
| `03-indicadores-solidaria.pdf` | PDF | 117.571 | `442c7c490f64183364eaf1cad058c1c15854e785ad96bfabeff3ca331d5e71ec` | renderização dos 26 indicadores | RESTRITO com o conjunto | não |
| `04-publico-mensuracao.pdf` | PDF | 117.400 | `66f0f2e3d39957a2a129a1b64d694a93ca787d675cd5d733a5b77cc800392f6f` | metodologia de público | RESTRITO com o conjunto | sim |
| `05-serie-mensal.pdf` | PDF | 93.901 | `151e952509e52ee07b820098f307a59ad46a5f4a4a7a0c4b2890b92eb951d206` | série mensal | RESTRITO com o conjunto | não |
| `06-pessoas-trabalho.pdf` | PDF | 203.310 | `9c7b74200941d2b77b820311621f5151312dd6eab3096260997fc3b9d6fb0811` | ranking nominal de pessoas | **NÃO PUBLICAR** | sim |
| `07-localidades.pdf` | PDF | 104.978 | `332048e0de36549ab5a14ef9d8c22d94296de890935537c7fdc55f62012e2916` | circulação por localidade | PENDENTE | risco por cruzamento |
| `08-fornecedores.pdf` | PDF | 113.992 | `202afd35cce33009cc02fc3cf9ab3a925ec795d0c41e4c803dd97d99c49d9e6f` | ranking nominal de fornecedores | **NÃO PUBLICAR** | sim |
| `09-atividades.pdf` | PDF | 99.244 | `0720f4a1af36ee071e351756805d8ca5df7fd2bb0ebf13b0af17931b27af774a` | ranking de atividades | RESTRITO com o conjunto | não |
| `10-conciliacao.pdf` | PDF | 110.181 | `3d0cd369c270ab24d67aa0e2aa6800fb83c41f6b31eb77171408015ddac44fc1` | conciliação com o relatório parcial | RESTRITO com o conjunto | não |
| `11-nota-metodologica.pdf` | PDF | 122.618 | `21f508407c67f47a4e5518aa8b21a8961a13f6d0bbc15ff83392ef1619714ece` | tratamento e correções | RESTRITO com o conjunto | sim, cita nomes |
| `12-perfil-visitantes.pdf` | PDF | 129.159 | `ec9401bfacb0799bbcf2e81ed7e2f08686cc04e765f8bdcb4f7dc0cfb957a996` | perfil da amostra de visitantes | RESTRITO com o conjunto | não |
| `13-motivacao-atividades.pdf` | PDF | 125.018 | `01d83183cbba0d7b04b746340bfca5b846d0af7a819a74893e53d39f74eaa8e3` | motivação e atividades | RESTRITO com o conjunto | não |
| `14-consumo-percepcao.pdf` | PDF | 121.366 | `bb412a77600037470ea2b70c03d26c72fc37c2a9d2138cdf148e764fb1f9263e` | consumo e percepção | RESTRITO com o conjunto | não |
| `15-grupos-institucionais.pdf` | PDF | 115.818 | `d38ec73b859f58fc373bc732da7ca603a06d3d40d4e8022ea35d3da6996e737e` | grupos nomeados | PENDENTE | instituições nomeadas |
| `16-dicionario-dados.pdf` | PDF | 134.633 | `1b08e39983184fc4e8e4636a86e1a66eb119f96675a5e009a2c3101d9454dbcd` | dicionário de dados | RESTRITO com o conjunto | não |
| `formulario-de-funcionamento-….xlsx` | XLSX | 25.726 | `4e426325bf010a2914b7b459ea7b410e6150f4cfb0eb78e4a5da27f45b0e842c` | base bruta de funcionamento | RESTRITO | sim, nome do respondente |
| `formulario-recanto-da-serra-respostas.xlsx` | XLSX | 17.609 | `c69044128c52d12a2d0a7fdff847b1e025b016c8ec91dced653a25b125d9bcc7` | respostas de visitantes | RESTRITO | anônima na origem |
| `formulario-borda-da-mata-respostas.xlsx` | XLSX | 9.417 | `7c50c0291901ca39a5497f674a2a19b0efa7b56ea58d150a8a21835b329b6fd1` | respostas de visitantes | RESTRITO | anônima na origem |

A unidade documental do conjunto continua classificada como **RESTRITA** no
módulo de classificação do projeto, com revisão de privacidade pendente e a
razão registrada: o conjunto inclui arquivos que nomeiam pessoas. Nada nesta
fase promoveu esse estado.

## 3. Auditoria aba por aba

**20 abas auditadas**: 17 do anexo de indicadores e 1 em cada planilha de
respostas. Nenhuma aba tem fórmula: todos os valores estão gravados.

| Aba | Linhas | Colunas | Natureza | Unidade de observação | PII | Agregável | Publicabilidade |
|---|---:|---:|---|---|---|---|---|
| `00_Capa` | 33 | 6 | identificação e sumário quantitativo | documento | **sim** — proponente e dois atores-chave | não | contexto interno |
| `01_Sumario` | 21 | 6 | índice das abas | documento | não | não | contexto interno |
| `02_Painel_Executivo` | 32 | 6 | 23 agregados com regra declarada | equipamento e consolidado | não | **sim** | fonte dos APTOS |
| `03_Indicadores_Solidaria` | 30 | 9 | 26 indicadores com código, regra e leitura | equipamento e consolidado | não | **sim** | fonte dos APTOS |
| `04_Publico_Mensuracao` | 22 | 8 | 12 categorias de público e regra de não-duplicação | categoria de público | **sim** — nomes de pessoas entrevistadas numa célula de definição | sim | metodologia interna |
| `05_Serie_Mensal` | 10 | 13 | série de 6 meses mais linha de total | mês | não | **sim** | fonte do gráfico |
| `06_Pessoas_Trabalho` | 37 | 22 | ranking nominal de trabalhadores | pessoa | **sim** — nome, grafias, gênero inferido, localidade, valores e datas | só como agregado | **NÃO PUBLICAR** |
| `07_Localidades` | 22 | 12 | circulação de recurso por localidade | localidade | risco: linhas com uma única pessoa e valor exato | só como agregado | PENDENTE |
| `08_Fornecedores` | 42 | 15 | ranking de fornecedores | fornecedor | **sim** — fornecedores identificados nominalmente, com localidade | só como agregado | **NÃO PUBLICAR** |
| `09_Atividades` | 19 | 8 | ranking de atividades por dias e alcance | atividade | não | **sim** | fonte do ranking |
| `10_Conciliacao` | 17 | 6 | comparação com o relatório parcial | indicador | não | não | decisivo para classificar |
| `11_Nota_Metodologica` | 54 | 6 | cobertura, correções e regras | campo e correção | **sim** — correções citam pessoas | não | metodologia interna |
| `12_Perfil_Visitantes` | 50 | 26 | perfil da amostra de 63 respostas | respondente agregado | não | sim | fora do escopo desta fase |
| `13_Motivacao_Atividades` | 49 | 26 | motivação e atividades da amostra | respondente agregado | não | sim | fora do escopo desta fase |
| `14_Consumo_Percepcao` | 40 | 26 | consumo e percepção da amostra | respondente agregado | não | sim | fora do escopo desta fase |
| `15_Grupos_Institucionais` | 29 | 26 | grupos e instituições recebidos | grupo | instituições nomeadas | sim | PENDENTE |
| `16_Dicionario_Dados` | 329 | 6 | dicionário de campos | campo | não | não | metodologia interna |
| funcionamento — `Respostas ao formulário 1` | 41 | 35 | 40 respostas individuais | dia de operação | **sim** — nome do responsável pelo preenchimento | só como agregado | RESTRITO |
| Recanto — `Respostas ao formulário 1` | 53 | 31 | 52 respostas individuais | visitante | anônima na origem; cita instituição e traz campos abertos | só como agregado | RESTRITO |
| Borda da Mata — `Respostas ao formulário 1` | 12 | 16 | 11 respostas individuais | visitante | anônima na origem | só como agregado | RESTRITO |

Título de aba não foi tratado como indicador. O que virou candidato foram as
linhas que declaram valor, unidade e regra de cálculo.

## 4. Dados pessoais

**Há PII, e ela não entra em nada derivado.** Onde ela está, descrita sem
reproduzir conteúdo:

- ranking nominal de trabalhadores: nome consolidado, variações de grafia,
  gênero **inferido pelo prenome**, localidade de origem, município, número de
  contratações, valor recebido e datas da primeira e da última contratação. É
  o conjunto mais sensível do anexo;
- ranking de fornecedores: estabelecimentos e produtores identificados
  nominalmente, com localidade e valor;
- capa: nome do proponente e dos dois atores-chave informantes;
- metodologia de público: uma célula de definição enumera pessoas
  entrevistadas, com cargo e instituição;
- nota metodológica: as correções citam pessoas ao explicar consolidação de
  identidade;
- base bruta de funcionamento: coluna com o nome de quem preencheu;
- bases de visitantes: **anônimas na origem** — a própria nota metodológica
  registra que os formulários não coletam nome, documento, telefone ou e-mail.
  Ainda assim são respostas individuais, e a regra do projeto mantém resposta
  individual como restrita. Comentários abertos podem citar terceiros e estão
  sinalizados na fonte para anonimização.

**Reidentificação por cruzamento.** A aba de localidades tem linhas com uma
única pessoa e valor exato de renda. Publicar a tabela por localidade permitiria
identificar essa pessoa em comunidade pequena, mesmo sem o nome. Por isso o
detalhamento por localidade fica PENDENTE e só o **número de localidades**
alcançadas é publicado.

Nenhuma pseudonimização foi improvisada. Trocar nome por identificador não é
anonimizar, e não foi feito.

## 5. Matriz dos indicadores candidatos

**43 candidatos** avaliados, todos com valor declarado na fonte: 23 no painel
executivo e 20 exclusivos do conjunto de indicadores de economia solidária.

- **APTO: 29**
- **PENDENTE: 11**
- **NÃO PUBLICAR: 3**

Período de todos: 21/07/2025 a 21/12/2025. Recorte de todos: Ecoparque e Museu
Recanto da Serra e Centro Cultural e Museu Borda da Mata, em Tobias Barreto
(SE).

### 5.1 PENDENTES, e por quê

| Indicador | Valor na fonte | Por que não é APTO |
|---|---|---|
| Visitantes registrados | 684 | conciliação **aberta**: a fonte manda adotar 11 no Borda da Mata ou localizar o registro da décima segunda visita |
| Pessoas integrantes de grupos organizados | 495 | é subconjunto do total de visitantes, que está em conciliação |
| Pessoas remuneradas distintas | 32 | definição **aberta**: a fonte pergunta se a autorremuneração do gestor entra na contagem |
| Receita média por visitante | R$ 22,95 | denominador é o total de visitantes |
| Custo médio por visitante | R$ 27,43 | denominador é o total de visitantes |
| Diária média sobre o valor-dia do salário mínimo | 181,4% | a premissa de salário mínimo adotada não está declarada nas abas lidas |
| Renda média por trabalhador | R$ 238,13 | denominador é a contagem de pessoas distintas, em aberto |
| Registros de trabalho não remunerado | 1 | a própria fonte registra provável subnotificação |
| Concentração da renda nas 5 maiores | 42,3% | deriva do ranking nominal e aproxima reidentificação quando cruzado com localidades |
| Participação de grupos organizados no público | 72,4% | denominador é o total de visitantes |
| Participação do público escolar | 60,7% | denominador é o total de visitantes |

### 5.2 NÃO PUBLICAR

| Indicador | Valor na fonte | Por quê |
|---|---|---|
| Participação feminina nas contratações | 36,9% | gênero **inferido pelo prenome**, não autodeclarado. A própria fonte manda validar com os atores-chave antes de publicar |
| Participação feminina no valor pago | 32,5% | mesma inferência |
| Valor comprado junto a produtor direto ou feira | 1,4% | a fonte registra que o numerador está zerado por ausência de valor destacado. Publicar afirmaria algo falso sobre a cadeia de suprimento |

Somam-se a estes, como **conjuntos** e não como indicadores, os dois rankings
nominais — pessoas e fornecedores — e o detalhamento por localidade.

### 5.3 Os oito escolhidos para o protótipo

Todos APTOS. IDs em namespace próprio da fase: **não são códigos do inventário
do edital nem da fonte**.

| ID | Indicador | Valor bruto | Exibido | Unidade | Base | Regra |
|---|---|---|---|---|---|---|
| H4-001 | Retenção municipal da despesa | 0,9339802439 | 93,4% | % | R$ 16.055,80 de despesa com localidade e valor identificados | despesa executada dentro de Tobias Barreto ÷ despesa identificada total |
| H4-002 | Valor movimentado por dia de funcionamento | 469,063 | R$ 469,06 | R$ | 40 registros de funcionamento | despesa total ÷ registros |
| H4-003 | Despesa total no período | 18.762,52 | R$ 18.762,52 | R$ | — | compras e insumos + contratações |
| H4-004 | Receita registrada no período | 15.700 | R$ 15.700,00 | R$ | — | soma do valor arrecadado dos registros diários |
| H4-005 | Participação do trabalho na despesa | 0,4061288143 | 40,6% | % | R$ 18.762,52 de despesa total | contratações ÷ (compras + contratações) |
| H4-006 | Registros de funcionamento coletados | 40 | 40 | nº | — | um registro por dia de operação relatado |
| H4-007 | Contratações de trabalho registradas | 84 | 84 | nº | — | uma contratação por pessoa contratada em um dia de registro |
| H4-008 | Localidades alcançadas pela renda do trabalho | 12 | 12 | nº | — | contagem distinta de localidades de origem declaradas |

Mais a série mensal de seis meses — receita, despesa, registros e contratações
— e o ranking de dezesseis atividades por dias com registro.

## 6. Proveniência: de onde saiu cada número

Cada indicador carrega no dataset um campo `procedencia` com aba, linha, código
na fonte e a instrução de conferência. **Esse campo nunca é renderizado**: ele
existe para auditoria interna e para os testes.

Nove dos valores publicados são reconferíveis **dentro do próprio dataset**, e
há teste para cada conferência:

| Valor | Conferência |
|---|---|
| Despesa total R$ 18.762,52 | soma da coluna de despesa da série mensal |
| Receita R$ 15.700,00 | soma da coluna de receita da série mensal |
| Registros 40 | soma da coluna de registros da série mensal |
| Contratações 84 | soma da coluna de contratações da série mensal |
| Retenção 93,4% | R$ 14.995,80 ÷ R$ 16.055,80 |
| Valor por dia R$ 469,06 | R$ 18.762,52 ÷ 40 |
| Participação do trabalho 40,6% | R$ 7.620,00 ÷ R$ 18.762,52 |
| % de cada atividade | dias com a atividade ÷ 40 registros |
| Meses com despesa acima da receita | comparação linha a linha da série, calculada no componente |

A soma em reais é feita **em centavos** nos testes: somar seis valores com
duas casas em ponto flutuante acumula resíduo e faria o teste falhar por
motivo errado.

## 7. Regras de arredondamento

Nenhum arredondamento é silencioso. As funções são puras e versionadas em
`src/dados/indicadores/formato.ts`, e cada regra tem teste com valor fixo.

| Grandeza | Casas | Regra | Exemplo |
|---|---:|---|---|
| percentual | 1 | meio-para-cima sobre o valor × 100 | 0,9339802439 → `93,4%` |
| reais | 2 | meio-para-cima, ponto de milhar, vírgula decimal | 469,063 → `R$ 469,06` |
| contagem | 0 | ponto de milhar acima de mil | 15700 → `15.700` |
| fator | 2 | meio-para-cima | 1,195064968 → `1,20×` |

`Intl.NumberFormat` **não** é usado: a saída dele depende do ICU do runtime, e
um build feito em máquina com ICU reduzido devolveria `18,762.52` para o mesmo
número. Num site de prestação de contas o valor exibido é parte da prova, então
a formatação é explícita e testada. O sinal negativo usa o menos tipográfico.

## 8. Dataset derivado

| | |
|---|---|
| Caminho | `src/dados/indicadores/derivados.ts` e `formato.ts` |
| Formato | `const` TypeScript com `as const satisfies`, como em `hero/derivados.ts` e `pesquisa/derivados.ts` |
| Bytes | 12.526 B e 3.413 B |
| Conteúdo | 8 indicadores, 6 meses de série, 16 atividades, 2 agregados de despesa identificada e o SHA-256 da fonte |
| Dependência nova | nenhuma |

Não é cópia da planilha: das 17 abas, nenhuma linha individual atravessou. Zod
não foi usado porque não há entrada externa em tempo de execução — o dataset é
constante versionada, e o contrato é o tipo mais os testes de invariante. É a
mesma decisão já tomada nos dois datasets derivados anteriores.

## 9. Fonte interna e fonte pública

A unidade documental que sustenta os números é RESTRITA. Ela sustenta a
agregação **internamente**; isso não autoriza publicar identificador, título
interno, URL, arquivo ou nome de aba.

Por isso cada indicador tem `fontePublica`, que pode ser renderizado, e
`procedencia`, que não pode. O protótipo exibe `Levantamento próprio do
Observatório`. Dois testes vigiam o limite: um sobre o dataset, outro sobre o
HTML servido, procurando o código do item, os códigos internos dos indicadores,
os nomes das abas e o nome do arquivo.

**Isto é uma pendência para a H4.1.** "Levantamento próprio do Observatório" é
verdadeiro e não vaza nada, mas a citação pública definitiva da fonte é decisão
humana: um número de prestação de contas costuma exigir referência mais
específica, e a referência específica hoje aponta para um conjunto restrito.

## 10. Banco de dados

Nada foi criado, alterado ou carregado. Sem migração, sem tabela, sem `INSERT`.

`DATABASE_URL` está disponível no ambiente local e foi usada **somente para
`SELECT`** de verificação: no schema público existem `arquivo` e `documento`, e
**a tabela `indicador` não existe** — ela pertence à Tarefa 13. O protótipo não
antecipa essa carga e não depende dela.

## 11. Arquitetura do frontend

Nenhuma biblioteca de gráficos foi instalada nem avaliada como necessária.

| | Antes | Depois |
|---|---:|---:|
| arquivos com `"use client"` | 6 | 6 |
| Client Components acrescentados pela H4 | — | **0** |
| dependências novas | — | **0** |

A seção inteira é Server Component. As duas ilhas alcançáveis na rota são as do
cabeçalho do laboratório, herdadas, e existem igualmente em `/dev/pesquisa`.

### Escolha de cada gráfico

| Gráfico | Forma | Por quê |
|---|---|---|
| Receita e despesa mês a mês | **SVG no servidor**, dot plot com conector | a pergunta é a *distância* entre as duas séries, não cada uma delas. Dois pontos ligados desenham a diferença diretamente, e o conector troca de lado quando o saldo troca de sinal. Barras pareadas obrigariam a comparar comprimentos |
| Atividades por dias com registro | **tabela com barra em CSS** | dezesseis categorias nominais com uma medida. O rótulo precisa de espaço horizontal, a ordem é o próprio dado e o leitor quer o número ao lado da barra. Um SVG separado precisaria de uma alternativa textual que a tabela já é |

Pizza, rosca, velocímetro, 3D e gradiente decorativo não foram usados. A
tipografia segue os três papéis do projeto: Archivo nos números e títulos,
Literata no texto, IBM Plex Mono só em metadado, eixo, legenda e valor de
barra — nunca em parágrafo.

Cor: dois tons semânticos, marca e acento, sobre neutros. **Cor nunca é o único
canal** — receita e despesa se distinguem por forma antes de se distinguirem
por cor, a legenda nomeia as duas em texto, e o ranking escreve "receita direta"
ou "receita indireta" ao lado de cada atividade.

Tipografia dimensionada em `cqi`, e não em `vw`: com `vw` o número monumental
estourava o container em zoom de 200%, porque a janela não encolhe junto com a
seção.

## 12. Acessibilidade do dado

- o SVG tem `role="img"`, `<title>` e `<desc>` com conteúdo real — nada de
  `aria-label="gráfico"`;
- a tabela com os valores exatos está **sempre no DOM**, e é ela que carrega o
  dado onde o gráfico não aparece;
- abaixo de 40rem de container o SVG e sua legenda somem: texto de 12 unidades
  num `viewBox` de 720 fica ilegível antes disso, e a tabela basta;
- a barra do ranking tem `aria-hidden`; o número e a porcentagem vivem no texto
  da célula;
- as tabelas têm `caption`, `th` com `scope` e cabem sem rolagem horizontal em
  320 px — região rolável precisaria de parada de Tab própria, e a que cabe não
  precisa;
- não há tooltip: nenhum dado depende de passar o mouse;
- sem animação, sem contador rolando, sem gráfico que se desenha. Movimento
  reduzido não encontra transição para desligar.

## 13. Presets

Os dois usam **o mesmo dataset**: mesmos valores brutos, mesma precisão, mesma
base, mesmo recorte, mesma fonte. Muda hierarquia e densidade.

| | A — Declaração editorial | B — Painel de pesquisa |
|---|---|---|
| protagonista | um indicador ocupa metade da largura, com ficha completa ao lado | o mesmo indicador, menor, abrindo uma grade |
| indicadores simultâneos | 3 | 8 |
| metadado | ficha completa do protagonista | ficha completa mais base em cada célula |
| gráfico | largura inteira, abaixo da leitura | em coluna própria, ao lado da leitura |
| ranking de atividades | ausente | presente, largura inteira |
| sensação | publicação de pesquisa | ferramenta de consulta |
| risco de parecer SaaS | baixo | médio-baixo |

**Recomendação técnica: A — Declaração editorial.** Ela conversa melhor com a
H3, que termina em fotografia e leitura; entra na Home com um número que
sustenta a narrativa em vez de abrir um painel; e mantém a promessa da direção
visual, em que a ficha é o elemento assinatura e o número é seco. B é o
material certo para uma futura página `/dados`, onde consulta é o objetivo.

A escolha final é humana.

## 14. Inspeção visual

| Pergunta | A | B |
|---|---|---|
| parece SaaS? | não: sem cartão, sem sombra, sem pílula, sem ícone | quase: a grade de oito células aproxima, mas hairline sobre o fundo da página e ausência de cartão seguram |
| parece Power BI? | não | não: sem moldura de gráfico, sem caixa de legenda, sem paleta padrão |
| parece relatório em PDF? | não: escala tipográfica e espaço negativo são editoriais | não |
| cards demais? | não, são dois | no limite; a grade é de células, não de cartões |
| número como publicidade? | não: a copy em volta é seca e diz o que o número **não** mede | não |
| o gráfico é necessário? | sim: mostra a distância entre receita e despesa | sim, e o ranking acrescenta ordenação |
| permite comparação? | sim, mês a mês e entre as duas séries | sim, e entre atividades |
| metadados têm presença? | sim, ficha completa | sim, ficha mais base por célula |
| mono demais? | não, só metadado | no limite, pela densidade da grade |
| cor demais? | não, dois tons | não |
| hierarquia funciona sem cor? | sim, por tamanho e posição | sim |
| compreensível sem legenda complexa? | sim | sim |
| parece o mesmo Observatório? | sim: mesma ficha, mesma numeração de seção, mesmos fios de 1px | sim |

Ajustes feitos durante a inspeção: o rótulo do último tick do eixo estava
cortado; a grade de oito células pintava um bloco vazio onde a última célula
não existia, e passou a usar borda por célula; o valor em reais quebrava depois
do cifrão nas células de quatro colunas; e a legenda do gráfico continuava
visível onde o gráfico estava oculto.

## 15. Performance

A rota é DEV e responde 404 em produção, então o custo medido é o da própria
seção, no servidor de desenvolvimento.

| Item | Valor |
|---|---:|
| dataset, `derivados.ts` | 12.526 B |
| dataset, `formato.ts` | 3.413 B |
| CSS da seção | 9.238 B |
| SVG por gráfico, no HTML | 3.978 B |
| SVG total no documento (dois presets) | 7.940 B |
| HTML total da rota | 142.383 B |
| nós DOM — preset A | 125 |
| nós DOM — preset B | 278 |
| nós DOM — um gráfico | 42 |
| JavaScript acrescentado | **0** |
| fotografia acrescentada | nenhuma |

Nenhum arquivo novo é baixado por causa da seção: o único chunk exclusivo da
rota tem 418 B e é o módulo da própria página no servidor de desenvolvimento.

## 16. Lighthouse

**Não disponível.** `@lhci/cli` continua não instalado — `lighthouserc.json`
existe e o gate continua exigido, mas não há binário no projeto. Nada foi
instalado para satisfazer este item. A dívida é a mesma registrada em
`docs/divida-documental.md` §4 e pertence à H7.

## 17. Testes

Dados:

- arredondamento e formatação com valores fixos, incluindo negativo;
- determinismo: duas chamadas devolvem a mesma saída, e a saída esperada está
  fixada no teste;
- série mensal fecha com despesa, receita, registros e contratações declarados;
- retenção municipal recalculada dos dois agregados de despesa;
- valor por dia e participação do trabalho recalculados;
- base da retenção menor que a despesa total, que é o ponto que distingue as
  duas;
- ranking ordenado e nenhuma atividade acima do total de registros;
- namespace dos identificadores e unicidade;
- nenhum campo renderizável com identificador da fonte restrita;
- nenhum campo renderizável com padrão de dado pessoal;
- dataset permanece agregado;
- SHA-256 da planilha de origem, quando o corpus está disponível — o teste é
  pulado com motivo explícito quando não está.

Frontend:

- os dois presets mostram os mesmos valores;
- todo gráfico tem título, descrição e tabela equivalente;
- a barra não carrega o dado sozinha;
- nenhuma fonte restrita nem dado pessoal no HTML;
- título editorial marcado como proposta;
- teclado alcança o conteúdo e o foco é visível;
- o gráfico aparece só na largura em que seu texto é legível;
- 320, 375, 768 e 1440 px, claro e escuro, sem overflow;
- zoom de 200% sem overflow e com o número legível;
- movimento reduzido sem animação nem transição;
- rota fora do sitemap e bloqueada no robots;
- **a Home continua sem a seção**, verificado no navegador e por leitura do
  código da página inicial.

## 18. Screenshots

Fora do Git, em `tmp/h4-screenshots/`:

- A: `dados-a-1440-light.png`, `dados-a-1440-dark.png`,
  `dados-a-375-light.png`, `dados-a-375-dark.png`;
- B: `dados-b-1440-light.png`, `dados-b-1440-dark.png`,
  `dados-b-375-light.png`, `dados-b-375-dark.png`;
- recomendado em 320: `dados-a-320-light.png`.

## 19. Riscos e bloqueios para a H4.1

1. **escolha humana entre A e B** — a integração não começa sem ela;
2. **citação pública da fonte** — decidir como um número de prestação de contas
   cita um conjunto documental que continua restrito (§9);
3. **título editorial** — "Onde o recurso circula" é proposta da H4.0 e precisa
   de aprovação, como o título da H3 precisou;
4. **conciliação do público** — enquanto a fonte não decidir entre 11 e 12
   visitas no Borda da Mata, o número de visitantes e tudo que o usa como
   denominador continuam PENDENTES. É o indicador mais comunicativo do conjunto,
   e a decisão desbloqueia cinco candidatos de uma vez;
5. **autorremuneração do gestor** — definir se entra na contagem de pessoas
   remuneradas distintas desbloqueia mais dois;
6. **gênero autodeclarado** — os dois indicadores de participação feminina só
   saem de NÃO PUBLICAR com coleta autodeclarada, não com inferência;
7. **orçamento de peso** — a Home já está acima do referencial de 500 kB, e a
   H4 ainda não entrou nela;
8. **Lighthouse** — continua exigido e não executável;
9. **`axe-core`** — continua fora do gate de acessibilidade.

Não houve integração na Home, migração, carga, alteração de R2, Vercel ou DNS,
biblioteca nova, deploy ou push. H5 não foi iniciada.
