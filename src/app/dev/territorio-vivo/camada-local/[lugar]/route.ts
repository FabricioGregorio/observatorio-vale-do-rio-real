import {
  lugaresComCamadaLocal,
  svgDoEntornoDoLugar,
} from "../../../../../componentes/territorio/cartografia/local/servico";

/**
 * Camada local sob demanda do laboratório territorial. **Rota DEV.**
 *
 * A página `/dev/territorio-vivo` não embute vias, cursos d'água nem
 * localidades: a ilha busca aqui o SVG do entorno do lugar selecionado, uma
 * vez, e guarda em memória.
 *
 * Em produção não existe: `generateStaticParams` não gera parâmetro nenhum,
 * `dynamicParams = false` recusa os demais, e o próprio `GET` responde 404.
 */

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  if (process.env.NODE_ENV === "production") return [];
  return lugaresComCamadaLocal().map((lugar) => ({ lugar }));
}

export async function GET(
  _pedido: Request,
  { params }: { params: Promise<{ lugar: string }> },
) {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }
  const { lugar } = await params;
  const svg = svgDoEntornoDoLugar(lugar);
  if (svg === null) return new Response(null, { status: 404 });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
