import type { Caixa } from "../geometria";
import type { CamadaLocal } from "./camada";

/**
 * Serialização da camada local em SVG — Tarefa 19.
 *
 * A camada não vai no HTML inicial: a rota DEV
 * `/dev/territorio-vivo/camada-local/[lugar]` responde com este SVG, e a ilha
 * importa os nós para dentro do grupo vazio da página. Por isso o desenho é
 * uma string, e não JSX: um route handler não renderiza componente.
 *
 * Todo texto passa por `escapar`. As classes são as mesmas que `estilos.ts`
 * pinta, e a hachura referencia o `<pattern>` que já existe na página.
 *
 * ## Símbolos — um para cada coisa
 *
 * | Coisa | Símbolo |
 * |---|---|
 * | lugar da pesquisa (posição confirmada) | pin em gota; selecionado: maior, milho, contorno grosso, etiqueta "▸" |
 * | localidade do lugar (IBGE) | quadrado pequeno dentro de anel tracejado, sem milho |
 * | referência cartográfica próxima (IBGE) | quadrado vazado e rótulo explícito “· IBGE” |
 * | sede municipal | quadrado cheio |
 * | outras localidades | quadrado vazado |
 * | rodovia | placa com o código, em fonte mono |
 */

export function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const n = (v: number) => v.toFixed(1);
const d2 = (v: number) => Number(v.toFixed(2));

/**
 * Pin em gota com a ponta exatamente em (0, 0) — a coordenada — e a cabeça
 * centrada em (0, −2r). Usado na página e na camada local.
 */
export function caminhoDoPin(r: number): string {
  return `M0 0C${d2(-0.45 * r)} ${d2(-0.9 * r)} ${d2(-r)} ${d2(-1.35 * r)} ${d2(-r)} ${d2(-2 * r)}A${d2(r)} ${d2(r)} 0 1 1 ${d2(r)} ${d2(-2 * r)}C${d2(r)} ${d2(-1.35 * r)} ${d2(0.45 * r)} ${d2(-0.9 * r)} 0 0Z`;
}

export function svgDaCamadaLocal(
  camada: CamadaLocal,
  vista: Caixa,
  idDoLugar: string,
): string {
  const vw = vista.x1 - vista.x0;
  const vh = vista.y1 - vista.y0;
  const recorte = `tv-local-recorte-${idDoLugar}`;
  const s: string[] = [];
  const caminho = (classe: string, d: string) => {
    if (d !== "") s.push(`<path class="${classe}" d="${d}"/>`);
  };

  s.push('<svg xmlns="http://www.w3.org/2000/svg">');
  s.push(
    `<defs><clipPath id="${recorte}"><rect x="${n(vista.x0)}" y="${n(vista.y0)}" width="${n(vw)}" height="${n(vh)}"/></clipPath></defs>`,
  );
  s.push(`<g clip-path="url(#${recorte})">`);
  s.push(
    `<rect class="fundo" x="${n(vista.x0)}" y="${n(vista.y0)}" width="${n(vw)}" height="${n(vh)}"/>`,
  );

  for (const m of camada.municipios) {
    caminho(m.doVale ? "mun v" : "mun", m.caminho);
  }
  for (const m of camada.municipios) {
    if (m.pesquisaDeCampo) caminho("mun-h", m.caminho);
  }
  const c = camada.caminhos;
  caminho("l agua", c.riachos);
  caminho("l agua rio", c.rios);
  caminho("l urbana", c.urbanas);
  caminho("l estrada", c.estradas);
  caminho("l casco", c.rodoviasPavimentadas + c.rodoviasSemPavimento);
  caminho("l rodovia", c.rodoviasPavimentadas);
  caminho("l rodovia terra", c.rodoviasSemPavimento);
  caminho("lim", camada.municipios.map((m) => m.caminho).join(""));

  for (const e of camada.escudos) {
    s.push(
      `<g class="escudo" data-tipo="rodovia"><rect x="${n(e.x0)}" y="${n(e.y0)}" width="${n(e.x1 - e.x0)}" height="${n(e.y1 - e.y0)}" rx="${n(e.fonte * 0.25)}"/><text x="${n((e.x0 + e.x1) / 2)}" y="${n((e.y0 + e.y1) / 2)}" font-size="${n(e.fonte)}" text-anchor="middle" dominant-baseline="central">${escapar(e.ref)}</text></g>`,
    );
  }

  for (const l of camada.localidades) {
    const classeDaReferencia =
      l.tipo === "referencia-cartografica" ? " referencia-cartografica" : "";
    s.push(
      `<g class="loc ${l.classe}${classeDaReferencia}" data-tipo="${l.tipo}" data-codigo-ibge="${l.codigoIbge}"><rect x="${n(l.x - l.marca)}" y="${n(l.y - l.marca)}" width="${n(l.marca * 2)}" height="${n(l.marca * 2)}"/><text x="${n(l.tx)}" y="${n(l.y + l.fonte * 0.34)}" font-size="${n(l.fonte)}" text-anchor="${l.lado === "direita" ? "start" : "end"}">${escapar(l.texto)}</text></g>`,
    );
  }

  const ref = camada.referencia;
  if (ref !== null) {
    s.push(
      `<g class="ref" data-tipo="localidade-do-lugar" data-codigo-ibge="${ref.codigoIbge}" transform="translate(${n(ref.x)} ${n(ref.y)})"><circle class="anel-ref" r="${n(ref.raio)}"/><rect class="nucleo-ref" x="${n(-ref.raio * 0.35)}" y="${n(-ref.raio * 0.35)}" width="${n(ref.raio * 0.7)}" height="${n(ref.raio * 0.7)}"/></g>`,
    );
    if (ref.rotulo !== null) {
      s.push(
        `<text class="ref-rotulo" x="${n(ref.rotulo.x0)}" y="${n((ref.rotulo.y0 + ref.rotulo.y1) / 2)}" font-size="${n(ref.rotulo.fonte)}" dominant-baseline="central">${escapar(ref.rotulo.texto)}</text>`,
      );
    }
  }

  // Pins por último, e o selecionado acima de todos.
  const pins = [...camada.pins].sort(
    (a, b) => Number(a.selecionado) - Number(b.selecionado),
  );
  for (const p of pins) {
    s.push(
      `<g class="pin" data-tipo="lugar" data-pin="${escapar(p.id)}" data-selecionado="${p.selecionado}" transform="translate(${n(p.x)} ${n(p.y)})"><path class="forma" d="${caminhoDoPin(p.raio)}"/><circle class="miolo" cy="${n(-2 * p.raio)}" r="${n(p.raio * 0.38)}"/></g>`,
    );
    if (p.rotulo !== null) {
      const r = p.rotulo;
      s.push(
        p.selecionado
          ? `<g class="pin-rotulo selecionado"><rect x="${n(r.x0)}" y="${n(r.y0)}" width="${n(r.x1 - r.x0)}" height="${n(r.y1 - r.y0)}" rx="${n(r.fonte * 0.2)}"/><text x="${n(r.x0 + r.fonte * 0.45)}" y="${n((r.y0 + r.y1) / 2)}" font-size="${n(r.fonte)}" dominant-baseline="central">${escapar(r.texto)}</text></g>`
          : `<text class="pin-rotulo" x="${n(r.x0)}" y="${n((r.y0 + r.y1) / 2)}" font-size="${n(r.fonte)}" dominant-baseline="central">${escapar(r.texto)}</text>`,
      );
    }
  }

  s.push("</g></svg>");
  return s.join("");
}
