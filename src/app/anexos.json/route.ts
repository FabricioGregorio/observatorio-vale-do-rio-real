import type { AnexoPublico } from "../../dados/consultas/anexos";
import { listarAnexosPublicos } from "../../dados/consultas/anexos";
import { separarCredito } from "../../dados/pesquisa/credito-fotografico";
import { urlDoSite } from "../../lib/site-url";

/**
 * `/anexos.json` — o mesmo conjunto do Acervo, legível por
 * máquina.
 *
 * A URL é exatamente `/anexos.json`, não `/api/anexos`: o App Router aceita
 * ponto no nome do segmento, e a documentação do Next é explícita — um
 * `app/data.json/route.ts` vira arquivo estático no `next build`.
 *
 * `force-static` é indispensável: nesta versão do Next, Route Handler não é
 * cacheado por padrão, e sem isso a rota consultaria o banco em tempo de
 * requisição.
 */
export const dynamic = "force-static";

/** Serialização pura: uma entrada por objeto público, inclusive multiarquivo. */
export function serializarAnexos(anexos: readonly AnexoPublico[]) {
  return {
    gerado_em: new Date().toISOString(),
    total: anexos.length,
    anexos: anexos.map((a) => ({
      ordem: a.ordemAnexo,
      slug: a.slug,
      /**
       * UUID público do arquivo, o mesmo já usado na rota contextual
       * `/acervo/[documento]/arquivo/[arquivoId]`. Vem da projeção pública
       * `vw_anexo_publico`, nunca de tabela privada: é o identificador que
       * permite relacionar deterministicamente cada item desta lista à sua
       * página HTML.
       */
      arquivo_id: a.arquivoId,
      titulo: a.titulo,
      rotulo_arquivo: separarCredito(a.rotuloArquivo).rotulo || null,
      nome_original: a.nomeOriginal ?? null,
      /** Crédito de autoria de terceiro, já na forma de exibição. */
      credito: separarCredito(a.rotuloArquivo).credito,
      principal: a.principal,
      tipo: a.tipo,
      resumo: a.resumo,
      data_referencia: a.dataReferencia,
      licenca: a.licenca,
      /**
       * Página HTML contextual do arquivo, para leitura humana. Não confundir
       * com `link_permanente`, que continua sendo o binário público: um leva à
       * ficha com contexto, crédito e informações técnicas; o outro entrega o
       * objeto. Derivada da origem canônica (`SITE_URL`) com o slug do
       * documento e o `arquivo_id` — nunca escrita à mão, e por isso nunca
       * aponta para homologação.
       */
      pagina_url: urlDoSite(
        `/acervo/${a.slug}/arquivo/${a.arquivoId}`,
      ).toString(),
      link_permanente: a.linkPermanente,
      link_origem: a.linkOrigem,
      mime_type: a.mimeType,
      bytes: a.bytes,
      sha256: a.sha256,
      arquivo_origem_id: a.arquivoOrigemId,
      arquivo_relacao: a.arquivoRelacao,
      arquivo_derivacao_metodo: a.arquivoDerivacaoMetodo,
      publicado_em: a.publicadoEm,
    })),
  };
}

export async function GET() {
  const anexos = await listarAnexosPublicos();

  return Response.json(serializarAnexos(anexos), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
