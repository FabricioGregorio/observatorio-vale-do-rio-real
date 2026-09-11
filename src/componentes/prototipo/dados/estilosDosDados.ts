/**
 * Direção visual da seção Dados — H4.0, laboratório.
 *
 * Cor, tipografia, raio e espessura saem de `tokens.css`. Nenhum hex aqui.
 *
 * ## `cqi`, e não `vw`, na tipografia
 *
 * O número monumental cresce com a **largura da seção**, não com a da janela.
 * Com `vw` ele estourava o container em zoom de 200%: `vw` continua medindo o
 * viewport, o container encolhe pela metade, e o número não cabe mais. `cqi`
 * mede a própria seção, que é o que de fato limita o texto.
 *
 * Duas regras governam o desenho e valem para os dois presets:
 *
 * 1. **Cor nunca é o único canal.** Receita e despesa se distinguem por forma
 *    — círculo e losango — antes de se distinguirem por cor, e a legenda
 *    nomeia as duas em texto.
 * 2. **O número grande é seco.** O tamanho é o único recurso de ênfase; não há
 *    caixa, sombra, gradiente ou cartão em volta dele.
 */
export const CSS_DOS_DADOS = `
.painel-dados{container-type:inline-size;display:flex;flex-direction:column;gap:clamp(2.5rem,6vw,4.5rem);padding-block:clamp(4.5rem,9vw,8rem);border-top:1px solid var(--color-borda)}
.painel-dados__cabecalho{display:grid;gap:1rem;max-width:var(--largura-leitura)}
.painel-dados__cabecalho h2{font-size:clamp(var(--text-3xl),5cqi,var(--text-5xl));max-width:15ch}
.painel-dados__cabecalho>p:last-child{font-size:var(--text-lg);max-width:58ch}
.painel-dados__proposta{display:inline-flex;width:fit-content;max-width:100%;flex-wrap:wrap;align-items:center;gap:.5rem;border-bottom:2px solid var(--color-marca);padding-bottom:.25rem}

.painel-dados__monumental{display:grid;gap:.75rem}
.painel-dados__numero{font-family:var(--font-display);font-weight:600;line-height:.92;letter-spacing:-0.03em;font-size:clamp(3rem,17cqi,9rem);font-variant-numeric:tabular-nums}
.painel-dados__rotulo{font-family:var(--font-display);font-size:clamp(var(--text-lg),2.4cqi,var(--text-2xl));max-width:22ch}
.painel-dados__ficha{display:grid;gap:.5rem;margin:0;max-width:44ch}
.painel-dados__ficha>div{display:grid;grid-template-columns:minmax(6rem,.5fr) 1fr;gap:1rem;padding-block:.5rem;border-top:1px solid var(--color-borda)}
.painel-dados__ficha dt{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.painel-dados__ficha dd{margin:0;font-size:var(--text-sm)}
.painel-dados__leitura{display:flex;flex-direction:column;gap:1.2rem;max-width:var(--largura-leitura)}
.painel-dados__leitura p{margin:0}
.painel-dados__leitura h3{font-size:clamp(var(--text-xl),2.6cqi,var(--text-2xl));max-width:18ch}

/*
  Borda por célula, e não gap pintado: quando a última linha não fecha —
  sete indicadores numa grade de quatro —, o gap pintado desenharia um
  bloco vazio no lugar da célula que não existe. Com borda por célula, a
  grade simplesmente termina.
*/
.painel-dados__grade{display:grid;border-top:1px solid var(--color-borda);border-left:1px solid var(--color-borda)}
.painel-dados__celula{border-right:1px solid var(--color-borda);border-bottom:1px solid var(--color-borda);padding:clamp(1rem,2.2vw,1.6rem) clamp(.85rem,2vw,1.4rem);display:grid;gap:.4rem;align-content:start}
.painel-dados__celula .painel-dados__valor{font-family:var(--font-display);font-weight:600;font-size:clamp(var(--text-2xl),4.4cqi,var(--text-4xl));line-height:1;letter-spacing:-0.02em;font-variant-numeric:tabular-nums}
.painel-dados__celula h3{font-family:var(--font-leitura);font-weight:400;font-size:var(--text-sm);line-height:1.35;color:var(--color-texto)}
.painel-dados__celula .meta-ficha{color:var(--color-texto-suave)}

.painel-dados__figura{margin:0;display:grid;gap:1rem}
.painel-dados__figura figcaption{max-width:62ch}
.painel-dados__grafico{display:none;width:100%;height:auto;overflow:visible}
/* A legenda pertence ao gráfico: onde ele não aparece, ela também não. */
.painel-dados__legenda{display:none;flex-wrap:wrap;gap:1.25rem;margin:0;padding:0;list-style:none}
.painel-dados__legenda li{display:flex;align-items:center;gap:.45rem;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.painel-dados__marca-serie{flex:0 0 auto;width:.7rem;height:.7rem;border-radius:50%;background:var(--color-marca)}
.painel-dados__marca-serie[data-serie="despesa"]{border-radius:0;rotate:45deg;background:var(--color-acento)}

.painel-dados__qualificador{display:block;font-weight:400;color:var(--color-texto-suave);padding-top:.2rem}
.painel-dados table{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.painel-dados caption{text-align:left;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave);padding-bottom:.6rem}
.painel-dados th,.painel-dados td{padding:.55rem .75rem;border-bottom:1px solid var(--color-borda);text-align:left;vertical-align:baseline}
.painel-dados thead th{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;font-weight:500;color:var(--color-texto-suave);border-bottom-color:var(--color-borda-forte)}
.painel-dados tbody th{font-weight:500;font-family:var(--font-leitura)}
.painel-dados td:first-child,.painel-dados th:first-child{padding-left:0}
.painel-dados td:last-child,.painel-dados th:last-child{padding-right:0}
.painel-dados [data-numero]{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.painel-dados tbody tr:last-child td{border-bottom-color:var(--color-borda-forte)}

.painel-dados__barra{display:grid;grid-template-columns:1fr auto;align-items:center;gap:.75rem;min-width:9rem}
.painel-dados__trilho{position:relative;height:.55rem;background:var(--color-borda);border-radius:1px}
.painel-dados__preenchimento{position:absolute;inset-block:0;left:0;background:var(--color-marca);border-radius:1px}
.painel-dados__preenchimento[data-receita="direta"]{background:var(--color-acento)}
.painel-dados__barra span{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);font-variant-numeric:tabular-nums;color:var(--color-texto-suave)}

.painel-dados__nota{padding-left:1rem;border-left:3px solid var(--color-borda-forte);color:var(--color-texto-suave);font-size:var(--text-sm);max-width:62ch}

.painel-dados[data-composicao="declaracao"] .painel-dados__corpo{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(1.5rem,3vw,3rem);align-items:start}
.painel-dados[data-composicao="declaracao"] .painel-dados__monumental{grid-column:1/span 6}
.painel-dados[data-composicao="declaracao"] .painel-dados__leitura{grid-column:8/-1;padding-top:clamp(.5rem,3vw,3rem)}
.painel-dados[data-composicao="declaracao"] .painel-dados__apoio{grid-column:1/span 6;margin-top:clamp(1rem,3vw,2.5rem)}
.painel-dados[data-composicao="declaracao"] .painel-dados__figura{grid-column:1/-1;margin-top:clamp(1.5rem,4vw,3.5rem)}
.painel-dados[data-composicao="declaracao"] .painel-dados__grade{grid-template-columns:repeat(2,minmax(0,1fr))}

.painel-dados[data-composicao="painel"]{gap:clamp(2rem,4vw,3rem)}
.painel-dados[data-composicao="painel"] .painel-dados__corpo{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(1.25rem,2.5vw,2rem);align-items:start}
.painel-dados[data-composicao="painel"] .painel-dados__grade{grid-column:1/-1;grid-template-columns:repeat(4,minmax(0,1fr))}
.painel-dados[data-composicao="painel"] .painel-dados__leitura{grid-column:1/span 5}
.painel-dados[data-composicao="painel"] .painel-dados__figura{grid-column:6/-1}
.painel-dados[data-composicao="painel"] .painel-dados__ranking{grid-column:1/-1;padding-top:clamp(1.5rem,3vw,2.5rem)}
.painel-dados[data-composicao="painel"] .painel-dados__monumental{grid-column:1/-1}
.painel-dados[data-composicao="painel"] .painel-dados__numero{font-size:clamp(2.5rem,10cqi,5.5rem)}
/* Quatro colunas apertam o valor: "R$ 18.762,52" quebrava depois do cifrão. */
.painel-dados[data-composicao="painel"] .painel-dados__celula .painel-dados__valor{font-size:clamp(var(--text-xl),2.8cqi,var(--text-3xl))}

@container (min-width: 40rem){
  .painel-dados__grafico{display:block}
  .painel-dados__legenda{display:flex}
}

@container (max-width: 47.99rem){
  .painel-dados{gap:2.5rem;padding-block:4.5rem}
  .painel-dados__cabecalho h2{font-size:clamp(var(--text-2xl),11cqi,var(--text-4xl))}
  .painel-dados__cabecalho>p:last-child{font-size:var(--text-base)}
  .painel-dados__ficha>div{grid-template-columns:1fr;gap:.15rem}
  .painel-dados[data-composicao="declaracao"] .painel-dados__corpo,
  .painel-dados[data-composicao="painel"] .painel-dados__corpo{display:flex;flex-direction:column;gap:2.5rem}
  .painel-dados[data-composicao="declaracao"] .painel-dados__grade,
  .painel-dados[data-composicao="painel"] .painel-dados__grade{grid-template-columns:repeat(2,minmax(0,1fr))}
  .painel-dados[data-composicao="declaracao"] .painel-dados__leitura,
  .painel-dados[data-composicao="painel"] .painel-dados__leitura{padding-top:0}
  .painel-dados th,.painel-dados td{padding:.5rem .5rem}
}

@container (max-width: 24rem){
  .painel-dados[data-composicao="declaracao"] .painel-dados__grade,
  .painel-dados[data-composicao="painel"] .painel-dados__grade{grid-template-columns:minmax(0,1fr)}
  .painel-dados__barra{min-width:6rem}
}
`.trim();
