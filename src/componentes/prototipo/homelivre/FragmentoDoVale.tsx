import { montarDadosDoMapa } from "../../../dados/territorio/mapa";

/**
 * Fragmento cartográfico do recorte — só os municípios do Vale do Rio Real.
 *
 * Usado apenas pela abertura C. Mesma malha e mesma projeção da seção
 * Território; aqui o `viewBox` é recortado ao envelope dos cinco municípios,
 * calculado dos próprios caminhos já projetados. Nenhuma coordenada nova.
 *
 * Os números no desenho **rotulam municípios**, na ordem da lista ao lado.
 * Não são pontos de visita: nenhum ponto tem coordenada aprovada.
 */

type Caixa = { x0: number; y0: number; x1: number; y1: number };

function caixaDoCaminho(caminho: string): Caixa & { cx: number; cy: number } {
  const numeros = caminho.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let x0 = Number.POSITIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  let somaX = 0;
  let somaY = 0;
  let pares = 0;
  for (let i = 0; i + 1 < numeros.length; i += 2) {
    const x = numeros[i] as number;
    const y = numeros[i + 1] as number;
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
    somaX += x;
    somaY += y;
    pares += 1;
  }
  return { x0, y0, x1, y1, cx: somaX / pares, cy: somaY / pares };
}

export function FragmentoDoVale() {
  const municipios = montarDadosDoMapa().municipios.filter((m) =>
    m.relacoesTerritoriais.includes("vale-rio-real"),
  );
  const caixas = municipios.map((m) => caixaDoCaminho(m.caminho));

  const x0 = Math.min(...caixas.map((c) => c.x0));
  const y0 = Math.min(...caixas.map((c) => c.y0));
  const x1 = Math.max(...caixas.map((c) => c.x1));
  const y1 = Math.max(...caixas.map((c) => c.y1));
  const folga = Math.max(x1 - x0, y1 - y0) * 0.08;
  const vx = x0 - folga;
  const vy = y0 - folga;
  const vw = x1 - x0 + folga * 2;
  const vh = y1 - y0 + folga * 2;
  const raio = Math.max(vw, vh) * 0.026;
  const linhas = [1, 2, 3, 4];

  return (
    <figure className="ab-c__mapa">
      <svg
        aria-labelledby="ab-c-mapa-titulo"
        role="img"
        viewBox={`${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`}
      >
        <title id="ab-c-mapa-titulo">
          Os cinco municípios do recorte do Vale do Rio Real, numerados como na
          lista.
        </title>
        <g className="ab-c__grade-carto">
          {linhas.map((n) => (
            <line
              key={`v${n}`}
              x1={vx + (vw * n) / 5}
              x2={vx + (vw * n) / 5}
              y1={vy}
              y2={vy + vh}
            />
          ))}
          {linhas.map((n) => (
            <line
              key={`h${n}`}
              x1={vx}
              x2={vx + vw}
              y1={vy + (vh * n) / 5}
              y2={vy + (vh * n) / 5}
            />
          ))}
        </g>
        {municipios.map((m) => (
          <path
            d={m.caminho}
            data-campo={m.relacoesTerritoriais.includes("pesquisa-campo")}
            key={m.codigoIbge}
          />
        ))}
        <g>
          {municipios.map((m, i) => {
            const caixa = caixas[i] as (typeof caixas)[number];
            return (
              <g key={m.codigoIbge}>
                <circle cx={caixa.cx} cy={caixa.cy} r={raio} />
                <text
                  dominantBaseline="central"
                  fontSize={raio * 1.1}
                  textAnchor="middle"
                  x={caixa.cx}
                  y={caixa.cy}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <figcaption>
        <ol className="ab-c__municipios">
          {municipios.map((m) => (
            <li key={m.codigoIbge}>
              <span>{m.nome}</span>
              {m.relacoesTerritoriais.includes("pesquisa-campo") ? (
                <span className="ab-c__campo">pesquisa de campo</span>
              ) : null}
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
