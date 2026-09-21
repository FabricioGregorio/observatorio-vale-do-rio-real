# /territorio — redesenho como atlas (2026-09-21)

Rodada de direção de arte aberta sobre `/territorio`, com autorização para
desmontar a composição anterior. O que ficou fechado para criatividade foi só a
verdade dos dados: geometria, coordenadas, recorte, fontes e evidências.

## Crítica da versão anterior

- **Interface cartográfica, não página.** A abertura era um cartão de mapa
  pequeno (cerca de um terço da largura) ao lado de uma tabela de lugares com
  metadado mono repetido ("Tobias Barreto · no recorte" três vezes), legenda
  de seis itens e nota de base — tudo na primeira dobra, tudo do mesmo peso.
- **A seleção mudava pouco.** Escolher um lugar trocava o mapa pequeno e uma
  ficha abaixo da dobra; o primeiro viewport continuava igual. Não havia a
  sensação de "chegar" a um lugar.
- **Fotografia como anexo.** Retrato estreito, tira de miniaturas, legendas
  soltas; em algumas larguras a tira deixava grandes vazios.
- **Vale como "nenhum item selecionado".** Texto corrido, lista de municípios
  em mono e um índice ilustrado de cartões.
- **Ilha Grande só existia depois do clique**: a carta geral fechava no Vale,
  e o único lugar fora do recorte ficava fora do quadro.

## O que foi abandonado

Tablist com roving tabindex e painéis escondidos; o mapa único que se
transformava entre escalas; a régua/linha de estado; o índice de cartões do
Vale; o sumário em tabela; a legenda permanente de seis itens na abertura.

## Conceito: o atlas

- **A abertura é a carta do território**, em faixa escura de largura total. O
  território é desenhado direto sobre a mesa: o Vale acende em milho, o resto
  de Sergipe é sombra, São Cristóvão tem traço anil. O quadro vai até Ilha
  Grande, então o ponto fora do recorte aparece fora do milho sem precisar de
  explicação. O título ocupa o chão vazio a oeste da malha — fora de Sergipe
  não há desenho, e é ali que cabe o texto.
- **A faixa dos lugares** fecha a abertura e fica presa ao topo durante a
  leitura, marcando o capítulo em leitura.
- **O Vale é o primeiro capítulo**: a frase do recorte em corpo grande, os
  cinco municípios com a própria silhueta (geometria real, via `<use>`) e
  Sergipe inteiro, em escala, com o quadro do recorte.
- **Cada lugar é uma prancha — a página dupla do atlas**: retrato, relato e o
  mapa do próprio entorno lado a lado. O mapa acompanha a leitura enquanto a
  prancha está na tela. Os lados alternam (ritmo de página, não hierarquia).

## Identidade por lugar

- **Recanto da Serra** — os registros do período viram numeral grande, como
  em `/dados`.
- **Museu Borda da Mata** — prancha espelhada; a casa de taipa abre.
- **Serra dos Macacos** — sem fotografia pública na ficha: o mapa ocupa o lugar
  do retrato, maior e sem acompanhar a rolagem, e a ausência é dita com a
  frase de sempre ("Esta ficha ainda não reúne fotografia pública.").
- **Ilha Grande** — papel tingido de anil (a cor da comparação na carta) e
  filete tracejado no topo; o localizador mostra o ponto fora do milho.

## O mapa

- Carta geral: quadro derivado das caixas dos municípios do Vale, das posições
  confirmadas e da caixa de São Cristóvão. Escala e norte na própria carta.
  No celular o quadro fecha no Vale (CSS recorta o mesmo SVG) e a figura diz
  em texto que Ilha Grande fica fora dele — "a leste" só porque a coordenada
  diz isso (x cresce para leste na projeção).
- Mapa da prancha: `viewBox` da vista do Vale, que é o sistema da camada local.
  No HTML vão a malha do entorno (por `<use>`, sob o enquadramento local) e o
  pin; vias, cursos d'água e localidades chegam sob demanda. Escala, norte,
  largura em km e atribuição do OpenStreetMap em cada prancha.
- Localizador: a carta geral em miniatura, com o retângulo exato da janela da
  prancha.
- Nenhum traço liga lugares; a ordem dos capítulos é a das fichas.

## Fotografias

Retrato grande em cada prancha (a marcada como `principal` no manifesto, ou a
primeira), demais numa prova de contato de altura única. Nenhum corte: altura
limitada, largura pela proporção original; a figura tem a largura da imagem e
a legenda quebra dentro dela. Servidas por `next/image` (AVIF/WebP
redimensionados), todas lazy e com dimensões declaradas.

## Navegação e interação

- Faixa: lista de âncoras (`nav` "Os lugares da pesquisa"), cinco paradas de
  Tab, `aria-current="location"` no capítulo em leitura.
- Pins da carta geral: links com `tabindex="-1"` dentro de SVG `aria-hidden`
  (atalho de ponteiro; a faixa é o equivalente acessível).
- Faixa ↔ pin: realce recíproco por `:has()`, só CSS.
- "Localização e acesso" em `<details>`: coordenada, procedência, referência
  cartográfica, referência de acesso e as duas consultas externas.
- Ilha cliente reduzida a três tarefas: medir o cabeçalho do site (uma ou duas
  linhas conforme a largura), buscar a camada local quando a prancha se
  aproxima e marcar o capítulo em leitura.
