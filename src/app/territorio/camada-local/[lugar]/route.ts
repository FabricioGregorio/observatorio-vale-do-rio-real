import {
  lugaresComCamadaLocal,
  svgDoEntornoDoLugar,
} from "../../../../componentes/prototipo/territoriovivo/local/servico";

/** Camadas SVG públicas, geradas no build e carregadas só após a seleção. */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return lugaresComCamadaLocal().map((lugar) => ({ lugar }));
}

export async function GET(
  _pedido: Request,
  { params }: { params: Promise<{ lugar: string }> },
) {
  const { lugar } = await params;
  const svg = svgDoEntornoDoLugar(lugar);
  if (svg === null) return new Response(null, { status: 404 });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
