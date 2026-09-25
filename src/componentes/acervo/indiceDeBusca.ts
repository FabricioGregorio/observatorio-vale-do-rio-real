/**
 * Índice de busca do Acervo — montado em build, a partir do que já é público.
 *
 * ## De onde sai cada termo
 *
 * Nenhum termo é escrito aqui. Cada um vem de uma relação que o site já
 * publica e já declara por slug de documento — nunca por semelhança de nome:
 *
 * - **`home/conteudo.ts`, `ENTREVISTAS`** — a instituição ou o lugar de cada
 *   entrevista e o município, como `/pesquisa` e a Home os apresentam. É o
 *   que deixa "Secretaria" encontrar a entrevista sem que se saiba o nome de
 *   quem falou.
 * - **`dados/materiais-de-campo.ts`, `MATERIAIS_POR_LUGAR`** — o que cada
 *   lugar reuniu. O documento ganha o nome do material ("Entrevista gravada",
 *   "Fotografias de campo") e o lugar, a localidade e o município de
 *   `territorio/referencias.ts`, mais o nome do equipamento quando o lugar é
 *   um dos dois acompanhados.
 * - **`editorial/mapa-b01.ts`** — o grupo de cada fotografia do conjunto:
 *   lugar, pessoa ou instituição.
 * - **o próprio `acervo.json`** — título, resumo e tipo do documento, e o
 *   título público de cada arquivo.
 *
 * ## Por que em build, e por que tão pouco
 *
 * O índice atravessa para o cliente como propriedade do componente de busca.
 * Por isso leva só o que a busca precisa para achar e apontar: identificador,
 * título e contexto de cada arquivo. Formato, tamanho, hash e endereço do
 * binário ficam na ficha, onde já estão. Não há API, nem requisição em
 * execução, nem índice externo: é o snapshot, lido uma vez.
 */

import { mapaB01 } from "../../dados/editorial/mapa-b01";
import { tipoPublico } from "../../dados/editorial/tipos-publicos";
import { MATERIAIS_POR_LUGAR } from "../../dados/materiais-de-campo";
import {
  type DocumentoDoAcervo,
  tituloDoArquivoPublico,
} from "../../dados/publicado/acervo";
import { REFERENCIAS_TERRITORIAIS } from "../../dados/territorio/referencias";
import { ENTREVISTAS, EQUIPAMENTOS } from "../home/conteudo";
import type { ArquivoDoIndice, DocumentoDoIndice } from "./busca";

const CONJUNTO_FOTOGRAFICO = "fotografias-visitas-i-vii";

/** Termos públicos por slug de documento, de relações já declaradas. */
function contextoPorDocumento(): ReadonlyMap<string, readonly string[]> {
  const termos = new Map<string, Set<string>>();
  const acrescentar = (slug: string, ...valores: (string | null)[]) => {
    const conjunto = termos.get(slug) ?? new Set<string>();
    for (const valor of valores) if (valor) conjunto.add(valor);
    termos.set(slug, conjunto);
  };

  for (const entrevista of ENTREVISTAS)
    acrescentar(entrevista.documento, entrevista.onde, entrevista.municipio);

  for (const [id, materiais] of Object.entries(MATERIAIS_POR_LUGAR)) {
    const lugar = REFERENCIAS_TERRITORIAIS.find((r) => r.id === id);
    if (lugar === undefined)
      throw new Error(`Busca do Acervo: lugar sem referência ${id}.`);
    const equipamento = EQUIPAMENTOS.find((e) => e.id === id);
    for (const material of materiais)
      acrescentar(
        material.documento,
        material.material,
        lugar.nome,
        lugar.localidade,
        lugar.municipio,
        equipamento?.nome ?? null,
      );
  }

  return new Map([...termos].map(([slug, valores]) => [slug, [...valores]]));
}

function arquivosDoIndice(documento: DocumentoDoAcervo): ArquivoDoIndice[] {
  return documento.arquivos.map((arquivo) => {
    let contexto: string | null = null;
    if (documento.slug === CONJUNTO_FOTOGRAFICO) {
      const entrada = mapaB01.arquivos.find(
        (item) =>
          item.arquivoId === (arquivo.previewArquivoId ?? arquivo.arquivoId),
      );
      const grupo = mapaB01.grupos.find((g) => g.id === entrada?.grupoId);
      // Grupo de lugar carrega a localidade e o município do lugar canônico
      // que o próprio mapa declara.
      const lugar = REFERENCIAS_TERRITORIAIS.find(
        (r) => r.id === grupo?.lugarCanonicoId,
      );
      contexto =
        [grupo?.tituloPublico, lugar?.localidade, lugar?.municipio]
          .filter(Boolean)
          .join(" · ") || null;
    }
    return {
      id: arquivo.arquivoId,
      titulo: tituloDoArquivoPublico(arquivo),
      contexto,
    };
  });
}

export function montarIndiceDoAcervo(
  documentos: readonly DocumentoDoAcervo[],
): DocumentoDoIndice[] {
  const contexto = contextoPorDocumento();
  return documentos.map((documento) => ({
    slug: documento.slug,
    titulo: documento.titulo,
    tipo: documento.tipo,
    resumo: documento.resumo,
    quantidade: documento.arquivos.length,
    contexto: [
      tipoPublico(documento.tipo, documento.slug),
      ...(contexto.get(documento.slug) ?? []),
    ],
    arquivos: arquivosDoIndice(documento),
  }));
}
