import { SERIE_MENSAL } from "../../../dados/indicadores/derivados";

/**
 * Direção visual da H4.5 — camada sobre a gramática da H3.5.1.
 *
 * A composição carrega `CSS_DA_LINGUAGEM`, que traz as quatro famílias de
 * grafismo tal como a H3.5.1 as definiu, e `CSS_DOS_DADOS_VIVOS`, que
 * acrescenta só o que a linguagem transversal não tinha porque não tinha
 * número para tratar. Nenhuma família foi reimplementada aqui: mudar o desenho
 * de uma passagem continua sendo mudança em um arquivo só, e os dois
 * laboratórios acompanham.
 *
 * ## Por que existe um terceiro bloco
 *
 * A H4.1 levou a composição para a Home, e o que é vocabulário de laboratório
 * não pode ir junto — nem como regra morta. `testes/a11y/home.spec.ts` exige
 * que o conteúdo servido da Home não contenha `proposta` nem `somente DEV`,
 * **inclusive dentro do CSS embutido**, e `.dv-proposta` casaria com isso.
 * Por isso `CSS_DO_LABORATORIO_DOS_DADOS_VIVOS` existe: ele fica na rota DEV, e
 * a Home recebe só a composição. É a mesma divisão que `estilosDaPesquisa.ts`
 * já fazia na H3.
 *
 * Cor, tipografia e espessura saem de `tokens.css`. Nenhum hexadecimal aqui.
 *
 * ## `cqi`, e não `vw`, na tipografia do número
 *
 * Herdado da H4.0, e pela mesma razão: com `vw` o número monumental estourava
 * o container em zoom de 200%, porque a janela não encolhe junto com a seção.
 */

/**
 * Ligação entre desenho e tabela, um trio de regras por mês.
 *
 * Passar o mouse sobre um mês atenua as marcas dos demais, reforça o conector
 * daquele mês e acende a linha correspondente na tabela. Seis meses, dezoito
 * regras, zero JavaScript: `:has()` faz a ponte.
 *
 * ## Seleção é ênfase, não apagamento — revisão da H4.5.1
 *
 * Duas correções, e as duas na mesma direção.
 *
 * A primeira é de alcance: a atenuação passou a valer só para **as marcas** —
 * conector, ponto e losango. O rótulo do mês, que é texto, continua em 100%.
 * Antes o grupo inteiro caía junto, e baixar a opacidade de texto baixa o
 * contraste dele: o critério de contraste da WCAG não pode depender de onde o
 * ponteiro está.
 *
 * A segunda é de grau: a atenuação subiu de 0,3 para 0,6. Em 0,3 os cinco
 * meses não selecionados pareciam desabilitados, como se a seleção tivesse
 * desligado dado. A dominância do mês escolhido agora vem de somar ênfases —
 * conector mais grosso, mais escuro, marcas em 100% — e não de apagar o resto.
 */
const REALCE_POR_MES = SERIE_MENSAL.map(
  (_, indice) => `
.dv-serie:has([data-mes="${indice}"]:is(:hover, :focus-within)) .dv-grafico .dv-registro:not([data-mes="${indice}"]) :is(.dv-conector, .dv-ponto) { opacity: var(--dv-atenuado); }
.dv-serie:has([data-mes="${indice}"]:is(:hover, :focus-within)) .dv-registro[data-mes="${indice}"] .dv-conector { stroke-width: 3; stroke: var(--color-texto); }
.dv-serie:has(.dv-grafico [data-mes="${indice}"]:is(:hover, :focus-within)) .dv-tabela tr[data-mes="${indice}"] { background: var(--dv-realce); }`,
).join("");

