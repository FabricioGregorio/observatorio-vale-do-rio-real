# Evolução visual de /territorio — 2026-09-21

## Diagnóstico e direção

A página anterior concentrava a abertura em texto e distribuía mapa e ficha
em colunas concorrentes. A placa reservava espaço que o enquadramento não
ocupava; a leitura longa das fichas deixava a coluna do mapa vazia. O índice
repetia caixas com pouca explicação das relações territoriais.

A direção implementada é **carta em três escalas**: Sergipe, recorte do Vale e
entorno do lugar. A abertura situa o território, a régua informa a escala em
uso, o mapa mostra a relação espacial e o dossiê reúne narrativa e evidência.
Essa composição já estava nos commits `e6687bc` e `8640e80` quando esta
conferência começou. Ela foi preservada e submetida à matriz ampliada abaixo.

## Organização, mapa, fichas e navegação

1. Abertura com título, mapa de situação estadual e margem documental:
   municípios do recorte, São Cristóvão como referência externa, lugares e base.
2. Régua com as três escalas. As larguras são calculadas pela projeção, não
   distâncias de viagem. O texto indica qual escala está em uso.
3. Mapa principal com a proporção do enquadramento real. As janelas tracejadas
   representam envelopes dos mapas detalhados existentes. Não são rotas.
4. Índice territorial com nomes, municípios, relação com o recorte e
   coordenadas. O agrupamento tem equivalente textual; seleção tem marca
   escrita, contorno e cor.
5. Dossiê abaixo da carta: localização e coordenada no cabeçalho, narrativa e
   fotografias na coluna de leitura, evidências e acesso na margem. A quantidade
   de informação varia conforme as fontes disponíveis.

O Vale possui ficha própria, com narrativa, cinco municípios e explicação da
pesquisa. Ilha Grande permanece em São Cristóvão, fora do Vale; a Serra não é
confundida com a Vila Samambaia do IBGE. Jacaré e Borda da Mata permanecem
localidades de Tobias Barreto. Dados territoriais, coordenadas e textos
factuais foram mantidos.

As quatro camadas locais continuam estáticas e carregadas apenas na seleção,
com reaproveitamento após a primeira consulta. Falha de carregamento conserva
a aproximação regional e o anúncio de indisponibilidade.

## Movimento

A régua acompanha a mudança de escala; o ponto selecionado ganha destaque;
mapa regional e camada local transitam no mesmo enquadramento. A ficha entra
uma vez ao trocar de seleção, sem animação na primeira pintura. Não há
pulsação contínua, partículas ou percurso inventado.

Com `prefers-reduced-motion`, mapa e régua recebem `transition-property: none`
e a ficha recebe `animation-name: none`. O teste complementar confere isso
**depois** da seleção de Ilha Grande e da chegada da camada detalhada.

## Desktop, tablet e mobile

- **1440 px:** abertura assimétrica; mapa e índice lado a lado; dossiê em
  largura inteira com narrativa e margem documental.
- **768 px:** mapa em largura inteira; índice em duas colunas; ficha em duas
  colunas proporcionais. A composição deixa de apertar a navegação ao lado da
  carta.
- **375 px:** mapa seguido por faixa de seleção horizontal contida; ficha em
  uma coluna; indicação da escala permanece legível. O índice rola apenas
  dentro da faixa, sem ampliar a largura da página. Localidades secundárias
  saem do desenho para preservar os pontos, a referência IBGE e as vias.

Os mapas locais mantêm limites de legibilidade próprios de uma carta compacta;
as fichas e o índice fornecem a localização textual completa.

## Acessibilidade e correção desta conferência

Tablist com uma parada de Tab, setas, Home/End, Enter/Espaço, Escape e retorno
à visão do território foram preservados. O mapa possui nome contextual e as
fichas permanecem no HTML. Sem JavaScript, as âncoras alcançam todas as fichas.
Os alvos do índice medem pelo menos 44 px em ambas as dimensões.

A nova matriz encontrou `link-in-text-block` no crédito do OpenStreetMap dos
mapas detalhados: o link dependia apenas de cor. A correção acrescenta
sublinhado permanente em `.tv__nota a`. Nenhuma regra de axe foi excluída.

## JS, CSS, assets e performance

Nenhuma biblioteca ou asset novo. O mapa continua sendo SVG gerado no servidor;
a única ilha de interação territorial administra seleção, foco, anúncio e
camadas sob demanda. A página não foi convertida em Client Component.

Comparação de arquivos fonte com `25eff69`, usando gzip padrão do Node:

| Arquivo | Antes | Depois | Delta gzip |
|---|---:|---:|---:|
| estilos.ts | 21.266 B / 5.771 B gzip | 28.884 B / 7.671 B gzip | +1.900 B |
| InteracaoTerritorioVivo.tsx | 9.515 B / 3.120 B gzip | 10.429 B / 3.480 B gzip | +360 B |

