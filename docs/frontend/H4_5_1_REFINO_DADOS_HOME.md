# H4.5.1 — Refino editorial da seção de dados

**Data:** 2026-09-12

**Estado:** EM PROTÓTIPO — `/dev/dados-vivos`, 404 em produção

**Home:** não alterada

**H4.0:** não alterada; continua intacta em `/dev/dados`

**Baseline:** `e3d9a08` — style: aplica sistema grafico aos dados

## 0. O que esta fase é

A H4.5 foi aprovada com ajustes. Esta rodada não propõe conceito novo, não
reconstrói a seção e não toca em dado: ela calibra a composição candidata à
Home para tirar os últimos resíduos de aparência de painel e preparar a decisão
de integração.

Cinco pontos foram atacados: o ranking, o estado selecionado do gráfico, a
passagem de saída, a cruz de registro e a integração espacial do carcará. Um
sexto trabalho, não pedido como problema mas necessário para responder aos
outros, foi separar a área candidata do vocabulário de laboratório.

Nada de valor, cálculo, base, recorte, arredondamento, fonte ou classificação
de publicação mudou. O dataset é o mesmo arquivo, sem uma linha alterada.

## 1. Problemas observados, e o que foi feito

| Diagnóstico | Decisão |
|---|---|
| o ranking é o trecho que mais lembra painel | saiu da composição candidata; continua inteiro no laboratório |
| a seleção do mês apaga os demais | atenuação subiu de 0,3 para 0,6 e passou a alcançar só as marcas |
| "por trás de cada contratação existe alguém" sugere 84 pessoas | copy substituída; a nova não fala de pessoas |
| a cruz de registro marca sem informar | removida, sem substituto |
| o carcará parece adesivo no canto | ancorado na grade pela régua da própria legenda |
| a pré-visualização se explica como protótipo | controles e ressalvas movidos para fora da área candidata |

## 2. Ranking de atividades

O ranking **saiu da composição candidata à Home**. Não foi apagado, não foi
alterado e não perdeu o limiar: `RankingEditorial` continua existindo, com os
mesmos oito registros acima de dez dias, e o laboratório o exibe depois da
marca de fim da área candidata, num bloco chamado "Material reservado para a
página de Dados".

A separação é conceitual antes de ser visual:

> Home interpreta e convida. Página de dados aprofunda e consulta.

Dezesseis linhas de atividade com barra são consulta. O que a Home precisa
dizer sobre atividades já está dito pelo resto da seção.

Como consequência, **o limiar de dez dias deixou de aparecer na composição
candidata**. Nenhum limiar novo foi inventado para substituí-lo, e nenhum corte
editorial tomou o lugar do que saiu.

A composição candidata termina na série mensal e na passagem de saída. Um teste
lê o código-fonte da rota e reprova se o ranking voltar para dentro: a ordem
`<DadosVivos />` → marca de fim → `<RankingEditorial />` é contrato.

## 3. Gráfico mensal: seleção é ênfase, não apagamento

Duas correções, na mesma direção.

**Alcance.** A atenuação passou a valer só para as **marcas** — conector,
círculo e losango. O rótulo do mês, que é texto, continua em opacidade 1. Antes
o grupo inteiro caía junto, e baixar a opacidade de texto baixa o contraste
dele: o critério da WCAG não pode depender de onde o ponteiro está.

**Grau.** A atenuação subiu de 0,3 para 0,6.

| Elemento | Antes (H4.5) | Depois (H4.5.1) |
|---|---:|---:|
| grupo do mês não selecionado | 0,3 | **1** |
| conector do mês não selecionado | 0,3 (herdado do grupo) | **0,6** |
| ponto e losango do mês não selecionado | 0,3 (herdado do grupo) | **0,6** |
| rótulo do mês não selecionado | 0,3 (herdado do grupo) | **1** |
| conector do mês selecionado | 1, espessura 3 | 1, espessura 3, e cor `--color-texto` |

A dominância do mês escolhido agora vem de **somar ênfases** — conector mais
grosso, mais escuro, marcas em opacidade cheia — e não de apagar o resto. O
vínculo com a linha correspondente da tabela foi preservado, e o realce dela
ficou um pouco mais firme.

