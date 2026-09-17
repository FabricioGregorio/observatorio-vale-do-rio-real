# ADR-020 — Curadoria fotográfica da Serra dos Macacos e capas das fichas

## Status

Aceita quanto às decisões; **execução suspensa** enquanto o corpus não estabilizar.

## Data

2026-09-17

## Contexto

A Fase 3.1 auditou `fotos/serra-dos-macacos/` e encontrou 11 originais, nenhum
derivado e nenhum publicado. Três questões ficaram para decisão humana: a placa
de veículo legível em `atravessando-a-ponte.jpg`, as fotografias com pessoas
identificáveis — uma delas com criança — e a escolha da imagem de capa.

Duas classificações anteriores tocam o assunto e precisam ser situadas, não
apagadas. A auditoria de fontes de 2026-09-05 marcou como `RESTRITO`, com
triagem humana obrigatória, as fotografias cujo nome sinaliza pessoa
identificável. O doc 01 §266 e §310 mantém em aberto a pendência de
consentimento LGPD por pessoa publicada.

## Decisão

Todas as decisões abaixo são **do responsável humano**, tomadas em 2026-09-17.
Nenhuma foi inferida pelo agente. Fora do escopo declarado em cada uma, valem as
regras anteriores.

### 1. Pessoas identificáveis — conjunto da Serra dos Macacos

As fotografias do conjunto auditado da Serra dos Macacos estão **autorizadas
para uso público mesmo contendo pessoas identificáveis**, inclusive as de
grupo, de reunião e aquela em que aparece uma criança.

**Escopo:** este conjunto, e só ele. A decisão **não** se estende
automaticamente a qualquer fotografia futura; qualquer outro conjunto exige
verificação própria. A classificação `RESTRITO` de 2026-09-05 continua vigente
onde esta decisão não alcança.

A pendência de consentimento LGPD do doc 01 §310 **não é resolvida por este
ADR** e segue aberta.

### 2. Tarjamento obrigatório de placa de veículo

`atravessando-a-ponte.jpg` pode ser usada, e a placa do veículo **deve ser
tarjada no derivado**, de modo que nenhum caractere seja recuperável a partir
da imagem pública. Desfoque que deixe caracteres reconhecíveis não satisfaz.

| | |
|---|---|
| original | `fotos/serra-dos-macacos/atravessando-a-ponte.jpg` |
| sha256 | `d5683e3b98523d36c81e7f2bb9bf8020c361393dc416b6af27fcffd0eccb225c` |
| bytes | 2 913 561 |

O original é preservado byte a byte; o tratamento existe apenas no derivado,
com método `tarjamento_privacidade` — vocabulário já previsto em
`arquivo_derivacao_metodo` (ADR-016).

As regras de remoção para CPF, telefone e assinatura continuam valendo onde
aplicáveis. Nenhum dos três foi encontrado neste conjunto.

### 3. Capa da Serra dos Macacos

| | |
|---|---|
| original | `fotos/serra-dos-macacos/principal-capa.jpg` |
| sha256 | `17bbd985205f34fcc98463d15e541f1540fd682e65d07c8517959d26ef7eae9b` |
| bytes | 5 696 518 |

### 4. Capa de Ilha Grande

| | |
|---|---|
| original | `fotos/ilha-grande/principal-capa.jpg` |
| sha256 | `faf06f4d3f82ebd62d72ce1b74bff770f12d3a96fb9cdf2ce50a599dd633d5de` |
| bytes | 2 720 812 |

Auditado em 2026-09-17: a pasta continha **exatamente um** arquivo
`principal-capa.*`, sem ambiguidade de extensão.

Esta é a única decisão nova sobre Ilha Grande. A galeria da ficha segue com as
três fotografias já selecionadas; ampliá-la exige decisão própria. As capas de
Recanto da Serra e do Museu Borda da Mata, registradas em 2026-09-16,
permanecem como estão.

A capa é a **imagem de abertura da ficha**. Não se confunde com o `principal`
de um documento no Acervo, que é preferência de link (ADR-016), nem com a
primeira posição de um array, que não é decisão de coisa alguma.

## Por que a execução está suspensa

As decisões acima são firmes. A derivação **não foi executada**, e não por
escolha do agente: durante a execução da Fase 3.2, o corpus estava sendo
reescrito.

Estado em 2026-09-17, às 16:30, comparado ao levantamento da Fase 3.1, feito
cerca de uma hora antes:

| Pasta | Antes | Agora | Observação |
|---|---:|---:|---|
| `serra-dos-macacos` | 11 | 8 | faltam 3, entre elas duas das três com pessoas |
| `ilha-grande` | 10 | 8 | 9 dos 10 originais do manifesto B01 ausentes |
| `recanto-da-serra` | 6 | 8 | dois arquivos novos |
| `centro-cultural-museu-borda-da-mata` | 7 | 8 | novo `capa-principal.jpg` |
| `pedro-menezes` | 13 | 8 | |
| `josenilson-bispo` | 13 | 8 | |
| **total** | **73** | **61** | |

Os arquivos ausentes não foram movidos: uma varredura por sha256 sobre o corpus
inteiro não os encontrou em lugar nenhum.

Derivar deste estado produziria três defeitos. O recorte editorial declararia
8 fotografias da Serra onde a decisão autoriza 11 — inclusive sem duas das que
a decisão fez questão de autorizar. Os hashes registrados seriam de uma versão
transitória, e um manifesto que documenta alvo em movimento não é reproduzível.
E a seleção passaria a existir sem que se saiba se o corpus atual é o
pretendido.

Três pontos a resolver antes de retomar:

1. **Os 3 originais ausentes da Serra** — `pessoas-presentes-na-segunda-visita.jpg`,
   `primeira-reuniao.jpg` e `pequeno-lago-com-arvores.jpg` — voltam ao corpus,
   ou a decisão passa a valer para o conjunto menor?
2. **A proveniência de Ilha Grande está rompida.** Nove dos dez originais
   registrados no manifesto B01 não existem mais com os mesmos bytes, e entre
   eles estão os três que sustentam fotografias **já publicadas** no Acervo e
   nas fichas. Os objetos publicados seguem íntegros; o que se perdeu é a
   capacidade de reproduzir a derivação a partir do original.
3. **A convenção de nome da capa diverge**: `principal-capa.jpg` na Serra e em
   Ilha Grande, `capa-principal.jpg` no Borda da Mata. De todo modo, o nome do
   arquivo não decide nada — a decisão canônica é esta, e o hash é que
   identifica.

## Consequências

Registradas as decisões, a derivação é execução, não deliberação. Quando o
corpus estabilizar, a sequência é: declarar o conjunto autorizado por sha256 →
derivar → tarjar a placa → conferir EXIF, GPS e legibilidade → registrar as
capas no manifesto → publicar no Acervo → a ficha recolhe sozinha, porque o
vínculo por `IdDoLugar` já existe e é testado.

Preparar derivado não é publicar. Enquanto não houver publicação no universo
público, a ficha permanece fail-closed e continua dizendo apenas que ainda não
reúne fotografia pública.