Esses números incluem comentários e não são tamanhos de chunks minificados ou
transferência. O HTML estático atual mede 390.989 B, 85.577 B gzip; não se
reconstruiu um build anterior isolado nesta conferência. A correção complementar
acrescenta somente uma regra CSS; não altera JavaScript.

A Home não importa estes estilos territoriais. Seu gate passou nas cinco
navegações frias de cada perfil: desktop DPR1, 486.618 B; mobile DPR2,
447.988 B. Não foi feita medição nova de Lighthouse; este relatório não afirma
pontuação ou ausência absoluta de layout shift.

## Testes

`pnpm verificar` terminou com código 0:

- tipos e lint; seis avisos preexistentes, sem erro;
- 977 testes unitários passaram; três testes de integração ficaram ignorados;
- gate de pendências: nenhuma pendência de publicação;
- build estático: 160 páginas;
- 473 cenários Playwright passaram;
- sete cenários novos: matriz 375/768/1440 × claro/escuro, cobrindo Vale e os
  quatro lugares (30 combinações), e movimento reduzido após seleção;
- axe A/AA, dados territoriais textuais, tamanho de alvo, seleção única e
  ausência de overflow conferidos em cada combinação;
- `git diff --check` sem erro.

Saída completa: `tmp/territorio-visual/verificar-final.log`. A execução anterior
com a falha de atribuição fica em `conferencia.log`, preservando a evidência de
que o novo teste detectou o problema antes da correção.

## Capturas e leitura crítica

Capturas locais em `tmp/territorio-visual/`, fora do Git. A série
`final-{1440,768,375}-{vale,recanto,serra,ilha}-claro.png` reúne os doze estados
solicitados. As séries anteriores `antes-*` e `depois-*-dark.png` preservam a
comparação histórica e a inspeção do tema escuro; capturas adicionais finais
do tema escuro acompanham a conferência.

A geometria permanece informativa: recorte real, janelas reais, coordenadas
documentadas. A ficha dá contexto ao mapa sem converter a página em catálogo
turístico. Tablet tem índice próprio; mobile mantém seleção por toque e
teclado. Fontes e lacunas permanecem legíveis.

Foi descartada a linha ligando lugares: a pesquisa documenta etapas e relatos
de deslocamento, mas não fornece o traçado geográfico exato. Acrescentar uma
rota precisa afirmaria um dado inexistente. Biblioteca cartográfica nova e
galeria ampliada também foram descartadas: aumentariam peso e repetiriam a
função de outras páginas sem melhorar a leitura das relações territoriais.

## Arquivos e Git

O redesign existente alterou `TerritorioVivo.tsx`, `estilos.ts` e
`InteracaoTerritorioVivo.tsx`, todos em `src/componentes/territorio/cartografia/`,
mais `testes/a11y/territorio-publico.spec.ts` e a tarefa 28.

A conferência complementar modifica somente `estilos.ts` (sublinhado), o teste
público, a tarefa 28 e este relatório. Os documentos protegidos,
`zz-conta-temp.test.ts`, dados territoriais, Home, banco e storage ficam fora
do stage. O lote de `/dados` é separado.

Commits de base: `e6687bc` (composição), `8640e80` (voz pública), confirmados
na branch remota autorizada por `git ls-remote`. Commit complementar:
`3ecca9f`, com a correção do link e a matriz de testes. Push concluído para
`origin/exp/home-v2-territorio-vivo`, de `8640e80` até `e4ebeb2`, incluindo os
commits separados de `/dados`. A documentação recebe um commit de encerramento
separado. Nenhum Preview, Production, Vercel ou avanço de main foi executado.

### Índice das capturas finais

| Largura | Vale | Equipamento | Serra dos Macacos | Ilha Grande |
|---|---|---|---|---|
| 1440 | [Vale](../../tmp/territorio-visual/final-1440-vale-claro.png) | [Recanto](../../tmp/territorio-visual/final-1440-recanto-claro.png) | [Serra](../../tmp/territorio-visual/final-1440-serra-claro.png) | [Ilha](../../tmp/territorio-visual/final-1440-ilha-claro.png) |
| 768 | [Vale](../../tmp/territorio-visual/final-768-vale-claro.png) | [Recanto](../../tmp/territorio-visual/final-768-recanto-claro.png) | [Serra](../../tmp/territorio-visual/final-768-serra-claro.png) | [Ilha](../../tmp/territorio-visual/final-768-ilha-claro.png) |
| 375 | [Vale](../../tmp/territorio-visual/final-375-vale-claro.png) | [Recanto](../../tmp/territorio-visual/final-375-recanto-claro.png) | [Serra](../../tmp/territorio-visual/final-375-serra-claro.png) | [Ilha](../../tmp/territorio-visual/final-375-ilha-claro.png) |

Ilha Grande no tema escuro: [1440 px](../../tmp/territorio-visual/final-1440-ilha-escuro.png),
[768 px](../../tmp/territorio-visual/final-768-ilha-escuro.png),
[375 px](../../tmp/territorio-visual/final-375-ilha-escuro.png).