### 3.1 Um defeito que só apareceu ao medir

A atenuação não alcançava os pontos, e a causa não estava na regra: estava na
animação de entrada. `animation-fill-mode: both` retém o último quadro, e o
último quadro de `dv-surgir` é `opacity: 1`. Valor retido por animação vence a
cascata, então a regra de realce era ignorada nos pontos e obedecida no
conector, que anima outra propriedade.

A correção foi trocar `both` por `backwards` nas duas animações do gráfico: o
estado inicial vale durante o atraso, e depois a marca volta a obedecer ao CSS.
A entrada continua idêntica na tela.

Isto só apareceu porque o valor computado foi medido no navegador, e não
conferido no arquivo.

## 4. Passagem de saída

A copy anterior — "Medida → Pessoas / Por trás de cada contratação registrada
existe alguém" — foi **removida**.

O problema é factual. São 84 **contratações**, e o próprio indicador declara
que a mesma pessoa pode aparecer em dias diferentes. A contagem de pessoas
distintas continua PENDENTE na fonte, com a definição em aberto. A frase
sugeria uma equivalência que nenhum documento sustenta.

Das três saídas admitidas, foi escolhida a **B — copy neutra**:

| Rótulo | `Medida → Conjunto completo` |
|---|---|
| Ponte | "O detalhamento por atividade pertence ao conjunto completo do levantamento, e não a esta leitura" |

Por quê, e não as outras duas:

- **A, puramente gráfica**, deixaria a saída muda. Na gramática da H3.5.1 toda
  passagem carrega um rótulo em mono e uma ponte curta; uma passagem sem texto
  seria a única exceção do sistema, e exceção sem motivo é ruído.
- **C, anunciar a navegação para os dados completos**, foi descartada porque a
  rota `/dados` existe mas é um stub que diz "esta seção ainda não tem conteúdo
  publicado". Um link dali levaria o leitor a uma página vazia, e promessa não
  cumprida num site de prestação de contas custa mais do que o ganho de
  navegação.

A copy escolhida faz o trabalho de C sem o link: ela explica por que o
detalhamento não está ali e estabelece o papel da futura página de dados, sem
prometer o que ainda não existe e sem afirmar nada sobre pessoas.

**É proposta editorial**, como o título da seção, e não foi promovida a
definitiva.

## 5. Cruz de registro

**Removida, e não substituída.**

Ela marcava o encontro entre capítulos sem carregar informação, e a própria
H4.5 já a tinha registrado como o grafismo mais frágil da composição. O fio da
família cartográfica continua fazendo a ligação; trocar um ornamento por outro
não seria refino.

A coluna que ela ocupava saiu junto: a passagem de saída passou a ter duas
colunas em vez de três, e a ponte ocupa a largura que sobrou.

## 6. Carcará

Preservado, do mesmo tamanho, um por página, decorativo, com a mesma legenda
que o identifica como grafismo da identidade. O que mudou é a relação dele com
a grade.

Duas mudanças, ambas com recursos que já existiam:

1. **A legenda virou a régua em que a ave se apoia.** Ela ganhou um fio no topo
   que atravessa a ponte e a assinatura, então as duas passam a pertencer à
   mesma linha da grade. A legenda deixou de ser um rótulo solto ao lado e
   virou a ficha do elemento.
2. **A caixa passou a abraçar a imagem.** A altura fixa herdada da H3.5.1
   existia para recortar um carcará maior; aqui ele não é maior, e os 42 px de
   sobra empurravam a ave para longe da régua. Sem a altura fixa e com o
   espaçamento de linha reduzido, ela se apoia na linha em vez de flutuar.

Nada foi aumentado, duplicado, animado, redesenhado ou recolorido. Um teste
confere que a ficha vem logo abaixo da ave, que a régua é mais larga que ela, e
que continua havendo uma assinatura por página.

## 7. Indicadores secundários: completa e reduzida

**Nenhum indicador foi eleito.** A decisão de quais entram na Home continua
humana e continua aberta.

O laboratório passou a montar a faixa duas vezes, e a alternância é CSS:

