import { listarAnexosPublicos } from "../../dados/consultas/anexos";

/**
 * `/anexos.json` — o mesmo conjunto da Sala do Avaliador, legível por máquina
 * (doc 01 §4, ADR-003 item 7).
 *
 * A URL é exatamente `/anexos.json`, não `/api/anexos`: o App Router aceita
 * ponto no nome do segmento, e a documentação do Next é explícita — um
 * `app/data.json/route.ts` vira arquivo estático no `next build`.
 *
 * `force-static` é indispensável: nesta versão do Next, Route Handler não é
 * cacheado por padrão, e sem isso a rota consultaria o banco em tempo de
 * requisição, contra a ADR-001.
 */
export const dynamic = "force-static";

export async function GET() {
  const anexos = await listarAnexosPublicos();

  return Response.json(
    {
      gerado_em: new Date().toISOString(),
      total: anexos.length,
      anexos: anexos.map((a) => ({
        ordem: a.ordemAnexo,
        slug: a.slug,
        titulo: a.titulo,
        tipo: a.tipo,
        resumo: a.resumo,
        data_referencia: a.dataReferencia,
        licenca: a.licenca,
        link_permanente: a.linkPermanente,
        link_origem: a.linkOrigem,
        mime_type: a.mimeType,
        bytes: a.bytes,
        sha256: a.sha256,
        publicado_em: a.publicadoEm,
      })),
    },
    { headers: { "content-type": "application/json; charset=utf-8" } },
  );
}
