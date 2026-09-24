/**
 * Leitura do snapshot publicado — a fonte de dados do site.
 *
 * Os três arquivos de `src/dados/publicado/` são **importados**, não lidos do
 * disco em tempo de execução. A diferença importa: um `import` é resolvido
 * pelo empacotador, entra no build e existe em qualquer runtime; um
 * `readFileSync` dependeria do diretório de trabalho e quebraria em função
 * serverless. O site publicado não abre arquivo, não abre soquete e não
 * pergunta nada a ninguém — ele já nasce com o acervo dentro.
 *
 * ## Por que validar o que o próprio repositório versiona
 *
 * Os JSON são gravados por um gerador que já validou. A validação aqui existe
 * para o caso em que alguém edita o arquivo à mão — que é exatamente o que
 * passa a acontecer agora que o Git é a fonte oficial. Um campo digitado
 * errado falha na leitura, e não três telas adiante com um `undefined`.
 *
 * ## `publicadoEm` volta a ser `Date`
 *
 * Em disco o instante é texto, porque `Date` não sobrevive a JSON. Os
 * consumidores continuam recebendo `Date`, como recebiam da camada de
 * consulta, e por isso nenhuma página precisou aprender a converter.
 */
import type { AnexoPublico } from "../anexo-publico";
import type { EpisodioPublico } from "../podobservar-publico";
import acervoJson from "./acervo.json";
import episodiosJson from "./episodios.json";
import releaseJson from "./release.json";
import {
  acervoPublicadoSchema,
  episodiosPublicadosSchema,
  type Release,
  releaseSchema,
} from "./tipos";

/*
  A validação roda uma vez por processo. Em build estático isso é uma vez por
  página renderizada no mesmo worker; sem a memória seria uma vez por chamada,
  e `acervo.json` tem 107 entradas para reanalisar a cada uma delas.
*/
let acervoMemo: readonly AnexoPublico[] | null = null;
let episodiosMemo: readonly EpisodioPublico[] | null = null;
let releaseMemo: Release | null = null;

/** O acervo publicado, na ordem gravada no snapshot. */
export function lerAcervoPublicado(): readonly AnexoPublico[] {
  if (acervoMemo) return acervoMemo;
  const validado = acervoPublicadoSchema.parse(acervoJson);
  /*
    Em disco os três campos de preview são anuláveis, porque o snapshot exige
    que todo campo esteja presente. Em `AnexoPublico` eles são opcionais, que
    é como a camada de consulta os entregava. A conversão acontece aqui, uma
    vez, e não em cada página que lê uma fotografia.
  */
  const lido: AnexoPublico[] = validado.map((anexo) => ({
    ...anexo,
    publicadoEm:
      anexo.publicadoEm === null ? null : new Date(anexo.publicadoEm),
    previewUrl: anexo.previewUrl ?? undefined,
    previewArquivoId: anexo.previewArquivoId ?? undefined,
    previewSha256: anexo.previewSha256 ?? undefined,
  }));
  acervoMemo = lido;
  return lido;
}

/** Os episódios publicados, na ordem gravada no snapshot. */
export function lerEpisodiosPublicados(): readonly EpisodioPublico[] {
  if (episodiosMemo) return episodiosMemo;
  const validado = episodiosPublicadosSchema.parse(episodiosJson);
  const lido: EpisodioPublico[] = validado.map((episodio) => ({
    ...episodio,
    publicadoEm: new Date(episodio.publicadoEm),
  }));
  episodiosMemo = lido;
  return lido;
}

/** O manifesto do release — totais, hashes e lotes declarados. */
export function lerRelease(): Release {
  if (releaseMemo) return releaseMemo;
  const lido = releaseSchema.parse(releaseJson);
  releaseMemo = lido;
  return lido;
}
