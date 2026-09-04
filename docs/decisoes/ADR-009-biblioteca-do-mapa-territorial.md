# ADR-009 — MapLibre GL JS como biblioteca do mapa territorial

## Status

**Substituída pela ADR-010**, em 2026-09-03.

A medição que esta ADR exigiu — "antes de instalar, medir o que efetivamente
chega ao navegador; se estourar o orçamento, a decisão volta à mesa" — foi
feita, o orçamento estourou, e a decisão voltou à mesa. O mapa da Home passou a
ser SVG renderizado no servidor, e `maplibre-gl` foi removido do projeto.

O texto abaixo permanece **sem alteração de conteúdo**, como registro do que se
decidiu e com que informação. Ver `ADR-010-mapa-svg-no-servidor.md`.

## Data

2026-09-03

## Contexto

O documento 10B.0 v1.2, aprovado em 2026-09-03, escolhia **D3 + SVG** para o
mapa (§5) e listava Mapbox e Leaflet como "não utilizar inicialmente" (§2). Os
motivos declarados contra o Mapbox eram três: dependência externa, custo futuro
e aparência de mapa comercial.

Nesta data o responsável pelo projeto decidiu **MapLibre GL JS**. Esta ADR
registra a decisão, o que ela substitui e as restrições que precisam viajar
junto com ela — porque a biblioteca, sozinha, não protege os princípios do
projeto.

Vale notar que MapLibre GL JS é um fork do Mapbox GL JS, licenciado em
BSD-3-Clause e auto-hospedado. Dois dos três motivos que excluíam o Mabox —
dependência de serviço externo e custo futuro — deixam de valer **desde que**
nenhuma fonte de tiles externa seja configurada. O terceiro, aparência de mapa
comercial, é decisão de estilo e continua sob controle do projeto.

## Decisão

Usar **`maplibre-gl`** para o mapa territorial da Home.

Verificado no registro do npm em 2026-09-03: licença BSD-3-Clause, 17
dependências diretas, pacote com 19.848.054 bytes descompactados. Esse número é
do pacote publicado, não do que chega ao navegador.

**Versão instalada: 6.6.0.** O registro anunciava 6.7.0 como `latest` na
consulta feita antes da instalação; o `pnpm add maplibre-gl@latest` resolveu
6.6.0. Fica registrada a divergência, com o valor que de fato está no
`package.json`.

### Motivos registrados pelo responsável

- suporte a GeoJSON;
- controle de camadas;
- zoom;
- interação por município;
- possibilidade de identidade visual própria;
- melhor equilíbrio entre desempenho e customização.

### Arquitetura de componentes

Server Components continuam sendo o padrão. A Home **não** vira Client
Component.

| Componente | Tipo | Responsabilidade |
|---|---|---|
| `MapaTerritorio` | Server | receber dados, preparar propriedades, controlar conteúdo, renderizar a alternativa textual |
| `MapaInterativo` | Client, isolado | inicializar o MapLibre, hover, clique, zoom, estados visuais |

O Client Component é a folha da árvore, não a raiz: recebe dados já preparados
por props e não busca nada.

### Camadas

| Camada | Conteúdo |
|---|---|
| base | todos os municípios de Sergipe |
| destaque | Vale do Rio Real |
| pesquisa | municípios com pesquisa de campo |
| comparação | municípios de referência |
| pontos | locais visitados |

As quatro últimas são leituras de `relacoesTerritoriais` e de
`PONTOS_DE_VISITA_PREVISTOS`, não arquivos de geometria separados
(Consolidação 10B.2.1 §8).

### Interações

Ao passar o mouse: o município destaca.

Ao clicar: abre ficha com nome, relações territoriais, evidências disponíveis e
pontos relacionados. **Sem números inventados** — a ficha mostra o que existe no
dado, e some quando não há.

### Dados

GeoJSON do IBGE, conforme `src/dados/territorio/fontes.ts`. Nenhum polígono
próprio, nenhuma imagem de mapa.

## Alternativas consideradas

- **D3 + SVG** — era a decisão anterior (v1.2 §5). Controle visual total e peso
  mínimo, ao custo de implementar à mão projeção, zoom, hit-testing e
  simplificação de geometria.
- **Leaflet** — descartado em v1.2 §5 por estética de aplicação operacional.
- **Mapbox GL JS** — descartado em v1.2 §2 por dependência externa e custo.
- **React Simple Maps** — v1.2 §5 admitia considerar no futuro.

## Consequências

Benefícios:

- camadas, zoom e hit-testing por município vêm prontos, em vez de escritos à
  mão sobre SVG;
- GeoJSON é cidadão de primeira classe da biblioteca;
- estilo é dado, não código: a identidade visual do mapa fica declarativa;
- licença BSD-3-Clause e auto-hospedagem, sem conta, sem chave de API e sem
  custo por uso.