- Movimento: crescimento do pin (150 ms), fade da camada local, deslize do
  marcador da faixa. Sob `prefers-reduced-motion`, a propriedade de transição é
  anulada.

## Sem JavaScript

Todo o conteúdo está no HTML: abertura, faixa, Vale, as quatro pranchas com
malha e pin, fichas e fotografias. Só as camadas locais não chegam.

## Peso (build de produção, carga fria)

| Perfil | Total | HTML | JS | Imagens |
|---|---|---|---|---|
| `/territorio` 1440 DPR1 | 543 kB | 79 kB | 147 kB | 201 kB |
| `/territorio` 375 DPR2 | 455 kB | 79 kB | 147 kB | 114 kB |
| `/` 1440 DPR1 (controle) | 477 kB | 78 kB | 148 kB | 136 kB |

As imagens da primeira carga são as fotografias das duas primeiras pranchas,
antecipadas pelo `loading="lazy"` do Chrome. A malha vai uma vez só no HTML
(`<defs>` + `<use>`); o CSS da página sai sem comentários. A Home não foi
tocada e passa no próprio orçamento.

## Sanitização

Texto, `aria-*`, `title`, `alt`, `data-*` e HTML bruto auditados: nenhum termo
de processo. Os únicos comentários no HTML são os marcadores do React.

## Testes

- `testes/a11y/territorio-publico.spec.ts` reescrito para o atlas: malha
  compartilhada com a Home, camadas só sob demanda (zero na carga), faixa e
  capítulo em leitura, carta e faixa na primeira dobra do desktop, overflow em
  320–1440 (claro e escuro), leitura sem JS, Tab e foco visível, pins sem
  parada duplicada, ficha pelo teclado, links externos, movimento reduzido,
  escalas em km, localizador, camada local (pin × localidade IBGE, Vila
  Samambaia distinta, atribuição OSM), evidências com link real, rotas
  externas exatas sem pedido externo, fotografia sem corte, coordenadas de
  `referencias.ts`, axe em 375/768/1440 × claro/escuro com fichas abertas.
- `testes/a11y/territorio-vivo.spec.ts` (laboratório DEV, fora do gate):
  reduzido a fumaça da rota DEV; o contrato completo é o do spec público.
- `testes/fotografia-por-lugar.test.ts`: lê a frase de lacuna e a procedência
  em `PranchaDoLugar.tsx`.

Resultado: `tsc` limpo, Biome limpo nos arquivos da rodada, 995 testes
unitários e 486 e2e passando.

## Capturas

Locais, fora do Git, em `tmp/territorio-captura/final/`: `1440-{abertura,
o-vale,lugar-recanto-da-serra,lugar-borda-da-mata,lugar-serra-dos-macacos,
lugar-ilha-grande}.png`, `768-` e `375-{abertura,o-vale,lugar-borda-da-mata,
lugar-serra-dos-macacos}.png`, e `1440-{abertura,lugar-ilha-grande}-escuro.png`.
A série `antes/` guarda a versão anterior.

## Rodada de interação (2026-09-21)

Sem redesenho: só a resposta da carta à exploração.

- **Lugar apontado.** Ponteiro no pin ou na faixa, foco de teclado na faixa
  e toque no pin produzem o mesmo estado, por `:has()` e variáveis CSS
  (`--ap`, `--ap-<id>`, `--eu`), sem JavaScript. O pin cresce e ganha halo
  em dois traços, o nome acende em milho, o município que contém o lugar
  (relação declarada em `municipioId`) ganha contorno claro, o resto da
  carta recua 30% sem sumir, e o item da faixa responde. Apontar o pin
  acende a faixa e vice-versa.
- **Ilha Grande.** A segunda linha "São Cristóvão · fora do recorte" fica
  sob o pin, sempre visível; ao apontar, São Cristóvão ganha preenchimento
  e o Vale inteiro recua.
- **Vale do Rio Real.** Não limpa seleção: traz o recorte à frente
  (contorno claro nos cinco municípios, o resto de Sergipe recua) com todos
  os lugares no mesmo nível.
- **Chegada.** Rolagem suave (imediata com movimento reduzido), filete de
  milho sob o título do destino que se apaga sozinho, e "você está aqui" na
  prancha em leitura: anel em volta do pin no mapa local e janela do
  localizador na cor do pin. Links da ficha de localização também acendem o
  anel.
- **Toque.** Alvo invisível de 44 px ou mais em cada pin (a gota tem
  13–18 px). No celular, onde a faixa não fica presa ao topo, cada prancha
  termina com "↑ Voltar à carta dos lugares", ausente nas telas maiores.
- **Teclado.** A faixa continua sendo o único controle (cinco paradas de
  Tab); os pins seguem fora da ordem de Tab. Corrigido o contorno de foco da
  faixa, que era anil sobre fundo escuro desde que ela saiu da abertura.
- **Rolagem.** Medida sem pisca-pisca: `– → vale → recanto → borda → serra
  → ilha → –`, agora coberta por teste.
- **Peso.** Inalterado: 543 kB (1440, DPR 1) e 455 kB (375, DPR 2); JS 147
  kB, sem dependência nova. A camada local continua só sob demanda.
- **Testes.** Novos, de comportamento: pin → faixa e município, teclado →
  pin, Shift+Tab, Ilha Grande, Vale, chegada e "você está aqui", sequência de
  rolagem, toque com alvo de 44 px, volta à carta no celular, rolagem
  imediata com movimento reduzido.

Capturas locais em `tmp/territorio-interacao/final/`.
