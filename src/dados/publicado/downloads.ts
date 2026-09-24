/**
 * Destinos de download — o mapa de `/baixar/[arquivoId]` para o objeto no R2.
 *
 * ## O que mudou, e por quê
 *
 * Até 2026-09-24 `/baixar/[arquivoId]` era uma rota dinâmica que buscava o
 * objeto no storage, conferia SHA-256 e bytes, e devolvia os bytes ao
 * visitante. A verificação por requisição parecia zelo e era o contrário:
 * punha uma função de servidor, uma transferência inteira e uma chance de
 * falha entre a pessoa e um arquivo que o storage já serve sozinho. Foi essa
 * rota que respondeu HTTP 500 em Production quando a cota do banco acabou.
 *
 * A entrega final não passa por servidor algum:
 *
 *     /baixar/<arquivoId>  →  308  →  <linkPermanente>?baixar=1
 *
 * Os 107 redirecionamentos saem daqui para `next.config.ts` e viram redirects
 * compilados no build. Quem responde é a camada de roteamento, antes de
 * qualquer função — e por isso a resposta não depende de rede, de credencial
 * nem de disponibilidade de nada.
 *
 * ## Onde a integridade passou a morar
 *
 * Na publicação, não na requisição. O snapshot declara `sha256`, `bytes`,
 * `mimeType` e a URL de cada objeto; o gate de release confere os objetos
 * reais contra essa declaração antes de publicar. Conferir de novo a cada
 * download provaria a mesma coisa pela milésima vez, ao custo de fazer o
 * visitante esperar.
 *
 * ## O marcador `?baixar=1`
 *
 * É o que distingue "abrir" de "baixar". A URL canônica continua abrindo o
 * arquivo no navegador; a mesma URL com o marcador recebe
 * `Content-Disposition: attachment` por regra de resposta no CDN. O marcador
 * não muda o objeto, não muda os bytes e não cria uma segunda URL para o
 * mesmo arquivo: é a mesma, com uma intenção declarada.
 */
import { lerAcervoPublicado } from "./leitura";

/**
 * Origem pública do acervo, versionada aqui e em lugar nenhum mais.
 *
 * Não vem de variável de ambiente de propósito: o build não pode depender de
 * configuração remota para saber para onde um download aponta, e um destino
 * que muda conforme o ambiente é um redirecionamento aberto esperando
 * acontecer. Todo `linkPermanente` do snapshot é conferido contra esta
 * origem, e um que não bata interrompe o build.
 */
export const ORIGEM_DO_ACERVO = "https://acervo.observatoriotobiassoueu.com.br";

/** Marcador de intenção de download, lido pela regra de resposta do CDN. */
export const MARCADOR_DE_DOWNLOAD = "baixar=1";

/** Um redirecionamento conhecido: caminho local e destino no storage. */
export type RedirecionamentoDeDownload = {
  readonly arquivoId: string;
  /** Caminho servido pelo site, como `next.config.ts` o declara. */
  readonly origem: string;
  /** URL absoluta do objeto, com o marcador de download. */
  readonly destino: string;
};

/**
 * Destino de download de um objeto público.
 *
 * O destino é montado por concatenação **depois** de a URL ser analisada, e
 * não pela serialização do objeto `URL`. A diferença importa: `toString()`
 * normaliza percent-encoding e poderia devolver uma URL equivalente com
 * bytes diferentes do link canônico que o acervo publica. Aqui o link sai
 * exatamente como está no snapshot, com o marcador acrescentado ao fim.
 *
 * A análise existe para recusar, não para transformar:
 *
 * - valor que não é URL absoluta;
 * - origem diferente da do acervo — nenhum destino externo, nunca;
 * - link que já traga query ou fragmento, que produziria `??` ou um marcador
 *   perdido depois do `#`.
 */
export function urlDeDownload(linkPermanente: string): string {
  let url: URL;
  try {
    url = new URL(linkPermanente);
  } catch {
    throw new Error(`Link permanente não é uma URL absoluta: ${linkPermanente}`);
  }

  if (url.origin !== ORIGEM_DO_ACERVO) {
    throw new Error(
      `Link permanente fora do acervo público: ${linkPermanente}. ` +
        `Esperado ${ORIGEM_DO_ACERVO}.`,
    );
  }
  if (url.search !== "" || url.hash !== "") {
    throw new Error(
      `Link permanente com query ou fragmento: ${linkPermanente}. ` +
        "O marcador de download exige uma URL canônica limpa.",
    );
  }

  return `${linkPermanente}?${MARCADOR_DE_DOWNLOAD}`;
}

/** Caminho servido pelo site para um arquivo público. */
export function caminhoDeDownload(arquivoId: string): string {
  return `/baixar/${arquivoId}`;
}

/**
 * Os redirecionamentos de todos os arquivos do acervo publicado.
 *
 * É a lista inteira, sempre: não há filtro, não há amostra e não há caso
 * especial. Um arquivo que está no acervo tem download; um que não está não
 * tem endereço de download para existir.
 *
 * A unicidade de `arquivoId` é conferida aqui porque duas entradas com o
 * mesmo id produziriam dois redirects com a mesma origem, e qual deles
 * venceria passaria a ser detalhe de implementação do roteador.
 */
export function redirecionamentosDeDownload(): RedirecionamentoDeDownload[] {
  const vistos = new Set<string>();
  return lerAcervoPublicado().map((anexo) => {
    if (vistos.has(anexo.arquivoId)) {
      throw new Error(`Acervo com arquivoId repetido: ${anexo.arquivoId}.`);
    }
    vistos.add(anexo.arquivoId);
    return {
      arquivoId: anexo.arquivoId,
      origem: caminhoDeDownload(anexo.arquivoId),
      destino: urlDeDownload(anexo.linkPermanente),
    };
  });
}
