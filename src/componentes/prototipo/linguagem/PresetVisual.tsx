import Image from "next/image";
import {
  CARCARA_DA_IDENTIDADE,
  PASTA_PUBLICA_DOS_GRAFISMOS,
} from "../../../dados/grafismos/derivados";
import {
  DERIVADOS_DA_PESQUISA,
  PASTA_PUBLICA_DA_PESQUISA,
} from "../../../dados/pesquisa/derivados";
import type { DadosDoMapa } from "../../../dados/territorio/mapa";
import { DEFINICAO_VALE_DO_RIO_REAL } from "../../../dados/territorio/recorte";

/**
 * Cruz de registro — família cartográfica.
 *
 * É o mesmo sinal que uma prancha de impressão usa para alinhar camadas.
 * Aqui ele marca o ponto exato em que um capítulo encontra o seguinte, sem
 * precisar de caixa, sombra ou faixa.
 */
function CruzDeRegistro() {
  return (
    <svg
      aria-hidden="true"
      className="lv-cruz lv-g-cartografico"
      viewBox="0 0 12 12"
    >
      <line x1="6" y1="0" x2="6" y2="12" />
      <line x1="0" y1="6" x2="12" y2="6" />
    </svg>
  );
}

/** Recortes exclusivos do laboratório; nenhuma importação do painel H4.0. */
export function PresetVisual({
  dados,
  preset,
}: {
  dados: DadosDoMapa;
  preset: "A" | "B";
}) {
  const foto = DERIVADOS_DA_PESQUISA[2];
  const vale = dados.municipios.filter((municipio) =>
    municipio.relacoesTerritoriais.includes("vale-rio-real"),
  );
  return (
    <article
      className="lv-preset"
      data-preset={preset}
      aria-label={`Preset ${preset} — ${preset === "A" ? "Contido" : "Vivo refinado"}`}
    >
      <section
        className="lv-territorio lv-capitulo"
        aria-labelledby={`territorio-${preset}`}
      >
        <div className="lv-grade">
          <figure className="lv-mapa">
            <svg
              role="img"
              aria-labelledby={`mapa-${preset}`}
              viewBox={`0 0 ${dados.projecao.largura} ${Math.round(dados.projecao.altura)}`}
            >
              <title id={`mapa-${preset}`}>
                Municípios de Sergipe; recorte do Vale do Rio Real em destaque
              </title>
              {dados.municipios.map((municipio) => (
                <path
                  key={municipio.codigoIbge}
                  d={municipio.caminho}
                  data-vale={
                    municipio.relacoesTerritoriais.includes("vale-rio-real") ||
                    undefined
                  }
                />
              ))}
            </svg>
            <figcaption className="meta-ficha lv-g-documental">
              Fonte: IBGE · Malhas Territoriais · malha municipal
            </figcaption>
          </figure>
          <div className="lv-leitura">
            <p className="meta-ficha lv-g-documental">01 — Território</p>
            <h2 id={`territorio-${preset}`}>
              Cartografia viva do Vale do Rio Real
            </h2>
            <p>{DEFINICAO_VALE_DO_RIO_REAL}</p>
            <details>
              <summary>Municípios do recorte</summary>
              <ul>
                {vale.map((municipio) => (
                  <li key={municipio.codigoIbge}>{municipio.nome}</li>
                ))}
              </ul>
            </details>
            <a className="lv-link" href="/mapa">
              Explorar o mapa <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/*
        Passagem 1 — a única da página que carrega assinatura de identidade.
        A regra de frequência da H3.5.1 é um carcará em escala editorial por
        página, e só em passagem: é o que separa assinatura de mascote.
      */}
      <div
        className="lv-g-transicao"
        data-passagem="campo"
        data-testid={`passagem-${preset}`}
      >
        <div className="lv-fio lv-g-cartografico" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="lv-ponte">
          <p className="meta-ficha lv-g-documental">Território → Campo</p>
          <p>Da abstração do mapa à materialidade do território</p>
        </div>
        <div className="lv-g-identidade" aria-hidden="true">
          <Image
            alt={CARCARA_DA_IDENTIDADE.alt}
            src={`${PASTA_PUBLICA_DOS_GRAFISMOS}/${CARCARA_DA_IDENTIDADE.arquivo}`}
            width={CARCARA_DA_IDENTIDADE.largura}
            height={CARCARA_DA_IDENTIDADE.altura}
            unoptimized
            loading="lazy"
          />
        </div>
        <p className="lv-origem meta-ficha lv-g-documental">
          {CARCARA_DA_IDENTIDADE.legenda}
        </p>
      </div>

      <section
        className="lv-campo lv-capitulo"
        aria-labelledby={`campo-${preset}`}
      >
        <div className="lv-heading lv-revelar">
          <p className="meta-ficha lv-g-documental">02 — Pesquisa em Campo</p>
          <h2 id={`campo-${preset}`}>O campo como documento</h2>
          <p>
            A pesquisa foi a campo e fotografou o que encontrou. As imagens
            desta seção pertencem ao acervo do projeto e documentam lugares onde
            o trabalho aconteceu.
          </p>
        </div>
        <div className="lv-grade">
          <figure className="lv-fotografia lv-revelar">
            <a
              className="lv-foto-link"
              href={`${PASTA_PUBLICA_DA_PESQUISA}/${foto.arquivo}`}
              aria-label={`Abrir fotografia integral: ${foto.titulo}`}
            >
              <Image
                alt={foto.alt}
                src={`${PASTA_PUBLICA_DA_PESQUISA}/${foto.arquivo}`}
                width={foto.largura}
                height={foto.altura}
                sizes="(max-width: 767px) 90vw, 420px"
                loading="lazy"
              />
            </a>
            <figcaption>
              <strong>{foto.titulo}</strong>
              <span className="meta-ficha lv-g-documental">
                {foto.tipo} · {foto.local}
              </span>
            </figcaption>
          </figure>
          <div className="lv-leitura lv-registro lv-revelar">
            <p className="meta-ficha lv-g-documental">Leitura do registro</p>
            <h3>Da abstração do mapa à materialidade do território</h3>
            <p>
              Os registros desta seção são de Ilha Grande, um dos lugares onde a
              pesquisa esteve.
            </p>
            <dl className="lv-g-documental">
              <div>
                <dt>Local</dt>
                <dd>{foto.local}</dd>
              </div>
              <div>
                <dt>Data</dt>
                <dd>Não informada</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{foto.tipo}</dd>
              </div>
            </dl>
            <a className="lv-link" href="/pesquisa">
              Conhecer a pesquisa <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/*
        Passagem 2 — sem assinatura de identidade, por regra de frequência.
        A ligação entre capítulos é feita só por grafismo cartográfico, e é
        justamente isso que prova que a transição não depende do carcará.
      */}
      <div
        className="lv-g-transicao"
        data-passagem="leitura"
        data-testid={`passagem-leitura-${preset}`}
      >
        <div className="lv-fio lv-g-cartografico" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="lv-ponte">
          <p className="meta-ficha lv-g-documental">Campo → Leitura</p>
          <p>Do registro isolado à série que permite comparar</p>
        </div>
        <CruzDeRegistro />
      </div>

      <section
        className="lv-ensaio lv-capitulo"
        aria-labelledby={`ensaio-${preset}`}
      >
        <p className="meta-ficha lv-g-documental">
          Ensaio de linguagem · compatibilidade com dados
        </p>
        <h2 id={`ensaio-${preset}`}>Toda leitura precisa de contexto</h2>
        <div className="lv-grade">
          <div className="lv-eixos lv-g-cartografico" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="lv-leitura">
            <p>
              Estrutura visual sem série numérica. Nenhum indicador é
              apresentado neste ensaio.
            </p>
            <table>
              <caption>Campos de leitura de um indicador</caption>
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Conteúdo neste ensaio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Valor</th>
                  <td>Não apresentado</td>
                </tr>
                <tr>
                  <th scope="row">Fonte</th>
                  <td>Não se aplica</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </article>
  );
}