> **Medição feita em 2026-09-03.** O peso foi medido e a projeção ficou acima
> do orçamento da Home. Os números, as reduções possíveis e a comparação de
> cenários estão em `docs/direcao-visual/10B.3.2_Auditoria_de_Performance_do_Mapa.md`.
> A decisão desta ADR **não foi revista**: segue valendo como hipótese de
> implementação, aguardando decisão sobre o orçamento.

Custos e riscos, todos verificáveis:

- **Peso.** O orçamento é Home abaixo de 500 kB e Lighthouse ≥ 90 medido em 3G
  simulado (doc 01 §7). MapLibre é ordens de grandeza maior que os ~20 kB de
  GeoJSON que ele vai desenhar. Antes de instalar, medir o que efetivamente
  chega ao navegador; se estourar o orçamento, a decisão volta à mesa.
- **WebGL2 obrigatório.** A partir da versão 5 o suporte a WebGL 1 foi
  removido. Navegador ou aparelho sem WebGL2 não vê mapa nenhum — e o público
  do projeto é rural e escolar, com aparelhos antigos.
- **Acessibilidade.** O mapa desenha num `<canvas>`: é opaco para leitor de
  tela e não navegável por teclado. A alternativa textual deixa de ser cortesia
  e passa a ser o caminho principal.
- **Superfície de dependências.** 17 dependências diretas, num projeto que hoje
  tem poucas. Cada uma é código de terceiro num repositório de prestação de
  contas.

## Restrições inegociáveis

Estas condições fazem parte da decisão. Sem elas, a escolha da biblioteca
viola princípios já aprovados.

1. **Estilo sem nenhuma fonte externa.** O `style` do mapa é um objeto local,
   com as nossas fontes GeoJSON e um fundo liso. Nenhum provedor de tiles,
   nenhuma URL de terceiro, nenhuma chave de API. É o ponto mais fácil de
   errar: quase todo exemplo de MapLibre aponta para um estilo de demonstração
   hospedado, e adotá-lo por descuido faria a Home chamar um serviço externo a
   cada visita — contra "sem rastreadores de terceiros" (doc 01 §7) e contra a
   independência de serviços externos (v1.2 §1). Também é o que garante o
   "não usar imagens de mapa" desta etapa: sem tiles, não há imagem.
2. **Carregamento sob demanda.** A biblioteca entra por importação dinâmica no
   cliente, nunca no pacote inicial da Home. Ela acessa `window`, então não
   pode ser renderizada no servidor.
3. **Alternativa textual primária.** A lista territorial funciona sem
   JavaScript, sem WebGL e por leitor de tela, e é renderizada pelo Server
   Component. O mapa é melhoria progressiva sobre ela, não substituto.
4. **Toque, não só hover.** Em tela pequena a ficha precisa abrir por toque
   (v1.3 §14).
5. **`prefers-reduced-motion` respeitado**, inclusive nas animações de câmera
   do próprio MapLibre.
6. **Nada de polígono próprio nem de imagem de mapa.** Geometria é dado oficial
   do IBGE ou não é nada.

## Impacto técnico

Arquivos e módulos afetados quando a implementação for autorizada:

- `src/componentes/mapa/MapaTerritorio.tsx` — passa a compor o Client Component
  além da alternativa textual;
- `src/componentes/mapa/MapaInterativo.tsx` — novo, único `"use client"` do
  mapa;
- `src/componentes/mapa/Municipio.tsx`, `MarcadorVisita.tsx`,
  `FichaMunicipio.tsx` — já existem e continuam servindo à alternativa textual;
- `src/dados/territorio/` — a malha já obtida e validada;
- `package.json` — a dependência já instalada.

## Pendências antes de implementar

Resolvidas na Tarefa 10B.3.1, em 2026-09-03:

- `maplibre-gl` instalado, versão 6.6.0;
- `zod` instalado, versão 4.5.4, com a camada de validação em
  `src/dados/territorio/validacao.ts`;
- malha do IBGE baixada, com origem, data, licença conhecida, atribuição e
  SHA-256 em `src/dados/territorio/fontes.ts`;
- peso medido — ver a auditoria 10B.3.2.

Abertas:

- **decisão sobre o orçamento de peso.** A projeção ficou acima do limite do
  doc 01 §7; a auditoria 10B.3.2 compara três cenários. Nada será renderizado
  antes dessa decisão;
- **licença oficial do IBGE**, que precisa ser confirmada antes da
  disponibilização pública dos dados. Não assumir licença;
- definir onde o mapa mostra os pontos sem município declarado — hoje Serra dos
  Macacos e Ilha Grande (Consolidação 10B.2.1 §5).

## Substitui

- 10B.0 v1.2 §2, no trecho que exclui bibliotecas de mapa;
- 10B.0 v1.2 §5, que escolhia D3 + SVG;
- 10B.0 v1.3 §7, no item "Tecnologia".

Os três trechos foram marcados nos documentos de origem, apontando para cá.
Duas versões da mesma decisão divergem, e num projeto operado por agentes a
versão errada é obedecida sem ninguém perceber (doc 03 §4).