export const CSS_DOS_DADOS_VIVOS = `
.dados-vivos { max-width: var(--largura-conteudo); margin-inline: auto; }
.dv-artigo { position: relative; container-type: inline-size; }
/* Fio único de continuidade, o mesmo recurso que a H3.5.1 usa para a página
   deixar de ser uma pilha de blocos. As passagens o engrossam. */
.dv-artigo::before { content: ""; position: absolute; inset-block: 0; left: calc(var(--lv-margem) / 2); border-left: 1px solid var(--lv-linha); pointer-events: none; }
.dv-passagem { border-left: calc(var(--spacing)) solid var(--color-marca); }
.dv-passagem .lv-fio { border-color: var(--color-marca); }
.dv-passagem { row-gap: calc(var(--spacing) * 4); }
.dv-passagem[data-passagem="saida"] { min-height: var(--lv-passagem-curta); }
/* A passagem de saída perdeu a coluna da direita quando a cruz saiu; sem isto
   a ponte continuaria comprimida contra um vazio. */
.dv-passagem[data-passagem="saida"] { grid-template-columns: auto minmax(0, 1fr); }


.dv-secao { display: flex; flex-direction: column; gap: var(--lv-capitulo); padding: var(--lv-capitulo) var(--lv-margem); background: var(--lv-superficie-ensaio); border-block: 1px solid var(--lv-linha); }
.dv-abertura { display: flex; flex-direction: column; gap: calc(var(--spacing) * 4); max-width: 62ch; }
.dv-abertura h2 { font-size: clamp(var(--text-3xl), 5cqi, var(--text-5xl)); max-width: 15ch; }
.dv-abertura__texto { font-size: var(--text-lg); }

.dv-ficha { display: grid; gap: calc(var(--spacing)); margin: 0; max-width: 58ch; }
.dv-ficha > div { display: grid; grid-template-columns: minmax(6rem, 0.4fr) 1fr; gap: calc(var(--spacing) * 4); border-top: 1px solid var(--lv-linha); border-left: 1px solid transparent; padding-block: calc(var(--spacing) * 2); padding-left: calc(var(--spacing) * 3); margin-left: calc(var(--spacing) * -3); transition: border-left-color var(--duracao-hover) var(--easing-padrao), background-color var(--duracao-hover) var(--easing-padrao); }
.dv-ficha > div:hover { border-left-color: var(--color-marca); background: var(--dv-realce); }
.dv-ficha dt { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: var(--tracking-mono); text-transform: uppercase; color: var(--color-texto-suave); }
.dv-ficha dd { margin: 0; font-size: var(--text-sm); }

.dv-protagonista { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: var(--lv-respiro); align-items: start; }
.dv-protagonista__numero { position: relative; display: grid; gap: calc(var(--spacing) * 2); }
.dv-numero { font-family: var(--font-display); font-weight: 600; line-height: 0.92; letter-spacing: -0.03em; font-size: clamp(3rem, 17cqi, 9rem); font-variant-numeric: tabular-nums; }
.dv-numero__rotulo { font-family: var(--font-display); font-size: clamp(var(--text-lg), 2.4cqi, var(--text-2xl)); max-width: 22ch; }
/* A amarra liga visualmente o número à sua própria explicação, sem caixa. */
.dv-amarra { display: block; height: 1px; width: 100%; background: var(--dv-eixo); margin-top: calc(var(--spacing) * 4); }
.dv-protagonista__leitura { display: flex; flex-direction: column; gap: calc(var(--spacing) * 4); border-left: 1px solid var(--color-marca); padding-left: calc(var(--spacing) * 6); }
.dv-protagonista__leitura h3 { font-size: clamp(var(--text-xl), 2.6cqi, var(--text-2xl)); max-width: 20ch; }

.dv-bloco { display: flex; flex-direction: column; gap: calc(var(--spacing) * 5); }
/* O eixo é a borda superior de cada registro, e não um elemento único acima da
   lista: assim ele sobrevive à quebra de linha da grade, e a segunda fileira
   continua pendurada numa régua em vez de flutuar. */
.dv-faixa__lista { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--lv-respiro) calc(var(--spacing) * 6); list-style: none; margin: 0; padding: 0; }
.dv-registro-indicador { position: relative; display: grid; gap: calc(var(--spacing) * 2); align-content: start; border-top: 1px solid var(--dv-eixo); padding-top: calc(var(--spacing) * 5); }
.dv-registro-indicador__tique { position: absolute; top: 0; left: 0; width: 1px; height: calc(var(--spacing) * 3); background: var(--color-marca); }
.dv-registro-indicador__valor { font-family: var(--font-display); font-weight: 600; font-size: clamp(var(--text-xl), 2.9cqi, var(--text-3xl)); line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dv-registro-indicador h3 { font-family: var(--font-leitura); font-weight: 400; font-size: var(--text-sm); line-height: 1.35; }
.dv-registro-indicador__regra { font-size: var(--text-xs); color: var(--color-texto-suave); max-width: 34ch; }

.dv-serie { margin: 0; display: grid; gap: calc(var(--spacing) * 5); }
.dv-serie__abertura { display: grid; gap: calc(var(--spacing) * 2); max-width: 62ch; }
.dv-grafico { display: none; width: 100%; height: auto; overflow: visible; }
.dv-grafico:focus-visible { outline: var(--largura-foco) solid var(--color-foco); outline-offset: calc(var(--spacing)); }
.dv-eixo { stroke: var(--dv-eixo); stroke-width: 1; }
.dv-tique, .dv-tique-mes { stroke: var(--dv-eixo); stroke-width: 1; }
.dv-escala, .dv-mes { font-family: var(--font-mono); fill: var(--color-texto-suave); }
.dv-escala { font-size: 11px; }
.dv-mes { font-size: 12px; }
.dv-captura { fill: transparent; }
.dv-conector, .dv-ponto { transition: opacity var(--duracao-hover) var(--easing-padrao); }
.dv-conector { stroke: var(--color-borda-forte); stroke-width: 1.25; transition: opacity var(--duracao-hover) var(--easing-padrao), stroke-width var(--duracao-hover) var(--easing-padrao), stroke var(--duracao-hover) var(--easing-padrao); }
.dv-ponto { fill: var(--color-marca); }
.dv-ponto--despesa { fill: var(--color-acento); }
.dv-legenda { display: none; flex-wrap: wrap; gap: calc(var(--spacing) * 5); margin: 0; padding: 0; list-style: none; }
.dv-legenda li { display: flex; align-items: center; gap: calc(var(--spacing) * 2); font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: var(--tracking-mono); text-transform: uppercase; color: var(--color-texto-suave); }
.dv-marca-serie { flex: 0 0 auto; width: 0.7rem; height: 0.7rem; border-radius: 50%; background: var(--color-marca); }
.dv-marca-serie[data-serie="despesa"] { border-radius: 0; rotate: 45deg; background: var(--color-acento); }

.dv-tabela { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
.dv-tabela caption { text-align: left; font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: var(--tracking-mono); text-transform: uppercase; color: var(--color-texto-suave); padding-bottom: calc(var(--spacing) * 3); }
.dv-tabela th, .dv-tabela td { padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3); border-bottom: 1px solid var(--lv-linha); text-align: left; vertical-align: baseline; }
.dv-tabela thead th { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: var(--tracking-mono); text-transform: uppercase; font-weight: 500; color: var(--color-texto-suave); border-bottom-color: var(--color-borda-forte); }
.dv-tabela tbody th { font-weight: 500; font-family: var(--font-leitura); }
.dv-tabela td:first-child, .dv-tabela th:first-child { padding-left: 0; }
.dv-tabela td:last-child, .dv-tabela th:last-child { padding-right: 0; }
.dv-tabela [data-numero] { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dv-tabela tbody tr:last-child td { border-bottom-color: var(--color-borda-forte); }
.dv-tabela tbody tr { transition: background-color var(--duracao-hover) var(--easing-padrao); }
.dv-tabela tbody tr[data-mes]:hover { background: var(--dv-realce); }

${REALCE_POR_MES}

@keyframes dv-entrada { from { transform: translateY(var(--lv-revelar-distancia)); opacity: .65; } to { transform: none; opacity: 1; } }
@keyframes dv-tracar { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes dv-surgir { from { opacity: 0; } to { opacity: 1; } }

@media (prefers-reduced-motion: no-preference) {
  .dados-vivos .lv-revelar[data-revelado] { animation: dv-entrada var(--duracao-revelacao) var(--easing-entrada) both; }
  /* O conector desenha primeiro; os pontos chegam depois dele.

     O modo de preenchimento é backwards, e não both. Com both o último quadro
     fica retido, e opacidade 1 retida vence a cascata: a atenuação do realce
     deixava de alcançar os pontos. Com backwards o estado inicial vale só
     durante o atraso, e depois a marca volta a obedecer ao CSS. */
  .dados-vivos .lv-revelar[data-revelado] .dv-conector { stroke-dasharray: 1; animation: dv-tracar var(--dv-duracao-linha) var(--easing-entrada) backwards; }
  .dados-vivos .lv-revelar[data-revelado] .dv-ponto { animation: dv-surgir var(--dv-duracao-ponto) var(--easing-entrada) var(--dv-atraso-ponto) backwards; }
}

@container (min-width: 40rem) {
  .dv-grafico { display: block; }
  .dv-legenda { display: flex; }
}

@media (max-width: 1023px) {
  .dv-faixa__lista { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 767px) {
  .dv-artigo::before { content: none; }
  .dv-protagonista { grid-template-columns: minmax(0, 1fr); }
  .dv-protagonista__leitura { border-left: none; border-top: 1px solid var(--color-marca); padding-left: 0; padding-top: calc(var(--spacing) * 5); }
  .dv-ficha > div { grid-template-columns: minmax(0, 1fr); gap: calc(var(--spacing)); }
  /* O equivalente a zoom de 200% numa viewport de 1440 px cai em 720 px.
     Uma coluna evita que o maior valor monetário force a página para fora. */
  .dv-faixa__lista { grid-template-columns: minmax(0, 1fr); }
  .dv-tabela th, .dv-tabela td { padding: calc(var(--spacing) * 2); }
}

@media (prefers-reduced-motion: reduce) {
  .dados-vivos .lv-revelar, .dados-vivos .dv-conector, .dados-vivos .dv-ponto { animation: none; transform: none; opacity: 1; }
  .dados-vivos .dv-conector { stroke-dasharray: none; }
}
`;