| Variante | O que mostra |
|---|---|
| **Completa** | os sete indicadores secundários, como na H4.5 |
| **Reduzida** | quatro posições de apoio, com valores reais |

A versão reduzida existe para medir **quanta faixa a Home aguenta**, e não para
escolher indicadores. Os quatro exibidos são os quatro primeiros do dataset, em
ordem de arquivo, sem critério editorial — quatro é o que a faixa comporta numa
fileira só em telas grandes.

Valores reais foram preservados, conforme a preferência declarada: rótulos
vazios do tipo "Indicador A/B/C/D" testariam a grade mas não o peso visual de
um número de verdade, que é justamente o que precisa ser avaliado.

**A ressalva vive no cabeçalho do laboratório**, fora da área de
pré-visualização, e diz com todas as letras que a redução é ensaio de
composição e não escolha editorial. Um teste confere que ela está visível e que
não vazou para dentro da composição.

Há uma tensão declarada aqui: §3 do escopo pede a marcação clara, e §4 pede a
área candidata limpa de vocabulário de laboratório. A ressalva ficou no
cabeçalho porque o pedido era marcá-la "no laboratório", e porque um aviso
dentro da composição falsearia a pré-visualização.

## 8. A área candidata deixou de se explicar

A rota passou a ter três zonas:

```
cabeçalho do laboratório     controles, ressalvas, link para /dev/dados
─ início da composição candidata à Home ─
composição                   passagem, seção 03, protagonista, faixa, série,
                             tabela, passagem de saída
─ fim da composição candidata à Home ─
material reservado           ranking de atividades
```

Nenhum controle, rótulo de preset, aviso de "somente DEV" ou menção a fases
sobrevive dentro da composição. Quem olha a pré-visualização vê o que o leitor
veria.

O marcador "Título editorial · proposta" ficou: ele é sobre aprovação de copy,
e não sobre desenvolvimento. Ele sairia junto com a aprovação do título.

## 9. Microinterações e movimento

Nada novo. O sistema é o mesmo da H3.5.1: entrada única de 240 ms com
deslocamento pequeno, hover e foco de hairline, realce gráfico, marcador e
tique. Nenhum parallax, nenhuma mola, nenhum laço, nenhum brilho, nenhum
contador animado, nenhum cursor customizado.

Com `prefers-reduced-motion: reduce`: nada anima, nada fica invisível, nenhuma
funcionalidade desaparece. Um teste percorre os blocos reveláveis e confere
`animation-name`, `opacity` e `transform` em cada um.

## 10. Acessibilidade

Conferido em 320, 375, 768 e 1440 px, nos dois temas:

- **sem transbordo horizontal** em nenhuma combinação, e com zoom de 200% a
  720 px;
- **o número e a tabela existem em toda largura**;
- **contraste**: a correção mais importante desta rodada é de contraste — o
  rótulo do mês não perde mais opacidade sob realce, então o texto do gráfico
  mantém a mesma relação de contraste em qualquer estado;
- **gráfico**: `role="img"`, `<title>` e `<desc>` preservados; nada focável
  dentro do desenho, e a tabela continua sendo a fonte textual completa;
- **seleção não retira informação**: as marcas dos meses não selecionados ficam
  em 0,6, bem acima do ponto em que uma série passa a parecer desabilitada, e
  um teste trava esse piso;
- **teclado**: primeiro Tab com foco visível, link para a rota original com
  contorno de 3 px, alternância completa/reduzida operável por teclado;
- **decorativos**: assinatura e fios com `aria-hidden="true"` e
  `pointer-events: none`;
- **sem JavaScript**: a alternância entre completa e reduzida funciona com o
  script desligado, e há teste que roda nesse modo.

## 11. Performance

| Medida | H4.5 | H4.5.1 |
|---|---:|---:|
| Dependências novas | 0 | **0** |
| Client Components novos | 0 | **0** |
| Arquivos com `"use client"` no repositório | 7 | 7 |
| JavaScript estático da rota | 552.767 B | **552.767 B**, o mesmo |
| CSS da camada H4.5 | 11.839 B | 14.674 B |
| CSS herdado da H3.5.1 | 9.372 B | 9.372 B |
| Mídia | carcará de 29.954 B | **o mesmo arquivo** |
| DOM da composição candidata | 270 | **219** |
| DOM da rota inteira | 379 | 411 |
| Nós dentro de SVG | 60 | 58 |

