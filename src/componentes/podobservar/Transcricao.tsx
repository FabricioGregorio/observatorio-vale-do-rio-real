import { analisarTranscricao } from "./analiseDaTranscricao";

/**
 * Nota metodológica da transcrição.
 *
 * Vive aqui, e não em `episodio.transcricao`: o texto é idêntico nos três
 * episódios, e repetir 350 caracteres em cada linha do banco é duplicação que
 * o primeiro episódio divergente transformaria em inconsistência. A P0.2B3
 * retirou o bloco do campo justamente para que ele passasse a ser contrato da
 * página.
 */
export const NOTA_DA_TRANSCRICAO =
  "Esta é uma transcrição revisada do episódio, produzida a partir do áudio " +
  "publicado. Foram preservados o sentido das falas, a identificação dos " +
  "participantes e os elementos sonoros relevantes. Pequenas hesitações e " +
  "repetições podem ter sido ajustadas para facilitar a leitura, sem alterar " +
  "o conteúdo.";

export function SobreEstaTranscricao() {
  return (
    <aside
      aria-labelledby="pod-nota-titulo"
      className="pod-nota"
      id="sobre-esta-transcricao"
    >
      <h2 className="pod-nota__titulo" id="pod-nota-titulo">
        Sobre esta transcrição
      </h2>
      <p>{NOTA_DA_TRANSCRICAO}</p>
    </aside>
  );
}

/**
 * Transcrição renderizada como texto, nunca como HTML.
 *
 * Todo conteúdo entra pela árvore do React, que escapa por definição. Não há
 * `dangerouslySetInnerHTML` nesta árvore, e o parser não produz marcação — só
 * classifica linhas.
 *
 * Os timestamps são **referência documental, não controle de reprodução**. O
 * site não tem player (ADR-021), então não há o que um clique ali pudesse
 * fazer: nenhum botão, nenhum seek, nenhum link para a plataforma com
 * posição. São marcas de leitura, e ficam fora da árvore de acessibilidade
 * como rótulo redundante — o `<b>` visível é anunciado como o tempo que é.
 */
export function Transcricao({ texto }: { texto: string }) {
  const blocos = analisarTranscricao(texto);

  return (
    <div className="pod-transcricao">
      {blocos.map((bloco, indice) => {
        // A posição é a identidade: a transcrição é uma sequência ordenada, e
        // dois blocos iguais em pontos diferentes são ocorrências distintas.
        const chave = `${bloco.tipo}-${indice}`;

        if (bloco.tipo === "tempo") {
          return (
            <p className="pod-transcricao__tempo" key={chave}>
              <span className="sr-only">Em </span>
              {bloco.valor}
            </p>
          );
        }

        if (bloco.tipo === "som") {
          return (
            <p className="pod-transcricao__som" key={chave}>
              <span className="sr-only">Indicação sonora: </span>
              {bloco.valor}
            </p>
          );
        }

        if (bloco.tipo === "locutor") {
          return (
            <p className="pod-transcricao__locutor" key={chave}>
              <span className="pod-transcricao__nome">{bloco.nome}</span>
              {bloco.funcao ? (
                <span className="pod-transcricao__funcao">{bloco.funcao}</span>
              ) : null}
            </p>
          );
        }

        return (
          <p className="pod-transcricao__fala" key={chave}>
            {bloco.texto}
          </p>
        );
      })}
    </div>
  );
}