/**
 * O que existe apenas em `/dev/dados-vivos` e nunca é servido pela Home.
 *
 * Três grupos: o marcador editorial de proposta, que a aprovação do título em
 * 12/09/2026 tornou obsoleto no público; o ranking de atividades, que a H4.5.1
 * tirou da candidata e manteve reservado à futura página de Dados; e a moldura
 * do próprio laboratório — pré-visualização, marcas de início e fim e o bloco
 * de material reservado.
 */
export const CSS_DO_LABORATORIO_DOS_DADOS_VIVOS = `
.dv-proposta { display: inline-flex; width: fit-content; max-width: 100%; border-bottom: 2px solid var(--color-marca); padding-bottom: calc(var(--spacing)); }

.dv-qualificador { display: block; font-weight: 400; color: var(--color-texto-suave); padding-top: calc(var(--spacing) * 0.5); }
.dv-barra { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: calc(var(--spacing) * 3); min-width: 9rem; }
.dv-trilho { position: relative; height: 0.5rem; background: var(--color-borda); }
.dv-preenchimento { position: absolute; inset-block: 0; left: 0; background: var(--color-marca); }
.dv-preenchimento[data-receita="direta"] { background: var(--color-acento); }
.dv-barra span { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: var(--tracking-mono); font-variant-numeric: tabular-nums; color: var(--color-texto-suave); }
.dv-ranking { display: grid; gap: calc(var(--spacing) * 4); }
.dv-ranking__nota { max-width: 62ch; }

.dv-laboratorio { padding: var(--lv-capitulo) var(--lv-margem); border-top: 1px solid var(--color-borda-forte); display: flex; flex-direction: column; gap: calc(var(--spacing) * 5); }
.dv-laboratorio h2 { font-size: var(--text-2xl); }
.dv-laboratorio h3 { font-size: var(--text-xl); }
.dv-laboratorio > p { max-width: 62ch; }
.dv-reservados { display: flex; flex-direction: column; gap: calc(var(--spacing) * 5); }
/* Os reservados são registro, e não vitrine: a faixa deles não compete com a
   da área candidata, e por isso fica numa fileira de três. */
.dv-faixa[data-variante="reservados"] .dv-faixa__lista { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.dv-preview { position: relative; }
.dv-preview__marca { padding: calc(var(--spacing) * 3) var(--lv-margem); border-top: 1px solid var(--color-borda-forte); font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: var(--tracking-mono); text-transform: uppercase; color: var(--color-texto-suave); }

@media (max-width: 1023px) {
  .dv-faixa[data-variante="reservados"] .dv-faixa__lista { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 767px) {
  .dv-faixa[data-variante="reservados"] .dv-faixa__lista { grid-template-columns: minmax(0, 1fr); }
}

@media (max-width: 479px) {
  .dv-barra { min-width: 6rem; }
}
`;