A composição candidata perdeu **51 nós**, quase 19%. Descontando a variante
reduzida, que é instrumento de laboratório e não iria para a Home, o conteúdo
candidato fica em 195 nós, uma redução de 28%.

A rota inteira cresceu 32 nós, e o motivo é o próprio laboratório: a segunda
variante da faixa e o bloco de material reservado são estrutura de comparação,
não de publicação.

O CSS cresceu 2.835 bytes — as dezoito regras de realce por mês, a alternância
de variante, o bloco de laboratório e a âncora da assinatura. Ele vive num
`<style>` da própria rota e não entra em bundle compartilhado.

**Zero JavaScript acrescentado** continua valendo: a varredura dos `chunks`
estáticos do build de produção não encontra `POSICOES_DE_APOIO`, `dv-faixa`,
`REALCE_POR_MES` nem `LIMIAR_DE_DIAS`.

## 12. Gates

| Gate | Resultado |
|---|---|
| `pnpm tipos` | passa |
| `pnpm lint` | passa, com os mesmos 4 avisos de prioridade forçada já conhecidos |
| `pnpm teste` | 495 passam, 3 pulados |
| `pnpm a11y` | 262 passam |
| `pnpm build` | passa; 25 rotas estáticas |
| `pnpm pendencias` | **não atestado** — sem `DATABASE_URL` nesta máquina, nada foi consultado |
| Lighthouse | **não executado** — continua indisponível, e nada foi instalado para simulá-lo |

Testes novos desta fase:

- nenhuma atividade e nenhum limiar aparecem na composição candidata;
- o componente do ranking continua inteiro, e o laboratório o exibe depois da
  marca de fim;
- a candidata não contém vocabulário de laboratório;
- a passagem de saída não fala de pessoas, e a cruz saiu sem substituto;
- as duas variantes existem, a reduzida mostra quatro posições com valores
  reais, e a alternância funciona sem JavaScript;
- o laboratório declara que a redução é composição e não escolha;
- o realce enfatiza sem apagar: marcas em 0,6 com piso travado, rótulo em 1;
- a assinatura se apoia na régua da própria legenda.

## 13. Inspeção visual

Capturas de página inteira **e de viewport**, porque o cabeçalho é fixo:

- 1440 claro, 1440 escuro, 768 claro, 375 claro, 375 escuro, 320 claro;
- zoom de 200% e movimento reduzido;
- detalhe do protagonista;
- passagem de entrada, com a assinatura apoiada na régua;
- passagem de saída;
- gráfico em estado normal e com um mês selecionado;
- faixa completa e faixa reduzida, lado a lado como comparação.

Os PNGs ficam fora do repositório. A prova versionada são os testes.

## 14. Dívidas e o que depende de decisão humana

Decisões humanas ainda abertas:

1. **quais indicadores secundários entram na Home** — a H4.5.1 mostra a faixa
   completa e uma reduzida de quatro posições, e nenhuma delas é
   recomendação. A escolha continua aberta;
2. **título editorial** — "Onde o recurso circula" continua proposta;
3. **copy da passagem de entrada** — "Campo → Medida" continua proposta;
4. **copy da passagem de saída** — "Medida → Conjunto completo" é proposta
   desta rodada;
5. **integração na Home** — a H4.1 não começa sem decisão;
6. **escolha entre A e B da H4.0** — segue aberta, agora com um terceiro
   material na mesa;
7. **citação pública da fonte** — como um número de prestação de contas cita um
   conjunto documental que continua restrito.

Dívidas técnicas herdadas, não resolvidas aqui:

8. **conciliação do público** e **autorremuneração do gestor** continuam
   travando cinco e dois indicadores candidatos;
9. **`/dados` é stub** — enquanto for, nenhuma passagem pode linkar para ela;
10. **Lighthouse** continua exigido e não executável; a dívida segue para a H7;
11. **orçamento de peso da Home** — ela já está acima do referencial de 500 kB,
    e a H4 ainda não entrou.
